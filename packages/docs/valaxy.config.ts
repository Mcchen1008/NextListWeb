import { defineValaxyConfig } from 'valaxy'
import type { ThemeConfig } from 'valaxy-theme-press'

/**
 * NextList 文档站配置
 * 主题：valaxy-theme-press（VitePress 风格文档主题，体验对齐 OpenList 文档站）
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
    description: 'NextList 文档：部署指南、配置说明、存储挂载与插件开发',
    // 部署后的正式域名（用于 SEO / RSS）
    url: 'https://nextlist-web.pages.dev',
    favicon: '/logo.svg',
  },

  theme: 'press',

  themeConfig: {
    logo: '/logo.svg',

    // 顶部导航
    nav: [
      { text: '指南', link: '/guide/quick-start' },
      { text: '存储挂载', link: '/guide/storage' },
      { text: '插件开发', link: '/plugins/development' },
      { text: 'FAQ', link: '/faq' },
      { text: '官网', link: '/' },
      { text: '插件市场', link: '/plugins/' },
      { text: 'GitHub', link: 'https://github.com/Mcchen1008/NextList' },
    ],

    // 侧边栏（按目录分组）
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '部署', link: '/guide/deploy' },
          { text: '配置说明', link: '/guide/config' },
          { text: '存储挂载', link: '/guide/storage' },
        ],
      },
      {
        text: '插件',
        items: [{ text: '插件开发指南', link: '/plugins/development' }],
      },
      {
        text: '帮助',
        items: [{ text: '常见问题 FAQ', link: '/faq' }],
      },
    ],

    editLink: {
      pattern: 'https://github.com/Mcchen1008/NextListWeb/edit/main/packages/docs/pages/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: '基于 AGPL-3.0 许可发布',
      copyright: '© 2026 NextList Contributors',
    },

    socialLinks: [
      { icon: 'i-ri-github-fill', link: 'https://github.com/Mcchen1008/NextList', ariaLabel: 'GitHub' },
    ],
  },

  /**
   * 文档站部署时挂载在 /docs/ 子路径：
   *   构建产物 packages/docs/dist → 根 dist/docs/（见 scripts/build.mjs）
   * 因此 vite base 必须为 /docs/，否则产物内资源引用 /assets/* 会 404。
   * 本地开发保持一致（http://localhost:5174/docs/），与生产行为对齐。
   */
  vite: {
    base: '/docs/',
  },
})
