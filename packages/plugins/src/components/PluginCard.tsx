import { A } from '@solidjs/router'
import { For, Show } from 'solid-js'
import type { PluginMeta } from '../types'
import { formatStars, timeAgo } from '../utils/format'
import { t } from '../i18n'
import { IconBadge } from './IconBadge'
import { StarIcon } from './Icons'

/** 展示标签：优先插件清单中文 tags，回退 GitHub topics */
export function displayTags(plugin: PluginMeta): string[] {
  return plugin.tags?.length ? plugin.tags : plugin.topics
}

/** 版本号统一展示为 v 前缀（作者已带 v 不重复加） */
export function versionLabel(version: string | null | undefined): string | null {
  if (!version) return null
  return version.startsWith('v') || version.startsWith('V') ? version : `v${version}`
}

export function PluginCard(props: { plugin: PluginMeta }) {
  return (
    <A class="plugin-card" href={`/plugin/${props.plugin.id}`} aria-label={t('card.viewAria', { name: props.plugin.name })}>
      <div class="card-head">
        <IconBadge plugin={props.plugin} size={46} rounded />
        <div class="card-title">
          <h3>
            {props.plugin.name}
            <Show when={versionLabel(props.plugin.version)}>
              {(v) => <span class="card-version">{v()}</span>}
            </Show>
          </h3>
          <span class="card-owner" title={`${props.plugin.owner}/${props.plugin.repoName ?? props.plugin.id}`}>
            {props.plugin.owner}/{props.plugin.repoName ?? props.plugin.id}
          </span>
        </div>
        <span class="card-stars" title={t('card.starsTitle', { n: props.plugin.stars })}>
          <StarIcon size={13} />
          {formatStars(props.plugin.stars)}
        </span>
      </div>

      <p class="card-desc">{props.plugin.description || t('card.noDesc')}</p>

      <div class="card-foot">
        <div class="card-topics">
          <For each={displayTags(props.plugin).slice(0, 2)}>{(tag) => <span class="chip mini">{tag}</span>}</For>
        </div>
        <span class="card-time">{timeAgo(props.plugin.updatedAt)}</span>
      </div>
    </A>
  )
}
