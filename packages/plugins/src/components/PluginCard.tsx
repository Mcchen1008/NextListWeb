import { A } from '@solidjs/router'
import { For } from 'solid-js'
import type { PluginMeta } from '../types'
import { formatStars, timeAgo } from '../utils/format'
import { IconBadge } from './IconBadge'
import { StarIcon } from './Icons'

export function PluginCard(props: { plugin: PluginMeta }) {
  return (
    <A class="plugin-card" href={`/plugin/${props.plugin.id}`} aria-label={`查看插件 ${props.plugin.name}`}>
      <div class="card-head">
        <IconBadge plugin={props.plugin} size={46} rounded />
        <div class="card-title">
          <h3>{props.plugin.name}</h3>
          <span class="card-owner">{props.plugin.owner}</span>
        </div>
        <span class="card-stars" title={`${props.plugin.stars} stars`}>
          <StarIcon size={13} />
          {formatStars(props.plugin.stars)}
        </span>
      </div>

      <p class="card-desc">{props.plugin.description || '暂无描述'}</p>

      <div class="card-foot">
        <div class="card-topics">
          <For each={props.plugin.topics.slice(0, 2)}>{(t) => <span class="chip mini">{t}</span>}</For>
        </div>
        <span class="card-time">{timeAgo(props.plugin.updatedAt)}</span>
      </div>
    </A>
  )
}
