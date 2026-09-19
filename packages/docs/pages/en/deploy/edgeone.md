---
title: Deploy to Tencent EdgeOne
description: Deploy NextList to Tencent Cloud EdgeOne Pages (Makers) — console Git import / CLI, environment variables, custom domain and data persistence.
---

Besides Cloudflare Workers, NextList fully supports Tencent Cloud [EdgeOne Pages](https://edgeone.ai/) (Makers). Static assets are served from the edge CDN while the backend runs as a Node.js cloud function; the build scripts handle all platform adaptations automatically, so no code changes are needed. This guide covers both the console Git import and the CLI route, plus environment variables, custom domains and data persistence.

## Prerequisites

Two things are needed up front. First, register and sign in to Tencent EdgeOne — either the [international console](https://console.edgeone.ai/makers) or the [China console](https://console.cloud.tencent.com/edgeone/makers) works, and the flow is identical on both. Second, a GitHub account to connect, since EdgeOne reads your NextList repository from GitHub and builds it automatically. For the CLI route you also need Node.js 22+ installed locally.

## Platform Adaptation Notes

NextList adapts to EdgeOne at three layers, which helps when troubleshooting. First, the build script `scripts/build-edge.mjs` bundles the backend into `cloud-functions/[[default]].js` at the repo root — EdgeOne scans for this file at checkout to decide whether to enable Node functions, so it must exist (it is committed to the repo); if missing, the CLI reports `No server-handler detected` and the project degrades to a purely static site. Second, Node functions have no Workers-style `ASSETS` binding, so the build inlines `dist/index.html` into the function bundle as an SPA fallback — requests that reach the function directly never 404. Third, the root `middleware.js` rewrites browser navigation requests to `index.html`, completing the SPA fallback via the static CDN.

## Option 1: Console Git Import (recommended)

Sign in to the [EdgeOne Makers console](https://console.edgeone.ai/makers), click **New project → Import Git repository**, authorize GitHub on first use, then select your forked or imported NextList repository:

![Select the NextList repository in EdgeOne](/img/worker/edgeone_ui1.png)

Fill in the build settings below (the platform reads the root `edgeone.json` automatically, so these are usually pre-filled):

| Item           | Value                                |
| -------------- | ------------------------------------ |
| Node version   | 22.11.0                              |
| Install command| `pnpm install --no-frozen-lockfile`  |
| Build command  | `pnpm run build`                     |
| Output dir     | `dist`                               |

In the variables step you can optionally configure environment variables. NextList has **no required variables** on EdgeOne — the Blob storage used for persistence gets its credentials injected automatically and works out of the box:

| Variable         | Example         | Description                                            |
| ---------------- | --------------- | ------------------------------------------------------ |
| `ADMIN_USERNAME` | `admin`         | Initial admin username                                 |
| `ADMIN_PASSWORD` | strong password | Initial admin password                                 |
| `JWT_SECRET`     | random string   | JWT signing key, 32+ characters recommended            |

Click **Start deployment** and wait for the build to finish, then access the site through the assigned `*.edgeone.cool` domain. The admin account is initialized from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (default `admin` / `admin`) — **change the password right after the first login**.

## Custom Domain & SSL

After deployment, open **Domain management**, add your custom domain, create the CNAME record at your DNS provider as instructed, and enable SSL once the resolution takes effect. EdgeOne walks you through each step.

![Add a custom domain and enable SSL](/img/worker/edgeone_ui2.png)

## Option 2: EdgeOne CLI

Command-line users can complete the same flow with the official CLI:

```bash
npm install -g edgeone   # install globally
edgeone login            # sign in
edgeone makers dev       # local debugging
edgeone makers deploy    # build and deploy to production
```

## Data Persistence

Persistence on EdgeOne is selected automatically by priority. The first choice is **Blob storage** (`@edgeone/pages-blob`, a strongly consistent HTTP API) whose credentials are injected at runtime — zero configuration. The second choice is an **EdgeOne KV binding** (`EDGEONE_KV` / `EO_KV`), only active when such a binding is present — if you prefer KV, create a namespace under **Storage → KV Storage** and bind it to one of those variable names:

![Bind the KV namespace](/img/worker/edgeone_ui3.png)

When neither is available the runtime falls back to **memory mode** — changes live only for the lifetime of the current function instance and are lost on restart, so production deployments should ensure one of the two above is active.

> [!TIP]
> Blob versus KV needs no explicit configuration: NextList's `auto` detection enables whichever binding exists, with Blob taking priority.

After deployment you can check the KV status panel in the admin panel under **Settings → Other** (backed by `/api/admin/kv/status`) to confirm which storage backend is actually active.

## About Scheduled Tasks

EdgeOne Pages supports scheduled jobs through `edgeone.json` (`schedules`), typically used to trigger token-refresh endpoints. NextList does not need this: storage-driver tokens are refreshed **on demand per request** (expired tokens renew automatically), and an in-process scheduler handles periodic work without platform-level triggers. If you want to reduce the first-request latency after a cold start, you may configure a scheduled request to `/api/health` to keep an instance warm — this is optional and does not affect functionality.

<GiscusComment />
