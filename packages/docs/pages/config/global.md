---
title: 全局设置
description: NextList 全局设置 —— 文件隐藏、打包下载、直链签名、隐私规则、文件名映射与分享行为
---

全局设置（设置分组 `GLOBAL`）收录影响整站数据访问与直链行为的开关，位于**管理面板 → 设置 → 全局**。这一组设置与分享、直链、索引等能力交叉较深，逐项说明如下。

## 文件可见性

**`hide_files`**（text）：全局隐藏清单。按文件名或通配规则填写，命中的条目不会出现在任何目录列表中（例如 `thumbs.db`、`.DS_Store`、`desktop.ini`）。需要整站屏蔽某类临时文件时优先使用它，而不用逐目录设置 Meta。

**`ignore_system_files`**（bool）：一键忽略常见系统文件，效果类似内置版的 `hide_files`。

**`ignore_direct_link_params` / `forward_direct_link_params`**（text）：控制直链请求上的 URL 参数透传策略——哪些参数在代理转发时被丢弃、哪些原样带给上游网盘，用于兼容对签名参数敏感的驱动。

## 下载与直链

**`package_download`**（bool）：是否提供文件夹打包下载入口；`package_download_disabled`（见[高级设置](/config/advanced)）是其服务端强制开关。

**`link_expiration`**（number）与 **`sign_all`**（bool）组成直链防篡改体系：`sign_all` 开启后，所有直链必须携带有效签名参数；`link_expiration` 让签名在指定秒数后过期。两者配合可以防止未授权外链盗刷你的网盘流量。

## 隐私与合规

**`privacy_regs`**（text）：隐私规则（正则表达式列表）。命中规则的文件名不会出现在列表与搜索结果中，适合屏蔽身份证号、手机号等敏感命名的文件被意外展示。这是面向内容合规的重要设置，公开站点建议配置。

## 分享相关

| 设置项 | 类型 | 说明 |
| --- | --- | --- |
| `allow_previewing_sharing_files` | bool | 是否允许在线预览分享中的文件（关闭则仅可下载） |
| `allow_previewing_sharing_archives` | bool | 是否允许在线预览分享中的压缩包 |
| `force_proxy_sharing_files` | bool | 分享文件强制走服务端代理下载，隐藏真实网盘直链 |
| `share_summary_content` | text | 分享页附加说明内容 |

## 其他

**`ocr_api`**（string）：OCR 识别接口地址，供需要文字识别的场景调用。

**`filename_char_mapping`**（text）：文件名字符映射规则（JSON），把网盘返回中不合法或难看的字符替换掉，例如把 `|` 映射为 `-`。

**`webauthn_login_enabled`**（bool）：是否启用 WebAuthn（通行密钥式）登录入口。

**`handle_hook_after_writing`**（text）：写入后处理钩子；**`handle_hook_rate_limit`**（number）：钩子触发频率限制。

**`auto_update_index`**（bool）：是否自动更新文件索引，保持搜索结果与新文件同步。

> [!NOTE]
> 以上条目与后端设置存储一一对应，键名可在「设置页 URL」或 `/api/admin/setting/list` 返回中核对；脚本化修改设置请走管理 API（见 [REST API](/advanced/api)）。

<GiscusComment />
