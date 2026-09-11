---
title: 站点设置
description: NextList 站点设置项详解 —— 标题、公告、分页、搜索引擎索引与挂载开关
---

站点设置控制 NextList 对外呈现的基本行为，全部条目都在**管理面板 → 设置 → 站点**中修改，保存后立即生效，无需重启。对应的存储 key 属于设置分组 `SITE`。

## 设置项一览

| 设置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `site_title` | string | `NextList` | 站点标题，显示在浏览器标签页与登录页 |
| `announcement` | text | 空 | 站点公告，设置后前台展示公告内容 |
| `pagination_type` | select | `all` | 分页形式：`all`（一次全部加载）/ `pagination`（经典翻页）/ `load_more`（点击加载更多） |
| `default_page_size` | number | `30` | 每页条目数，配合分页形式使用 |
| `allow_indexed` | bool | `false` | 是否允许搜索引擎收录 |
| `allow_mounted` | bool | `true` | 是否在文件页显示「已挂载」的存储列表 |
| `robots_txt` | text | `User-agent: *\nDisallow: /` | robots.txt 内容，站点按此响应 `/robots.txt` 请求 |
| `version` | string | 只读 | 当前程序版本，仅作展示，不可修改 |

## 搜索引擎收录与 SEO

`allow_indexed` 与 `robots_txt` 共同决定搜索引擎能否收录你的站点，也是站长平台验证时最常触碰的两个设置。

`allow_indexed` 关闭（默认）时，前台页面会输出 noindex 类的指示，避免个人网盘内容被搜索引擎抓取；确认要公开运营、希望被收录的站点可以打开它。`robots_txt` 则原样作为 `/robots.txt` 的响应体——如果你要接入 Google AdSense / Search Console 等服务，通常需要在这里放行爬虫并追加 `Sitemap: https://your-domain/sitemap.xml` 一行。

> [!TIP]
> 站点是否要被收录取决于内容性质：私人网盘保持默认全禁更安全；公开资源站则建议打开 `allow_indexed` 并自定义 robots 放行规则。

## 分页策略怎么选

三种分页形式各有适用场景。目录条目普遍不多（几百以内）时，`all` 一次加载体验最顺滑；单个目录上千条目时建议 `pagination`，避免一次性渲染拖慢页面；移动端访客较多的站点可选 `load_more`，浏览连续性更好。`default_page_size` 只在翻页 / 加载更多形式下有明显感知，配合使用即可。

## 已挂载存储的显示

关闭 `allow_mounted` 后，文件页将隐藏「已挂载存储」的聚合展示，目录树只呈现目录结构本身。适合把站点包装成普通目录站、不希望暴露背后存储构成的场景；存储本身（挂载、启停）不受该开关影响，仍由管理员在存储管理中维护。

<GiscusComment />
