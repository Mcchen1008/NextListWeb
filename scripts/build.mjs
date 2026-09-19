#!/usr/bin/env node
/**
 * 合并子包的构建产物到根 dist/，供 Cloudflare Pages 部署。
 *
 * 合并规则：
 *   packages/docs/dist    → dist/           （文档站即站点首页，路由 /）
 *   packages/plugins/dist → dist/plugins/   （插件市场 SPA，路由 /plugins）
 *
 * 健壮性：某个子包产物不存在时仅警告并跳过，不中断构建。
 * 额外生成 dist/_redirects（仅注释）与 dist/404.html；SPA 页面路径回退
 * 由 functions/plugins/ 下的 Pages Functions 承担。
 */
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const REDIRECTS = `# NextList Web — Cloudflare Pages 路由规则（由 scripts/build.mjs 自动生成）
# 插件市场 SPA 的页面路径回退（/plugins/callback、/plugins/plugin/:owner/:repo）
# 由 functions/plugins/ 下的 Pages Functions 承担：workerd 会把 _redirects 的
# rewrite 规范化 308（rewrite 到 X/index.html 判为无限循环忽略；rewrite 到
# 普通 .html 被 clean-URL 去扩展名），均会丢失路径或授权 query；Function 返回
# 资产则 URL 原样保留。/plugins 与 /plugins/ 依赖目录索引自动服务 index.html。
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
console.log(`✓ [merge] 写入 dist/_redirects（SPA 回退由 functions/plugins/ 承担，此文件仅留注释）`)

// 根级 404 兜底页：Cloudflare Pages 对所有未匹配路径返回此页，
// 避免 /plugins 等路由异常时访客看到白板 404。风格与文档站一致。
const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>404 页面不存在 - NextList</title>
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<style>
  :root { color-scheme: light dark; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f6f8fa; color: #1f2328; padding: 24px;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #0d1117; color: #e6edf3; }
    .card { background: #161b22 !important; border-color: #30363d !important; }
  }
  .card {
    background: #fff; border: 1px solid #d0d7de; border-radius: 16px;
    padding: 48px 40px; max-width: 420px; width: 100%; text-align: center;
  }
  .logo { width: 56px; height: 56px; margin-bottom: 16px; }
  .code { font-size: 64px; font-weight: 800; line-height: 1.1; color: #1b8fc4; }
  h1 { font-size: 20px; margin: 12px 0 8px; }
  p { font-size: 14px; opacity: 0.72; margin-bottom: 28px; }
  .actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
  .btn {
    display: inline-block; padding: 10px 22px; border-radius: 999px;
    font-size: 14px; text-decoration: none; white-space: nowrap;
    background: #3d4754; color: #fff; transition: background 0.2s;
  }
  .btn:hover { background: #2b333e; }
  .btn.brand { background: #1b8fc4; }
  .btn.brand:hover { background: #1479a8; }
</style>
</head>
<body>
<div class="card">
  <img class="logo" src="/logo.svg" alt="NextList">
  <div class="code">404</div>
  <h1>页面不存在或已被移动</h1>
  <p>请检查地址是否正确，或从下面的入口继续访问。</p>
  <div class="actions">
    <a class="btn brand" href="/">返回首页</a>
    <a class="btn" href="/plugins/">插件市场</a>
    <a class="btn" href="https://github.com/Mcchen1008/NextList" target="_blank" rel="noopener noreferrer">GitHub</a>
  </div>
</div>
</body>
</html>
`
writeFileSync(join(dist, '404.html'), NOT_FOUND_HTML)
console.log(`✓ [merge] 写入 dist/404.html（站点级 404 兜底页）`)

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
