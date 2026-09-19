import { A, useNavigate } from '@solidjs/router'
import { Show, createSignal } from 'solid-js'
import { GitHubIcon, BookIcon, LogoutIcon, RefreshIcon } from './Icons'
import { clearSession, token, user } from '../store/session'
import { startLogin } from '../utils/oauth'
import { refreshMyPlugins } from '../api/client'
import { showToast } from '../store/toast'

/** 顶部导航：品牌、文档入口、登录区（登录后含「刷新我的插件」） */

export function Navbar() {
  const navigate = useNavigate()
  const [loggingIn, setLoggingIn] = createSignal(false)
  const [refreshing, setRefreshing] = createSignal(false)

  async function onLogin() {
    setLoggingIn(true)
    try {
      await startLogin() // 成功会跳转 GitHub，不会返回
    } catch (err) {
      showToast((err as Error).message, 'error')
      setLoggingIn(false)
    }
  }

  function onLogout() {
    clearSession()
    showToast('已退出登录', 'info')
    navigate('/', { replace: true })
  }

  async function onRefresh() {
    const t = token()
    if (!t || refreshing()) return
    setRefreshing(true)
    try {
      const res = await refreshMyPlugins(t)
      showToast(`刷新完成：本次收录 / 更新 ${res.collected} 个插件，市场共 ${res.total} 个`, 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <header class="navbar">
      <div class="container navbar-inner">
        <A class="brand" href="/" aria-label="NextList 插件市场首页">
          <img src="/logo.svg" alt="" width="26" height="26" />
          <span class="brand-name">
            NextList <em>插件市场</em>
          </span>
        </A>

        <nav class="nav-links" aria-label="插件市场导航">
          <a href="/" target="_self">
            <BookIcon size={15} />
            <span class="nav-text">文档</span>
          </a>
          <a href="https://github.com/Mcchen1008/NextList" target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={15} />
            <span class="nav-text">主仓库</span>
          </a>
        </nav>

        <div class="nav-actions">
          <Show
            when={user()}
            fallback={
              <button class="btn btn-primary btn-sm" onClick={onLogin} disabled={loggingIn()}>
                <GitHubIcon size={15} />
                {loggingIn() ? <span>跳转中…</span> : (
                  <>
                    <span class="hide-sm">用 GitHub&nbsp;</span>
                    <span>登录</span>
                  </>
                )}
              </button>
            }
          >
            {(u) => (
              <>
                <button class="btn btn-secondary btn-sm" onClick={onRefresh} disabled={refreshing()} title="重新拉取我名下带 nextlist-plugin topic 的公开仓库">
                  <RefreshIcon size={14} class={refreshing() ? 'spin' : undefined} />
                  {refreshing() ? '刷新中…' : '刷新我的插件'}
                </button>
                <span class="nav-user" title={u().login}>
                  <img src={u().avatarUrl} alt="" width="26" height="26" />
                  <span class="nav-user-name">{u().name || u().login}</span>
                </span>
                <button class="icon-btn" onClick={onLogout} aria-label="退出登录" title="退出登录">
                  <LogoutIcon size={15} />
                </button>
              </>
            )}
          </Show>
        </div>
      </div>
    </header>
  )
}
