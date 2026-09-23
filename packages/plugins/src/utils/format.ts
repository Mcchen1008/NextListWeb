/** 展示格式化工具 */
import { t } from '../i18n'

/** Star 数缩写：1234 → 1.2k */
export function formatStars(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0'
  if (n >= 1000) {
    const k = n / 1000
    const text = k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, '')
    return `${text}k`
  }
  return String(n)
}

/** ISO 时间 → 相对时间（跟随当前语言）：3 天前 / 3 days ago */
export function timeAgo(iso: string): string {
  const t0 = Date.parse(iso)
  if (!Number.isFinite(t0)) return ''
  const diffMs = Date.now() - t0
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return t('time.justNow')
  if (minutes < 60) return t('time.minutes', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('time.hours', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return t('time.days', { n: days })
  const months = Math.floor(days / 30)
  if (months < 12) return t('time.months', { n: months })
  return t('time.years', { n: Math.floor(months / 12) })
}
