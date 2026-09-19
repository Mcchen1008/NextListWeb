/// <reference types="@cloudflare/workers-types" />
import type { GitHubRepo, GitHubUser, PluginManifest, PluginMeta } from './types'

/**
 * GitHub API 封装（全部为公开仓库只读操作，token 仅需 public_repo scope）。
 *
 * 配额策略：
 *  - Search API：带 token 30 次/分钟，登录 / 刷新时使用用户自己的 token 计费；
 *  - REST API：带 token 5000 次/小时；
 *  - 图标探测走 raw.githubusercontent.com（非 API，不占配额）。
 */

const GITHUB_API = 'https://api.github.com'
const RAW_HOST = 'https://raw.githubusercontent.com'
const USER_AGENT = 'nextlist-web'

export class HttpError extends Error {
  constructor(message: string, public status = 500) {
    super(message)
    this.name = 'HttpError'
  }
}

function apiHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': USER_AGENT,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/** 内部 GET；404/422 等失败返回 null（由调用方决定如何降级） */
async function ghGet<T>(path: string, token?: string): Promise<T | null> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: apiHeaders(token) })
  if (!res.ok) {
    console.warn(`[github] GET ${path} → ${res.status}`)
    return null
  }
  return (await res.json()) as T
}

/** 读取当前 token 的用户身份；token 无效 / 过期抛 401 */
export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/user`, { headers: apiHeaders(token) })
  if (!res.ok) throw new HttpError('GitHub token 无效或已过期，请重新登录', 401)
  return (await res.json()) as GitHubUser
}

/** 搜索某用户名下带指定 topic 的公开仓库（排除 fork） */
export async function searchUserReposByTopic(token: string, login: string, topic: string): Promise<GitHubRepo[]> {
  const q = encodeURIComponent(`topic:${topic} user:${login} fork:false`)
  const data = await ghGet<{ items: GitHubRepo[] }>(`/search/repositories?q=${q}&per_page=100&sort=stars`, token)
  return data?.items ?? []
}

/**
 * 拉取仓库 README：
 * 1. GET /repos/{owner}/{repo}/readme 拿到 download_url（raw.githubusercontent.com 直链）
 * 2. 下载该 URL 获得 Markdown 纯文本
 */
export async function fetchRepoReadme(token: string, owner: string, repo: string): Promise<string | null> {
  const meta = await ghGet<{ download_url: string | null }>(`/repos/${owner}/${repo}/readme`, token)
  if (!meta?.download_url) return null
  const res = await fetch(meta.download_url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) {
    console.warn(`[github] 下载 README 失败：${owner}/${repo} → ${res.status}`)
    return null
  }
  return await res.text()
}

/**
 * 仓库根目录 plugin.json（市场展示元数据来源）。
 * 走 raw 直链，不消耗 GitHub API 配额；不存在 / 解析失败均返回 null（调用方回退仓库信息）。
 * 字段清洗：仅接受非空字符串，tags 最多保留 8 个。
 */
export async function fetchRepoManifest(owner: string, repo: string, branch: string): Promise<PluginManifest | null> {
  const url = `${RAW_HOST}/${owner}/${repo}/${branch}/plugin.json`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return null
    const data = (await res.json()) as Record<string, unknown>
    const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null)
    const tags = Array.isArray(data.tags)
      ? [...new Set(data.tags.filter((t): t is string => typeof t === 'string' && !!t.trim()).map((t) => t.trim()))].slice(0, 8)
      : []
    return {
      id: str(data.id),
      name: str(data.name),
      description: str(data.description),
      version: str(data.version),
      author: str(data.author),
      tags,
    }
  } catch {
    return null
  }
}

/**
 * 图标约定：仓库根目录存在 icon.png 则使用其 raw 直链，否则返回 null。
 * 使用 HEAD 探测 raw 直链，不消耗 GitHub API 配额；只存 URL，不转存文件。
 */
export async function resolveRepoIcon(owner: string, repo: string, branch: string): Promise<string | null> {
  const url = `${RAW_HOST}/${owner}/${repo}/${branch}/icon.png`
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok ? url : null
  } catch {
    return null
  }
}

/**
 * 下载链接：优先取最新 Release 的资产直链（browser_download_url，优先 .zip），
 * 其次 Release 页面链接；无 Release 时回退仓库地址。纯直链，无需 token 下载。
 */
export async function resolveDownloadUrl(token: string, owner: string, repo: string, repoUrl: string): Promise<string> {
  const release = await ghGet<{ assets: { browser_download_url: string }[]; html_url: string }>(
    `/repos/${owner}/${repo}/releases/latest`,
    token
  )
  if (release) {
    const asset = release.assets?.find((a) => a.browser_download_url?.toLowerCase().endsWith('.zip')) ?? release.assets?.[0]
    if (asset?.browser_download_url) return asset.browser_download_url
    if (release.html_url) return release.html_url
  }
  return repoUrl
}

export interface CollectResult {
  /** 组装完成的插件元数据 */
  plugins: PluginMeta[]
  /** id → README Markdown（仅收录成功拉取的部分） */
  readmes: Record<string, string>
}

/**
 * 收录流程核心：搜索 → 逐仓库补全（清单 / README / 图标 / 下载链接）。
 * 供「登录自动收录」与「手动刷新」两个入口复用。
 *
 * 展示元数据以仓库根目录 plugin.json 为准（见插件开发指南）：
 *   name = manifest.name ?? 仓库名；description / version / tags 同样 manifest 优先。
 */
export async function collectPlugins(token: string, login: string, topic: string): Promise<CollectResult> {
  const repos = await searchUserReposByTopic(token, login, topic)
  const plugins: PluginMeta[] = []
  const readmes: Record<string, string> = {}

  for (const repo of repos) {
    if (repo.fork) continue
    const owner = repo.owner.login
    const repoName = repo.name
    const branch = repo.default_branch || 'main'

    // README / 清单 / 图标 / 下载链接四路并行，减少整体耗时
    const [readme, icon, downloadUrl, manifest] = await Promise.all([
      fetchRepoReadme(token, owner, repoName),
      resolveRepoIcon(owner, repoName, branch),
      resolveDownloadUrl(token, owner, repoName, repo.html_url),
      fetchRepoManifest(owner, repoName, branch),
    ])

    plugins.push({
      id: repo.full_name,
      name: manifest?.name || repoName,
      repoName,
      description: manifest?.description ?? repo.description ?? '',
      owner,
      ownerAvatar: repo.owner.avatar_url,
      repoUrl: repo.html_url,
      icon,
      stars: repo.stargazers_count ?? 0,
      topics: repo.topics ?? [],
      tags: manifest?.tags ?? [],
      version: manifest?.version ?? null,
      pluginId: manifest?.id ?? null,
      updatedAt: repo.pushed_at || repo.updated_at || new Date().toISOString(),
      downloadUrl,
      defaultBranch: branch,
    })
    if (readme) readmes[repo.full_name] = readme
  }

  return { plugins, readmes }
}
