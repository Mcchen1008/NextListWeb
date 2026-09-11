---
layout: home
title: NextList 文档中心
description: NextList 官方文档 —— 快速开始、用户指南、部署、存储挂载、配置、API 与插件开发

hero:
  name: NextList
  text: 支持多种存储的文件列表程序
  tagline: 全栈 TypeScript 构建，60+ 存储驱动统一挂载，一键部署到 Cloudflare Workers 边缘，免费额度即可长期运行。
  image:
    src: /logo.svg
    alt: NextList
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 部署指南
      link: /deploy/workers
    - theme: alt
      text: 插件市场
      link: /plugins/
    - theme: alt
      text: GitHub
      link: https://github.com/Mcchen1008/NextList

features:
  - icon: 💾
    title: 60+ 存储驱动
    details: 夸克、阿里云盘、百度网盘、123 云盘、115、天翼、迅雷、UC、移动云云盘、PikPak、OneDrive、Google Drive、Dropbox、S3、WebDAV、GitHub Releases 等统一挂载，支持跨存储复制。
  - icon: ⚡
    title: 边缘部署
    details: 核心后端只用 Web 标准 API（fetch / Web Crypto），一套代码部署到 Cloudflare Workers、EdgeOne Pages、Vercel 与 Node 容器，无需数据库，配置持久化到 KV。
  - icon: 🤖
    title: MCP 协议接入
    details: 内置 Model Context Protocol 服务端，Claude、Cursor 等 AI 助手可直接浏览文件、检索内容、查看站点状态，把你的网盘接入 AI 工作流。
  - icon: 👁️
    title: 强大的文件预览
    details: PDF、Markdown（公式 / Mermaid）、Office（docx / pptx / xlsx）、Monaco 代码编辑、图片画廊、视频音频（字幕 / 弹幕 / HLS）全覆盖。
  - icon: 🔗
    title: 分享 / 直链 / WebDAV
    details: 密码与过期时间的分享链接（/@s/ 浏览、/sd/ 直链下载）、签名直链、断点续传、文件夹流式 ZIP 打包，完整的 RFC 4918 WebDAV 服务端（/dav）。
  - icon: 🦀
    title: 全栈 TypeScript
    details: 前端 SolidJS + 后端 Hono 同语言，类型前后端共享，无 Go 编译链；内置两步验证（TOTP）、SSH 公钥、审计日志与备份恢复。
---
