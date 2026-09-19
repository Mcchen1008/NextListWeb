#!/usr/bin/env node
/**
 * 合并子包的构建产物到根 dist/，供 Cloudflare Pages 部署。
 *
 * 合并规则：
 *   packages/docs/dist    → dist/           （文档站即站点首页，路由 /）
 *   packages/plugins/dist → dist/plugins/   （插件市场 SPA，路由 /plugins）
 *
 * 健壮性：某个子包产物不存在时仅警告并跳过，不中断构建。
 * 额外生成 dist/_redirects：为插件市场 SPA 提供客户端路由回退，
 * 同时避免 shadow /plugins/assets/* 等真实静态资源。
 */
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const REDIRECTS = `# NextList Web — Cloudflare Pages 路由规则（由 scripts/build.mjs 自动生成）
# 插件市场为客户端路由 SPA：页面路径回退到其 index.html。
# 注意：不要使用 /plugins/* 全量匹配，否则会 shadow /plugins/assets/* 静态资源。
/plugins /plugins/index.html 200
/plugins/ /plugins/index.html 200
/plugins/callback /plugins/index.html 200
/plugins/callback/ /plugins/index.html 200
/plugins/plugin/* /plugins/index.html 200
`

const targets = [
  { name: 'docs    (文档站，首页)', src: join(root, 'packages/docs/dist'), dest: dist },
  { name: 'plugins (插件市场)', src: join(root, 'packages/plugins/dist'), dest: join(dist, 'plugins') },
]

console.log('> [merge] 清理 dist/')
rmSync(dist, { recursive: true, force: true })

let merged = 0
for (const t of targets) {
  if (!existsSync(t.src)) {
    console.warn(`⚠ [merge] 跳过 ${t.name}：产物不存在（${t.src}）。请先执行对应子包的 build。`)
    continue
  }
  console.log(`✓ [merge] ${t.name}: ${t.src} → ${t.dest}`)
  cpSync(t.src, t.dest, { recursive: true })
  merged++
}

writeFileSync(join(dist, '_redirects'), REDIRECTS)
console.log(`✓ [merge] 写入 dist/_redirects（插件市场 SPA 路由回退）`)

// 根目录 ads.txt（广告平台验证文件）→ dist/ads.txt，
// 部署后可通过 https://<域名>/ads.txt 直接访问。
const adsTxt = join(root, 'ads.txt')
if (existsSync(adsTxt)) {
  cpSync(adsTxt, join(dist, 'ads.txt'))
  console.log('✓ [merge] ads.txt → dist/ads.txt（站点根路径）')
} else {
  console.warn('⚠ [merge] 跳过 ads.txt：仓库根目录不存在该文件。')
}

if (merged === 0) {
  console.warn('⚠ [merge] 没有任何子包产物被合并，dist/ 仅包含 _redirects。')
} else {
  console.log(`✓ [merge] 完成：${merged}/2 个子包产物已合并到 dist/`)
}
