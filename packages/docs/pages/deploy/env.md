---
title: 环境变量与绑定
description: NextList 部署所需的环境变量、Secrets 与 KV / ASSETS 绑定说明
---

NextList 的运行时配置分为三类：**平台绑定**（KV 命名空间、静态资源）、**明文 vars**（非敏感的运行参数）与 **Secrets**（敏感密钥）。本文以 Cloudflare Workers 为主说明每一项的作用与配置方式，其他平台（EdgeOne、Vercel、Node 容器）的同名变量配置方式类似。

## 平台绑定

**`NEXTLIST_KV`（KV 命名空间，必需）**：NextList 的「数据库」。站点设置、用户、存储、分享、元数据、插件等全部状态都序列化后持久化到这个 KV 命名空间，替代传统部署中的本地 JSON 文件。Cloudflare Workers 上通过 `wrangler.toml` 的 `[[kv_namespaces]]` 声明；若 KV 不可用，后端会退化为内存模式，重启即丢数据，因此生产环境务必配置。

**`ASSETS`（静态资源绑定）**：指向构建产物目录（`./dist`），用于在同一个 Worker 上同时提供前端页面与 API。`wrangler.toml` 默认已配置；仅当你把前后端分开部署时才需要移除它。

## 明文 vars（wrangler.toml `[vars]`）

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ENVIRONMENT` | `production` | 运行环境标识，出现在 `/api/health` 的返回中，便于确认线上版本 |
| `ADMIN_USERNAME` | `admin` | 首次启动时初始化的管理员用户名 |
| `ADMIN_PASSWORD` | `admin` | 首次启动时初始化的管理员密码，**上线后请立即修改** |
| `VITE_API_URL` | `/api` | 前端请求的 API 前缀，同域部署保持默认即可 |
| `KV_NAMESPACE` / `KV_NAME` / `EO_REGION` | — | EdgeOne 等其他平台的 KV 定制参数，Workers 部署无需关注 |

## Secrets（敏感配置）

**`JWT_SECRET`**：登录态 JWT 的签名密钥，建议不小于 32 字符的随机字符串：

```bash
npx wrangler secret put JWT_SECRET
```

未配置时的回退行为：首次请求会自动生成随机密钥并写入 KV 持久化（`nextlist_jwt_secret`），多实例间共享；既无 KV 也未配置的开发环境下退化为进程内随机密钥，重启后所有登录态失效。出于安全考虑，生产环境始终建议显式配置。

> [!WARNING]
> 修改 JWT_SECRET 后，所有已登录用户的 token 会立即失效，需要重新登录。这是预期行为。

**Node 容器模式的部署参数**：以 Node 方式运行（`npm run start`）时，除上述变量外还支持 `DATABASE_JSON`（直接注入 JSON 数据库内容）、`CF_ACCOUNT_ID` / `CF_API_TOKEN` / `CF_KV_NAMESPACE_ID`（让容器模式复用 Cloudflare KV 作为远端存储）。这些均为可选项，默认使用本地 `public_data/db.json`。

## 验证配置

部署完成后访问 `/api/health`，返回的 JSON 包含 `name`、`version` 与 `environment` 字段。若 `environment` 与你配置的 `ENVIRONMENT` 一致，说明 vars 生效；若登录后刷新页面不掉线，说明 KV 与 JWT 密钥工作正常。

<GiscusComment />
