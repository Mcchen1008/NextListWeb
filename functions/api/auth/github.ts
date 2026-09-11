/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../utils/types'
import { errorResponse, jsonResponse, preflight } from '../utils/http'
import { getPlugins, markRefreshed, mergePlugins, savePlugins, saveReadme } from '../utils/kv'
import { collectPlugins, fetchGitHubUser, HttpError } from '../utils/github'

/**
 * POST /api/auth/github — GitHub OAuth 回调
 *
 * 请求体：{ code: string }（前端 OAuth 授权后重定向携带的授权码）
 *
 * 流程：
 *   1. code + client_id + client_secret → access_token（github.com/login/oauth/access_token）
 *   2. token → GET /user 读取用户身份
 *   3. Search API 检索该用户名下带 `nextlist-plugin` topic 的公开仓库
 *   4. 逐仓库拉取 README 并缓存 KV `plugin:readme:<id>`
 *   5. 合并去重写入 KV `plugins:list`（不删除其他作者已收录的插件）
 *   6. 记录 user:<id>:refreshed_at（登录视作一次刷新，纳入冷却控制）
 *
 * 响应 200：
 * {
 *   user: { id, login, name, avatarUrl },
 *   token: string,        // 用户自己的 token（public_repo 只读），前端保存用于「刷新我的插件」
 *   collected: number,    // 本次新收录 / 更新的插件数
 *   total: number         // 全市场当前插件总数
 * }
 *
 * 安全说明：token 通过 HTTPS 返回给用户本人保存，权限仅 public_repo（只读公开仓库），
 * 用户可随时在 GitHub → Settings → Applications 撤销授权。
 */
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env
  try {
    const body = await ctx.request.json<{ code?: string }>().catch(() => null)
    const code = body?.code?.trim()
    if (!code) return errorResponse('缺少 code 参数', 400)

    const clientId = env.GITHUB_CLIENT_ID
    const clientSecret = env.GITHUB_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return errorResponse('服务端未配置 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET', 500)
    }

    // 1) 授权码换 access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'nextlist-web' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    })
    if (!tokenRes.ok) return errorResponse('GitHub OAuth 换取 token 失败', 502)
    const tokenData = await tokenRes.json<{ access_token?: string; error?: string; error_description?: string }>()
    const accessToken = tokenData.access_token
    if (!accessToken) {
      return errorResponse(tokenData.error_description || 'GitHub OAuth 授权失败', 401, { reason: tokenData.error })
    }

    // 2) 读取用户身份
    const user = await fetchGitHubUser(accessToken)

    // 3) 收录该用户名下带 topic 的公开仓库（含 README 缓存）
    const topic = env.PLUGIN_TOPIC || 'nextlist-plugin'
    const { plugins, readmes } = await collectPlugins(accessToken, user.login, topic)

    // 4) 合并去重写入 KV
    const kv = env.PLUGINS_KV
    const existing = await getPlugins(kv)
    const merged = mergePlugins(existing, plugins)
    await savePlugins(kv, merged)
    await Promise.all(Object.entries(readmes).map(([id, markdown]) => saveReadme(kv, id, markdown)))

    // 5) 记录刷新时间（纳入冷却控制）
    await markRefreshed(kv, String(user.id))

    return jsonResponse({
      user: { id: user.id, login: user.login, name: user.name || user.login, avatarUrl: user.avatar_url },
      token: accessToken,
      collected: plugins.length,
      total: merged.length,
    })
  } catch (err) {
    if (err instanceof HttpError) return errorResponse(err.message, err.status)
    console.error('[POST /api/auth/github]', err)
    return errorResponse('登录失败：GitHub API 调用异常', 502)
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => preflight()
