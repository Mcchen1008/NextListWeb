import { For, Show, createMemo, createResource, createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import type { PluginMeta } from '../types'
import { fetchPlugins, refreshMyPlugins } from '../api/client'
import { PluginCard } from '../components/PluginCard'
import { SearchIcon, RefreshIcon } from '../components/Icons'
import { token, user } from '../store/session'
import { showToast } from '../store/toast'
import { t } from '../i18n'

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

  /** 全市场 topic / 标签聚合（最多展示 12 个筛选 chip，含插件清单中文 tags） */
  const topics = createMemo(() => {
    const set = new Set<string>()
    for (const p of plugins()) {
      for (const t of p.topics ?? []) set.add(t)
      for (const t of p.tags ?? []) set.add(t)
    }
    return [...set].sort().slice(0, 12)
  })

  const filtered = createMemo<PluginMeta[]>(() => {
    let list = plugins()
    if (topic()) list = list.filter((p) => p.topics?.includes(topic()) || p.tags?.includes(topic()))
    const q = query().trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.repoName ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.topics?.some((t) => t.toLowerCase().includes(q)) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }
    const sorted = [...list]
    if (sort() === 'stars') sorted.sort((a, b) => b.stars - a.stars)
    else if (sort() === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else sorted.sort((a, b) => Date.parse(b.updatedAt ?? '') - Date.parse(a.updatedAt ?? ''))
    return sorted
  })

  async function onRefresh() {
    const t0 = token()
    if (!t0 || refreshing()) return
    setRefreshing(true)
    try {
      const res = await refreshMyPlugins(t0)
      showToast(t('nav.refreshDone', { collected: res.collected, total: res.total }), 'success')
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
        <h1>NextList {t('nav.brandSuffix')}</h1>
        <p class="list-hero-desc">
          {t('list.descBefore')}
          <code>nextlist-plugin</code>
          {t('list.descAfter')}
        </p>

        <div class="list-toolbar">
          <div class="search-box">
            <SearchIcon size={16} class="search-icon" />
            <input
              type="search"
              placeholder={t('list.searchPlaceholder')}
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              aria-label={t('list.searchPlaceholder')}
            />
          </div>
          <div class="toolbar-right">
            <select
              value={sort()}
              onChange={(e) => setSort(e.currentTarget.value as SortKey)}
              aria-label={t('list.sortAria')}
            >
              <option value="stars">{t('list.sortStars')}</option>
              <option value="updatedAt">{t('list.sortUpdated')}</option>
              <option value="name">{t('list.sortName')}</option>
            </select>
            <Show when={user() && token()}>
              <button class="btn btn-secondary btn-sm" onClick={onRefresh} disabled={refreshing()}>
                <RefreshIcon size={14} class={refreshing() ? 'spin' : undefined} />
                {refreshing() ? t('nav.refreshing') : t('nav.refresh')}
              </button>
            </Show>
          </div>
        </div>

        <Show when={topics().length > 0}>
          <div class="topic-filter" aria-label={t('list.filterAria')}>
            <button class={topic() === '' ? 'chip active' : 'chip'} onClick={() => setTopic('')}>
              {t('list.all')}
            </button>
            <For each={topics()}>
              {(topicName) => (
                <button class={topic() === topicName ? 'chip active' : 'chip'} onClick={() => setTopic(topicName === topic() ? '' : topicName)}>
                  {topicName}
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
                  <p>{t('list.noResult')}</p>
                  <p class="empty-sub">
                    {t('list.noResultBefore')}<code>nextlist-plugin</code>{t('list.noResultAfter')}
                  </p>
                </div>
              }
            >
              <div class="plugins-grid">
                <For each={filtered()}>{(p) => <PluginCard plugin={p} />}</For>
              </div>
              <p class="result-count">
                {t('list.resultCount', { n: filtered().length })}
                {data()?.total !== filtered().length ? t('list.resultCountAll', { n: data()?.total ?? 0 }) : ''}
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
      <p>{t('list.loading')}</p>
    </div>
  )
}

function ErrorBlock(props: { message?: string; onRetry: () => void }) {
  return (
    <div class="center-block error">
      <p>{t('list.errorPrefix', { message: props.message ?? t('list.unknownError') })}</p>
      <p class="empty-sub">{t('list.errorHint')}</p>
      <button class="btn btn-secondary btn-sm" onClick={props.onRetry}>
        {t('list.retry')}
      </button>
    </div>
  )
}

export default ListPage
