import type { Component } from 'solid-js'
import { ArrowRightIcon, BookIcon } from './Icons'

const STEPS = [
  {
    title: '准备与导入',
    desc: '注册 Cloudflare 账号，Fork NextList 仓库（或在 Dashboard 直接连接 GitHub 仓库导入）。无需准备服务器与数据库。',
  },
  {
    title: '一键部署',
    desc: '本地执行 pnpm deploy：脚本自动检测 / 创建 KV namespace、构建前端并部署到 Cloudflare Workers，静态资源由 ASSETS binding 托管。',
  },
  {
    title: '初始化配置',
    desc: '使用默认账号 admin / admin 登录后台（首次登录务必改密），在「存储管理」中挂载你的第一块网盘，开始使用。',
  },
]

const Deploy: Component = () => {
  return (
    <section id="deploy" class="section deploy-section">
      <div class="container">
        <h2 class="section-title">三步完成部署</h2>
        <p class="section-desc">边缘优先架构，免费额度即可长期稳定运行；同时也支持 Vercel、EdgeOne、AWS Lambda 与 Docker 自托管。</p>

        <ol class="deploy-steps">
          {STEPS.map((step, i) => (
            <li class="deploy-step">
              <span class="step-num">{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div class="deploy-cta">
          <a class="btn btn-primary btn-lg" href="/docs/guide/deploy">
            <BookIcon size={18} />
            查看完整部署文档
          </a>
          <a class="btn btn-ghost btn-lg" href="/docs/guide/quick-start">
            快速开始
            <ArrowRightIcon size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Deploy
