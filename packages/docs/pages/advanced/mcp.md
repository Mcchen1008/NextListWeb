---
title: MCP 接入（AI 助手）
description: 通过 Model Context Protocol 把 NextList 接入 Claude、Cursor 等 AI 助手 —— 端点、鉴权、工具与配置示例
---

NextList 内置 **MCP（Model Context Protocol）服务端**。接入后，Claude Desktop、Cursor 等支持 MCP 的 AI 客户端可以浏览你的网盘目录、查询单文件信息、按关键词递归搜索，并读取站点状态——让 AI 直接回答「我的电影库里有哪些 4K 资源」这类问题。

## 端点与传输

MCP 服务端随主程序部署在 `/api` 前缀下，支持两种传输方式，任选其一：

| 传输 | 端点 | 适用 |
| --- | --- | --- |
| Streamable HTTP（推荐） | `POST /api/mcp` | 标准 JSON-RPC 请求 / 响应，无状态，最适合边缘部署 |
| 旧版 SSE | `GET /api/mcp/sse` + `POST /api/mcp/messages` | 兼容仅支持 SSE 传输的客户端；SSE 流持续发送 keepalive，JSON-RPC 响应随 POST 同步返回 |

服务端实现的协议版本为 `2025-03-26`（兼容客户端请求 `2024-11-05`），`serverInfo` 为 `{ name: "NextList" }`。

## 鉴权

除 `initialize` 与 `ping` 外，所有方法都要求认证，规则与 REST API 完全一致：

- `Authorization: Bearer <JWT>` —— 登录令牌；
- `Authorization: Bearer <静态 API Token>` —— 管理面板「设置 → 其他」中的 `token` 设置项，**推荐给 MCP 客户端使用**；
- 站点启用了 guest 账号时，匿名请求以游客身份放行（仅能浏览 guest 权限内的内容）。

未认证请求返回 HTTP 401 与 JSON-RPC 错误 `-32001`。

## 提供的工具（tools）

| 工具 | 参数 | 说明 |
| --- | --- | --- |
| `list_files` | `path`（必填）、`password` | 列出目录内容：名称、目录 / 文件、大小、修改时间 |
| `get_file_info` | `path`、`password` | 单条目详情：大小、类型、修改时间、直链 `raw_url` |
| `search_files` | `parent`、`keywords`、`scope` | 递归搜索（scope：0 全部 / 1 仅文件夹 / 2 仅文件），上限与网页端一致 |
| `get_system_info` | — | 站点指标：版本、启用的存储（按驱动统计）、用户 / 分享 / 元数据数量 |

## 资源（resources）与提示词（prompts）

**资源**：`nextlist://storage/metrics`（站点指标 JSON）、`nextlist://storage/list`（全部挂载：路径 / 驱动 / 启用状态）。

**提示词**：`summarize_directory`（参数 `path`）——预置的「总结这个目录」引导语，客户端可一键调用。

## 客户端配置示例

**Claude Desktop / 通用 JSON 配置**（`claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "nextlist": {
      "type": "http",
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer <你的静态 API Token>"
      }
    }
  }
}
```

**使用旧版 SSE 传输的客户端**：

```json
{
  "mcpServers": {
    "nextlist": {
      "url": "https://your-domain.com/api/mcp/sse",
      "headers": {
        "Authorization": "Bearer <你的静态 API Token>"
      }
    }
  }
}
```

**命令行快速自检**（模拟一次完整握手 + 调用）：

```bash
TOKEN="<静态 API Token 或 JWT>"
curl -s -X POST https://your-domain.com/api/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

> [!TIP]
> 拿不准客户端该用哪种传输时，先选 Streamable HTTP（`/api/mcp`）。若客户端报「不支持 GET」，说明它在探测 SSE 通道，改用 `/api/mcp/sse` 配置即可。

## 安全建议

给 MCP 客户端的令牌等同管理员权限，请像保管密码一样保管它：静态 Token 泄露时立即在管理面板重置；不希望 AI 读到全部内容时，建一个 `base_path` 受限的专用账号，把它的 JWT 交给客户端使用；公开站点谨慎开启 guest，否则任何知道 MCP 地址的人都能匿名浏览。

<GiscusComment />
