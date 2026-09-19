---
title: 驱动一览
description: NextList 支持的全部存储驱动 —— 名称、类别、凭证类型与读写能力
---

以下是 NextList 当前支持的全部存储驱动，与「添加存储」下拉框中的名称一一对应（`代码名` 即存储配置中 `driver` 字段的取值）。按类别分组，凭证列给出该驱动需要准备的核心材料，获取方式见[添加存储](/storage/)的通用技巧。

## 国内网盘

| 驱动（代码名） | 凭证 | 读写 | 备注 |
| --- | --- | --- | --- |
| `Quark` 夸克网盘 | Cookie | 全读写 | 支持下载自定义请求头 |
| `123Pan` 123 云盘 | 账号密码或 access_token | 全读写 | 支持 CRC32 秒传；边缘环境登录限制见部署说明 |
| `BaiduNetdisk` 百度网盘 | OAuth refresh_token | 全读写 | 支持官方接口与加速线路、秒传与分片上传 |
| `115Open` 115 网盘 | OAuth Token | 全读写 | 开放平台接口 |
| `189Cloud` 天翼云盘 | 账号密码（Session） | 全读写 | 分片上传；`189PC` 等变体同源 |
| `139Cloud` 移动云云盘 | 授权 Token | 全读写 | personal_new 接口 |
| `Thunder` 迅雷云盘 | Cookie | 全读写 | 专家模式见 `ThunderExpert` |
| `ThunderExpert` 迅雷专家版 | 自定义算法参数 | 全读写 | 可配置 client_id 与签名算法，兼容浏览器版等变体 |
| `UC` UC 网盘 | Cookie | 全读写 | `__puus` 自动刷新 |
| `WoPan` 联通云盘 | 账号密码（Token 自动续期） | 全读写 | wire 协议签名 |
| `GuangYaPan` 光速盘 | Token 或手机号短信 | 全读写 | 任务轮询上传 |
| `MoPan` 沃盘 | 设备信息 + Token | 全读写 | |
| `Lanzou` 蓝奏云 | Cookie | 全读写 | 支持 lanzou / lanzoui / lanzous 等域名变体 |
| `WeiYun` 腾讯微云 | Cookie | 全读写 | Cookie 自动续期 |
| `Doubao` 豆包网盘 | Cookie | 全读写 | 直链三分支自适应 |
| `WPS` WPS 云文档 | Cookie | 全读写 | Personal / Business 双端 |
| `NeteaseMusic` 网易云音乐云盘 | Cookie | 全读写 | 歌曲列表、歌词虚拟文件、纯 Web Crypto 加密 |
| `123PanShare` 123 云盘分享 | 分享链接 | 只读 | CRC32 签名，700ms 限速 |
| `115Share` 115 分享 | 分享凭证 | 只读 | |
| `AliyundriveShare` 阿里云盘分享 | refresh_token + 分享 ID | 只读 | 双层鉴权，自动限流 |
| `OpenListShare` OpenList 分享 | 分享链接 | 只读 | 浏览任意 OpenList 站点的分享 |
| `LenovoNasShare` 联想 NAS 分享 | stoken | 只读 | dtoken 下载直链 |

## 国际网盘

| 驱动（代码名） | 凭证 | 读写 | 备注 |
| --- | --- | --- | --- |
| `Onedrive` OneDrive / SharePoint | OAuth refresh_token | 全读写 | 支持 `OnedriveApp` / `OnedriveSB` 变体 |
| `GoogleDrive` | OAuth refresh_token | 全读写 | |
| `Dropbox` | OAuth（账号密码或 Token） | 全读写 | 20MB 分片上传会话 |
| `YandexDisk` | OAuth refresh_token | 全读写 | 支持自建 API 中转 |
| `PikPak` | 账号密码或 Token | 读写* | 列表/管理全支持；上传需 OSS 管线（暂不支持） |
| `PikPakShare` PikPak 分享 | 分享链接（+pass_code） | 只读 | 三平台签名链 |
| `Terabox` | Cookie + jsToken | 全读写 | 自动续期与域名切换 |
| `MediaFire` | Cookie | 读写* | 上传需分片管线（暂不支持） |
| `Mega` | 账号密码 | 读写* | S3 分片上传（暂不支持） |
| `FebBox` | OAuth client 凭证 | 全读写 | error_code -10001 自动重试 |
| `Degoo` | 账号密码（GraphQL） | 读写* | 上传暂不支持 |
| `Teldrive` | JWT | 读写* | Telegram 分片上传暂不支持 |

