---
title: 阿里云 ESA 部署
description: 将 NextList 部署到阿里云 ESA 边缘安全加速（Edge Routine 边缘函数）—— 通用边缘入口、esa.jsonc 配置与数据持久化方案
---

NextList 的后端只依赖 Web 标准 API（fetch、Web Crypto、ReadableStream），构建产物中的通用边缘入口以 ES Module 形式导出标准的 `fetch` 句柄，因此可以运行在阿里云 [ESA（边缘安全加速）](https://www.alibabacloud.com/zh/product/edge-security-acceleration)的 Edge Routine 边缘函数上。本教程改编自 OpenList Worker 的 ESA 部署指南，并结合 NextList 的实际实现做了调整：NextList 未内置 EdgeKV 适配入口，而是使用通用边缘入口加远程 KV 的组合，适合希望把站点部署在阿里云境内节点的进阶用户。

## 前置准备

开始之前请确认以下几件事就绪。第一，开通阿里云 ESA 服务并创建站点，ESA 边缘函数（Edge Routine）随 ESA 套餐提供，控制台入口为 **ESA 控制台 → 边缘函数**；第二，本地安装 Node.js 18 或更高版本与包管理器 pnpm（`npm i -g pnpm`），用于构建项目；第三，准备一个持久化目标——由于 NextList 未适配 ESA 的 EdgeKV，推荐配置一个远程 Cloudflare KV 作为数据存储（免费额度足够个人使用，配置方式见下文数据持久化章节）。

## 构建产物说明

与 OpenList Worker 提供专用 `esa-entry.ts` 不同，NextList 采用「一套入口、多平台复用」的策略：构建脚本 `scripts/build-edge.mjs` 会把后端打包为平台中立的通用边缘入口 `dist/api/[...route].js`（esbuild `platform: neutral`，纯 Web 标准，无平台专有依赖）。该产物以 ES Module 格式默认导出 `fetch` 句柄，与 ESA Edge Routine 的入口规范兼容，无需为 ESA 单独维护入口文件。

```bash
# 1. 安装依赖
pnpm install

# 2. 构建（产出通用边缘入口 dist/api/[...route].js 与前端静态资源 dist/）
pnpm run build
```

构建完成后，`dist/` 目录同时包含前端静态资源与后端入口，两者一起部署即可在同一个边缘函数上提供页面与 API。

## esa.jsonc 参考配置

ESA 边缘函数通过项目根目录的 `esa.jsonc` 声明入口、安装/构建命令与静态资源目录。在 NextList 仓库根目录新建 `esa.jsonc`，参考配置如下：

```jsonc
{
  "name": "nextlist",
  "entry": "./dist/api/[...route].js",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm run build",
  "assets": { "directory": "./dist" },
}
```

各字段与 OpenList Worker 的 `esa.jsonc` 含义一致：`entry` 指向构建产出的边缘函数入口，`installCommand` 与 `buildCommand` 供 ESA 控制台在 Git 导入部署时自动执行，`assets` 声明静态资源目录使前端页面由边缘 CDN 直接命中。将仓库推送到 GitHub 后，也可以在 ESA 控制台以「边缘函数 → 创建函数 → Git 导入」的方式让平台自动构建部署。

## 数据持久化方案

NextList 在 ESA 环境没有 EdgeKV 绑定可用，持久化按以下优先级处理。**推荐方案是远程 Cloudflare KV（REST API 模式）**：在边缘函数的环境变量中配置以下三项，NextList 会通过 Cloudflare KV REST API 读写数据，效果与 Workers 部署一致，且数据独立于函数实例存在，重启不丢：

| 变量 | 说明 |
| --- | --- |
| `CF_ACCOUNT_ID` | Cloudflare 账号 ID（Dashboard 右侧栏可见） |
| `CF_KV_NAMESPACE_ID` | KV 命名空间 ID（`wrangler kv namespace create NEXTLIST_KV` 创建后获取） |
| `CF_API_TOKEN` | 具有 KV 读写权限的 Cloudflare API Token |

同时建议配置 `ADMIN_USERNAME` / `ADMIN_PASSWORD`（初始化管理员账号，默认 `admin` / `admin`）与 `JWT_SECRET`（登录态签名密钥，建议不小于 32 字符）。完整的变量说明见 [环境变量与绑定](/deploy/env)。

> [!WARNING]
> 若不配置远程 KV，NextList 会退化为**内存模式**——所有数据只存在于当前函数实例的生命周期内，实例回收或扩缩容后配置即丢失。内存模式仅适合本地验证构建产物，生产部署务必配置远程 KV。

## 已知限制

ESA 部署属于社区路径，有几项限制需要提前了解。其一，NextList 未适配 EdgeKV，无法使用 ESA 原生的免费 KV 存储，持久化依赖上述远程 Cloudflare KV（跨云访问 KV 的请求延迟约为几十毫秒，管理操作可接受，热点文件访问不受影响——文件流量走存储驱动直链，不经过 KV）。其二，OpenList Worker 针对 EdgeKV 最终一致性设计的模块级 TTL 缓存在 NextList 中不存在对应实现，也无需关心——REST API 模式下读写均为强一致。其三，`本地存储 (Local)` 驱动在边缘函数上不可用，请使用对象存储或网盘驱动；离线下载等需要常驻进程的功能同样受限。若你希望原生接入 EdgeKV，可以参考 OpenList Worker 的 `esa-entry.ts` 适配思路，在 `src/backend/internal/model/db.ts` 的 KV 绑定层新增一个 EdgeKV 驱动实现，欢迎向 NextList 仓库提交 PR。

<GiscusComment />
