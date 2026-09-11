<p align="center">
  <img src="packages/home/public/logo.svg" width="72" alt="NextList" />
</p>

<h1 align="center">NextList 官网</h1>

<p align="center">
  <b>主页 · 文档站 · 插件市场</b><br />
  为开源文件列表 / 网盘管理系统 <a href="https://github.com/Mcchen1008/NextList">NextList</a> 搭建的官方网站<br />
  整体部署于 Cloudflare Pages，插件市场数据存储于 Cloudflare KV
</p>

---

## 一、项目组成

| 部分 | 路由 | 技术栈 | 说明 |
| --- | --- | --- | --- |
| 主页 | `/` | SolidJS + Vite（纯静态） | 项目门面：特性介绍、部署引导、界面预览 |
| 文档站 | `/docs` | Valaxy + valaxy-theme-press（纯静态） | 快速开始 / 部署 / 配置 / 存储挂载 / 插件开发 / FAQ，集成 Giscus 评论 |
| 插件市场 | `/plugins` | SolidJS + Vite（SPA） | 浏览 / 搜索 / 详情 / GitHub 登录 / 自动收录 / 评论 |
| 后端 API | `/api/*` | Cloudflare Pages Functions（TypeScript） | 读 KV + GitHub OAuth + 插件收录 |
| 存储 | - | Cloudflare KV | 插件列表与 README 缓存 |

## 二、仓库结构

```text
nextlist-web/
├── package.json              # 根 package.json（workspace 脚本）
├── pnpm-workspace.yaml       # pnpm workspace 配置
├── wrangler.toml             # Cloudflare Pages 配置（KV 绑定示例）
├── scripts/
│   ├── build.mjs             # 合并三个子包产物到根 dist/
│   └── ensure-dist.mjs       # 本地 API 调试时确保 dist/ 存在
├── packages/
│   ├── home/                 # 主页（SolidJS + Vite）
│   ├── docs/                 # 文档站（Valaxy + valaxy-theme-press）
│   └── plugins/              # 插件市场（SolidJS + Vite SPA）
├── functions/
│   └── api/                  # Pages Functions（自动成为 /api/* 端点）
│       ├── auth/
│       │   ├── config.ts     # GET  /api/auth/config      OAuth 前端配置
│       │   └── github.ts     # POST /api/auth/github      OAuth 回调 + 自动收录
│       ├── plugins/
│       │   ├── index.ts      # GET  /api/plugins          插件列表
│       │   ├── refresh.ts    # POST /api/plugins/refresh  作者刷新自己的插件
│       │   └── [[path]].ts   # GET  /api/plugins/:id(/readme)  详情与 README
│       └── utils/            # KV / GitHub API / HTTP 工具库
└── dist/                     # 构建生成，不提交
```

## 三、本地开发

### 环境要求

- Node.js ≥ 20（推荐 22 LTS）
- pnpm 9+（`npm i -g pnpm`）

### 安装与启动

```bash
pnpm install

# 三个子包可分别独立启动（带 HMR，产物路径与线上一致）
pnpm dev:home      # 主页        → http://localhost:5173
pnpm dev:docs      # 文档站      → http://localhost:5174
pnpm dev:plugins   # 插件市场    → http://localhost:5175/plugins/

# 后端 API（Pages Functions 本地模拟，默认 8788 端口）
cp .dev.vars.example .dev.vars   # 填入 GitHub OAuth 凭据（本地调试用）
pnpm dev:api                     # → http://localhost:8788
```

> [!TIP]
> 三个前端子包的 Vite dev server 都已配置 `/api` 代理到 `http://localhost:8788`。
> 想同时调试前端 + API：先跑 `pnpm dev:api`，再开需要的 `pnpm dev:*`。
> API 未启动时页面可正常浏览，仅登录 / 刷新等交互会报错。

## 四、构建

```bash
pnpm build          # 依次构建三个子包，然后合并产物到 dist/
```

合并规则（`scripts/build.mjs`）：

| 子包产物 | 目标位置 | 线上路由 |
| --- | --- | --- |
| `packages/home/dist` | `dist/` | `/` |
| `packages/docs/dist` | `dist/docs/` | `/docs` |
| `packages/plugins/dist` | `dist/plugins/` | `/plugins` |

- 某个子包产物不存在时**跳过并警告，不中断**构建
- 脚本会自动生成 `dist/_redirects`，为插件市场 SPA 提供客户端路由回退（`/plugins/plugin/*` → `/plugins/index.html`），且不会遮蔽 `/plugins/assets/*` 静态资源

## 五、部署到 Cloudflare Pages

### 1. 创建项目

在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages → 连接 Git 仓库：

| 配置项 | 值 |
| --- | --- |
| 构建命令 | `pnpm build` |
| 构建输出目录 | `dist` |
| Node 版本 | 环境变量 `NODE_VERSION` = `22`（推荐） |

### 2. 创建并绑定 KV

```bash
npx wrangler kv namespace create PLUGINS_KV
```

把命令输出的 namespace id 填到两处：

1. `wrangler.toml` 中 `[[kv_namespaces]]` 的 `id`（本地开发用）
2. Dashboard → 项目 → Settings → Functions → **KV namespace bindings**：变量名 `PLUGINS_KV`（生产用）

### 3. 配置环境变量 / Secrets

Dashboard → 项目 → Settings → Environment variables：

