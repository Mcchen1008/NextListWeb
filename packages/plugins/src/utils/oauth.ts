import { fetchAuthConfig } from '../api/client'

/**
 * GitHub OAuth 登录流程（前端侧）：
 *   1. 拉取 /api/auth/config 获取 Client ID
 *   2. 生成 state 存 sessionStorage（防 CSRF）
 *   3. 跳转 GitHub 授权页（scope=public_repo，只读公开仓库）
 *   4. GitHub 携带 code 重定向回 /plugins/callback，由 CallbackPage 完成 token 交换
 */

const STATE_KEY = 'nextlist_oauth_state'

/** 发起登录；配置缺失时抛出可展示的错误 */
export async function startLogin(): Promise<void> {
  const cfg = await fetchAuthConfig()
  if (!cfg.configured || !cfg.clientId) {
    throw new Error('管理员尚未配置 GitHub OAuth（GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET），详见官网仓库 README')
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
