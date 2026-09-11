---
title: 存储挂载
description: NextList 13 种存储驱动的接入说明与注意事项
---

NextList 通过统一的 `StorageDriver` 接口（`list` / `get` / `mkdir` / `rename` / `remove` / `move` / `copy`）抽象所有存储，13 种驱动统一挂载，并支持跨存储复制。

## 支持的驱动

| 驱动 | 说明 |
| --- | --- |
| **Local** 本地文件系统 | 文件映射到 `public_data/`，仅 Node 容器模式可用 |
| **夸克网盘** | Cookie / 请求头直链 |
| **阿里云盘（Open）** | Open 平台 OAuth2 |
| **OneDrive / SharePoint** | OAuth2，refresh token 自动持久化 |
| **Google Drive** | OAuth2 |
| **百度网盘** | 官方 / 破解下载、分片上传、秒传 |
| **123 云盘** | token-first 登录，规避境外 IP 风控 |
| **115 网盘** | 开放平台，token 自动持久化 |
| **天翼云盘** | Cookie 持久化 |
| **迅雷云盘** | 普通 / Expert 双模式 |
| **蓝奏云** | Cookie 持久化 |
| **GitHub** | 仓库文件即存储 |
| **WebDAV** | 挂载任意 WebDAV 服务器（Nextcloud / ownCloud / 群晖 / Alist 等） |

## 挂载步骤

1. 进入**管理面板 → 存储管理**，点击「新增存储」；
2. 选择驱动类型，按表单填写认证信息；
3. 设置挂载路径（mount path），保存并启用；
4. 回到文件页即可看到新存储出现在目录树中。

## 注意事项

> [!NOTE]
> 除 Local 外所有驱动均可在 Cloudflare Workers 上运行。

- **123 云盘**：在 Workers 出口 IP 上可能触发服务端登录风控（Go 原版 OpenList 同样会触发）。推荐在本地浏览器登录后抓取 `access_token` 填入存储配置，或部署到境内服务器。
- **Local 驱动**：Workers 是无文件系统环境，Local 驱动仅在 Node 容器模式可用（按需动态加载 `fs`）。边缘部署请使用网盘 / WebDAV 等远程存储驱动。
- **Cookie 类驱动**（夸克 / 天翼 / 蓝奏）：Cookie 有效期由网盘服务端决定，过期后需要在管理面板重新填写。
- **OAuth2 类驱动**（阿里云盘 / OneDrive / Google Drive / 115）：refresh token 会自动持久化，一般无需重复授权。

## WebDAV 双向支持

NextList 对 WebDAV 是双向的：

- **作为客户端**：把远程 WebDAV 服务器（Nextcloud、ownCloud、群晖、Alist 等）当作存储驱动挂载进来；
- **作为服务端**：NextList 自身对外提供完整的 WebDAV 端点（`/dav`，RFC 4918 Class 1/2），可直接被 Windows 资源管理器、macOS Finder、rclone 等客户端挂载。

服务端挂载示例（rclone）：

```bash
rclone config          # 添加 WebDAV 远端，URL 填 https://你的域名/dav
rclone ls nextlist:/
rclone copy local-dir/ nextlist:/backup
```

完整参数说明见仓库内 [docs/webdav.md](https://github.com/Mcchen1008/NextList/blob/main/docs/webdav.md)。

## 跨存储复制

文件管理页支持在任意两个挂载的存储之间复制 / 移动文件（服务端中转流式传输），例如把百度网盘的文件直接复制到 OneDrive，无需下载到本地。

<GiscusComment />
