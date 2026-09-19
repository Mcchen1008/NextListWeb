---
title: OpenList 兼容性
description: NextList 与 OpenList 的备份互导 —— 驱动名映射、字段矫正、加密备份与迁移限制
---

NextList 与 [OpenList](https://github.com/OpenListTeam/OpenList) 同源同理念（挂载路径 + 驱动 + JSON 格式 `addition`），并内置了**双向备份互导**能力：NextList 导出的配置文件可以直接导入 OpenList，OpenList 的备份也可以原样导入 NextList，全程只走标准 HTTP + JSON，无需手工改文件。本文从使用者角度说明如何迁移与注意事项。

## 快速迁移

两侧的入口都在**管理面板 → 备份 / 恢复**：

- 从 **NextList 迁往 OpenList**：点「导出 OpenList 格式」（可选口令加密），得到 OpenList Web UI「恢复」功能可直接接受的备份文件；
- 从 **OpenList 迁入 NextList**：点「导入 OpenList 备份」，选择文件即可；导入器同时兼容 OpenList 格式与 NextList 原生格式，无需事先区分。

可选的**口令加密**与两侧 Web UI 的备份加密完全同格式（crypto-js OpenSSL `Salted__` 规范，AES-256-CBC）：用口令导出的文件，在两侧的恢复流程中都能正常解密；口令错误会被拒绝（400）。

## 迁移时发生什么

**存储（storages）**：52 对驱动名自动双向映射（如 OpenList `139Yun` ↔ NextList `139Cloud`、`AList V3` ↔ `AListV3`、`Bunny Storage` ↔ `BunnyStorage`）；各驱动的 `addition` 字段名与类型自动矫正（如 `root_folder_id` ↔ `root_id`、`AccessToken` ↔ `access_token`、`UploadThread` int ↔ 字符串）；OpenList 存储模型多出的七个字段（`cache_expiration`、`enable_sign` 等）导出时自动补齐。存储按规范化挂载路径去重；**NextList 暂不支持的 OpenList 驱动（如 Crypt、SMB 等）会保留为禁用状态**并在备注注明，数据不丢、可再导出回去。

**设置（settings）**：只导出对方已知的键（白名单机制），组号按各自默认表归位；`token`、`version` 等实例私有项永不导出，OpenList 独有键（如 S3 网关细节）不会污染对方配置。

**用户（users）**：仅迁移普通用户（`admin` / `guest` 不参与）。密码两侧都是哈希存储、**不可迁移**——导出文件中密码恒为空，导入后使用默认口令（`123456`），请登录后立即重置。

**元数据（metas）**：字段完全同名，目录密码原样迁移，导入即生效。

**分享（shares）**：OpenList 没有分享对象，OpenList 格式导出中恒为空数组；NextList 的分享只在 `format=nextlist` 原生格式中保留。

## 接口语义的一致与差异

文件接口层面，NextList 刻意对齐了 OpenList 的行为：`/api/fs/list` 支持相同语义的服务端分页（`page<1` 归一为 1、`per_page<1` 返回全量、`total` 为切片前总数）；目录密码按最长前缀 Meta 命中校验，403 消息与 OpenList 一致；响应信封、`fs/get|mkdir|rename|remove|move|copy|put` 的结构与登录（含哈希登录）、密码哈希规则完全一致——为 OpenList 写的客户端脚本大多可以直接指向 NextList。

已知差异：OpenList 管理员登录态不受目录密码限制，NextList 的 fs 接口对所有调用方统一要求密码（前端已内置输错弹窗，体验自洽）；直链签名与 WebDAV 未做 OpenList 签名算法兼容。

## 验证与回归

双向兼容有自动化测试保障：适配层单元测试 115 条断言（`npx tsx scripts/test-compat-convert.mts`），以及拉起真实 NextList + OpenList 双服务的双向实测（`bash scripts/run-compat-test.sh`）——覆盖导出→导入→回导的完整往返，验证挂载路径、字段类型、加密口令的多轮无损回环。

<GiscusComment />
