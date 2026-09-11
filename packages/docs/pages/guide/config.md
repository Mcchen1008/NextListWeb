---
title: 配置说明
description: NextList 的环境变量、站点设置、数据持久化与备份恢复
---

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | 前端请求的后端 API 地址，同域部署保持默认即可 |
| `ADMIN_USERNAME` | `admin` | 管理员初始用户名（首次初始化时生效） |
| `ADMIN_PASSWORD` | `admin` | 管理员初始密码（首次初始化时生效） |
| `DATABASE_JSON` | - | 可选：自定义 JSON 数据结构，覆盖默认数据库状态 |

> [!TIP]
> Cloudflare Workers 部署时，可在 `wrangler.toml` 的 `[vars]` 中配置非敏感变量；`ADMIN_PASSWORD` 等敏感信息建议使用 `wrangler secret put` 或 Dashboard 的 Secrets 配置。

## 站点设置

登录管理后台后，可在「管理面板 → 设置」中调整：

- **站点信息**：站点标题、公告、页脚等
- **预览设置**：各类文件的预览开关（视频 / 音频 / Office / PDF 等）
- **归档扩展名**：允许被打包下载的扩展名白名单

站点设置会随配置一起持久化，无需修改代码或重启服务。

## 数据持久化在哪里

| 运行模式 | 持久化位置 |
| --- | --- |
| Node 容器模式 | `public_data/db.json`（含站点配置、存储配置、用户、分享）+ `public_data/` 下的本地文件 |
| Cloudflare Workers 模式 | 绑定的 `NEXTLIST_KV` namespace |
| EdgeOne 模式 | Blob 存储（`nextlist_db` 命名空间） |

NextList **零数据库依赖**：不使用 MySQL / PostgreSQL / Redis，全部状态为 JSON 或 KV 键值对，这让备份与迁移异常简单。

## 备份与恢复

在「管理面板 → 备份恢复」中：

- **导出备份**：一键下载配置 / 存储 / 用户的 JSON 备份文件
- **恢复备份**：上传之前导出的 JSON 文件，覆盖当前配置

> [!WARNING]
> 存储驱动中的认证信息（Cookie、Token 等）会包含在备份文件内，请妥善保管备份文件，不要分享给他人。

## 常用运维操作

- **修改管理员密码**：管理面板 → 用户管理
- **启停某块存储**：管理面板 → 存储管理，切换开关即可，无需重启
- **管理插件**：管理面板 → 插件管理，支持 ZIP 上传 / URL 安装 / 可视化配置
- **元数据管理**：管理面板 → 元数据，可为文件与目录附加自定义信息

<GiscusComment />
