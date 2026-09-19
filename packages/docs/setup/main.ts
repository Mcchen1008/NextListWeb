import { defineAppSetup } from 'valaxy'

/**
 * 文档站客户端扩展。
 * Valaxy 的 createClientSetupPlugin 会把 <用户根>/setup/main.ts 注入其
 * client setup 入口（与 valaxy-theme-press 自带的 setup/main.ts 并存执行）。
 *
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
})
