---
title: WebDAV
description: NextList 内置 RFC 4918 WebDAV 服务端（/dav）——认证、权限、方法与各平台客户端配置
---

NextList 内置完整的 **WebDAV 服务端**（RFC 4918 Class 1 / Class 2），把所有已挂载的存储统一暴露在 `/dav` 端点下。你可以用 Windows 资源管理器、macOS Finder、rclone、RaiDrive、Cyberduck 等任意标准 WebDAV 客户端直接挂载并管理文件。

## 服务端地址与认证

服务端地址为你的部署地址加 `/dav` 前缀：

```text
https://your-domain.com/dav
```

认证与网页登录完全一致，支持两种方式：

- **HTTP Basic**：用户名 + 密码（支持明文与哈希存储的密码）；
- **Bearer**：`POST /api/auth/login` 返回的 JWT Token。

快速自检：

```bash
curl -X PROPFIND -H "Depth: 1" -u admin:admin https://your-domain.com/dav/
```

> [!WARNING]
> 默认账号为 `admin` / `admin`，正式环境请先修改密码再对外提供 WebDAV。

## 权限模型

WebDAV 的权限在**管理面板 → 用户 → 编辑 → 权限**中勾选，与网页端权限相互独立：

| 项目 | 说明 |
| --- | --- |
| `webdav_read` 权限位 | 允许 `PROPFIND` / `GET` / `HEAD` / `OPTIONS`（只读） |
| `webdav_manage` 权限位 | 允许 `PUT` / `MKCOL` / `MOVE` / `COPY` / `DELETE` / `PROPPATCH` / `LOCK` / `UNLOCK`（读写） |
| 管理员（role=2） | 隐式拥有全部 WebDAV 权限 |
| 访客（role=1） | 默认无任何 WebDAV 权限（匿名请求一律 401） |
| `base_path` 目录监禁 | 用户只能看到并操作自己 `base_path` 之内的路径，`/dav` 的根即该用户的 `base_path` |

## 支持的方法

| 方法 | 行为 |
| --- | --- |
| `OPTIONS` | 能力协商（`DAV: 1, 2`），无需认证 |
| `PROPFIND` | 列目录 / 查属性；`Depth: 0` 与 `Depth: 1`（`infinity` 按 1 处理），207 多状态 XML 响应 |
| `PROPPATCH` | 尽力而为的属性应答；`lastmodified` / `creationdate` 等只读属性返回 403 |
| `MKCOL` | 新建目录（201）；已存在 405；带请求体 415 |
| `GET` / `HEAD` | 下载文件，支持 `Range` 断点续传（206）；远程网盘服务端流式代理，本地存储直读 |
| `PUT` | 上传 / 覆盖文件（新建 201，覆盖 204） |
| `DELETE` | 删除文件或目录（递归，204） |
| `MOVE` | 重命名（同目录）或移动（跨目录），遵循 `Destination` 与 `Overwrite` 头 |
| `COPY` | 复制文件 / 目录，同目录改名自动经临时目录中转 |
| `LOCK` / `UNLOCK` | Class 2 兼容：独占写锁令牌（无状态假锁，满足 Windows / macOS 客户端写入前探测） |

错误码遵循 RFC 4918：未认证 401、权限不足 403、目标不存在 404、目录冲突 409、`Overwrite: F` 且目标存在 412。

## 客户端配置示例

**Windows 资源管理器**：「此电脑 → 映射网络驱动器」，文件夹填 `https://your-domain.com/dav`，勾选「使用其他凭据」输入账号密码。若映射失败，确认 `services.msc` 中 **WebClient** 服务已启动；自签名证书可能导致失败，建议使用有效 HTTPS 证书。

**macOS Finder**：`前往 → 连接服务器`（⌘K），输入 `https://your-domain.com/dav`，登录后挂载为网络卷。

**rclone**：

```bash
rclone config
# new remote → 类型 webdav
# url:    https://your-domain.com/dav
# vendor: other
# user:   你的用户名
# pass:   你的密码

rclone lsl remote:                       # 列根目录
rclone copy ./local-file remote:docs/    # 上传
rclone copy remote:docs/ ./backup/       # 下载
```

**Linux（davfs2）**：`sudo apt install davfs2` 后 `sudo mount -t davfs https://your-domain.com/dav /mnt/nextlist`，凭据可写入 `/etc/davfs2/secrets`。

**移动端**：iOS 用 Documents / Fileball 等应用的「连接服务器」；Android 用 ES 文件浏览器 / CX 文件管理器添加 WebDAV。

## 已知限制

边缘环境（Cloudflare Workers 等）下 `PUT` 请求体会先在内存中缓冲再转发给存储驱动，超大文件请分批上传；Node 容器模式无此限制。`LOCK` 返回的令牌不在服务端登记，多客户端并发写同一文件时不会互斥。跨存储的 `MOVE` / `COPY` 依赖源驱动能力，云端网盘间可能因驱动不支持而失败（与网页端行为一致）。各平台入口（Workers / Vercel / EdgeOne / 本地开发）均已放行 WebDAV 的全部 HTTP 方法，无需额外配置。

<GiscusComment />
