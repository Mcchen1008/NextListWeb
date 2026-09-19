---
title: EdgeOne Pages 部署
description: 将 NextList 部署到腾讯云 EdgeOne Makers（边缘函数）—— 控制台 Git 导入 / CLI 部署、环境变量、域名与数据持久化完整说明
---

除 Cloudflare Workers 外，NextList 也完整支持部署到腾讯云 [EdgeOne Pages](https://edgeone.ai/)（Makers）。该平台上前端静态资源由边缘 CDN 加速，后端由 Node.js 云函数承载，构建脚本会在打包期自动完成所有适配，你不需要修改任何代码。本文覆盖控制台 Git 导入与 CLI 两种部署方式，以及环境变量、自定义域名、数据持久化等部署细节。

## 前置准备

开始之前需要准备两件事。第一，注册并登录腾讯云 EdgeOne 账号，[国际站控制台](https://console.edgeone.ai/makers)与[中国站控制台](https://console.cloud.tencent.com/edgeone/makers)均可部署，两者操作流程一致；第二，准备一个 GitHub 账号用于连接仓库——EdgeOne 会从你授权的 GitHub 账号中读取 NextList 仓库并自动构建。若选择 CLI 方式，本地还需 Node.js 22 或更高版本。

## 平台适配要点

NextList 针对 EdgeOne 做了三层适配，了解它们有助于排查部署问题。其一，构建脚本 `scripts/build-edge.mjs` 会把后端入口打包为仓库根的 `cloud-functions/[[default]].js`——EdgeOne 在检出仓库时就会扫描该文件来决定是否启用 Node 函数，因此它必须存在于仓库中（本项目已提交）；若缺失，CLI 会报 `No server-handler detected` 并退化为纯静态站点。其二，Node 云函数内没有 Workers 那样的 `ASSETS` 绑定，所以构建时会把 `dist/index.html` 内联进函数包作为 SPA 兜底，即使请求直达云函数也不会 404。其三，根级 `middleware.js` 会把浏览器导航请求改写到 `index.html`，命中静态 CDN 完成 SPA fallback。

## 方式一：控制台 Git 导入（推荐）

登录 [EdgeOne Makers 控制台](https://console.edgeone.ai/makers)，点击 **新建项目 → 导入 Git 仓库**，首次使用会要求授权 GitHub 账号，授权后在仓库列表中选择你 Fork 或导入的 NextList 仓库：

![在 EdgeOne 中选择 NextList 仓库](/img/worker/edgeone_ui1.png)

构建设置按如下填写（平台会自动读取项目根目录的 `edgeone.json`，以下值通常无需手动修改）：

| 项 | 值 |
| --- | --- |
| Node 版本 | 22.11.0 |
| 安装命令 | `pnpm install --no-frozen-lockfile` |
| 构建命令 | `pnpm run build` |
| 输出目录 | `dist` |

在部署前的变量设置环节，可以按需配置环境变量。NextList 在 EdgeOne 上**没有必填变量**——数据持久化使用的 Blob 存储由运行时自动注入凭证，开箱即用。可选变量如下：

| 变量 | 示例值 | 说明 |
| --- | --- | --- |
| `ADMIN_USERNAME` | `admin` | 首次启动初始化的管理员用户名 |
| `ADMIN_PASSWORD` | 你的强密码 | 首次启动初始化的管理员密码 |
| `JWT_SECRET` | 随机长字符串 | JWT 签名密钥，建议不小于 32 字符 |

设置完成后点击 **开始部署**，等待构建完成即可通过平台分配的 `*.edgeone.cool` 域名访问。NextList 使用 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 初始化管理员账号（未配置时默认 `admin` / `admin`），**首次登录后请立即在后台修改密码**。

## 自定义域名与 SSL

部署完成后，进入项目的 **域名管理** 页面添加自定义域名，然后按页面要求在你的 DNS 服务商处为该子域名创建 CNAME 记录，待解析生效后启用 SSL 证书即可。整个过程 EdgeOne 会有向导式提示，按步骤操作即可。

![添加自定义域名并启用 SSL](/img/worker/edgeone_ui2.png)

## 方式二：EdgeOne CLI 部署

习惯命令行的用户可以使用官方 CLI 完成同样的流程：

```bash
npm install -g edgeone   # 全局安装
edgeone login            # 登录账户
edgeone makers dev       # 本地调试
edgeone makers deploy    # 构建并部署到生产
```

## 数据持久化说明

NextList 在 EdgeOne 环境的持久化按以下优先级自动选择。第一优先是 **Blob 存储**（`@edgeone/pages-blob`，强一致性 HTTP API），凭证由运行时自动注入，零配置；第二优先是 **EdgeOne KV 绑定**（`EDGEONE_KV` / `EO_KV`），仅当环境注入了绑定才启用——若你希望使用 KV 存储，需在控制台 **存储 → KV 存储** 中创建命名空间并绑定到上述变量名：

![绑定 KV 命名空间](/img/worker/edgeone_ui3.png)

两者都不可用时退化为**内存模式**——配置变更只在当前函数实例生命周期内有效，重启即丢，因此生产部署请确保前两者之一生效。

> [!TIP]
> Blob 与 KV 两种持久化无需在变量中显式选择：NextList 的 `auto` 探测逻辑会按 Blob → KV 的优先级自动启用，控制台绑定哪个就用哪个。

部署后可以进入管理面板「设置 → 其他」查看 KV 状态面板（对应接口 `/api/admin/kv/status`），确认当前实际生效的存储平台。

## 关于定时任务

EdgeOne Pages 支持 `edgeone.json` 的 `schedules` 定时任务能力（可用于定期触发 token 刷新类接口）。NextList 无需配置该项：其存储驱动的 token 采用**请求时按需刷新**策略（遇到过期 token 自动续期），另有进程内定时任务调度器处理周期性工作，不依赖平台级定时触发。若你希望降低冷启动后的首次请求延迟，也可以配置一条定时任务定期请求 `/api/health` 为实例保温，但这属于可选项，不影响功能完整性。

<GiscusComment />
