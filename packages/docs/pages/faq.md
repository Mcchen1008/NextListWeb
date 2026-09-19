---
title: 常见问题 FAQ
description: NextList 部署与使用中的高频问题
---

## Q：为什么 Local 驱动在 Cloudflare Workers 上不可用？

Workers 是无文件系统环境。Local 驱动仅在 Node 容器模式可用（按需动态加载 `fs`）；边缘部署请使用网盘 / WebDAV 等远程存储驱动。

## Q：123 云盘在 Workers 部署时提示「境外登录风险」？

这是 123 服务端对数据中心 / 陌生 IP 登录的策略限制，Go 原版 OpenList 同样会遇到。推荐使用官方开放平台授权获取 `access_token` 填入存储配置，或部署到境内服务器。

## Q：数据存在哪里？

Node 容器模式持久化到 `public_data/db.json`；Cloudflare Workers 模式持久化到绑定的 `NEXTLIST_KV` namespace；EdgeOne 模式持久化到 Blob 存储。详见 [环境变量与绑定](/deploy/env)。

## Q：支持 WebDAV 吗？

双向支持：既可以把远程 WebDAV 服务器（Nextcloud、ownCloud、群晖等）作为存储驱动挂载进来，也对外提供完整的 WebDAV 服务端（`/dav` 端点，RFC 4918 Class 1/2），可被 Windows 资源管理器、macOS Finder、rclone 等客户端挂载。详见 [添加存储](/storage/)。

## Q：`npm run start` 为什么不能直接启动服务？

`dist/api/[...route].js` 是 Serverless 句柄产物，不包含端口监听。项目以边缘部署为主要形态；Node 自托管需自行接入 `@hono/node-server` 并托管静态资源。本地开发请使用 `pnpm dev`。

## Q：默认账号密码是什么？

`admin` / `admin`。首次部署后请立即在「管理面板 → 用户管理」中修改。

## Q：忘记管理员密码怎么办？

删除持久化数据（`public_data/db.json` 或对应 KV 中的用户记录）后重启，系统会以 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 环境变量重新初始化默认账号。

## Q：如何参与插件生态？

给你的插件仓库打上 `nextlist-plugin` topic，然后在[插件市场](/plugins/)用 GitHub 登录并刷新，插件即被自动收录。开发问题见 [插件开发指南](/plugins/development)。

## Q：这个文档站和官网是怎么搭的？

官网（主页 / 文档 / 插件市场）源码在 [Mcchen1008/NextListWeb](https://github.com/Mcchen1008/NextListWeb)：主页与插件市场为 SolidJS + Vite，文档站为 Valaxy + valaxy-theme-press，整体部署在 Cloudflare Pages，插件市场数据存储于 Cloudflare KV。

<GiscusComment />
