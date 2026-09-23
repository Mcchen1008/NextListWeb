import { createSignal } from 'solid-js'

/**
 * 插件市场轻量国际化（SolidJS 响应式）。
 *
 * 语言判定优先级（与「根据用户语言与地区自动选择、用户可自由修改」的需求对应）：
 *   1. URL 参数 ?lang=zh / ?lang=en（文档站跳转入口按文档语言显式指定）
 *   2. localStorage 上次手动选择（nextlist_locale，Navbar 切换按钮写入）
 *   3. 浏览器语言与地区（navigator.languages，zh* → 中文，其余 → 英文）
 *
 * 切换语言时同步：signal（驱动全部 t() 文案）、localStorage 记忆、
 * <html lang>、<title> 与 meta description。
 */

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'nextlist_locale'

/** 消息值：静态文本或带参数的函数（用于英文复数等场景） */
type Message = string | ((params: Record<string, unknown>) => string)

const messages: Record<Locale, Record<string, Message>> = {
  zh: {
    // 通用 / 文档元信息
    'doc.title': 'NextList 插件市场',
    'doc.description': 'NextList 插件市场：发现与分享 NextList 插件，支持 GitHub 登录、自动收录与评论互动。',
    'lang.switchTitle': '切换到 English',

    // 顶部导航
    'nav.brandSuffix': '插件市场',
    'nav.brandAria': 'NextList 插件市场首页',
    'nav.marketAria': '插件市场导航',
    'nav.docs': '文档',
    'nav.repo': '主仓库',
    'nav.loginFull': '用 GitHub 登录',
    'nav.loginShort': '登录',
    'nav.loggingIn': '跳转中…',
    'nav.logout': '退出登录',
    'nav.loggedOut': '已退出登录',
    'nav.refresh': '刷新我的插件',
    'nav.refreshing': '刷新中…',
    'nav.refreshTitle': '重新拉取我名下带 nextlist-plugin topic 的公开仓库',
    'nav.refreshDone': '刷新完成：本次收录 / 更新 {collected} 个插件，市场共 {total} 个',

    // 列表页
    'list.descBefore': '发现 NextList 插件：悬浮挂件、主题、预览扩展与效率工具。给你的插件仓库打上 ',
    'list.descAfter': ' topic，用 GitHub 登录即可被自动收录。',
    'list.searchPlaceholder': '搜索插件名、仓库名、描述、作者或标签…',
    'list.sortAria': '排序方式',
    'list.sortStars': '按 Star 最多',
    'list.sortUpdated': '按最近更新',
    'list.sortName': '按名称',
    'list.filterAria': '按 topic 筛选',
    'list.all': '全部',
    'list.noResult': '没有匹配的插件。',
    'list.noResultBefore': '换个关键词试试，或者给你的插件仓库打上 ',
    'list.noResultAfter': ' topic 成为第一个收录者。',
    'list.resultCount': '共 {n} 个插件',
    'list.resultCountAll': '（全市场 {n} 个）',
    'list.loading': '正在加载插件列表…',
    'list.errorPrefix': '插件服务暂不可用：{message}',
    'list.errorHint': '如果刚完成部署，请检查 Pages 的 PLUGINS_KV 绑定是否配置正确。',
    'list.retry': '重试',
    'list.unknownError': '未知错误',

    // 插件卡片 / 详情页
    'card.noDesc': '暂无描述',
    'card.starsTitle': '{n} stars',
    'card.iconAlt': '{name} 图标',
    'card.viewAria': '查看插件 {name}',
    'detail.back': '返回插件列表',
    'detail.loading': '正在加载插件信息…',
    'detail.updatedPrefix': '更新于',
    'detail.repoSlugTitle': '插件仓库名',
    'detail.download': '下载插件',
    'detail.repoLink': '项目地址',
    'detail.readme': 'README',
    'detail.readmeEmpty': '暂无 README 缓存。',
    'detail.readmeEmptySub': '作者在插件市场登录 / 刷新后，会自动拉取并缓存仓库 README。',

    // OAuth 登录 / 回调
    'auth.completing': '正在完成 GitHub 登录，请稍候…',
    'auth.cancelledPrefix': '授权被取消：',
    'auth.noCode': '未收到授权码，请重新发起登录',
    'auth.welcome': (p) => `欢迎，${p.name}！本次收录 / 更新 ${p.collected} 个插件（市场共 ${p.total} 个）`,
    'auth.failed': '登录失败，请稍后再试',
    'auth.backToMarket': '返回插件市场',
    'auth.notConfigured': '管理员尚未配置 GitHub OAuth（GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET），详见官网仓库 README',
    'auth.stateMismatch': '登录状态校验失败（state 不匹配），请从插件市场重新发起登录',

    // 404
    'nf.text': '页面不存在或插件已被移除。',
    'nf.back': '返回插件市场',

    // 页脚
    'footer.tipBefore': 'NextList 插件市场 · 用 GitHub 登录即可收录你的插件（仓库需打上 ',
    'footer.tipAfter': ' topic）',
    'footer.market': '插件市场',
    'footer.docs': '文档',

    // 相对时间
    'time.justNow': '刚刚',
    'time.minutes': (p) => `${p.n} 分钟前`,
    'time.hours': (p) => `${p.n} 小时前`,
    'time.days': (p) => `${p.n} 天前`,
    'time.months': (p) => `${p.n} 个月前`,
    'time.years': (p) => `${p.n} 年前`,

    // Giscus 评论区
    'giscus.title': '评论',
    'giscus.subtitle': '使用 GitHub 账号参与讨论，数据存储于 GitHub Discussions',
    'giscus.disabledTip':
      '评论区尚未启用：需要在构建时配置 VITE_GISCUS_REPO / VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY_ID 环境变量（在 https://giscus.app 生成，详见官网仓库 README）。',

    // API 客户端
    'api.requestFailed': '请求失败（HTTP {status}）',
  },

  en: {
    // Common / document meta
    'doc.title': 'NextList Plugin Market',
    'doc.description': 'NextList plugin market: discover and share NextList plugins, with GitHub sign-in, auto listing and community comments.',
    'lang.switchTitle': 'Switch to 中文',

    // Navbar
    'nav.brandSuffix': 'Plugins',
    'nav.brandAria': 'NextList plugin market home',
    'nav.marketAria': 'Plugin market navigation',
    'nav.docs': 'Docs',
    'nav.repo': 'Repository',
    'nav.loginFull': 'Sign in with GitHub',
    'nav.loginShort': 'Sign in',
    'nav.loggingIn': 'Redirecting…',
    'nav.logout': 'Sign out',
    'nav.loggedOut': 'Signed out',
    'nav.refresh': 'Refresh my plugins',
    'nav.refreshing': 'Refreshing…',
    'nav.refreshTitle': 'Re-fetch my public repos tagged with the nextlist-plugin topic',
    'nav.refreshDone': (p) => `Refresh complete: ${p.collected} plugin${Number(p.collected) === 1 ? '' : 's'} added/updated, ${p.total} in the market`,

    // List page
    'list.descBefore': 'Discover NextList plugins: floating widgets, themes, preview extensions and productivity tools. Tag your plugin repo with ',
    'list.descAfter': ' and sign in with GitHub to get listed automatically.',
    'list.searchPlaceholder': 'Search by plugin name, repo, description, author or tag…',
    'list.sortAria': 'Sort by',
    'list.sortStars': 'Most stars',
    'list.sortUpdated': 'Recently updated',
    'list.sortName': 'Name',
    'list.filterAria': 'Filter by topic',
    'list.all': 'All',
    'list.noResult': 'No matching plugins.',
    'list.noResultBefore': 'Try different keywords, or tag your plugin repo with ',
    'list.noResultAfter': ' to become the first listed author.',
    'list.resultCount': (p) => `${p.n} plugin${Number(p.n) === 1 ? '' : 's'}`,
    'list.resultCountAll': (p) => ` (out of ${p.n} in the whole market)`,
    'list.loading': 'Loading plugins…',
    'list.errorPrefix': 'Plugin service unavailable: {message}',
    'list.errorHint': 'If you just deployed, check that the PLUGINS_KV binding is configured in Pages.',
    'list.retry': 'Retry',
    'list.unknownError': 'unknown error',

    // Plugin card / detail page
    'card.noDesc': 'No description',
    'card.starsTitle': '{n} stars',
    'card.iconAlt': '{name} icon',
    'card.viewAria': 'View plugin {name}',
    'detail.back': 'Back to plugins',
    'detail.loading': 'Loading plugin details…',
    'detail.updatedPrefix': 'Updated',
    'detail.repoSlugTitle': 'Plugin repository name',
    'detail.download': 'Download',
    'detail.repoLink': 'Source repo',
    'detail.readme': 'README',
    'detail.readmeEmpty': 'No README cached yet.',
    'detail.readmeEmptySub': 'It will be fetched and cached automatically once the author signs in to the market or refreshes their plugins.',

    // OAuth sign-in / callback
    'auth.completing': 'Completing GitHub sign-in…',
    'auth.cancelledPrefix': 'Authorization was cancelled: ',
    'auth.noCode': 'No authorization code received, please start the sign-in again',
    'auth.welcome': (p) => `Welcome, ${p.name}! ${p.collected} plugin${Number(p.collected) === 1 ? '' : 's'} added/updated (${p.total} in the market)`,
    'auth.failed': 'Sign-in failed, please try again later',
    'auth.backToMarket': 'Back to market',
    'auth.notConfigured': 'GitHub OAuth has not been configured by the admin yet (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET). See the website repo README for details.',
    'auth.stateMismatch': 'Sign-in state validation failed (state mismatch). Please start the sign-in from the plugin market again.',

    // 404
    'nf.text': 'This page does not exist, or the plugin has been removed.',
    'nf.back': 'Back to market',

    // Footer
    'footer.tipBefore': 'NextList plugin market · Sign in with GitHub to list your plugins (tag your repo with ',
    'footer.tipAfter': ')',
    'footer.market': 'Market',
    'footer.docs': 'Docs',

    // Relative time
    'time.justNow': 'just now',
    'time.minutes': (p) => `${p.n} minute${Number(p.n) === 1 ? '' : 's'} ago`,
    'time.hours': (p) => `${p.n} hour${Number(p.n) === 1 ? '' : 's'} ago`,
    'time.days': (p) => `${p.n} day${Number(p.n) === 1 ? '' : 's'} ago`,
    'time.months': (p) => `${p.n} month${Number(p.n) === 1 ? '' : 's'} ago`,
    'time.years': (p) => `${p.n} year${Number(p.n) === 1 ? '' : 's'} ago`,

    // Giscus comments
    'giscus.title': 'Comments',
    'giscus.subtitle': 'Join the discussion with your GitHub account — data is stored in GitHub Discussions',
    'giscus.disabledTip':
      'Comments are not enabled yet: configure the VITE_GISCUS_REPO / VITE_GISCUS_REPO_ID / VITE_GISCUS_CATEGORY_ID env vars at build time (generate them at https://giscus.app, see the website repo README).',

    // API client
    'api.requestFailed': 'Request failed (HTTP {status})',
  },
}

