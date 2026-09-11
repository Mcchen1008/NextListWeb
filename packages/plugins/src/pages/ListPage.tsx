import { For, Show, createMemo, createResource, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import type { PluginMeta } from '../types'
import { fetchPlugins, refreshMyPlugins } from '../api/client'
import { PluginCard } from '../components/PluginCard'
import { SearchIcon, RefreshIcon } from '../components/Icons'
import { token, user } from '../store/session'
import { showToast } from '../store/toast'

type SortKey = 'stars' | 'updatedAt' | 'name'

/**
 * 插件列表页：
 * 数据整体来自 GET /api/plugins（读 KV），搜索 / topic 筛选 / 排序全部在浏览器端完成，
 * 不产生任何服务端查询开销。
 */
const ListPage: Component = () => {
  const [data, { refetch }] = createResource(fetchPlugins)
  const [query, setQuery] = createSignal('')
  const [topic, setTopic] = createSignal('')
  const [sort, setSort] = createSignal<SortKey>('stars')
  const [refreshing, setRefreshing] = createSignal(false)

  const plugins = createMemo<PluginMeta[]>(() => data()?.plugins ?? [])

  /** 全市场 topic 聚合（最多展示 12 个筛选 chip） */
  const topics = createMemo(() => {
    const set = new Set<string>()
    for (const p of plugins()) for (const t of p.topics ?? []) set.add(t)
    return [...set].sort().slice(0, 12)
  })

  const filtered = createMemo<PluginMeta[]>(() => {
    let list = plugins()
    if (topic()) list = list.filter((p) => p.topics?.includes(topic()))
    const q = query().trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.topics?.some((t) => t.toLowerCase().includes(q))
      )
    }
    const sorted = [...list]
    if (sort() === 'stars') sorted.sort((a, b) => b.stars - a.stars)
    else if (sort() === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else sorted.sort((a, b) => Date.parse(b.updatedAt ?? '') - Date.parse(a.updatedAt ?? ''))
    return sorted
  })

  async function onRefresh() {
    const t = token()
    if (!t || refreshing()) return
    setRefreshing(true)
    try {
      const res = await refreshMyPlugins(t)
      showToast(`刷新完成：本次收录 / 更新 ${res.collected} 个插件，市场共 ${res.total} 个`, 'success')
      await refetch()
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div class="container page">
      <section class="list-hero">
        <h1>NextList 插件市场</h1>
        <p class="list-hero-desc">
          发现 NextList 插件：悬浮挂件、主题、预览扩展与效率工具。给你的插件仓库打上{' '}
          <code>nextlist-plugin</code> topic，用 GitHub 登录即可被自动收录。
        </p>

        <div class="list-toolbar">
          <div class="search-box">
            <SearchIcon size={16} class="search-icon" />
            <input
              type="search"
              placeholder="搜索插件名、描述、作者或 topic…"
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              aria-label="搜索插件"
            />
          </div>
          <div class="toolbar-right">
            <select
              value={sort()}
              onChange={(e) => setSort(e.currentTarget.value as SortKey)}
              aria-label="排序方式"
            >
              <option value="stars">按 Star 最多</option>
              <option value="updatedAt">按最近更新</option>
              <option value="name">按名称</option>
            </select>
            <Show when={user() && token()}>
              <button class="btn btn-secondary btn-sm" onClick={onRefresh} disabled={refreshing()}>
                <RefreshIcon size={14} class={refreshing() ? 'spin' : undefined} />
                {refreshing() ? '刷新中…' : '刷新我的插件'}
              </button>
            </Show>
          </div>
        </div>

        <Show when={topics().length > 0}>
          <div class="topic-filter" aria-label="按 topic 筛选">
            <button class={topic() === '' ? 'chip active' : 'chip'} onClick={() => setTopic('')}>
              全部
            </button>
            <For each={topics()}>
              {(t) => (
                <button class={topic() === t ? 'chip active' : 'chip'} onClick={() => setTopic(t === topic() ? '' : t)}>
                  {t}
                </button>
              )}
            </For>
          </div>
        </Show>
      </section>

      <section class="list-content" aria-live="polite">
        <Show when={!data.loading} fallback={<LoadingBlock />}>
          <Show when={!data.error} fallback={<ErrorBlock message={data.error?.message} onRetry={refetch} />}>
            <Show
              when={filtered().length > 0}
              fallback={
                <div class="empty-block">
                  <p>没有匹配的插件。</p>
                  <p class="empty-sub">换个关键词试试，或者给你的插件仓库打上 <code>nextlist-plugin</code> topic 成为第一个收录者。</p>
                </div>
              }
            >
              <div class="plugins-grid">
                <For each={filtered()}>{(p) => <PluginCard plugin={p} />}</For>
              </div>
              <p class="result-count">
                共 {filtered().length} 个插件
                {data()?.total !== filtered().length ? `（全市场 ${data()?.total} 个）` : ''}
              </p>
            </Show>
          </Show>
        </Show>
      </section>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div class="center-block">
      <span class="spinner" aria-hidden="true" />
      <p>正在加载插件列表…</p>
    </div>
  )
}

function ErrorBlock(props: { message?: string; onRetry: () => void }) {
  return (
    <div class="center-block error">
      <p>插件服务暂不可用：{props.message ?? '未知错误'}</p>
      <p class="empty-sub">如果刚完成部署，请检查 Pages 的 PLUGINS_KV 绑定是否配置正确。</p>
      <button class="btn btn-secondary btn-sm" onClick={props.onRetry}>
        重试
      </button>
    </div>
  )
}

export default ListPage
