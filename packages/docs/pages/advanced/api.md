---
title: REST API
description: NextList HTTP API 参考 —— 认证、文件、分享、公开与管理端点的约定与示例
---

NextList 前后端同构部署，全部能力都通过 HTTP API 暴露，第三方客户端（脚本、App、自动化）可以直接复用。本文给出端点地图与通用约定；请求 / 响应字段与前端源码（`src/utils/api.ts`、`src/backend/server/*`）一一对应。

## 通用约定

**Base URL**：同域部署下为 `/api`。**响应信封**：除直链与 WebDAV 外，所有接口返回统一的 JSON 结构 `{ "code": 200, "message": "success", "data": ... }`；`code` 为业务状态码（200 成功、403 密码错误、404 不存在、500 服务端异常），与 HTTP 状态码独立。**认证**：三种方式任选——登录签发的 JWT（`Authorization: Bearer <token>`，也接受 `?token=` 查询参数，便于 <img> / 直链场景）；管理面板「设置 → 其他」中的静态 API Token（同样走 Bearer 头，视为管理员）；未携带凭证且站点启用了 guest 账号时以游客身份访问。

## 登录示例

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

返回 `data.token` 即 JWT，后续请求携带 `Authorization: Bearer <token>`。启用了两步验证的账号，登录请求会得到 `code: 402`，需在请求体追加 `otp_code` 重新提交。

## 端点地图

### 认证与账户

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/login` | POST | 登录，返回 JWT；启用 2FA 时返回 402 |
| `/api/auth/login/hash` | POST | 哈希密码登录 |
| `/api/auth/logout` | POST / GET | 注销（当前 token 加入黑名单） |
| `/api/auth/2fa/generate` | POST | 生成 2FA 密钥（返回二维码内容） |
| `/api/auth/2fa/verify` | POST | 校验验证码完成 2FA 绑定 |
| `/api/me` | GET | 当前用户信息 |
| `/api/me/update` | POST | 更新当前用户资料 |
| `/api/me/sshkey/list` / `add` / `delete` | GET / POST | SSH 公钥管理（含 SHA256 指纹） |
| `/api/user/update_pwd` | POST | 修改自己的密码 |

### 文件系统（`/api/fs`，除注明外均为 POST + JSON）

| 端点 | 请求体 | 说明 |
| --- | --- | --- |
| `/api/fs/list` | `{path, password?, page?, per_page?}` | 列目录；服务端分页（`per_page<1` 返回全量，`total` 为切片前总数） |
| `/api/fs/get` | `{path, password?}` | 条目详情，含 `raw_url` 直链 |
| `/api/fs/dirs` | `{path}` | 仅子目录（目录树用） |
| `/api/fs/mkdir` | `{path}` | 新建目录 |
| `/api/fs/rename` | `{path, name}` | 重命名 |
| `/api/fs/batch_rename` | `{src_dir, rename_objects}` | 批量重命名，逐条返回失败明细 |
| `/api/fs/move` | `{src_dir, dst_dir, names[]}` | 移动（支持跨存储） |
| `/api/fs/copy` | `{src_dir, dst_dir, names[]}` | 复制（支持跨存储） |
| `/api/fs/remove` | `{dir, names[]}` | 删除 |
| `/api/fs/remove_empty_directory` | `{src_dir}` | 清理空目录（保护挂载点） |
| `/api/fs/put` | PUT，Header `File-Path` | 二进制流上传 |
| `/api/fs/form` | PUT，multipart + Header `File-Path` | 表单上传 |
| `/api/fs/search` | `{parent, keywords, scope?, page?, per_page?}` | 递归搜索（BFS，深度 10 / 目录 500 / 命中 5000 上限） |
| `/api/fs/other` | `{path, method, ...}` | 驱动扩展操作（如阿里云盘转码播放） |
| `/api/fs/add_offline_download` | `{path, urls[]}` | 离线下载投递（Serverless 环境受限） |

**目录密码**：受 Meta 保护（见[高级设置](/config/advanced)）的路径，`list` / `get` 需携带 `password`，错误时返回 `code: 403` 与固定消息 `password is incorrect or you have no permission`（与 OpenList 一致）。

### 直链下载

| 路径 | 说明 |
| --- | --- |
| `GET /d/<挂载路径>/文件` | 直链下载，支持 `Range` 断点续传与多线程 |
| `GET /p/<挂载路径>/文件` | 代理下载（服务端中转） |
| `GET /sd/<shareId>/...` | 分享直链下载 |

### 分享（`/api/share`）

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/api/share/list` | GET | 分享列表（管理员） |
| `/api/share/get` | GET | 单条分享详情 |
| `/api/share/create` | POST | 创建分享（密码 / 过期 / 多文件） |
| `/api/share/update` | POST | 编辑分享 |
| `/api/share/delete` | POST | 删除分享 |
| `/api/share/enable` / `disable` | POST | 启用 / 停用 |

### 公开端点（无需认证）

| 端点 | 说明 |
| --- | --- |
| `GET /api/public/settings` | 前台渲染所需的站点设置（标题、公告、预览配置等） |
| `GET /api/public/guest` | 游客账号状态 |
| `GET /api/public/archive_extensions` | 可在线预览的压缩包扩展名 |
| `GET /api/public/offline_download_tools` | 可用的离线下载工具 |
| `GET /api/public/plugins` | 已启用的前台插件清单 |
| `GET /api/health` | 健康检查：`{ok, name, version, environment}` |

### 管理端点（`/api/admin`，需管理员）

| 分组 | 端点 |
| --- | --- |
| 存储 | `GET storage/list`、`GET storage/get`、`POST storage/create` / `update` / `delete` / `enable` / `disable` / `check` / `check_all` / `load_all` |
| 驱动 | `GET driver/names`（可选驱动名）、`GET driver/list`（表单配置）、`GET driver/info?driver=X` |
| 设置 | `GET setting/list`、`POST setting/save` / `setting/default` / `setting/delete` / `setting/reset_token` |
| 元数据 | `GET meta/list`、`GET meta/get`、`POST meta/create` / `update` / `delete` |
| 用户 | `GET user/list`、`GET user/get`、`POST user/create` / `update` / `delete` / `cancel_2fa`、SSH 公钥管理 |
| 插件 | `GET plugin/list`、`GET plugin/get`、`POST plugin/install` / `update` / `toggle` / `delete` / `batch_save` |
| 系统 | `GET kv/status`（持久化平台状态）、`GET index/progress`、`GET scan/progress` |
| 备份 | `GET/POST admin/export?format=openlist\|nextlist`、`POST admin/import`（详见 [OpenList 兼容性](/advanced/compat)） |

### MCP

`POST /api/mcp`（Streamable HTTP，推荐）、`GET /api/mcp/sse` + `POST /api/mcp/messages`（旧版 SSE）。协议方法与接入配置见 [MCP 接入](/advanced/mcp)。

## 调用示例：列出目录

```bash
TOKEN="<登录或静态令牌>"
curl -X POST https://your-domain.com/api/fs/list \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path":"/电影","page":1,"per_page":20}'
```

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [
      { "name": "demo.mp4", "size": 1048576, "is_dir": false, "modified": "2026-01-01T00:00:00.000Z", "sign": "", "thumb": "", "type": 2 }
    ],
    "total": 1,
    "readme": "",
    "header": "",
    "write": true,
    "provider": "Quark"
  }
}
```

<GiscusComment />
