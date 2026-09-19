import { createSignal, Show } from 'solid-js'
import type { PluginMeta } from '../types'

/**
 * 插件图标：
 *  1. 优先使用收录时约定的 icon.png（raw 直链）
 *  2. 回退作者 GitHub 头像
 *  3. 都没有 / 加载失败时使用首字母色块（按 id 哈希取色）
 */

const HUES = [199, 172, 205, 160, 24, 340, 45, 8]

export function IconBadge(props: { plugin: PluginMeta; size: number; rounded?: boolean }) {
  const [failed, setFailed] = createSignal(false)

  const src = () => props.plugin.icon || props.plugin.ownerAvatar || ''
  const showImg = () => Boolean(src()) && !failed()

  const hue = () => {
    let h = 0
    for (const ch of props.plugin.id) h = (h * 31 + ch.charCodeAt(0)) % 997
    return HUES[h % HUES.length]
  }

  return (
    <Show
      when={showImg()}
      fallback={
        <span
          class="icon-fallback"
          style={{
            width: `${props.size}px`,
            height: `${props.size}px`,
            'font-size': `${Math.max(12, Math.round(props.size * 0.44))}px`,
            'border-radius': props.rounded ? '22%' : '50%',
            background: `hsl(${hue()} 58% 46%)`,
          }}
          aria-hidden="true"
        >
          {(props.plugin.name?.[0] ?? '?').toUpperCase()}
        </span>
      }
    >
      <img
        class="plugin-icon"
        src={src()}
        alt={`${props.plugin.name} 图标`}
        width={props.size}
        height={props.size}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ 'border-radius': props.rounded ? '22%' : '50%' }}
      />
    </Show>
  )
}
