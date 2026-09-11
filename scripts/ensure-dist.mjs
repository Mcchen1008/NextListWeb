#!/usr/bin/env node
/**
 * 确保 dist/ 目录存在（wrangler pages dev 需要一个静态资源目录）。
 * 若不存在则创建一个空目录并提示：完整体验请先执行 pnpm build。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

if (!existsSync(dist)) {
  mkdirSync(dist, { recursive: true })
  writeFileSync(
    join(dist, 'index.html'),
    '<!doctype html><meta charset="utf-8"><title>NextList Web</title><p>dist/ 为空：请先执行 <code>pnpm build</code> 构建完整站点。</p>'
  )
  console.warn('⚠ [dev] dist/ 不存在，已创建空目录。请先执行 pnpm build 获得完整静态站点。')
}
