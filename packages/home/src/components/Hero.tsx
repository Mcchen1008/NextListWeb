import type { Component } from 'solid-js'
import { BookIcon, BoxIcon, CloudIcon, GitHubIcon, ShieldIcon, StarIcon, ZapIcon } from './Icons'

const REPO_URL = 'https://github.com/Mcchen1008/NextList'

const Hero: Component = () => {
  return (
    <section class="hero">
      <div class="hero-glow" aria-hidden="true" />
      <div class="container hero-inner">
        <p class="hero-badge">OpenList 的定制全栈分支 · Hono + TypeScript 重写后端</p>

        <div class="hero-logo">
          <img src="/logo.svg" alt="NextList Logo" width="84" height="84" />
        </div>

        <h1 class="hero-title">NextList</h1>
        <p class="hero-subtitle">现代化的全栈文件列表 / 网盘管理系统</p>

        <p class="hero-desc">
          把本地目录、各家网盘与 WebDAV 服务器统一挂载到一个现代网页界面，支持浏览、预览、上传下载、分享与后台管理。
          轻量级 Node.js 后端替代原版 Go 后端——部署更轻、启动更快，无需编译 Go 二进制。
        </p>

        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={18} />
            GitHub 仓库
          </a>
          <a class="btn btn-secondary btn-lg" href="/docs/">
            <BookIcon size={18} />
            快速开始
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
            <ZapIcon size={15} /> SolidJS + Hono 全栈 TS
          </span>
          <span>
            <CloudIcon size={15} /> 边缘一键部署
          </span>
          <span>
            <StarIcon size={15} /> 13 种存储驱动
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
