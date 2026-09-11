/** 展示格式化工具 */

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

/** ISO 时间 → 相对时间：3 天前 */
export function timeAgo(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const diffMs = Date.now() - t
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}
