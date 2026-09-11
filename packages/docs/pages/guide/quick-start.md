---
title: 快速开始
description: NextList 的环境要求、安装与本地运行
---

本文带你从零开始，在本地把 NextList 跑起来，并完成首次登录与存储挂载。

## 环境要求

| 依赖 | 版本要求 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 20.19（推荐 22 LTS） | Vite 构建工具链要求 |
| 包管理器 | pnpm 9+（推荐）或 npm | `npm i -g pnpm` 即可安装 |

## 安装依赖

```bash
git clone https://github.com/Mcchen1008/NextList.git
cd NextList
pnpm install
```

## 启动开发服务器

```bash
pnpm dev
```

该命令会同时启动 Vite 前端与 Hono 后端一体化开发服务器，随后访问 <http://localhost:3000> 即可。

## 默认管理账号

| 项 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 密码 | `admin` |

> [!WARNING]
> 首次部署后请务必在「管理面板 → 用户管理」中修改默认密码，避免站点被陌生人接管。

## 添加你的第一块存储

1. 使用默认账号登录，进入**管理面板 → 存储管理**；
2. 点击「新增存储」，选择驱动（如夸克网盘、WebDAV、OneDrive 等）；
3. 按表单填写对应的认证信息（Cookie / Token / OAuth 授权等），保存并启用；
4. 回到文件页，即可看到新挂载的存储出现在目录树中。

驱动的具体接入方式与参数说明见 [存储挂载](/guide/storage)。

## 下一步

- 部署到线上：见 [部署](/guide/deploy)，推荐 Cloudflare Workers 免费边缘部署
- 调整站点行为：见 [配置说明](/guide/config)
- 开发自己的插件：见 [插件开发指南](/plugins/development)

<GiscusComment />
