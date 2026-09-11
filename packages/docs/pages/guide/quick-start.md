---
title: 快速开始
description: 五分钟上手 NextList —— 在线部署或本地运行、首次登录、挂载第一块存储
---

欢迎来到 NextList！本文是整个文档的入口，带你用最短路径把站点跑起来：选择一种部署方式、完成首次登录、挂载第一块存储，然后把后续深入阅读的文档链接交给你。

## 选择你的启动方式

NextList 支持两条上手路径，按你的需求二选一即可。

**路径一：云端部署（推荐）**。如果你希望拥有一个可以直接访问的线上站点，推荐部署到 Cloudflare Workers：免费计划每天 100,000 次请求、全球边缘节点加速、无需维护服务器。完整流程见 [Cloudflare Workers 部署](/deploy/workers)，概括起来只有三步——创建一个 KV 命名空间、`pnpm build` 构建产物、`pnpm deploy:worker` 发布。腾讯云用户也可以选择 [EdgeOne Pages 部署](/deploy/edgeone)。

**路径二：本地开发运行**。如果你想先在本地体验或参与开发，确认已安装 Node.js ≥ 20.19 与 pnpm 9+，然后：

```bash
git clone https://github.com/Mcchen1008/NextList.git
cd NextList
pnpm install
pnpm dev
```

启动后访问 <http://localhost:3000> 即可。Vite 会同时托管前端页面与 Hono 后端，配置数据写入本地 `public_data/db.json`。

## 首次登录

无论哪种方式启动，默认管理员账号相同：

| 项 | 值 |
| --- | --- |
| 用户名 | `admin` |
| 密码 | `admin` |

> [!WARNING]
> 公网部署后请第一时间在「管理面板 → 用户管理」修改默认密码，并为站点启用两步验证，参见 [登录与账户安全](/guide/account)。

登录入口在页面右上角。管理员登录后会自动获得「管理面板」入口，普通用户仅能看到被授权的文件视图。

## 挂载第一块存储

NextList 自身不存储文件，一切内容来自你挂载的存储。挂载流程对任何驱动都一致：

1. 进入**管理面板 → 存储管理**，点击「添加存储」；
2. 选择驱动——从 WebDAV、S3 这类通用协议，到夸克、阿里云盘、百度网盘、123 云盘、115、OneDrive、Google Drive 等 60+ 网盘；
3. 按表单填写认证信息（Cookie、refresh_token、WebDAV 账号密码等），设置挂载路径（如 `/夸克`）；
4. 保存并启用，回到文件页即可在目录树中看到新存储。

每种驱动需要哪些参数、去哪里获取凭证，见 [添加存储](/storage/)；全部驱动的清单见 [驱动一览](/storage/drivers)。

## 接下来去哪里

按目的选择阅读路线：

- **日常使用**：[文件浏览与预览](/guide/browse)、[分享](/guide/share)、[WebDAV 挂载到本机](/guide/webdav)
- **站点管理**：[站点 / 样式 / 预览 / 全局设置](/config/site)、[高级设置](/config/advanced)
- **接入 AI**：[MCP 接入指南](/advanced/mcp)，让 Claude、Cursor 直接读取你的网盘
- **二次开发**：[REST API](/advanced/api) 与 [插件开发](/plugins/development)

<GiscusComment />