/** 把 BCP-47 语言标签（或逗号串联的候选列表）归一化为站点支持的 Locale */
function normalize(value: string | null | undefined): Locale | null {
  if (!value) return null
  const v = value.toLowerCase()
  if (v.startsWith('zh')) return 'zh'
  if (v.startsWith('en')) return 'en'
  return null
}

/** 初始语言：URL ?lang= → localStorage 记忆 → 浏览器语言与地区 → 默认英文 */
function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  try {
    const fromUrl = normalize(new URLSearchParams(window.location.search).get('lang'))
    if (fromUrl) return fromUrl
    const fromStore = normalize(localStorage.getItem(STORAGE_KEY))
    if (fromStore) return fromStore
  } catch {
    /* 隐私模式等存储不可用场景，忽略后回退浏览器语言 */
  }
  const candidates =
    navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language]
  for (const lang of candidates) {
    const hit = normalize(lang)
    if (hit) return hit
  }
  return 'en'
}

const [localeSignal, setLocaleSignal] = createSignal<Locale>(detectInitialLocale())

/** 当前语言（响应式；t() 与各组件文案依赖它自动更新） */
export function locale(): Locale {
  return localeSignal()
}

/** 同步 <html lang>、<title> 与 meta description（纯客户端 SPA，无 SSG 约束） */
function applyDocumentLocale(l: Locale): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
  document.title = t('doc.title')
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('doc.description'))
}

// 模块加载即按初始语言修正文档元信息（index.html 中的默认值是中文）
applyDocumentLocale(localeSignal())

/** 手动切换语言并持久化（Navbar 切换按钮调用） */
export function setLocale(next: Locale): void {
  setLocaleSignal(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* 存储不可用时仅本次会话生效 */
  }
  applyDocumentLocale(next)
}

/** 中英一键互换 */
export function toggleLocale(): void {
  setLocale(localeSignal() === 'zh' ? 'en' : 'zh')
}

/** Giscus 评论区语言（跟随当前站点语言） */
export function giscusLang(): string {
  return localeSignal() === 'zh' ? 'zh-CN' : 'en'
}

/**
 * 取文案：缺失时回退中文，再回退 key 本身（便于发现漏翻）。
 * 支持 {name} 插值；函数型消息用于英文复数等动态文案。
 */
export function t(key: string, params?: Record<string, unknown>): string {
  const msg = messages[localeSignal()][key] ?? messages.zh[key] ?? key
  if (typeof msg === 'function') return msg(params ?? {})
  if (!params) return msg
  return msg.replace(/\{(\w+)\}/g, (_m, name: string) => String(params[name] ?? `{${name}}`))
}
