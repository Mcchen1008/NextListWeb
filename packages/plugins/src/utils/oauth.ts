import { exchangeCode, fetchAuthConfig } from '../api/client'
import { saveSession } from '../store/session'
import { showToast } from '../store/toast'
import { t } from '../i18n'
import type { AuthResult } from '../types'

/**
 * GitHub OAuth 登录流程（前端侧）：
 *   1. 拉取 /api/auth/config 获取 Client ID
 *   2. 生成 state 存 sessionStorage（防 CSRF）
 *   3. 跳转 GitHub 授权页（scope=public_repo，只读公开仓库）
 *   4. GitHub 携带 code 重定向回 /plugins/callback，由 CallbackPage 完成 token 交换
 *
 * 兼容性说明：GitHub 实际重定向到 OAuth App 后台配置的 callback URL。若管理员把它
 * 配置成 /plugins/（而非 /plugins/callback），授权码会直接挂在市场首页 URL 上，
 * CallbackPage 不会运行——因此布局层还挂有 handleStrayOAuthCallback 兜底（见下）。
 */

const STATE_KEY = 'nextlist_oauth_state'

/** 发起登录；配置缺失时抛出可展示的错误 */
export async function startLogin(): Promise<void> {
  const cfg = await fetchAuthConfig()
  if (!cfg.configured || !cfg.clientId) {
    throw new Error(t('auth.notConfigured'))
  }
  const state = crypto.randomUUID()
  try {
    sessionStorage.setItem(STATE_KEY, state)
  } catch {
    /* 忽略 */
  }
  const redirectUri = `${window.location.origin}/plugins/callback`
  const url =
    `${cfg.authorizeUrl}?client_id=${encodeURIComponent(cfg.clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(cfg.scope || 'public_repo')}` +
    `&state=${encodeURIComponent(state)}`
  window.location.href = url
}

/** 校验并消费 state（一次性）；不匹配返回 false */
export function consumeState(expected: string | null): boolean {
  let saved: string | null = null
  try {
    saved = sessionStorage.getItem(STATE_KEY)
    sessionStorage.removeItem(STATE_KEY)
  } catch {
    /* 忽略 */
  }
  return Boolean(saved && expected && saved === expected)
}

/**
 * 完成 OAuth 回调（CallbackPage 与全局兜底共用）：
 * 校验 state → 用 code 向服务端换取登录态（服务端同时完成插件收录）→ 保存会话。
 * 失败时抛出可直接展示给用户的错误。
 */
export async function completeOAuthCallback(code: string, state: string | null): Promise<AuthResult> {
  if (!consumeState(state)) {
    throw new Error(t('auth.stateMismatch'))
  }
  const res = await exchangeCode(code)
  saveSession(res.user, res.token)
  return res
}

/**
 * 全局 OAuth 回调兜底：处理 GitHub 直接重定向到 /plugins/（callback URL 配置为
 * 市场首页）的情况。检测到非 /callback 路径上的 code+state 时，就地完成登录、
 * 清理地址栏参数并以 toast 反馈结果；返回 true 表示已接管。
 * 说明：/plugins/callback 路径仍由 CallbackPage 专属处理，此处主动跳过避免
 * 同一授权码被消费两次。
 */
export async function handleStrayOAuthCallback(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  if (!code || !state) return false
  if (window.location.pathname.replace(/\/$/, '').endsWith('/callback')) return false

  // 授权码一次性且含敏感信息：先从地址栏移除，避免刷新重放或链接外泄
  params.delete('code')
  params.delete('state')
  params.delete('iss')
  const rest = params.toString()
  window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash)

  try {
    const res = await completeOAuthCallback(code, state)
    showToast(
      t('auth.welcome', { name: res.user.name, collected: res.collected, total: res.total }),
      'success'
    )
  } catch (err) {
    showToast((err as Error).message || t('auth.failed'), 'error')
  }
  return true
}
