---
title: Cloudflare Workers 部署
description: 将 NextList 部署到 Cloudflare Workers —— 控制台连接 GitHub 图形化部署与 CLI 部署两种方式，KV 绑定、环境变量、自定义域名完整流程
---

NextList 后端基于 Hono 构建，只依赖 Web 标准 API（fetch、Web Crypto、ReadableStream），天然适合运行在 Cloudflare Workers 上。本文覆盖从零开始将 NextList 部署到 Cloudflare Workers 的完整流程，提供两种部署方式：**方式一**通过 Cloudflare 控制台连接 GitHub 仓库自动构建，全程图形化操作，无需本地开发环境；**方式二**使用 Wrangler CLI 从本地构建部署，适合习惯命令行的用户。

## 前置准备

开始之前请确认以下几件事就绪。第一，注册并登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) 账号，免费计划即可满足日常使用；第二，准备一个 [GitHub](https://github.com/) 账号——方式一需要用它连接仓库触发自动构建，方式二则需要本地安装 Node.js 18 或更高版本，以及包管理器 pnpm（`npm i -g pnpm`）；第三，若走 CLI 路线，在项目目录执行 `npx wrangler login` 完成 Wrangler 授权，浏览器会自动打开并要求登录你的 Cloudflare 账号。

## 方式一：控制台连接 GitHub 自动构建（推荐）

这种方式利用 Cloudflare Workers Builds：把 Fork 后的 NextList 仓库交给 Cloudflare，推送代码时自动构建并部署，全程在浏览器中完成。

### 步骤 1：Fork 仓库并创建应用

先将 [Mcchen1008/NextList](https://github.com/Mcchen1008/NextList) Fork 到你自己的 GitHub 账号下，后续 Cloudflare 会从这个 Fork 读取代码。然后进入 Cloudflare 控制台的 **Workers 和 Pages** 页面，点击右上角 **创建应用程序**，选择 **连接到 GitHub**。Cloudflare 会提示授权访问你的 GitHub 账号——点击 **Authorize** 并选择包含 Fork 仓库的账号（或组织）。

![创建应用程序 — 连接 GitHub](/img/worker/create_app1.png)

> [!TIP]
> 如果直接选择上游仓库导致 Cloudflare 提示「无法获取存储库内容」，请确认你已经 Fork 了 NextList 项目，并在授权时勾选该 Fork 所在的账号。

### 步骤 2：选择仓库并配置构建

在仓库选择页选中你 Fork 的 `NextList` 仓库，构建设置保持以下默认值即可，Cloudflare 会据此构建 Worker 并部署到 `*.workers.dev` 子域名：

| 配置项 | 值 |
| --- | --- |
| 项目名称 | 自定义（决定默认子域名前缀） |
| 构建命令 | `pnpm run build` |
| 部署命令 | `npx wrangler deploy` |
| 生产分支 | `main` |

![构建参数保持默认](/img/worker/create_app3.png)

NextList 仓库根目录已内置 `wrangler.toml`（Worker 入口 `src/backend/worker.ts`、`nodejs_compat` 兼容标志、静态资源目录 `./dist`），因此构建参数无需任何额外调整，点击 **Deploy** 后等待构建完成即可。

### 步骤 3：配置环境变量与 Secrets

进入刚刚创建的 Worker 项目，打开 **设置 → 变量和机密**，添加运行时变量：

| 变量 | 示例值 | 说明 |
| --- | --- | --- |
| `ADMIN_USERNAME` | `admin` | 首次启动初始化的管理员用户名 |
| `ADMIN_PASSWORD` | 你的强密码 | 首次启动初始化的管理员密码 |
| `JWT_SECRET` | 随机长字符串 | JWT 签名密钥，建议不小于 32 字符，敏感值请以「机密」类型保存 |

![添加环境变量](/img/worker/create_app4.png)

完整的变量清单与回退行为见 [环境变量与绑定](/deploy/env)。其中 `JWT_SECRET` 若不配置，NextList 会在首次启动时自动生成随机密钥并持久化到 KV，多实例间共享，但显式配置仍是最推荐的做法。

### 步骤 4：绑定 KV 存储

NextList 在 Serverless 环境中没有本地文件系统，所有配置、用户、存储与分享数据都持久化在 Cloudflare KV 中（对应本地开发时的 `public_data/db.json`），因此 KV 是必须完成的绑定。进入 **设置 → 绑定**，添加一条 KV 命名空间绑定：

| 类型 | 变量名 |
| --- | --- |
| KV 命名空间 | `NEXTLIST_KV` |

![绑定 KV 命名空间](/img/worker/create_app5.png)

> [!IMPORTANT]
> 绑定名（变量名）必须保持 `NEXTLIST_KV` 不变，后端通过该名称访问 KV。若尚未创建命名空间，可在此界面直接新建一个，或参考下文 CLI 部署中的 `wrangler kv namespace create` 命令。

### 步骤 5：绑定自定义域名

在 **设置 → 域名和路由** 中添加你自己的域名。若域名已托管在 Cloudflare，证书与 DNS 会自动配置；若域名托管在其他服务商，则为对应子域名创建一条 CNAME 记录，指向你的 `*.workers.dev` 域名。

![绑定自定义域名](/img/worker/create_app6.png)

### 部署完成后

构建成功后访问分配的 `*.workers.dev` 域名（或你的自定义域名）即可看到登录页。NextList 使用 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 变量初始化管理员账号（未配置时默认 `admin` / `admin`），**首次登录后请立即在后台修改密码**。部署后可访问 `/api/health` 验证服务状态。

## 方式二：CLI 本地部署

习惯命令行的用户可以在本地完成同样的流程，且这种方式对构建过程有完全的控制权。

### 创建并绑定 KV

打开终端进入项目目录，先创建 KV 命名空间：

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

> [!TIP]
> Wrangler 4.x 起支持 Automatic resource provisioning：`wrangler.toml` 中可以省略 `id` 只保留绑定名，部署时 Wrangler 会自动创建/关联同名 KV 并回写 ID。仓库自带的 `scripts/deploy.js` 一键部署脚本已经内置了这一逻辑（检测并确保 KV 存在后再部署），可以直接使用。

### 构建与部署

```bash
pnpm install        # 安装依赖
pnpm build          # 构建 Vite 前端 + Edge 后端
pnpm deploy:worker  # 部署到 Cloudflare 全球边缘网络（等价于 npx wrangler deploy）
```

或者使用一键部署脚本，它会自动确保 KV 命名空间存在并完成构建部署：

```bash
node scripts/deploy.js
```

部署成功后，命令行会返回默认访问域名（形如 `https://nextlist.<你的子域>.workers.dev`），打开即可看到登录页。

### 本地预览

部署上线前，可以先在本地模拟完整的 Workers 运行时（包含模拟 KV）：

```bash
pnpm dev:worker
```

该命令等价于 `wrangler dev`，启动后访问它打印的本地地址即可。它会以 `wrangler.toml` 中的 `vars`（`ADMIN_USERNAME` / `ADMIN_PASSWORD` 等）初始化环境，适合验证部署产物是否正常。

### 密钥配置

生产环境的敏感配置（如 JWT 签名密钥）应使用 Secret 而非明文 vars。执行以下命令并按提示输入值（建议长度不小于 32 字符）：

```bash
npx wrangler secret put JWT_SECRET
```

## Serverless 环境须知

Cloudflare Workers 是无状态的边缘计算环境，有几点限制需要了解。首先，`本地存储 (Local)` 驱动在 Workers 上不可用（没有持久文件系统），请改用对象存储或网盘驱动（S3、WebDAV、各大网盘等）。其次，离线下载等需要后台常驻进程的功能受限。最后，关注免费计划配额：每天 100,000 次请求、100,000 次 KV 读与 1,000 次 KV 写，个人使用通常绰绰有余。

## 网盘驱动与数据中心 IP 登录限制

Workers 的数据中心出口 IP 可能受到部分网盘服务商登录策略的限制，其中最典型的是 **123 云盘**：其登录接口会对数据中心 IP 返回「当前账号存在境外登录风险」，这是 123 服务端的策略，Go 原版部署到 Workers 同样会遇到。该限制只影响新的账号登录挂载，不影响已挂载存储的正常读取与下载。

推荐的接入方式按优先级排列如下。第一，**使用官方开放平台授权**：123 云盘提供开放平台（Open API），按官方流程申请应用并通过 OAuth 授权获取 access_token 填入存储配置，即可在边缘环境正常挂载；第二，**部署到境内 Node 容器**（`pnpm build && npm run start`），出口 IP 为境内宽带时可正常账号密码登录；第三，若账号已被平台标记，先在官网正常登录并完成验证即可恢复。

其他主流驱动（夸克、阿里云盘 Open、OneDrive、Google Drive、115、百度网盘等）均提供官方的开放平台或 OAuth 授权流程，其 token 类凭证不受数据中心 IP 限制影响，可直接在 Workers 上使用。

<GiscusComment />
