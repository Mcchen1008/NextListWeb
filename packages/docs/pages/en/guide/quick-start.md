---
title: Quick Start
description: Get NextList running in minutes — deploy online or run locally, sign in for the first time and mount your first storage.
---

Welcome to NextList! This page walks you through the shortest path to a running site: pick a deployment option, sign in for the first time, mount your first storage, and find the deeper documentation from there.

## Choose Your Path

There are two ways to get started — pick whichever fits your needs.

**Path one: cloud deployment (recommended)**. If you want a live site reachable from anywhere, deploy to Cloudflare Workers: the free plan includes 100,000 requests per day with global edge acceleration and no server to maintain. The full walkthrough is in [Deploy to Cloudflare Workers](/en/deploy/workers) — either connect your GitHub repo in the Cloudflare console for automatic builds, or use the CLI. Users who prefer mainland China access can choose [Tencent EdgeOne](/en/deploy/edgeone) or [Alibaba Cloud ESA](/en/deploy/esa) instead.

**Path two: run locally**. To try things out or contribute code, install Node.js ≥ 20.19 and pnpm 9+, then:

```bash
git clone https://github.com/Mcchen1008/NextList.git
cd NextList
pnpm install
pnpm dev
```

Open <http://localhost:3000> once it starts. Vite serves the frontend together with the Hono backend, and configuration data is written to the local `public_data/db.json`.

## First Sign-in

The default admin account is the same everywhere:

| Item     | Value   |
| -------- | ------- |
| Username | `admin` |
| Password | `admin` |

> [!WARNING]
> Change the default password immediately after the first login in **Admin Panel → Users**. For edge deployments you can also preset the initial credentials through the `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables — see [Environment Variables](/deploy/env).

## Mount Your First Storage

Open **Admin Panel → Storage → Add** and pick a driver. Most drivers only need a cookie or a token from the provider's official authorization flow — the form shows exactly what to fill in. After saving, wait a few seconds for the health check to pass and the drive appears in the home page. See [Add Storage](/storage/) for driver-specific details.

## Where to Go Next

- [Deploy to Cloudflare Workers](/en/deploy/workers) — console or CLI, both covered
- [FAQ](/en/faq) — the most common questions answered
- [REST API](/advanced/api) and [MCP Integration](/advanced/mcp) — for automation and AI assistants

<GiscusComment />
