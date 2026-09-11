/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../utils/types'
import { errorResponse, jsonResponse, preflight } from '../utils/http'
import { getPlugins, getReadme } from '../utils/kv'
import { listPluginsResponse } from './index'

/**
 * GET /api/plugins/:id
 * GET /api/plugins/:id/readme
 *
 * 说明：插件 id 形如 `owner/repo`（自带斜杠），因此本目录使用可选 catch-all
 * `[[path]].ts` 统一承接两段 / 三段路径；同目录下更精确的
 * `refresh.ts`（/api/plugins/refresh）处理刷新请求。
 *
 * 注意：可选 catch-all 同样会匹配 `/api/plugins` 本身（部分运行时下优先于
 * `index.ts`），因此空路径时委托给 `listPluginsResponse` 返回列表，
 * 与 index.ts 的行为保持一致。
 *
 * 响应：
 *   列表   { plugins: PluginMeta[], total: number }
 *   详情   { plugin: PluginMeta }
 *   README { id: string, readme: string }   （readme 为 Markdown 纯文本）
 */

/** 宽松解码：段可能已被平台解码，二次解码失败时原样返回 */
function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

export const onRequestGet: PagesFunction<Env, 'path'> = async (ctx) => {
  try {
    const raw = ctx.params.path as string | string[] | undefined

    // 空路径 = /api/plugins 本身 → 返回全量列表
    if (raw == null) return await listPluginsResponse(ctx.env)

    const parts = (Array.isArray(raw) ? raw : [raw])
      .filter((p): p is string => typeof p === 'string' && p.length > 0)
      .map(safeDecode)

    // 解码后为空（如 /api/plugins/）→ 同样返回列表
    if (parts.length === 0) return await listPluginsResponse(ctx.env)

    const wantReadme = parts[parts.length - 1].toLowerCase() === 'readme'
    const idParts = wantReadme ? parts.slice(0, -1) : parts
    if (idParts.length !== 2) {
      return errorResponse('无效的插件 ID，期望 /api/plugins/<owner>/<repo> 或 /api/plugins/<owner>/<repo>/readme', 400, {
        got: parts.join('/'),
      })
    }
    const id = idParts.join('/')
    const kv = ctx.env.PLUGINS_KV

    if (wantReadme) {
      const readme = await getReadme(kv, id)
      if (readme == null) {
        return errorResponse('暂无该插件的 README 缓存（可能尚未被收录）', 404, { id })
      }
      return jsonResponse({ id, readme })
    }

    const plugins = await getPlugins(kv)
    const plugin = plugins.find((p) => p.id === id)
    if (!plugin) return errorResponse('插件不存在（可能尚未被收录）', 404, { id })
    return jsonResponse({ plugin })
  } catch (err) {
    console.error('[GET /api/plugins/:id]', err)
    return errorResponse('读取插件数据失败', 500)
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => preflight()
