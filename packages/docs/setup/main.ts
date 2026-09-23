import { defineAppSetup } from 'valaxy'
import { nextTick } from 'vue'

/**
 * 文档站客户端扩展。
 * Valaxy 的 createClientSetupPlugin 会把 <用户根>/setup/main.ts 注入其
 * client setup 入口（与 valaxy-theme-press 自带的 setup/main.ts 并存执行）。
 *
 * 一、404 兜底路由守卫：
 * 背景：文档站是站点首页（/），而站点还托管着独立的插件市场 SPA（/plugins）。
 * Valaxy 的 AppLink 会把站内相对路径渲染成 <RouterLink>，点击导航栏、
 * hero 按钮或正文里的「插件市场」时，Vue Router 在文档站路由表中找不到
 * /plugins，落入 valaxy 自带的 catch-all 404 路由（client/pages/[...path].vue，
 * meta.layout = 404），于是渲染出文档站自己的 404 视图 —— 只有手动刷新
 * （触发真实 HTTP 请求、命中 Cloudflare Pages 的 _redirects 规则）才能进入
 * 插件市场。
 *
 * 修复：注册全局路由守卫。当导航即将落入 404 兜底路由（即目标不属于文档站）
 * 时，放弃客户端导航并整页跳转，把请求交还 Cloudflare Pages，由它按
 * _redirects 规则路由到对应的子应用。文档站自己的页面
 * （如 /plugins/development 插件开发指南）仍走客户端路由，不受影响。
 *
 * 二、页脚「最后更新于」真实数据填充：
 * 背景：valaxy 1.0.0-rc.9 未实现 page.lastUpdated 数据填充，
 * valaxy-theme-press 的 PressDocFooterLastUpdated 组件内部
 * `new Date(page.lastUpdated || 0)` 恒为 Unix epoch —— 显示 1970-01-01。
 * 修复：构建脚本 scripts/patch-last-updated.mjs 已把每页真实 git 提交时间
 * 写入预渲染 HTML（data-last-ts 属性）与 last-updated.json。本扩展在
 * 路由就绪 / 每次导航后读取真实时间，以访问者本地语言格式化填充，
 * 并取消 CSS 隐藏；数据不可得时保持隐藏（CSS 默认 display:none），
 * 确保任何状态下都不会出现 1970。
 */
export default defineAppSetup(({ router }) => {
  // SSG 预渲染阶段没有 window，且预渲染的路由必然存在于文档站，无需处理
  if (typeof window === 'undefined')
    return

  router.beforeEach((to) => {
    // 仅拦截「即将展示 404」的导航；文档站真实页面照常客户端路由
    if (!to.matched.some(m => m.meta?.layout === 404))
      return true

    // 目标与当前地址一致（例如直接打开未知路径后的首次导航）：
    // 维持原有行为（展示文档站 404 视图），避免整页刷新死循环
    const current = window.location.pathname + window.location.search + window.location.hash
    if (to.fullPath === current)
      return true

    window.location.assign(to.fullPath)
    return false
  })

  // ---------- 页脚「最后更新于」真实数据填充 ----------

  /** URL → 秒级时间戳（由构建脚本生成；SPA 导航后 DOM 无 data-last-ts，从这里查） */
  let lastUpdatedMap: Record<string, number> | null = null
  let mapPromise: Promise<void> | null = null

  function loadLastUpdatedMap(): Promise<void> {
    mapPromise ??= fetch('/last-updated.json')
      .then(r => (r.ok ? r.json() : {}))
      .then((data) => {
        lastUpdatedMap = data
      })
      .catch(() => {
        lastUpdatedMap = {}
      })
    return mapPromise
  }

  /** 当前页面的最后更新时间（秒）：优先预渲染 DOM 上的 data-last-ts，其次查映射表 */
  function resolveLastUpdatedSec(): number | undefined {
    const el = document.querySelector<HTMLTimeElement>('.press-lastUpdated time')
    const domTs = Number(el?.dataset.lastTs)
    if (Number.isFinite(domTs) && domTs > 0)
      return domTs

    const path = router.currentRoute.value.path
    const mapped = lastUpdatedMap?.[path]
      ?? (path.endsWith('/') ? lastUpdatedMap?.[path.replace(/\/+$/, '')] : lastUpdatedMap?.[`${path}/`])
    return mapped
  }

  /** 把真实时间写入页脚 <time>；无数据时保持 CSS 默认隐藏（绝不显示 1970） */
  function applyLastUpdated(): void {
    const el = document.querySelector<HTMLTimeElement>('.press-lastUpdated time')
    if (!el) return

    const sec = resolveLastUpdatedSec()
    if (!sec) return

    const date = new Date(sec * 1000)
    el.setAttribute('datetime', date.toISOString())
    el.textContent = date.toLocaleString(window.navigator.language)
    el.closest('.press-lastUpdated')?.style.setProperty('display', 'block')
  }

  /** 在页面组件挂载、主题组件 onMounted（填充 1970 文本）之后执行 */
  function scheduleApplyLastUpdated(): void {
    nextTick(() => {
      requestAnimationFrame(() => requestAnimationFrame(applyLastUpdated))
    })
  }

  loadLastUpdatedMap().then(scheduleApplyLastUpdated)
  router.afterEach(() => scheduleApplyLastUpdated())
})
