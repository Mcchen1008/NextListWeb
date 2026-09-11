import { onMount, Show } from 'solid-js'

/**
 * Giscus 评论组件（基于 GitHub Discussions，与文档站同一套配置约定）。
 * 配置通过构建时环境变量注入（在 https://giscus.app 生成）：
 *   VITE_GISCUS_REPO / VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY / VITE_GISCUS_CATEGORY_ID
 * 评论数据与插件市场 KV 数据完全独立。
 */

const REPO = (import.meta.env.VITE_GISCUS_REPO as string | undefined) ?? ''
const REPO_ID = (import.meta.env.VITE_GISCUS_REPO_ID as string | undefined) ?? ''
const CATEGORY = (import.meta.env.VITE_GISCUS_CATEGORY as string | undefined) ?? 'Announcements'
const CATEGORY_ID = (import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined) ?? ''

const CONFIGURED = Boolean(REPO && REPO_ID && CATEGORY_ID)

export function Giscus() {
  let container: HTMLDivElement | undefined

  onMount(() => {
    if (!CONFIGURED || !container) return
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', REPO)
    script.setAttribute('data-repo-id', REPO_ID)
    script.setAttribute('data-category', CATEGORY)
    script.setAttribute('data-category-id', CATEGORY_ID)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')
    container.appendChild(script)
  })

  return (
    <Show
      when={CONFIGURED}
      fallback={
        <p class="giscus-tip">
          评论区尚未启用：需要在构建时配置 VITE_GISCUS_REPO / VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY_ID
          环境变量（在 https://giscus.app 生成，详见官网仓库 README）。
        </p>
      }
    >
      <section class="giscus-block">
        <h2>评论</h2>
        <p class="giscus-subtitle">使用 GitHub 账号参与讨论，数据存储于 GitHub Discussions</p>
        <div ref={container} class="giscus-container" />
      </section>
    </Show>
  )
}
