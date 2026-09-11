---
title: Cloudflare Workers 部署
description: 将 NextList 部署到 Cloudflare Workers 边缘网络 —— KV 绑定、构建、部署、自定义域名与密钥
---

NextList 后端基于 Hono 构建，只依赖 Web 标准 API（fetch、Web Crypto、ReadableStream），天然适合运行在 Cloudflare Workers 上。本文覆盖从零开始将 NextList 部署到 Cloudflare Workers 的完整流程：创建 KV、构建、部署、绑定自定义域名与配置密钥。

## 前置准备

开始之前请确认以下三件事就绪。第一，本地安装 Node.js 18 或更高版本，以及包管理器 pnpm（推荐，`npm i -g pnpm`）；第二，注册并登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) 账号，免费计划即可满足日常使用；第三，在项目目录执行 `npx wrangler login` 完成 Wrangler CLI 授权，浏览器会自动打开并要求登录你的 Cloudflare 账号。

## 创建并绑定 KV

NextList 在 Serverless 环境中没有本地文件系统，所有配置、用户、存储与分享数据都持久化在 Cloudflare KV 中（对应本地开发时的 `public_data/db.json`）。KV 是部署前必须完成的一步，否则站点无法保存任何状态。

首先创建命名空间：

```bash
npx wrangler kv namespace create NEXTLIST_KV
```

命令行会输出类似下面的信息，复制其中的 ID：

```text
🌀 Creating namespace with title "nextlist-NEXTLIST_KV"
✨ Success! Created namespace nextlist-NEXTLIST_KV with ID "a1b2c3d4e5f67890abcdef1234567890"
```

然后把它填入项目根目录的 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "NEXTLIST_KV"
id = "a1b2c3d4e5f67890abcdef1234567890"  # 替换为你自己的 ID
```

> [!IMPORTANT]
> 绑定名（`binding`）必须保持 `NEXTLIST_KV` 不变，后端通过该名称访问 KV。若你在 Cloudflare Dashboard 的 Workers 设置页添加绑定，同样要使用这个变量名。

## 构建与部署

项目根目录的 `wrangler.toml` 已经配置好 Worker 入口（`src/backend/worker.ts`）、`nodejs_compat` 兼容标志与静态资源目录（`./dist`），无需额外修改即可部署。完整流程只需要三条命令：

```bash
pnpm install        # 安装依赖
pnpm build          # 构建 Vite 前端 + Edge 后端
pnpm deploy:worker  # 部署到 Cloudflare 全球边缘网络（等价于 npx wrangler deploy）
```

部署成功后，命令行会返回默认访问域名（形如 `https://nextlist.<你的子域>.workers.dev`），打开即可看到登录页。

## 本地预览

部署上线前，可以先在本地模拟完整的 Workers 运行时（包含模拟 KV）：

```bash
pnpm dev:worker
```

该命令等价于 `wrangler dev`，启动后访问它打印的本地地址即可。它会以 `wrangler.toml` 中的 `vars`（`ADMIN_USERNAME` / `ADMIN_PASSWORD` 等）初始化环境，适合验证部署产物是否正常。

## 密钥与自定义域名

**配置 Secrets**：生产环境的敏感配置（如 JWT 签名密钥）应使用 Secret 而非明文 vars。执行以下命令并按提示输入值（建议长度不小于 32 字符）：

```bash
npx wrangler secret put JWT_SECRET
```

> [!TIP]
> 若不配置 JWT_SECRET，NextList 会在首次启动时自动生成随机密钥并持久化到 KV，多实例间可以共享。但显式配置仍是最推荐的做法，可避免 KV 清空后全员掉线。

**绑定自定义域名**：进入 Cloudflare Dashboard → **Workers 和 Pages** → 选择你的 Worker → **设置 → 域名和路由 → 添加自定义域**，填入一个已托管在 Cloudflare 的域名（如 `pan.example.com`）即可，证书与 DNS 会自动配置。

## Serverless 环境须知

Cloudflare Workers 是无状态的边缘计算环境，有几点限制需要了解。首先，`本地存储 (Local)` 驱动在 Workers 上不可用（没有持久文件系统），请改用对象存储或网盘驱动（S3、WebDAV、各大网盘等）。其次，离线下载等需要后台常驻进程的功能受限。最后，关注免费计划配额：每天 100,000 次请求、100,000 次 KV 读与 1,000 次 KV 写，个人使用通常绰绰有余。

## 网盘驱动与出口 IP 风控

Workers 的数据中心出口 IP 可能触发部分网盘服务商的登录风控，其中最典型的是 **123 云盘**：其登录接口会对境外数据中心 IP 返回「当前账号存在境外登录风险」，这是 123 服务端的策略，Go 原版部署到 Workers 同样会遇到。

推荐的规避方案按优先级排列如下。第一，**直接使用 access_token**：在本机浏览器登录 123 云盘官网（本机 IP 不受风控），从开发者工具中复制请求头的 `Authorization: Bearer <token>` 填入存储配置的 access_token 字段；第二，**部署到境内 Node 容器**（`pnpm build && npm run start`），出口 IP 为境内宽带时可正常账号密码登录；第三，账号已被标记风险时，先在官网正常登录一次解除。

其他主流驱动（夸克、阿里云盘 Open、OneDrive、Google Drive、115、百度网盘等）的 token 类凭证不受登录 IP 风控影响，可直接在 Workers 上使用。

<GiscusComment />
