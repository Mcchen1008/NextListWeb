/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../api/utils/types'

/**
 * GET /plugins/callback — OAuth 回调页 SPA 回退。
 *
 * 为什么不用 _redirects rewrite：workerd（wrangler 4.x / 现行 Pages 资产服务）
 * 会把“rewrite 到 X/index.html”视为目录索引规范化，对请求先 308 到去掉末段
 * 的目录路径（/plugins/callback → /plugins/，授权 query 虽保留但 /callback
 * 路由丢失，登录链路静默失败）；rewrite 到普通 .html 也会被 clean-URL 规范
 * 化 308 去掉扩展名。通过 Function 返回资产则 URL 原样保留，SPA 路由可直接
 * 命中 /callback，由 CallbackPage 完成授权码交换与插件收录。
 */
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL('/plugins/index.html', ctx.request.url)
  return ctx.env.ASSETS.fetch(url.toString())
}
