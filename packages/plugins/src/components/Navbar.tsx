import { A, useNavigate } from '@solidjs/router'
import { Show, createSignal } from 'solid-js'
import { GitHubIcon, BookIcon, LogoutIcon, RefreshIcon } from './Icons'
import { clearSession, token, user } from '../store/session'
import { startLogin } from '../utils/oauth'
import { refreshMyPlugins } from '../api/client'
import { showToast } from '../store/toast'
import { locale, t, toggleLocale } from '../i18n'

/** 顶部导航：品牌、文档入口、语言切换、登录区（登录后含「刷新我的插件」） */

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
    showToast(t('nav.loggedOut'), 'info')
    navigate('/', { replace: true })
  }

  async function onRefresh() {
    const t0 = token()
    if (!t0 || refreshing()) return
    setRefreshing(true)
    try {
      const res = await refreshMyPlugins(t0)
      showToast(t('nav.refreshDone', { collected: res.collected, total: res.total }), 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <header class="navbar">
      <div class="container navbar-inner">
        <A class="brand" href="/" aria-label={t('nav.brandAria')}>
          <img src="/logo.svg" alt="" width="26" height="26" />
          <span class="brand-name">
            NextList <em>{t('nav.brandSuffix')}</em>
          </span>
        </A>

        <nav class="nav-links" aria-label={t('nav.marketAria')}>
          <a href="/" target="_self">
            <BookIcon size={15} />
            <span class="nav-text">{t('nav.docs')}</span>
          </a>
          <a href="https://github.com/Mcchen1008/NextList" target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={15} />
            <span class="nav-text">{t('nav.repo')}</span>
          </a>
        </nav>

        <div class="nav-actions">
          <Show
            when={user()}
            fallback={
              <button class="btn btn-primary btn-sm" onClick={onLogin} disabled={loggingIn()}>
                <GitHubIcon size={15} />
                {loggingIn() ? <span>{t('nav.loggingIn')}</span> : (
                  <>
                    <span class="hide-sm">{t('nav.loginFull')}</span>
                    <span class="show-sm">{t('nav.loginShort')}</span>
                  </>
                )}
              </button>
            }
          >
            {(u) => (
              <>
                <button class="btn btn-secondary btn-sm" onClick={onRefresh} disabled={refreshing()} title={t('nav.refreshTitle')}>
                  <RefreshIcon size={14} class={refreshing() ? 'spin' : undefined} />
                  {refreshing() ? t('nav.refreshing') : t('nav.refresh')}
                </button>
                <span class="nav-user" title={u().login}>
                  <img src={u().avatarUrl} alt="" width="26" height="26" />
                  <span class="nav-user-name">{u().name || u().login}</span>
                </span>
                <button class="icon-btn" onClick={onLogout} aria-label={t('nav.logout')} title={t('nav.logout')}>
                  <LogoutIcon size={15} />
                </button>
              </>
            )}
          </Show>
          <button
            class="icon-btn lang-toggle"
            onClick={toggleLocale}
            aria-label={t('lang.switchTitle')}
            title={t('lang.switchTitle')}
          >
            <span class="lang-toggle-text">{locale() === 'zh' ? 'EN' : '中'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
