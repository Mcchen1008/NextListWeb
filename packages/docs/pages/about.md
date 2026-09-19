---
title: 关于本项目
description: NextList 是什么、由谁维护、开源背景与联系方式
---

NextList 是一款开源的自建网盘与文件列表程序：把你自己的网盘账号、对象存储和 WebDAV 服务器统一挂载到一个网页界面中，提供浏览预览、上传下载、分享直链、WebDAV 服务与后台管理等完整能力。程序本身不提供、不分发任何存储内容——所有文件都存放在使用者自行授权的存储服务里，NextList 只负责聚合浏览与管理。

## 项目定位与开源背景

NextList 是 [OpenList](https://github.com/OpenListTeam/OpenList) 的社区衍生实现：完整保留了 OpenList 的前端交互体验，使用全栈 TypeScript（前端 SolidJS、后端 Hono）重写了后端与存储驱动层，无需编译 Go 二进制，可以直接部署到 Cloudflare Workers、腾讯云 EdgeOne、阿里云 ESA 等边缘平台或自有 Node 容器。项目代码以 **AGPL-3.0** 许可证开源，源码托管在 GitHub：主程序仓库 [Mcchen1008/NextList](https://github.com/Mcchen1008/NextList)，官网与文档仓库 [Mcchen1008/NextListWeb](https://github.com/Mcchen1008/NextListWeb)，欢迎 Star、Issue 与 PR。

## 维护者与运营主体

NextList 由个人开源开发者 **Mcchen1008** 独立开发与维护，属于非商业化的个人开源项目：没有公司实体、没有付费服务、不在站内销售任何东西，官网（文档站与插件市场）的全部源码同样公开在 GitHub 上。正因为是个人项目，功能迭代与问题响应的速度依赖业余时间，重要变更会通过仓库 Release 与文档站公布。

## 联系我们

如果你在使用中遇到问题、发现文档错误，或希望反馈安全漏洞与版权投诉，欢迎通过以下渠道联系：

- **邮箱**：[Chen10081008@outlook.com](mailto:Chen10081008@outlook.com)
- **GitHub Issues**：[NextListWeb/issues](https://github.com/Mcchen1008/NextListWeb/issues)（文档与官网问题）、[NextList/issues](https://github.com/Mcchen1008/NextList/issues)（程序功能与缺陷）

个人项目通常无法做到即时响应，一般会在数日内回复；涉及安全的反馈请优先使用邮箱，并附上复现步骤。版权相关的投诉请附上权利证明与具体链接，核实后我们会及时处理。

<GiscusComment />
