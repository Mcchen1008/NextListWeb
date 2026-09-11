import type { ApiError, AuthConfig, AuthResult, PluginMeta } from '../types'

/**
 * API 客户端：与 Pages Functions 同源通信（/api/*）。
 * 本地开发由 Vite proxy 转发到 wrangler pages dev（8788 端口）。
 */

const API_BASE = '/api'

/** 统一请求封装：解析 JSON、抛出带状态码的错误 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const payload = data as { error?: string; retryAfter?: number } | null
    const err = new Error(payload?.error ?? `请求失败（HTTP ${res.status}）`) as ApiError
    err.status = res.status
    if (typeof payload?.retryAfter === 'number') err.retryAfter = payload.retryAfter
    throw err
  }
  return data as T
}

/** OAuth 配置（Client ID 为公开信息，由服务端下发，改配置无需重新构建前端） */
export function fetchAuthConfig(): Promise<AuthConfig> {
  return request<AuthConfig>('/auth/config')
}

/** 全量插件列表（搜索 / 筛选 / 排序在浏览器端完成） */
export function fetchPlugins(): Promise<{ plugins: PluginMeta[]; total: number }> {
  return request('/plugins')
}

/** 单个插件详情 */
export function fetchPlugin(id: string): Promise<{ plugin: PluginMeta }> {
  return request(`/plugins/${encodeId(id)}`)
}

/** 插件 README（Markdown 纯文本） */
export async function fetchReadme(id: string): Promise<string> {
  const res = await request<{ id: string; readme: string }>(`/plugins/${encodeId(id)}/readme`)
  return res.readme
}

/** OAuth 授权码换登录态（服务端同时完成收录） */
export function exchangeCode(code: string): Promise<AuthResult> {
  return request('/auth/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
}

/** 刷新当前登录用户的插件（Bearer token 鉴权，服务端控制冷却） */
export function refreshMyPlugins(token: string): Promise<{ collected: number; total: number }> {
  return request('/plugins/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** id 形如 owner/repo：对每段单独编码，避免斜杠被整体编码后无法命中路由 */
function encodeId(id: string): string {
  return id
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}
