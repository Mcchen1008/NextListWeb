---
title: EdgeOne Pages 部署
description: 将 NextList 部署到腾讯云 EdgeOne Makers（边缘函数）—— Git 导入 / CLI 部署与数据持久化说明
---

除 Cloudflare Workers 外，NextList 也完整支持部署到腾讯云 [EdgeOne Makers](https://edgeone.ai/)。该平台上前端静态资源由边缘 CDN 加速，后端由 Node.js 云函数承载，构建脚本会在打包期自动完成所有适配，你不需要修改任何代码。

## 平台适配要点

NextList 针对 EdgeOne 做了三层适配，了解它们有助于排查部署问题。其一，构建脚本 `scripts/build-edge.mjs` 会把后端入口打包为仓库根的 `cloud-functions/[[default]].js`——EdgeOne 在检出仓库时就会扫描该文件来决定是否启用 Node 函数，因此它必须存在于仓库中（本项目已提交）；若缺失，CLI 会报 `No server-handler detected` 并退化为纯静态站点。其二，Node 云函数内没有 Workers 那样的 `ASSETS` 绑定，所以构建时会把 `dist/index.html` 内联进函数包作为 SPA 兜底，即使请求直达云函数也不会 404。其三，根级 `middleware.js` 会把浏览器导航请求改写到 `index.html`，命中静态 CDN 完成 SPA fallback。

## 方式一：控制台 Git 导入（推荐）

登录 [EdgeOne Makers 控制台](https://console.edgeone.ai/makers)，点击 **新建项目 → 导入 Git 仓库**，构建设置按如下填写（平台会自动读取项目根目录的 `edgeone.json`）：

| 项 | 值 |
| --- | --- |
| Node 版本 | 22.11.0 |
| 安装命令 | `pnpm install --no-frozen-lockfile` |
| 构建命令 | `pnpm run build` |
| 输出目录 | `dist` |

存储无需手动配置：Blob 存储会通过 `@edgeone/pages-blob` SDK 自动初始化，配置数据持久化在 `nextlist_db` 命名空间。部署完成后通过平台分配的 `*.edgeone.cool` 域名访问，默认管理账号 `admin` / `admin`。

## 方式二：EdgeOne CLI 部署

习惯命令行的用户可以使用官方 CLI 完成同样的流程：

```bash
npm install -g edgeone   # 全局安装
edgeone login            # 登录账户
edgeone makers dev       # 本地调试
edgeone makers deploy    # 构建并部署到生产
```

## 数据持久化说明

NextList 在 EdgeOne 环境的持久化按以下优先级自动选择。第一优先是 **Blob 存储**（`@edgeone/pages-blob`，强一致性 HTTP API），凭证由运行时自动注入，零配置；第二优先是 **EdgeOne KV 绑定**（`EDGEONE_KV` / `EO_KV`），仅当环境注入了绑定才启用；两者都不可用时退化为**内存模式**——配置变更只在当前函数实例生命周期内有效，重启即丢，因此生产部署请确保前两者之一生效。

部署后可以进入管理面板「设置 → 其他」查看 KV 状态面板（对应接口 `/api/admin/kv/status`），确认当前实际生效的存储平台。

<GiscusComment />
