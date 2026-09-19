import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-press'

/**
 * NextList 文档站配置
 * 主题：valaxy-theme-press（VitePress 风格文档主题，体验对齐 doc.oplist.org.cn）
 * 主题配置结构见 node_modules/valaxy-theme-press/types/index.d.ts
 */
export default defineValaxyConfig<ThemeConfig>({
  siteConfig: {
    title: 'NextList',
    subtitle: '文档中心',
    author: {
      name: 'Mcchen1008',
      link: 'https://github.com/Mcchen1008',
      avatar: 'https://github.com/Mcchen1008.png',
    },
    lang: 'zh-CN',
    description: 'NextList 官方文档：快速开始、用户指南、部署（Cloudflare Workers / EdgeOne / 阿里云 ESA）、存储挂载、配置、API 与 MCP 接入、插件开发',
    // 部署后的正式域名（用于 SEO / RSS / sitemap）
    url: 'https://nextlist-web.pages.dev',
    favicon: '/logo.svg',
  },

  theme: 'press',

  /**
   * 运行时拼接的 unocss 图标类名（frontmatter features.icon、导航
   * socialLinks.icon）无法被静态扫描提取，须加入 safelist 才会生成
   * 对应的 iconify 样式。
   */
  unocss: {
    safelist: [
      'i-ri-github-fill',
      'i-ri-database-2-line',
      'i-ri-flashlight-line',
      'i-ri-robot-2-line',
      'i-ri-eye-line',
      'i-ri-link',
      'i-ri-code-s-slash-line',
    ],
  },

  themeConfig: {
    logo: '/logo.svg',

    // 顶部导航（对齐 doc.oplist.org.cn：文档 / 用户指南 / 配置 / FAQ / 生态）
    nav: [
      { text: '文档', link: '/' },
      { text: '用户指南', link: '/guide/quick-start' },
      { text: '配置', link: '/config/site' },
      { text: '存储', link: '/storage/' },
      { text: '进阶', link: '/advanced/api' },
      { text: 'FAQ', link: '/faq' },
      { text: '关于', link: '/about' },
      { text: '插件市场', link: '/plugins/' },
      { text: 'GitHub', link: 'https://github.com/Mcchen1008/NextList' },
    ],

    // 侧边栏（按目录分组，文档首页 = 快速开始）
    sidebar: [
      {
        text: '用户指南',
        items: [
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '登录与账户安全', link: '/guide/account' },
          { text: '文件浏览与预览', link: '/guide/browse' },
          { text: '文件搜索', link: '/guide/search' },
          { text: '分享', link: '/guide/share' },
          { text: 'WebDAV', link: '/guide/webdav' },
        ],
      },
      {
        text: '部署',
        items: [
          { text: 'Cloudflare Workers 部署', link: '/deploy/workers' },
          { text: 'EdgeOne Pages 部署', link: '/deploy/edgeone' },
          { text: '阿里云 ESA 部署', link: '/deploy/esa' },
          { text: '环境变量与绑定', link: '/deploy/env' },
        ],
      },
      {
        text: '配置',
        items: [
          { text: '站点设置', link: '/config/site' },
          { text: '样式设置', link: '/config/style' },
          { text: '预览设置', link: '/config/preview' },
          { text: '全局设置', link: '/config/global' },
          { text: '高级设置', link: '/config/advanced' },
        ],
      },
      {
        text: '存储挂载',
        items: [
          { text: '添加存储', link: '/storage/' },
          { text: '驱动一览', link: '/storage/drivers' },
        ],
      },
      {
        text: '进阶',
        items: [
          { text: 'REST API', link: '/advanced/api' },
          { text: 'MCP 接入（AI 助手）', link: '/advanced/mcp' },
          { text: 'OpenList 兼容性', link: '/advanced/compat' },
          { text: '插件开发指南', link: '/plugins/development' },
        ],
      },
      {
        text: '帮助',
        items: [
          { text: '常见问题 FAQ', link: '/faq' },
          { text: '关于本项目', link: '/about' },
        ],
      },
      {
        text: '关于',
        items: [
          { text: '隐私政策', link: '/legal/privacy' },
          { text: '服务条款', link: '/legal/terms' },
          { text: '免责声明', link: '/legal/disclaimer' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/Mcchen1008/NextListWeb/edit/main/packages/docs/pages/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: 'AGPL-3.0 Licensed · 联系我们：Chen10081008@outlook.com',
      copyright: '© 2026 NextList Contributors',
    },

    socialLinks: [
      { icon: 'i-ri-github-fill', link: 'https://github.com/Mcchen1008/NextList', ariaLabel: 'GitHub' },
    ],
  },

  /**
   * 文档站即站点首页：
   *   构建产物 packages/docs/dist → 根 dist/（见 scripts/build.mjs）
   * vite base 必须保持默认的 /，产物内资源才能从站点根正确引用。
   * 本地开发直接访问 http://localhost:5174/，与生产行为一致。
   */
  vite: {
    base: '/',
  },
})
