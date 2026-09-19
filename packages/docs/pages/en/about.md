---
title: About This Project
description: What NextList is, who maintains it, its open-source background and how to get in touch.
---

NextList is an open-source, self-hosted file list and cloud drive manager: it mounts your own cloud drive accounts, object storage and WebDAV servers into a single web interface, providing browsing, preview, upload/download, sharing, WebDAV service and an admin panel. The program itself hosts no content — every file stays in the storage services you authorize; NextList only aggregates and manages them.

## Positioning & Open-source Background

NextList is a community fork of [OpenList](https://github.com/OpenListTeam/OpenList): it keeps the official OpenList frontend experience while rewriting the backend and the storage-driver layer in full-stack TypeScript (SolidJS frontend, Hono backend). No Go toolchain is needed — the same codebase deploys straight to Cloudflare Workers, Tencent EdgeOne, Alibaba Cloud ESA and other edge platforms, or to your own Node container. The project is released under the **AGPL-3.0** license. Source code lives on GitHub: the main repo [Mcchen1008/NextList](https://github.com/Mcchen1008/NextList) and this website [Mcchen1008/NextListWeb](https://github.com/Mcchen1008/NextListWeb). Stars, issues and pull requests are all welcome.

## Maintainer & Operator

NextList is developed and maintained independently by the individual open-source developer **Mcchen1008**. It is a non-commercial personal project: there is no company behind it, no paid service and nothing for sale on this site. The source code of this website (docs and plugin market) is equally public on GitHub. As a personal project, iteration and support depend on spare time — significant changes are announced through repo releases and this documentation site.

## Contact

If you run into problems, spot documentation errors, or want to report a security issue or a copyright complaint, reach out through either channel:

- **Email**: [Chen10081008@outlook.com](mailto:Chen10081008@outlook.com)
- **GitHub Issues**: [NextListWeb/issues](https://github.com/Mcchen1008/NextListWeb/issues) (site & docs), [NextList/issues](https://github.com/Mcchen1008/NextList/issues) (program features & bugs)

As a personal project we cannot promise instant replies — most messages get an answer within a few days. For security reports please prefer email and include reproduction steps. Copyright complaints should include proof of ownership and the specific links; verified requests are handled promptly.

<GiscusComment />