| 变量 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `GITHUB_CLIENT_ID` | Secret | 是（登录功能） | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Secret | 是（登录功能） | GitHub OAuth App Client Secret |
| `PLUGIN_TOPIC` | 变量 | 否 | 插件收录 topic，默认 `nextlist-plugin` |
| `REFRESH_COOLDOWN_SECONDS` | 变量 | 否 | 刷新冷却秒数，默认 `300` |

GitHub OAuth App 创建：<https://github.com/settings/developers> →

- Homepage URL：`https://<你的域名>`
- **Authorization callback URL**：`https://<你的域名>/plugins/callback`
- 仅需 `public_repo` scope，只读公开仓库，不涉及私有数据

### 4. 配置 Giscus 评论（可选）

文档站每个页面与插件详情页的评论区基于 [Giscus](https://giscus.app)（GitHub Discussions）：

1. 仓库开启 Discussions，并安装 [giscus App](https://github.com/apps/giscus)；
2. 在 <https://giscus.app> 按引导生成参数；
3. 在 Pages 构建环境变量中添加（影响 `packages/docs` 与 `packages/plugins` 的构建产物）：

| 变量 | 说明 |
| --- | --- |
| `VITE_GISCUS_REPO` | 如 `Mcchen1008/NextListWeb` |
| `VITE_GISCUS_REPO_ID` | 如 `R_kgDOxxxxxx` |
| `VITE_GISCUS_CATEGORY` | 建议 `Announcements` |
| `VITE_GISCUS_CATEGORY_ID` | 如 `DIC_kwDOxxxxxx` |

未配置时评论区显示占位提示，不影响其他功能。评论数据与插件市场的 KV 数据完全独立。

### 5. 部署

提交代码推送到 GitHub，Pages 会自动构建部署；也可以本地手动部署：

```bash
pnpm build
npx wrangler pages deploy dist
```

## 六、KV 数据模型

| Key | Value | 说明 |
| --- | --- | --- |
| `plugins:list` | JSON 数组 | 所有插件的元数据（整体存一个 key） |
| `plugin:readme:<id>` | Markdown 文本 | 单个插件的 README 缓存 |
| `user:<github_id>:refreshed_at` | 时间戳毫秒 | 上次刷新时间，用于冷却控制 |

插件元数据结构：

```json
{
  "id": "owner/repo",
  "name": "插件名",
  "description": "描述",
  "owner": "GitHub 用户名",
  "ownerAvatar": "作者头像 URL",
  "repoUrl": "https://github.com/owner/repo",
  "icon": "仓库根目录 icon.png 的 raw 直链，或 null",
  "stars": 123,
  "topics": ["nextlist-plugin"],
  "updatedAt": "ISO 时间",
  "downloadUrl": "GitHub Release 直链或仓库地址",
  "defaultBranch": "main"
}
```

> [!NOTE]
> KV 不支持复杂查询 / 模糊搜索 / 排序分页，因此列表整体存一个 key，前端拿到后在浏览器内完成搜索 / 筛选 / 排序，访客浏览零服务端开销。

## 七、插件收录流程

1. 给插件仓库打上 `nextlist-plugin` topic（仓库根目录可选放置 `icon.png` 作为图标）；
2. 在插件市场点击「用 GitHub 登录」，授权 `public_repo`；
3. 后端用 token 调 Search API（`topic:nextlist-plugin user:<用户名>`）检索该用户公开仓库；
4. 逐仓库拉取 README（缓存到 KV）、探测 `icon.png`、解析最新 Release 下载直链；
5. 合并去重写入 KV `plugins:list`——普通访客直接读 KV，不消耗 GitHub API 配额；
6. 作者之后可点「刷新我的插件」触发重新拉取（默认 5 分钟冷却，防 rate limit）。

## 八、API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/plugins` | 全量插件列表：`{ plugins, total }` |
| GET | `/api/plugins/:id` | 插件详情：`{ plugin }`（id 形如 `owner/repo`） |
| GET | `/api/plugins/:id/readme` | README：`{ id, readme }` |
| POST | `/api/auth/github` | OAuth 回调：`{ code }` → `{ user, token, collected, total }` |
| POST | `/api/plugins/refresh` | 刷新本人插件：`Authorization: Bearer <token>` → `{ collected, total }`（429 时携带 `retryAfter`） |
| GET | `/api/auth/config` | 补充端点：下发 OAuth Client ID（公开信息），修改后无需重新构建前端 |

## 九、需要替换的占位符清单

| 占位符 | 位置 | 用途 |
| --- | --- | --- |
| `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` | `wrangler.toml` | 本地开发的 KV 绑定 |
| `PLUGINS_KV` 绑定 | Pages Settings | 生产 KV 绑定 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Pages Secrets / `.dev.vars` | GitHub OAuth |
| `VITE_GISCUS_*` 四项 | Pages 构建环境变量 | Giscus 评论 |
| `siteConfig.url` | `packages/docs/valaxy.config.ts` | 文档站正式域名（SEO） |

## 十、技术说明

- **单仓库多包**：pnpm workspace 管理三个子包，共享统一的 TypeScript 与代码风格
- **样式方案**：全部为手写原生 CSS（设计令牌 + 组件类），未引入任何重型 UI 库
- **安全边界**：GitHub token 仅 `public_repo` 只读权限，返回给用户本人保存在浏览器，可随时在 GitHub 设置中撤销；服务端不存储 token
- **评论系统**：Giscus（GitHub Discussions），与 KV 数据完全独立

## 许可证

[AGPL-3.0](https://github.com/Mcchen1008/NextList/blob/main/LICENSE) © NextList Contributors
