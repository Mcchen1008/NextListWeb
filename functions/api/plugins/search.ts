/// <reference types="@cloudflare/workers-types" />
import type { Env, PluginMeta } from '../utils/types'
import { getPlugins } from '../utils/kv'
import { errorResponse, jsonResponse, preflight } from '../utils/http'

/**
 * GET /api/plugins/search?q=<关键词>&limit=<条数>
 *
 * 服务端按关键词搜索插件（供插件市场站与 NextList 主程序的市场代理调用）。
 * 匹配范围与加权：名称（前缀 +2 / 包含 +4）> topics（+2）> 描述 / 作者（+1），
 * 同分时按 Star 数降序。q 为空时返回全量列表（按 Star 降序，截取前 limit 条）。
 *
 * 响应：{ query: string, plugins: PluginMeta[], total: number }
 * （total 为过滤后总数，未截断；前端可据此展示"共 N 个"）
 */

const DEFAULT_LIMIT = 60
const MAX_LIMIT = 200

function scoreOf(plugin: PluginMeta, q: string): number {
  let score = 0
  const name = (plugin.name ?? '').toLowerCase()
  if (name.includes(q)) score += 4
  if (name.startsWith(q)) score += 2
  if (plugin.topics?.some((t) => t.toLowerCase().includes(q))) score += 2
  if ((plugin.description ?? '').toLowerCase().includes(q)) score += 1
  if ((plugin.owner ?? '').toLowerCase().includes(q)) score += 1
  return score
}

function parseLimit(raw: string | null): number {
  const n = Number(raw ?? '')
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(n), MAX_LIMIT)
}

export async function searchPluginsResponse(env: Env, request: Request): Promise<Response> {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  const limit = parseLimit(url.searchParams.get('limit'))

  const all = await getPlugins(env.PLUGINS_KV)

  if (!q) {
    const sorted = [...all].sort((a, b) => b.stars - a.stars)
    return jsonResponse({ query: '', plugins: sorted.slice(0, limit), total: sorted.length })
  }

  const matched = all
    .map((plugin) => ({ plugin, score: scoreOf(plugin, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.plugin.stars - a.plugin.stars)
    .map((x) => x.plugin)

  return jsonResponse({ query: q, plugins: matched.slice(0, limit), total: matched.length })
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  try {
    return await searchPluginsResponse(ctx.env, ctx.request)
  } catch (err) {
    console.error('[GET /api/plugins/search]', err)
    return errorResponse('搜索插件失败', 500)
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => preflight()
