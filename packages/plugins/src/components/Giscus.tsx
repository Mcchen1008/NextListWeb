import { onMount, Show } from 'solid-js'
import { giscusLang, t } from '../i18n'

/**
 * Giscus 评论组件（基于 GitHub Discussions，与文档站同一套配置约定）。
 * 参数已内置官方仓库的公开配置（Repo ID / Category ID 均为公开信息，
 * 不属于敏感数据），构建后即开即用；如需指向其它仓库，
 * 可通过构建时环境变量覆盖（在 https://giscus.app 生成）：
 *   VITE_GISCUS_REPO / VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY / VITE_GISCUS_CATEGORY_ID
 * 评论数据与插件市场 KV 数据完全独立。
 *
 * 语言：脚本按挂载时的站点语言注入（giscusLang()）。切换语言后需刷新
 * 页面才能重载评论区 —— 评论区为低频交互，可接受。
 */

const REPO = (import.meta.env.VITE_GISCUS_REPO as string | undefined) ?? 'Mcchen1008/NextListWeb'
const REPO_ID = (import.meta.env.VITE_GISCUS_REPO_ID as string | undefined) ?? 'R_kgDOUWl4Cg'
const CATEGORY = (import.meta.env.VITE_GISCUS_CATEGORY as string | undefined) ?? 'Announcements'
const CATEGORY_ID = (import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined) ?? 'DIC_kwDOUWl4Cs4DF7Lu'

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
    script.setAttribute('data-lang', giscusLang())
    script.setAttribute('data-loading', 'lazy')
    container.appendChild(script)
  })

  return (
    <Show
      when={CONFIGURED}
      fallback={<p class="giscus-tip">{t('giscus.disabledTip')}</p>}
    >
      <section class="giscus-block">
        <h2>{t('giscus.title')}</h2>
        <p class="giscus-subtitle">{t('giscus.subtitle')}</p>
        <div ref={container} class="giscus-container" />
      </section>
    </Show>
  )
}
