---
title: 插件开发指南
description: NextList 插件系统架构、plugin.json 规范、SDK 与打包安装
---

NextList 提供了强大、轻量且高度灵活的插件系统：用标准前端技术栈（JavaScript / CSS / SVG）开发界面悬浮挂件、文件操作扩展、自定义主题、数据预览及系统集成工具。

> [!NOTE]
> NextList 的插件清单格式（`plugin.json`）、权限字典、`OpenListPlugin` SDK、后台 API 与 ZIP 打包规范与 OpenListNext **完全一致**：为 OpenListNext / NextList 开发的插件包可直接在两者之间互相安装运行。
> 示例插件见主仓库 `plugins_src/` 目录与[插件市场](/plugins/)。

## 一、插件系统特性

1. **零构建门槛**：无需 Webpack / Vite 编译链，纯原生 JavaScript（ES6+）与 CSS 即可编写；
2. **安全隔离执行**：每个插件在独立封装的函数作用域内运行，避免全局变量污染；
3. **后台可视化配置**：在 `plugin.json` 中声明 `config_schema`，后台自动生成设置表单（下拉、布尔、输入框、多行文本等）；
4. **一键打包分发**：以标准 `.zip` 压缩包分发，后台支持拖拽上传、一键解压热加载。

## 二、插件包文件结构

```text
my-plugin.zip
├── plugin.json       # [必须] 插件清单与配置元数据
├── index.js          # [必须] 插件主逻辑脚本
├── style.css         # [可选] 插件专属样式表
├── icon.svg          # [推荐] 插件图标（或 icon.png）
└── README.md         # [推荐] 使用说明
```

压缩时将这 5 个文件直接置于 ZIP 根目录。

## 三、清单文件 plugin.json

```json
{
  "id": "my-plugin-demo",
  "name": "示例插件",
  "version": "1.0.0",
  "description": "在界面右下角提供便捷工具面板",
  "author": "Your Name",
  "homepage": "https://github.com/you/my-plugin",
  "entry": "index.js",
  "style": "style.css",
  "icon": "icon.svg",
  "config_schema": [
    {
      "key": "greeting",
      "label": "问候语",
      "type": "string",
      "default": "Hello NextList"
    }
  ],
  "permissions": ["ui:widget", "fs:read", "notify"]
}
```

关键字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 全局唯一标识，建议 `插件名-功能` 命名 |
| `entry` / `style` / `icon` | 入口脚本 / 样式 / 图标在 ZIP 内的相对路径 |
| `config_schema` | 可视化配置项数组（`key` / `label` / `type` / `default`） |
| `permissions` | 权限声明字典，见下表 |

常用权限：`ui:widget`（悬浮挂件）、`ui:file-action`（文件操作扩展）、`fs:read` / `fs:write`（文件系统读写）、`admin:read`（管理接口）、`notify`（消息通知）。

## 四、运行时 SDK 概览

`index.js` 默认导出一个接收执行上下文的工厂函数，上下文提供：

- **ctx.config**：用户在后台填写的可视化配置；
- **ctx.ui**：注册悬浮挂件、注入文件操作菜单项；
- **ctx.events**：事件总线与生命周期钩子（挂载 / 卸载 / 文件选中 / 目录切换等）；
- **ctx.notify**：消息与弹窗提示；
- **ctx.fs**：文件系统 API（列目录 / 读文件 / 写文件等，需对应权限）；
- **ctx.admin**：管理员与系统配置 API（需 `admin:*` 权限）；
- **ctx.resources**：动态资源与样式注入。

完整 SDK 签名与示例代码见主仓库 [docs/plugin-development.md](https://github.com/Mcchen1008/NextList/blob/main/docs/plugin-development.md)（764 行完整指南，含从零到一的实战范例）。

## 五、打包、安装与调试

```bash
# 在插件目录内打包（5 个文件置于 zip 根目录）
zip -r ../my-plugin.zip plugin.json index.js style.css icon.svg README.md
```

1. 进入**管理面板 → 插件管理**；
2. 上传 `my-plugin.zip`（或填入托管在 GitHub Release 的 ZIP 直链）；
3. 启用插件，在「配置」中调整 `config_schema` 生成的表单；
4. 刷新前端页面即可看到插件生效；开发时可反复上传覆盖调试。

## 六、发布到插件市场

将插件仓库发布到 GitHub 并打上 `nextlist-plugin` topic 后，在[插件市场](/plugins/)用 GitHub 登录并点击「刷新我的插件」，你的插件就会被自动收录（含 README 展示、Release 下载直链与评论互动）。

<GiscusComment />
