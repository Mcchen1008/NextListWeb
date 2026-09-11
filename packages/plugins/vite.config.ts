import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  // 关键：插件市场挂载在 /plugins/ 子路径下（合并产物 → dist/plugins/）
  base: '/plugins/',
  plugins: [solid()],
  server: {
    port: 5175,
    // 本地开发时把 /api 代理到 wrangler pages dev（默认 8788 端口）
    proxy: {
      '/api': 'http://localhost:8788',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
