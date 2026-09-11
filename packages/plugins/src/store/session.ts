import { createSignal } from 'solid-js'
import type { SessionUser } from '../types'

/**
 * 登录态管理（localStorage 持久化）。
 * 安全边界：token 为用户本人 GitHub token（仅 public_repo 只读权限），
 * 仅存于用户自己的浏览器，可随时在 GitHub 设置中撤销授权。
 */

const USER_KEY = 'nextlist_user'
const TOKEN_KEY = 'nextlist_token'

function loadUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionUser
    return parsed && typeof parsed.id === 'number' ? parsed : null
  } catch {
    return null
  }
}

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

const [user, setUser] = createSignal<SessionUser | null>(loadUser())
const [token, setToken] = createSignal<string | null>(loadToken())

/** 保存登录态 */
export function saveSession(nextUser: SessionUser, nextToken: string): void {
  setUser(nextUser)
  setToken(nextToken)
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    localStorage.setItem(TOKEN_KEY, nextToken)
  } catch {
    /* 隐私模式下忽略 */
  }
}

/** 退出登录 */
export function clearSession(): void {
  setUser(null)
  setToken(null)
  try {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* 忽略 */
  }
}

export { user, token }
