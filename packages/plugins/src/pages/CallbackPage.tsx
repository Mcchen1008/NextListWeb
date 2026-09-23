import { A, useNavigate, useSearchParams } from '@solidjs/router'
import { onMount, Show, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import { showToast } from '../store/toast'
import { completeOAuthCallback } from '../utils/oauth'
import { GitHubIcon } from '../components/Icons'
import { t } from '../i18n'

/**
 * OAuth 回调页：/plugins/callback?code=xxx&state=xxx
 * 用 code 换取登录态（服务端同时完成插件收录），随后跳回列表页。
 */
const CallbackPage: Component = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = createSignal('')
  const [busy, setBusy] = createSignal(true)

  onMount(() => {
    const code = searchParams.code ? String(searchParams.code) : ''
    const state = searchParams.state ? String(searchParams.state) : null

    // 用户在 GitHub 上取消了授权
    if (!code) {
      setError(
        searchParams.error_description
          ? `${t('auth.cancelledPrefix')}${String(searchParams.error_description)}`
          : t('auth.noCode')
      )
      setBusy(false)
      return
    }

    // completeOAuthCallback：state 校验 → 服务端换取登录态（同时完成插件收录）
    completeOAuthCallback(code, state)
      .then((res) => {
        showToast(
          t('auth.welcome', { name: res.user.name, collected: res.collected, total: res.total }),
          'success'
        )
        navigate('/', { replace: true })
      })
      .catch((err: Error) => {
        setError(err.message || t('auth.failed'))
        setBusy(false)
      })
  })

  return (
    <div class="container page">
      <div class="center-block callback-block">
        <GitHubIcon size={40} class="callback-icon" />
        <Show when={busy()} fallback={<ErrorCard message={error()} />}>
          <span class="spinner" aria-hidden="true" />
          <p>{t('auth.completing')}</p>
        </Show>
      </div>
    </div>
  )
}

function ErrorCard(props: { message: string }) {
  return (
    <>
      <p class="error-text">{props.message}</p>
      <A class="btn btn-secondary btn-sm" href="/">
        {t('auth.backToMarket')}
      </A>
    </>
  )
}

export default CallbackPage
