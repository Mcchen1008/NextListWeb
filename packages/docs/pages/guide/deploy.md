---
title: 部署
description: 将 NextList 部署到 Cloudflare Workers / EdgeOne / Vercel / AWS Lambda / Node 容器
---

NextList 是**边缘优先**架构：核心后端只用 Web 标准 API（`fetch` / `Web Crypto` / `ReadableStream`），无 `fs`、`http` 等 Node.js 模块依赖，因此同一套代码可以部署到多种平台。

| 方式 | 命令 / 操作 | 适用场景 |
| --- | --- | --- |
| **Cloudflare Workers**（推荐） | `pnpm deploy` | 免费边缘部署，无需服务器 |
| **EdgeOne Makers** | 控制台导入仓库 | 国内访问友好，原生支持 |
| **Vercel** | `pnpm build` 后平台导入 | Serverless 部署 |
| **AWS Lambda** | `pnpm sls:deploy` | AWS 生态 |
| **Node 容器 / 自托管** | Docker / 手动托管 | 本地 NAS、VPS |

---

## 方式一：Cloudflare Workers（推荐）

```bash
# 一键部署（自动检测 / 创建 KV namespace，无需手动填写 KV id）
pnpm deploy

# 或分步执行：
npx wrangler login        # 1) 登录 Cloudflare
node scripts/deploy.js --kv   # 2) 确保 KV namespace 存在
pnpm deploy:worker        # 3) 部署
pnpm dev:worker           # 本地预览（wrangler dev）
```

`pnpm deploy` 会自动完成：检测 `NEXTLIST_KV` namespace（不存在则自动创建）→ 构建前端 → `wrangler deploy`。部署后：

- 配置数据持久化在 KV 中
- 静态资源由 `ASSETS` binding 托管

可选环境变量：`CF_ACCOUNT_ID` / `CF_API_TOKEN` / `CF_KV_NAMESPACE_ID`（供脚本自动创建 KV 时使用）。

> [!NOTE]
> 详细步骤（含自定义域名与 Secrets 配置）见仓库内 [docs/deploy-cloudflare-workers.md](https://github.com/Mcchen1008/NextList/blob/main/docs/deploy-cloudflare-workers.md)。

---

## 方式二：腾讯云 EdgeOne Makers

项目内置 `edgeone.json`、Node 云函数入口（`cloud-functions/[[default]].js`）、边缘中间件（`middleware.js`）与 `@edgeone/pages-blob` 持久化适配：

1. 在 [EdgeOne Makers 控制台](https://console.edgeone.ai/makers) 导入 Git 仓库，平台自动读取 `edgeone.json` 完成构建；
2. 存储无需手动配置：配置数据自动持久化到 Blob 存储（`nextlist_db` 命名空间）；
3. 部署后通过 `*.edgeone.cool` 域名访问，默认管理账号 `admin` / `admin`。

详见仓库内 [docs/edgeone.md](https://github.com/Mcchen1008/NextList/blob/main/docs/edgeone.md)。

---

## 方式三：Vercel / AWS Lambda

```bash
# 生产构建：Vite 前端（dist/）+ esbuild 边缘后端（dist/api/[...route].js）
pnpm build
```

- **Vercel**：仓库根目录的 `vercel.json` 会自动识别 `api/[...route].ts`（Hono Vercel 句柄）与 `dist/` 静态资源
- **AWS Lambda**：`pnpm sls:deploy` 基于 `serverless.yml` 部署，`handler.ts` 导出 Lambda 句柄

---

## 方式四：Node 容器 / 自托管

> [!IMPORTANT]
> `npm run start` 加载的是 Serverless 句柄产物（`dist/api/[...route].js`，Vercel 格式），**不包含端口监听**，不能直接当作常驻服务启动。
>
> 在 Node 环境下自托管时，需要自行用 `@hono/node-server`（依赖已内置）启动该句柄，并额外托管 `dist/` 静态资源。本地开发请使用 `pnpm dev`。

Local 驱动（本地文件系统）仅在此模式下可用：文件直接映射到 `public_data/` 目录，站点配置与存储配置持久化为 `public_data/db.json`。容器部署时将该目录挂载为数据卷即可持久化。

---

## 部署后的建议

1. **立即修改默认密码**（`admin` / `admin`）；
2. 在 Workers / Serverless 环境下优先使用网盘类驱动，Local 驱动仅限 Node 容器；
3. 为站点配置自定义域名，并开启 HTTPS；
4. 定期在「管理面板 → 备份恢复」导出配置备份。

<GiscusComment />
