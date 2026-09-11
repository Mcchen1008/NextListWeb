import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
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
