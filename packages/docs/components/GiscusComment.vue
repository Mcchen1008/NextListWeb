<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

/**
 * Giscus 评论组件（基于 GitHub Discussions）
 * 参数已内置官方仓库的公开配置（Repo ID / Category ID 均为公开信息，
 * 最终会打包进客户端脚本，不属于敏感数据），构建后即开即用。
 * 如需指向其它仓库的 Discussions，可通过构建时环境变量覆盖
 * （.env / Cloudflare Pages 构建环境变量，参数可在 https://giscus.app 生成）：
 *   VITE_GISCUS_REPO          例：Mcchen1008/NextListWeb
 *   VITE_GISCUS_REPO_ID       例：R_kgDOxxxxxx
 *   VITE_GISCUS_CATEGORY      例：Announcements
 *   VITE_GISCUS_CATEGORY_ID   例：DIC_kwDOxxxxxx
 */

const repo = (import.meta.env.VITE_GISCUS_REPO as string | undefined) ?? 'Mcchen1008/NextListWeb'
const repoId = (import.meta.env.VITE_GISCUS_REPO_ID as string | undefined) ?? 'R_kgDOUWl4Cg'
const category = (import.meta.env.VITE_GISCUS_CATEGORY as string | undefined) ?? 'Announcements'
const categoryId = (import.meta.env.VITE_GISCUS_CATEGORY_ID as string | undefined) ?? 'DIC_kwDOUWl4Cs4DF7Lu'

const configured = computed(() => Boolean(repo && repoId && categoryId))
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!configured.value || !container.value) return
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', repo)
  script.setAttribute('data-repo-id', repoId)
  script.setAttribute('data-category', category)
  script.setAttribute('data-category-id', categoryId)
  script.setAttribute('data-mapping', 'pathname')
  script.setAttribute('data-strict', '0')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'top')
  script.setAttribute('data-theme', 'preferred_color_scheme')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('data-loading', 'lazy')
  container.value.appendChild(script)
})
</script>

<template>
  <section class="giscus-comment">
    <h2>评论</h2>
    <div v-if="configured" ref="container" class="giscus-container" />
    <p v-else class="giscus-tip">
      评论功能尚未启用：请在构建文档站时配置 VITE_GISCUS_REPO、VITE_GISCUS_REPO_ID、VITE_GISCUS_CATEGORY_ID
      环境变量（在 https://giscus.app 生成，详见官网仓库 README）。
    </p>
  </section>
</template>

<style scoped>
.giscus-comment {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider, #e2e8f0);
}
.giscus-comment h2 {
  font-size: 1.25rem;
  margin: 0 0 16px;
}
.giscus-tip {
  color: var(--vp-c-text-3, #94a3b8);
  font-size: 0.9rem;
  line-height: 1.7;
}
</style>
