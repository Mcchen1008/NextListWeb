/** 与 Cloudflare Pages Functions（functions/api/utils/types.ts）保持一致的数据结构 */

/** 插件元数据（KV plugins:list 数组元素） */
export interface PluginMeta {
  /** 唯一标识：owner/repo */
  id: string
  /** 插件展示名：优先 plugin.json 的 name，回退仓库名 */
  name: string
  /** 仓库名（name 的回退来源；搜索与次要展示用） */
  repoName?: string
  description: string
  owner: string
  ownerAvatar: string
  repoUrl: string
  /** 仓库根目录 icon.png 的 raw 直链，无则为 null */
  icon: string | null
  stars: number
  topics: string[]
  /** 插件清单标签（plugin.json 的 tags，支持中文），市场展示优先于 topics */
  tags?: string[]
  /** 插件版本号（plugin.json 的 version），无则为 null */
  version?: string | null
  /** 插件清单唯一 id（plugin.json 的 id，区别于 owner/repo） */
  pluginId?: string | null
  updatedAt: string
  /** GitHub Release 资产直链或仓库地址 */
  downloadUrl: string
  defaultBranch?: string
}

/** 登录用户信息 */
export interface SessionUser {
  id: number
  login: string
  name: string
  avatarUrl: string
}

/** GET /api/auth/config 响应 */
export interface AuthConfig {
  configured: boolean
  clientId: string
  authorizeUrl: string
  scope: string
}

/** POST /api/auth/github 响应 */
export interface AuthResult {
  user: SessionUser
  token: string
  collected: number
  total: number
}

/** 带 HTTP 状态与冷却信息的错误对象 */
export interface ApiError extends Error {
  status?: number
  retryAfter?: number
}
