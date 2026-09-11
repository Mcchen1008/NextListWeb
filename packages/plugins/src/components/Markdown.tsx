import { createMemo } from 'solid-js'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { PluginMeta } from '../types'

/**
 * Markdown 渲染器：
 *  - marked 解析（GFM，表格 / 代码块 / 删除线）
 *  - 相对图片 / 链接改写为 GitHub 绝对地址
 *  - DOMPurify 消毒，外链统一 target=_blank
 */

// 全局注册一次：所有链接外链新窗口打开
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') ?? ''
    if (/^https?:/i.test(href)) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  }
})

marked.setOptions({ gfm: true, breaks: false })

/** 把 README 中的相对路径改写为 GitHub raw / blob 绝对地址 */
function absolutize(markdown: string, plugin: PluginMeta): string {
  const branch = plugin.defaultBranch || 'main'
  const rawBase = `https://raw.githubusercontent.com/${plugin.id}/${branch}`
  const blobBase = `${plugin.repoUrl}/blob/${branch}`

  const rewrite = (url: string): string => {
    const clean = url.replace(/^\.\//, '').replace(/^\//, '')
    const isAsset = /\.(png|jpe?g|gif|svg|webp|avif|ico|bmp|mp4|webm)(\?|#|$)/i.test(clean)
    return `${isAsset ? rawBase : blobBase}/${clean}`
  }

  // [text](url) / ![alt](url)，保留 title 部分
  return markdown.replace(/(!?\[[^\]]*\]\(\s*)([^)\s]+)((?:\s+"[^"]*")?\s*\))/g, (m, pre, url, post) => {
    if (/^(https?:|data:|mailto:|#)/i.test(url)) return m
    return `${pre}${rewrite(url)}${post}`
  })
}

export function Markdown(props: { content: string; plugin: PluginMeta }) {
  const html = createMemo(() => {
    const raw = marked.parse(absolutize(props.content, props.plugin), { async: false })
    return DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] })
  })

  return <div class="markdown-body" innerHTML={html()} />
}
