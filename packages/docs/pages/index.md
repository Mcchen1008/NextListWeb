---
layout: home
title: NextList 文档中心
description: NextList 的部署指南、配置说明、存储挂载与插件开发文档

hero:
  name: NextList
  text: 现代化的文件列表 / 网盘管理系统
  tagline: OpenList 的定制全栈分支 —— SolidJS + Hono 全栈 TypeScript，13 种存储驱动统一挂载，免费部署到边缘。
  image:
    src: /logo.svg
    alt: NextList
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 部署指南
      link: /guide/deploy
    - theme: alt
      text: 插件市场
      link: /plugins/
    - theme: alt
      text: GitHub
      link: https://github.com/Mcchen1008/NextList

features:
  - icon: 💾
    title: 多存储挂载
    details: 13 种存储驱动统一挂载：夸克、阿里云盘、百度网盘、123 云盘、115、天翼、迅雷、蓝奏、OneDrive、Google Drive、WebDAV、GitHub 与本地磁盘，支持跨存储复制。
  - icon: ☁️
    title: 边缘优先部署
    details: 核心后端只用 Web 标准 API，一套代码部署到 Cloudflare Workers、Vercel、EdgeOne、AWS Lambda 与 Node 容器，免费额度即可长期运行。
  - icon: 🧩
    title: 灵活的插件系统
    details: ZIP 一键安装、可视化配置；悬浮挂件、文件操作扩展、自定义主题与预览扩展，与 OpenListNext 插件格式双向兼容。
  - icon: 👁️
    title: 强大的文件预览
    details: PDF、Markdown（公式 / Mermaid）、Office（docx / pptx / xlsx）、Monaco 代码、图片画廊、视频音频（字幕 / 弹幕 / HLS）。
  - icon: 🔗
    title: 分享与高速下载
    details: 提取码 / 密码 / 过期时间的分享链接；直链下载、断点续传、代理下载；文件夹流式 ZIP 打包下载。
  - icon: 🦀
    title: 全栈 TypeScript
    details: 前端 SolidJS + 后端 Hono 同语言，类型前后端共享，无 Go 编译链；配置全部持久化为 JSON / KV，零数据库依赖。
---
