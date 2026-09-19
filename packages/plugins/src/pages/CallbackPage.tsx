import { A, useNavigate, useSearchParams } from '@solidjs/router'
import { onMount, Show, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import { showToast } from '../store/toast'
import { completeOAuthCallback } from '../utils/oauth'
import { GitHubIcon } from '../components/Icons'

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
          ? `授权被取消：${String(searchParams.error_description)}`
          : '未收到授权码，请重新发起登录'
      )
      setBusy(false)
      return
    }

    // completeOAuthCallback：state 校验 → 服务端换取登录态（同时完成插件收录）
    completeOAuthCallback(code, state)
      .then((res) => {
        showToast(
          `欢迎，${res.user.name}！本次收录 / 更新 ${res.collected} 个插件（市场共 ${res.total} 个）`,
          'success'
        )
        navigate('/', { replace: true })
      })
      .catch((err: Error) => {
        setError(err.message || '登录失败，请稍后再试')
        setBusy(false)
      })
  })

  return (
    <div class="container page">
      <div class="center-block callback-block">
        <GitHubIcon size={40} class="callback-icon" />
        <Show when={busy()} fallback={<ErrorCard message={error()} />}>
          <span class="spinner" aria-hidden="true" />
          <p>正在完成 GitHub 登录，请稍候…</p>
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
        返回插件市场
      </A>
    </>
  )
}

export default CallbackPage
