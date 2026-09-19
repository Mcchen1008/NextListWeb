/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../../api/utils/types'

/**
 * GET /plugins/plugin/:owner/:repo — 插件详情页 SPA 回退。
 *
 * 详情页路径含动态段（owner/repo），无法用真实静态文件覆盖；
 * 同样不能用 _redirects rewrite（会被 workerd 规范化 308 丢失 owner/repo
 * 路径段）。通过 Function 原样返回 SPA 入口，URL 保持不变，前端路由据此
 * 解析 owner/repo 并加载详情。
 */
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL('/plugins/index.html', ctx.request.url)
  return ctx.env.ASSETS.fetch(url.toString())
}
