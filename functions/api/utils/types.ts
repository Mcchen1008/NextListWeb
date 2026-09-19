/// <reference types="@cloudflare/workers-types" />

/**
 * 插件元数据（KV `plugins:list` 数组元素）
 * 对外结构与需求文档保持一致，`defaultBranch` 为补充字段，
 * 用于前端把 README 中的相对图片链接解析为 raw.githubusercontent.com 绝对地址。
 */
export interface PluginMeta {
  /** 唯一标识：owner/repo */
  id: string
  /** 插件名（仓库名） */
  name: string
  description: string
  /** GitHub 用户名 */
  owner: string
  /** 作者头像 URL */
  ownerAvatar: string
  /** 仓库地址 */
  repoUrl: string
  /** 图标 URL（约定：仓库根目录 icon.png），无则为 null，由前端回退到作者头像 / 首字母色块 */
  icon: string | null
  stars: number
  /** 仓库 topics，包含收录约定的 `nextlist-plugin` */
  topics: string[]
  /** 最近推送时间（ISO 8601） */
  updatedAt: string
  /** 下载链接：优先 GitHub Release 资产直链，无 Release 时回退仓库地址 */
  downloadUrl: string
  /** 默认分支（补充字段） */
  defaultBranch?: string
}

/** GitHub Search API 返回的仓库（仅保留所需字段） */
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  fork: boolean
  html_url: string
  stargazers_count: number
  topics: string[]
  updated_at: string
  pushed_at: string
  default_branch: string
  owner: { login: string; avatar_url: string }
}

/** GET /user 返回（仅保留所需字段） */
export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
}

/** Pages Functions 环境变量与绑定 */
export interface Env {
  /** KV 绑定：插件市场数据（在 Pages 设置或 wrangler.toml 中绑定） */
  PLUGINS_KV: KVNamespace
  /** 静态资产绑定（Pages 自动提供）：用于 SPA 回退时原样返回 index.html */
  ASSETS: { fetch: (url: string) => Promise<Response> }
  /** GitHub OAuth App Client ID（Secret，勿提交） */
  GITHUB_CLIENT_ID?: string
  /** GitHub OAuth App Client Secret（Secret，勿提交） */
  GITHUB_CLIENT_SECRET?: string
  /** 插件收录 topic，默认 nextlist-plugin */
  PLUGIN_TOPIC?: string
  /** 刷新冷却秒数，默认 300 */
  REFRESH_COOLDOWN_SECONDS?: string
}
