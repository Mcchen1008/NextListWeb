/// <reference types="@cloudflare/workers-types" />
import type { PluginMeta } from './types'

/**
 * KV 数据模型（绑定名 PLUGINS_KV）：
 *   plugins:list                 → JSON 数组，所有插件元数据（整体存一个 key）
 *   plugin:readme:<id>           → Markdown 文本，单个插件 README 缓存
 *   user:<github_id>:refreshed_at → 时间戳毫秒，用于刷新冷却
 *
 * KV 不支持复杂查询 / 模糊搜索 / 排序分页，
 * 因此列表整体读写，搜索、筛选、排序全部在前端浏览器内完成。
 */

export const PLUGINS_LIST_KEY = 'plugins:list'
const README_KEY_PREFIX = 'plugin:readme:'
const REFRESH_KEY_PREFIX = 'user:'
const REFRESH_KEY_SUFFIX = ':refreshed_at'

/** 读取全量插件列表；key 不存在或数据损坏时返回空数组 */
export async function getPlugins(kv: KVNamespace): Promise<PluginMeta[]> {
  const raw = await kv.get(PLUGINS_LIST_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PluginMeta[]) : []
  } catch {
    console.error('[kv] plugins:list 解析失败，已按空列表处理')
    return []
  }
}

/** 写入全量插件列表 */
export async function savePlugins(kv: KVNamespace, plugins: PluginMeta[]): Promise<void> {
  await kv.put(PLUGINS_LIST_KEY, JSON.stringify(plugins))
}

/**
 * 按 id 去重合并两份插件列表：
 * incoming（新收录）的字段覆盖同 id 旧数据，existing 独有的条目保留；
 * 结果按 star 数降序，便于前端默认展示。
 */
export function mergePlugins(existing: PluginMeta[], incoming: PluginMeta[]): PluginMeta[] {
  const map = new Map<string, PluginMeta>()
  for (const p of existing) map.set(p.id, p)
  for (const p of incoming) map.set(p.id, { ...map.get(p.id), ...p })
  return [...map.values()].sort((a, b) => b.stars - a.stars)
}

/** 读取插件 README 缓存 */
export function getReadme(kv: KVNamespace, id: string): Promise<string | null> {
  return kv.get(README_KEY_PREFIX + id)
}

/** 写入插件 README 缓存 */
export function saveReadme(kv: KVNamespace, id: string, markdown: string): Promise<void> {
  return kv.put(README_KEY_PREFIX + id, markdown)
}

function refreshKey(githubId: string): string {
  return `${REFRESH_KEY_PREFIX}${githubId}${REFRESH_KEY_SUFFIX}`
}

/** 读取上次刷新时间戳（毫秒），未刷新过返回 null */
export async function getLastRefreshedAt(kv: KVNamespace, githubId: string): Promise<number | null> {
  const raw = await kv.get(refreshKey(githubId))
  if (raw == null) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** 记录本次刷新时间 */
export async function markRefreshed(kv: KVNamespace, githubId: string): Promise<void> {
  await kv.put(refreshKey(githubId), String(Date.now()))
}

/**
 * 冷却检查：
 * ok=true 允许刷新；ok=false 时 retryAfter 为还需等待的秒数。
 */
export async function checkCooldown(
  kv: KVNamespace,
  githubId: string,
  cooldownSeconds: number
): Promise<{ ok: boolean; retryAfter: number; lastAt: number | null }> {
  const lastAt = await getLastRefreshedAt(kv, githubId)
  if (lastAt == null) return { ok: true, retryAfter: 0, lastAt: null }
  const elapsed = (Date.now() - lastAt) / 1000
  if (elapsed >= cooldownSeconds) return { ok: true, retryAfter: 0, lastAt }
  return { ok: false, retryAfter: Math.ceil(cooldownSeconds - elapsed), lastAt }
}
