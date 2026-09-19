---
layout: home
title: NextList — File List & Cloud Drive Manager
description: NextList official site — a self-hosted file list program with 60+ storage drivers, one-click deploy to Cloudflare Workers, WebDAV, sharing and MCP AI integration.

hero:
  name: NextList
  text: File list & cloud drive manager
  tagline: Full-stack TypeScript, 60+ storage drivers unified, one-click deploy to the Cloudflare Workers edge — runs free on generous free tiers.
  image:
    src: /logo.svg
    alt: NextList
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/quick-start
    - theme: alt
      text: Deploy Guide
      link: /en/deploy/workers
    - theme: alt
      text: GitHub
      link: https://github.com/Mcchen1008/NextList

features:
  - icon: i-ri-database-2-line
    title: 60+ Storage Drivers
    details: Quark, Aliyun Drive, Baidu Netdisk, 123 Cloud, OneDrive, Google Drive, Dropbox, S3, WebDAV, GitHub Releases and more — mounted side by side with cross-storage copy.
  - icon: i-ri-flashlight-line
    title: Edge Deployment
    details: The backend relies only on Web standard APIs (fetch / Web Crypto). Deploy the same code to Cloudflare Workers, Tencent EdgeOne, Alibaba ESA, Vercel or a Node container — no database required.
  - icon: i-ri-robot-2-line
    title: MCP for AI Assistants
    details: A built-in Model Context Protocol server lets Claude, Cursor and other AI clients browse folders, search files and read site status — plug your drive into AI workflows.
  - icon: i-ri-eye-line
    title: Rich File Preview
    details: PDF, Markdown (math / Mermaid), Office documents, Monaco code editor, image gallery and video / audio playback with subtitles and HLS.
  - icon: i-ri-link
    title: Sharing / Direct Links / WebDAV
    details: Password-protected share links with expiry, signed direct links with resume support, streamed ZIP downloads, and a full RFC 4918 WebDAV server at /dav.
  - icon: i-ri-code-s-slash-line
    title: Full-stack TypeScript
    details: SolidJS frontend + Hono backend share one language and types. Ships with 2FA, audit logging, and OpenList-compatible backup & plugin format.
---
