import type { Component } from 'solid-js'
import { Folders } from 'lucide-solid'
import { BookIcon, BoxIcon, CloudIcon, GitHubIcon, ShieldIcon, StarIcon, ZapIcon } from './Icons'

const REPO_URL = 'https://github.com/Mcchen1008/NextList'

const Hero: Component = () => {
  return (
    <section class="hero">
      <div class="container hero-inner">
        <p class="hero-badge">开源免费 · AGPL-3.0</p>

        <div class="hero-logo">
          <img src="/logo.svg" alt="NextList Logo" width="84" height="84" />
        </div>

        <h1 class="hero-title">
          NextList
          <Folders size={36} class="hero-title-icon" aria-hidden="true" />
        </h1>
        <p class="hero-subtitle">支持多种存储的文件列表程序</p>

        <p class="hero-desc">
          把本地目录、各家网盘与 WebDAV 服务器统一挂载到一个现代网页界面，全栈 TypeScript
          构建，一键部署到 Cloudflare Workers 等边缘平台，免费额度即可长期运行。
        </p>

        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="/docs/">
            <BookIcon size={18} />
            快速开始
          </a>
          <a class="btn btn-secondary btn-lg" href="/deploy/workers" >
            <CloudIcon size={18} />
            部署指南
          </a>
          <a class="btn btn-ghost btn-lg" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={18} />
            GitHub
          </a>
          <a class="btn btn-ghost btn-lg" href="/plugins/">
            <BoxIcon size={18} />
            插件市场
          </a>
        </div>

        <div class="hero-meta">
          <span>
            <ShieldIcon size={15} /> AGPL-3.0 开源免费
          </span>
          <span>
            <ZapIcon size={15} /> 全栈 TypeScript
          </span>
          <span>
            <CloudIcon size={15} /> 边缘一键部署
          </span>
          <span>
            <StarIcon size={15} /> 60+ 存储驱动
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
