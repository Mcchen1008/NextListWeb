import type { Component } from 'solid-js'
import type { JSX } from 'solid-js'
import {
  CloudIcon,
  CodeIcon,
  DatabaseIcon,
  EyeIcon,
  HardDriveIcon,
  PuzzleIcon,
  ServerIcon,
  ShareIcon,
} from './Icons'

interface Feature {
  icon: (props: { size?: number; class?: string }) => JSX.Element
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    icon: HardDriveIcon,
    title: '多存储挂载',
    desc: '60+ 存储驱动统一挂载：夸克、阿里云盘、百度网盘、123 云盘、115、天翼、迅雷、UC、移动云、PikPak、OneDrive、Google Drive、Dropbox、S3、WebDAV 等，支持跨存储复制。',
  },
  {
    icon: CloudIcon,
    title: '边缘优先部署',
    desc: '核心后端只用 Web 标准 API（fetch / Web Crypto / ReadableStream），一套代码部署到 Cloudflare Workers、Vercel、EdgeOne、AWS Lambda 与 Node 容器。',
  },
  {
    icon: CodeIcon,
    title: 'MCP 接入 AI',
    desc: '内置 Model Context Protocol 服务端，Claude、Cursor 等 AI 助手通过标准协议直接浏览目录、搜索文件、查看站点状态，把网盘接入 AI 工作流。',
  },
  {
    icon: DatabaseIcon,
    title: '零数据库依赖',
    desc: '配置、存储、用户全部持久化为 JSON 文件（容器）或 Cloudflare KV（边缘），无需 MySQL / Redis，备份与恢复一键完成。',
  },
  {
    icon: EyeIcon,
    title: '强大的文件预览',
    desc: 'PDF、Markdown（数学公式 / Mermaid / 语法高亮）、Office（docx / pptx / xlsx）、Monaco 代码编辑、图片画廊、视频音频（字幕 / 弹幕 / 歌词 / HLS）。',
  },
  {
    icon: PuzzleIcon,
    title: '灵活的插件系统',
    desc: 'ZIP 上传 / URL 一键安装，可视化配置界面。悬浮挂件、文件操作扩展、自定义主题与预览扩展，与 OpenListNext 插件格式双向兼容。',
  },
  {
    icon: ShareIcon,
    title: '分享与高速下载',
    desc: '提取码 / 密码 / 过期时间的分享链接；直链下载、HTTP Range 断点续传、代理下载；文件与文件夹流式 ZIP 打包，浏览器边打包边下载。',
  },
  {
    icon: ServerIcon,
    title: 'WebDAV 双向支持',
    desc: '既能把 Nextcloud / 群晖 / Alist 等 WebDAV 服务器挂载进来，也对外提供完整的 WebDAV 服务端（RFC 4918），可被 Windows 资源管理器、macOS Finder、rclone 直接挂载。',
  },
]

const Features: Component = () => {
  return (
    <section id="features" class="section">
      <div class="container">
        <h2 class="section-title">功能特性</h2>
        <p class="section-desc">开箱即用的私有网盘体验，从存储到预览再到插件生态，一个程序全部搞定。</p>

        <div class="features-grid">
          {FEATURES.map((feature) => (
            <article class="feature-card">
              <div class="feature-icon">
                <feature.icon size={22} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
