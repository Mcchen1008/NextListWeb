import { Router, Route } from '@solidjs/router'
import type { RouteSectionProps } from '@solidjs/router'
import { For, onMount } from 'solid-js'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import ListPage from './pages/ListPage'
import DetailPage from './pages/DetailPage'
import CallbackPage from './pages/CallbackPage'
import NotFound from './pages/NotFound'
import { toasts } from './store/toast'
import { handleStrayOAuthCallback } from './utils/oauth'

/** 全局布局：导航 + 路由出口 + 页脚 + toast 通知栈 */
const Layout = (props: RouteSectionProps) => {
  // OAuth 回调兜底：GitHub 按 OAuth App 后台配置重定向时，授权码可能落在
  // /plugins/ 而非 /plugins/callback（callback URL 未精确到 callback）。
  // 在布局层统一检测并就地完成登录，避免登录链路静默失败。
  onMount(() => {
    void handleStrayOAuthCallback()
  })

  return (
    <div class="app">
      <Navbar />
      <main class="app-main">{props.children}</main>
      <Footer />
      <div class="toast-stack" aria-live="polite">
        <For each={toasts()}>{(t) => <div class={`toast toast-${t.kind}`}>{t.text}</div>}</For>
      </div>
    </div>
  )
}

/** SPA 入口：base 与 Vite base（/plugins/）保持一致，开发 / 生产行为相同 */
export default function App() {
  return (
    <Router base="/plugins" root={Layout}>
      <Route path="/" component={ListPage} />
      <Route path="/callback" component={CallbackPage} />
      <Route path="/plugin/:owner/:repo" component={DetailPage} />
      <Route path="*" component={NotFound} />
    </Router>
  )
}
