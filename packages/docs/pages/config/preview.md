---
title: 预览设置
description: NextList 预览设置 —— 各类型扩展名、代理下载、外置/iframe 预览、音视频行为与强制预览
---

预览设置决定「点开一个文件会发生什么」，位于**管理面板 → 设置 → 预览**（设置分组 `PREVIEW`）。NextList 按扩展名把文件路由到对应预览器，这里的全部设置都围绕这个映射与预览器的行为展开。

## 类型扩展名清单

四个文本项分别定义四类文件由哪些扩展名构成，逗号分隔，可自由增删：

| 设置项 | 默认值（节选） | 说明 |
| --- | --- | --- |
| `text_types` | txt、html、json、js、ts、py、go、yaml、conf 等 | 走 Monaco 只读查看 |
| `audio_types` | mp3、flac、wav、ogg、aac、m4a、opus | 音频播放器 |
| `video_types` | mp4、mkv、webm、avi、mov、flv、m3u8、ts | 视频播放器 |
| `image_types` | jpg、png、gif、webp、svg、ico、avif、tiff | 图片画廊 |

把新扩展名加进对应清单即可让它走该预览器；从清单移除后，该扩展名退回直接下载。

## 代理下载

`proxy_types` 中的扩展名会强制经**服务端代理转发**而不是直链下载，配合 `proxy_ignore_headers`（代理时忽略的响应头）使用。两类典型场景：一是直链存在跨域 / Referer 防盗链限制的网盘（如部分百度网盘内容），代理后可正常预览；二是不想暴露真实网盘地址的公开分享站。代价是流量经过你的边缘实例，注意配额。

## 音视频行为

| 设置项 | 类型 | 说明 |
| --- | --- | --- |
| `audio_autoplay` | bool | 打开音频预览时自动播放 |
| `video_autoplay` | bool | 打开视频预览时自动播放 |
| `audio_cover` | string | 无内嵌封面的音频使用的默认封面图 URL |

## 外置与 iframe 预览（进阶）

`external_previews` 与 `iframe_previews` 接受 JSON 配置，把指定扩展名交给第三方预览服务或内嵌 iframe 渲染，是预览能力的主要扩展点：

```json
{
  "xyz": {
    "reg": ".*\\.xyz$",
    "vh": "520px",
    "src": "https://preview-service.example.com/?url=$e"
  }
}
```

其中 `$e` 会被替换为文件直链地址，`vh` 控制预览区高度。iframe 预览结构类似，区别在于内容以 iframe 形式嵌入页面。两者都为空对象 `{}` 时表示未启用。

## 其他行为开关

- `readme_autorender`（bool，默认开）：目录内 README.md 自动渲染到文件页底部；`filter_readme_scripts` 可过滤 README 中的脚本标签以保证安全；
- `markdown_autorender`（bool）：Markdown 文件点击即渲染而非源码查看；
- `preview_archives_by_default`（bool）：压缩包默认走在线解压预览；
- `office_preview`（string）：Office 文档预览使用的服务（docx / pptx / xlsx）；
- `pdf_preview`（string）：PDF 预览方式；
- `code_editor_theme`（string）：Monaco 编辑器主题；
- `force_preview` / `specify_preview`（text）：强制某些路径或扩展名走指定预览器，是排期梳理「点开就下载」问题的终极开关。

> [!TIP]
> 拿不准某个文件为什么下载而不是预览时，先检查它的扩展名是否在对应类型清单里，再检查是否命中了 `force_preview` / `specify_preview` 的例外规则。

<GiscusComment />
