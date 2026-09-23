#!/usr/bin/env node
/**
 * 构建后处理：修复文档页脚「最后更新于 1970-01-01」问题。
 *
 * 背景：valaxy 1.0.0-rc.9 只声明了 page.lastUpdated 类型（types/data.ts）与
 * lastUpdated 配置项（types/config.ts），构建/运行时均未实现数据填充，
 * valaxy-theme-press 的 PressDocFooterLastUpdated.vue 内部
 * `new Date(page.lastUpdated || 0)` 恒为 Unix epoch（1970-01-01T00:00:00.000Z），
 * 并被输出进 SSG 预渲染 HTML（爬虫可见、无 JS 环境常驻、CSS 加载前闪现）。
 *
 * 修复（本脚本在 `valaxy build --ssg` 之后运行）：
 *   1. 遍历 pages 目录下全部 .md，用 git log 取每页最后提交时间（无历史时回退构建时间）；
 *   2. 把 dist 目录下预渲染 HTML 中 1970 的 <time> 替换为真实时间，
 *      并附带 data-last-ts（客户端免请求直接使用）；
 *   3. 生成 dist/last-updated.json（URL → 秒级时间戳），
 *      供客户端 SPA 导航后填充（此时 DOM 由 JS 渲染，无 data-last-ts）。
 *
 * 显示策略见 styles/index.css 与 setup/main.ts：CSS 默认隐藏该行，
 * 客户端拿到真实时间后以内联样式显示 —— 任何状态下都不会出现 1970。
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pagesDir = join(docsRoot, 'pages')
const distDir = join(docsRoot, 'dist')
const EPOCH = '1970-01-01T00:00:00.000Z'

/** 递归收集目录下全部文件 */
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

/** pages 文件 → 站点 URL（与 vue-router path / dist 产物路径一致） */
function pageToUrl(file) {
  const rel = relative(pagesDir, file).replace(/\\/g, '/').replace(/\.md$/, '')
  if (rel === 'index') return '/'
  if (rel.endsWith('/index')) return `/${rel.slice(0, -'/index'.length)}/`
  return `/${rel}`
}

/** 单页最后提交时间（秒）；git 不可用 / 新文件无历史 → null（回退构建时间） */
function gitLastCommitSec(file) {
  try {
    const rel = relative(docsRoot, file)
    const out = execFileSync('git', ['log', '-1', '--format=%ct', '--', rel], {
      cwd: docsRoot,
      encoding: 'utf8',
    }).trim()
    const n = Number(out)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

function existsDir(p) {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function main() {
  if (!existsDir(pagesDir) || !existsDir(distDir)) {
    console.warn('⚠ [last-updated] pages/ 或 dist/ 不存在，跳过（请先执行 valaxy build）')
    process.exit(0)
  }

  const buildTimeSec = Math.floor(Date.now() / 1000)

  // 1) 页面 → 最后提交时间映射
  const mdFiles = walk(pagesDir).filter((f) => f.endsWith('.md'))
  const urlToSec = new Map()
  let gitHits = 0
  for (const file of mdFiles) {
    const url = pageToUrl(file)
    const sec = gitLastCommitSec(file) ?? buildTimeSec
    if (sec !== buildTimeSec) gitHits++
    urlToSec.set(url, sec)
  }

  // 2) 替换预渲染 HTML 中的 1970 <time>
  //    SSG 输出形如：<time datetime="1970-01-01T00:00:00.000Z" data-v-xxxx></time>
  const EPOCH_TIME_RE = /<time\s+([^>]*?)?datetime="1970-01-01T00:00:00\.000Z"([^>]*)><\/time>/g
  const htmlFiles = walk(distDir).filter((f) => f.endsWith('.html'))
  let patchedFiles = 0
  let patchedTags = 0
  const missing = new Set()

  for (const file of htmlFiles) {
    let html = readFileSync(file, 'utf8')
    if (!html.includes(EPOCH)) continue

    // dist 相对路径 → URL：about.html → /about；storage/index.html → /storage/
    const relToDist = relative(distDir, file).replace(/\\/g, '/')
    const url = relToDist === 'index.html'
      ? '/'
      : relToDist.endsWith('/index.html')
        ? `/${relToDist.slice(0, -'/index.html'.length)}/`
        : `/${relToDist.replace(/\.html$/, '')}`
    // SSG 会为目录页生成 storage.html 与 storage/index.html 两个 clean-URL 变体，
    // 对应同一路由（/storage 与 /storage/），映射查询做双向兼容
    const sec = urlToSec.get(url)
      ?? urlToSec.get(url.endsWith('/') ? url.slice(0, -1) : `${url}/`)
      ?? buildTimeSec
    if (!urlToSec.has(url) && !urlToSec.has(url.endsWith('/') ? url.slice(0, -1) : `${url}/`)) missing.add(url)

    const date = new Date(sec * 1000)
    const iso = date.toISOString()
    // 无 JS / 爬虫可见的静态文本（客户端水合后会被本地化文本覆盖）
    const staticText = `${iso.slice(0, 16).replace('T', ' ')} UTC`

    let count = 0
    html = html.replace(EPOCH_TIME_RE, (_m, pre = '', post = '') => {
      count++
      const attrs = `${pre ?? ''}datetime="${iso}"${post} data-last-ts="${sec}"`.trim()
      return `<time ${attrs}>${staticText}</time>`
    })

    if (count > 0) {
      writeFileSync(file, html)
      patchedFiles++
      patchedTags += count
    }
  }

  // 3) 客户端映射表（SPA 导航后 DOM 由 JS 渲染，无 data-last-ts 可用）
  writeFileSync(join(distDir, 'last-updated.json'), JSON.stringify(Object.fromEntries(urlToSec)))

  const fallbackNote = gitHits === mdFiles.length ? '' : `（git 无历史的页面回退为构建时间）`
  console.log(
    `✓ [last-updated] ${mdFiles.length} 个页面，${patchedFiles} 个 HTML 修正了 ${patchedTags} 处 1970 时间${fallbackNote}`
  )
  if (missing.size > 0) console.warn(`⚠ [last-updated] 未匹配页面的 HTML：${[...missing].join(', ')}`)
}

main()
