---
title: 高级设置
description: NextList 高级设置 —— 离线下载（ARIA2 / qBittorrent）、API Token、流量限制、备份恢复与 KV 状态
---

高级设置收录系统级与运维向的能力，多数位于**管理面板 → 设置 → 其他**与**设置 → 流量**（对应设置分组 `OTHER`、`TRAFFIC`），另包括备份恢复、KV 状态等独立面板。除非明确知道自己在做什么，保持默认即可。

## 离线下载（ARIA2 / qBittorrent）

NextList 支持把链接投递给外部下载器完成离线下载，相关设置位于「设置 → 其他」：

| 设置项 | 说明 |
| --- | --- |
| `aria2_uri` | ARIA2 RPC 地址，如 `http://127.0.0.1:6800/jsonrpc` |
| `aria2_secret` | ARIA2 RPC 密钥（`--rpc-secret` 对应值） |
| `aria2_path` | 下载保存目录 |
| `aria2_keep_files` | 任务完成后是否保留 ARIA2 会话文件 |
| `qbittorrent_url` | qBittorrent WebUI 地址 |
| `qbittorrent_username` / `qbittorrent_password` | qBittorrent 登录凭证 |
| `qbittorrent_seed_time` | 做种时间限制 |
| `qbittorrent_path` | 下载保存目录 |

> [!IMPORTANT]
> **Serverless 平台限制**：Cloudflare Workers / EdgeOne 等边缘环境无法常驻后台进程，`/api/fs/add_offline_download` 仅接收任务并提示受限。完整离线下载体验需要 Node 容器模式（本地 / VPS 部署）并自行运行 ARIA2 或 qBittorrent 服务。

## API Token（静态令牌）

`token`（设置分组 `OTHER`）是站点级静态 API 令牌：请求携带 `Authorization: Bearer <token>` 且与该设置匹配时，调用方以**管理员身份**通过校验，无需走登录流程。它适合脚本、CI、MCP 客户端等服务化场景（参见 [MCP 接入](/advanced/mcp)）。出于安全考虑：令牌仅自己保存、泄露立即在后台重置；「设置 → 重置 Token」按钮会轮换该值（同时重置 JWT 签名密钥，使全部登录态失效）。

## 流量限制

| 设置项 | 说明 |
| --- | --- |
| `traffic_limit` | 站点级流量上限，超过后对下载类请求做限制 |
| `ip_limit` | 单 IP 请求频率限制，缓解被脚本刷流量的风险 |

边缘平台的原始流量由平台计费（Cloudflare 免费计划理论不限流但对大文件分发有隐形约束），这两项是应用层的自我保护开关，公开大文件站建议开启。

## KV 状态与备份恢复

**KV 状态**（`/api/admin/kv/status`）：展示当前实例实际生效的持久化平台——Cloudflare KV、EdgeOne Blob、内存模式等。部署后先看一眼这里，确认「配置不会重启丢失」是排查一切诡异配置回滚问题的第一步。

**备份与恢复**：管理面板提供配置数据库的 JSON 导出 / 导入（支持加密），覆盖站点设置、存储、用户、分享、元数据等全部状态。迁移服务器、升级前的例行快照都靠它；恢复时按「跳过已存在」策略合并，避免误覆盖。

## 元数据（Meta）与目录密码

元数据管理不在设置页而在**管理面板 → 元数据**，但它属于站点级高级能力，一并列出：为任意路径创建 Meta 可实现**目录密码**（访客需输入密码才能浏览该子树）、隐藏清单、README / 页头覆盖与页脚注入。Meta 按路径前缀最长匹配生效，多个 Meta 叠加时取最具体的一个。

<GiscusComment />
