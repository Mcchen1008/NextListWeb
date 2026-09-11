/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../utils/types'
import { getPlugins } from '../utils/kv'
import { errorResponse, jsonResponse, preflight } from '../utils/http'

/**
 * GET /api/plugins
 *
 * 返回全量插件列表（读 KV `plugins:list`）。
 * KV 不支持模糊搜索 / 排序分页，列表整体下发后，
 * 搜索、筛选、排序均在浏览器端完成，不消耗任何服务端资源。
 *
 * 响应：{ plugins: PluginMeta[], total: number }
 *
 * ⚠️ 路由说明：同目录的 `[[path]].ts` 是可选 catch-all，在部分运行时
 * （如 wrangler pages dev）会以更高优先级截获 `/api/plugins` 本身。
 * 因此列表逻辑抽为 `listPluginsResponse` 供两处复用，保证行为一致。
 */
export async function listPluginsResponse(env: Env): Promise<Response> {
  const plugins = await getPlugins(env.PLUGINS_KV)
  return jsonResponse({ plugins, total: plugins.length })
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  try {
    return await listPluginsResponse(ctx.env)
  } catch (err) {
    console.error('[GET /api/plugins]', err)
    return errorResponse('读取插件列表失败', 500)
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => preflight()
