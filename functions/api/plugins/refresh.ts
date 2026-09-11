/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../utils/types'
import { bearerToken, errorResponse, jsonResponse, preflight } from '../utils/http'
import { checkCooldown, getPlugins, markRefreshed, mergePlugins, savePlugins, saveReadme } from '../utils/kv'
import { collectPlugins, fetchGitHubUser, HttpError } from '../utils/github'

/**
 * POST /api/plugins/refresh
 *
 * 作者刷新自己的插件（手动触发收录）。
 * 鉴权：Authorization: Bearer <github_token>（登录接口返回的用户 token，仅 public_repo 权限）。
 *
 * 流程：
 *   1. 用 token 读取用户身份（顺带验证 token 有效性）
 *   2. 检查冷却（REFRESH_COOLDOWN_SECONDS，默认 5 分钟）——避免打爆 GitHub rate limit
 *   3. Search API 检索该用户带 topic 的公开仓库 → 补全 README / 图标 / 下载链接
 *   4. 合并去重写入 KV，并记录本次刷新时间
 *
 * 响应 200：{ collected, total, nextRefreshAvailableAt }
 * 错误：401 未登录 / token 失效；429 冷却中（携带 retryAfter）；502 GitHub API 异常
 */
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env
  try {
    const token = bearerToken(ctx.request)
    if (!token) return errorResponse('缺少 Authorization: Bearer <token>，请先用 GitHub 登录', 401)

    // 1) 验证 token 并读取身份
    const user = await fetchGitHubUser(token)

    // 2) 冷却检查
    const kv = env.PLUGINS_KV
    const cooldownSeconds = Math.max(0, Number(env.REFRESH_COOLDOWN_SECONDS ?? '300') || 300)
    const cooldown = await checkCooldown(kv, String(user.id), cooldownSeconds)
    if (!cooldown.ok) {
      return errorResponse(`操作过于频繁，请 ${cooldown.retryAfter} 秒后再试`, 429, {
        retryAfter: cooldown.retryAfter,
      })
    }

    // 3) 收录该用户名下带 topic 的公开仓库
    const topic = env.PLUGIN_TOPIC || 'nextlist-plugin'
    const { plugins, readmes } = await collectPlugins(token, user.login, topic)

    // 4) 合并去重写入 KV
    const existing = await getPlugins(kv)
    const merged = mergePlugins(existing, plugins)
    await savePlugins(kv, merged)
    await Promise.all(Object.entries(readmes).map(([id, markdown]) => saveReadme(kv, id, markdown)))
    await markRefreshed(kv, String(user.id))

    return jsonResponse({
      collected: plugins.length,
      total: merged.length,
      nextRefreshAvailableAt: Date.now() + cooldownSeconds * 1000,
    })
  } catch (err) {
    if (err instanceof HttpError) return errorResponse(err.message, err.status)
    console.error('[POST /api/plugins/refresh]', err)
    return errorResponse('刷新失败：GitHub API 调用异常，请稍后再试', 502)
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => preflight()
