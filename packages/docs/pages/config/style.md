---
title: 样式设置
description: NextList 样式设置 —— logo、favicon、主题色、首页容器与自定义 HTML/脚本注入
---

样式设置决定站点的外观与品牌，全部条目位于**管理面板 → 设置 → 样式**（设置分组 `STYLE`）。所有改动即时生效，刷新前台页面即可看到。

## 设置项一览

| 设置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `logo` | string | `/logo.png` | 站点 Logo 图片地址，可使用站内相对路径或外链 |
| `favicon` | string | `/favicon.png` | 浏览器标签图标地址 |
| `main_color` | string | `#1890ff` | 主题主色，影响按钮、链接、高亮等元素 |
| `home_icon` | string | `nextlist` | 首页入口图标样式名 |
| `home_container` | select | `hope_container` | 首页内容容器宽度：`hope_container`（自适应宽）/ `max_980px`（980px 上限） |
| `settings_layout` | select | `responsive` | 后台设置页布局：`list`（纵向列表）/ `responsive`（响应式栅格） |
| `customize_head` | text | 空 | 注入到每个页面 `<head>` 的自定义 HTML / CSS |
| `customize_body` | text | 空 | 注入到页面底部的自定义脚本 |

## 品牌资源：Logo 与图标

`logo` 与 `favicon` 都接受任意可访问的图片 URL。使用站内资源时，把图片文件放入构建产物或图床后引用相对路径即可；使用外链时注意选择稳定图床，避免挂掉后站点裸奔。建议 Logo 使用横向 PNG 或 SVG，favicon 提供 64×64 以上的正方形图。

## 主题色

`main_color` 接受任意 CSS 颜色值（hex / rgb 均可）。修改后前台的主色调（登录按钮、链接、选中态等）会整体跟随，无需逐处调整。挑选时建议与 Logo 主色保持一致，深色模式下也应注意对比度。

## 自定义注入（进阶）

`customize_head` 与 `customize_body` 是面向进阶用户的两个注入点，内容会原样进入每个页面对应位置，可实现：

- 引入外部字体、图标库或统计脚本；
- 覆盖站点 CSS（例如 `<style> .some-class { ... } </style>`）；
- 接入客服浮窗、CDN 加速的第三方组件。

> [!WARNING]
> 注入内容会出现在**每一个**前台页面中，包括登录页。请只注入你完全理解并信任的代码——错误的脚本可能让整站不可用，此时需要直接在 KV / 数据库中清空对应设置项恢复。

<GiscusComment />
