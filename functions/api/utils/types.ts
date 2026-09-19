/// <reference types="@cloudflare/workers-types" />

/**
 * 插件元数据（KV `plugins:list` 数组元素）
 * 对外结构与需求文档保持一致，`defaultBranch` 为补充字段，
 * 用于前端把 README 中的相对图片链接解析为 raw.githubusercontent.com 绝对地址。
 *
 * 展示元数据（name / description / version / tags）优先取自仓库根目录
 * `plugin.json`（插件清单），缺失时回退到 GitHub 仓库信息；仓库名固定存于 `repoName`。
 */
export interface PluginMeta {
  /** 唯一标识：owner/repo */
  id: string
  /** 插件展示名：优先 plugin.json 的 name，回退仓库名 */
  name: string
  /** 仓库名（name 的回退来源；搜索与次要展示用） */
  repoName?: string
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
  /** 插件清单标签（plugin.json 的 tags，支持中文），市场展示优先于 topics */
  tags?: string[]
  /** 插件版本号（plugin.json 的 version），无则为 null */
  version?: string | null
  /** 插件清单唯一 id（plugin.json 的 id，区别于 owner/repo），用于与已安装插件精确匹配 */
  pluginId?: string | null
  /** 最近推送时间（ISO 8601） */
  updatedAt: string
  /** 下载链接：优先 GitHub Release 资产直链，无 Release 时回退仓库地址 */
  downloadUrl: string
  /** 默认分支（补充字段） */
  defaultBranch?: string
}

/** 仓库根目录 plugin.json（市场收录展示元数据来源；仅保留所需字段） */
export interface PluginManifest {
  id: string | null
  name: string | null
  description: string | null
  version: string | null
  author: string | null
  tags: string[]
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