## 自托管 / 对象存储

| 驱动（代码名） | 凭证 | 读写 | 备注 |
| --- | --- | --- | --- |
| `WebDav` | 地址 + 账号密码 | 全读写 | 接入任意 WebDAV 服务 |
| `S3` | AccessKey / SecretKey + Endpoint + Bucket | 全读写 | AWS SigV4，兼容 R2 / OSS / MinIO 等 |
| `AzureBlob` | 连接字符串 / SAS | 全读写 | |
| `BunnyStorage` | AccessKey | 全读写 | 路径型 API |
| `USS` 又拍云 | 操作员 + 密码 | 全读写 | 纯 fetch 实现，含防盗链签名 |
| `Local` 本地存储 | 根目录路径 | 全读写 | 仅 Node 容器模式，边缘环境不可用 |
| `Cloudreve` Cloudreve v3 | 账号密码（Session） | 全读写 | Cookie 自动持久化 |
| `CloudreveV4` Cloudreve v4 | Token | 全读写 | |
| `Seafile` | Token 或账号密码 | 全读写 | 支持加密资料库（repo_pwd） |
| `KodBox` 可道云 | Session Token | 全读写 | |
| `AListV3` | 站点地址 + Token / 账号密码 | 全读写 | 兼容 AList / OpenList v3 API，401 自动重登 |
| `OpenList` OpenList 站点 | 站点地址 + Token | 全读写 | |
| `OnedriveSharelink` OneDrive 分享链接 | 分享链接 | 只读 | 免账号浏览 OneDrive 分享 |
| `IPFS` | 网关地址 | 只读 | 经网关读取 IPFS 内容 |

## 开放平台与专项

| 驱动（代码名） | 凭证 | 读写 | 备注 |
| --- | --- | --- | --- |
| `AliyundriveOpen` 阿里云盘 Open | OAuth refresh_token | 全读写 | 官方开放平台 |
| `QuarkOpen` 夸克开放平台 | OAuth 凭证 | 全读写 | |
| `QuarkUcTv` 夸克 / UC 电视版 | 电视版 Token | 全读写 | |
| `123Open` 123 开放平台 | OAuth 凭证 | 全读写 | |
| `189TV` 天翼电视版 | 电视版凭证 | 全读写 | |
| `BaiduPhoto` 百度相册 | OAuth 凭证 | 全读写 | |
| `HalalCloudOpen` | 开放平台凭证 | 全读写 | |
| `GitHub API` | GitHub Token | 全读写 | 仓库即目录，管理代码文件 |
| `GitHubReleases` | Token（可选） | 只读 | latest / 全版本两种模式，支持 gh_proxy 加速 |
| `CnbReleases` | — | 只读 | CNB / GitCode 仓库发布件 |
| `CloudflareImgBed` | 站点凭证 | 全读写 | 标准 / 分片 / HuggingFace LFS 三种上传管线 |
| `Emby` | api_key 或 账号密码 | 只读 | 媒体库呈现为目录树 |
| `GooglePhoto` | OAuth 凭证 | 只读 | 相册与全部照片虚拟目录 |
| `AliDoc` 阿里云文档 | 钉钉 Cookie | 只读 | 预签名 OSS 直链 |
| `ChaoXingGroupDrive` 超星小组云 | 账号密码（Session 自动续期） | 全读写 | 学习通群组文件 |
| `Misskey` | API Token | 全读写 | 网盘文件读写 |
| `Teambition` | Cookie | 读写* | 网盘 + 云作品双列表；上传暂不支持 |
| `MediaTrack` 分秒帧 | Bearer access_token | 读写* | 上传需临时凭证管线（暂不支持）；阿里转码预览可用 |

> [!NOTE]
> 「读写\*」表示浏览、增删改查完整支持、但上传链路依赖暂未移植的分片管线。此外，后端分发层还识别若干未在下拉框中列出的驱动名（如 `QuarkUcTv`、`115Share`、`Mega` 等），可通过管理 API 直接创建；它们会随版本更新逐步补全表单配置。

<GiscusComment />
