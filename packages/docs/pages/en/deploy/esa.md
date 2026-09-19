---
title: Deploy to Alibaba Cloud ESA
description: Deploy NextList to Alibaba Cloud ESA Edge Routine — the universal edge entry, esa.jsonc configuration and data persistence options.
---

The NextList backend depends only on Web standard APIs (fetch, Web Crypto, ReadableStream), and the universal edge entry in its build output exports a standard `fetch` handler as an ES Module, so it can run on [Alibaba Cloud ESA](https://www.alibabacloud.com/en/product/edge-security-acceleration) Edge Routine functions. This guide is adapted from the OpenList Worker ESA deployment instructions with adjustments that reflect NextList's actual implementation: instead of a dedicated EdgeKV entry, NextList uses a universal edge entry combined with a remote KV store — a good fit for advanced users who want their site served from Alibaba Cloud's mainland nodes.

## Prerequisites

Make sure the following are ready. First, an ESA subscription with a site created — Edge Routine functions come with ESA plans, found in the console under **Edge Routine**. Second, Node.js 18+ and pnpm (`npm i -g pnpm`) installed locally for building. Third, a persistence target: because NextList does not include an EdgeKV adapter, we recommend a remote Cloudflare KV configured as the data store (free tier is sufficient for personal use — see the persistence section below).

## Build Output

Unlike OpenList Worker, which ships a dedicated `esa-entry.ts`, NextList takes a "one entry, many platforms" approach: the build script `scripts/build-edge.mjs` bundles the backend into a platform-neutral universal edge entry at `dist/api/[...route].js` (esbuild `platform: neutral`, pure Web standards, no platform-specific dependencies). The artifact default-exports a `fetch` handler in ES Module form, which matches the ESA Edge Routine entry spec — no per-platform entry file is maintained.

```bash
# 1. Install dependencies
pnpm install

# 2. Build (produces the universal edge entry dist/api/[...route].js plus static assets in dist/)
pnpm run build
```

After the build, the `dist/` directory contains both the frontend assets and the backend entry; deploying them together serves pages and APIs from the same edge function.

## esa.jsonc Reference

ESA edge functions read their entry, install/build commands and assets directory from an `esa.jsonc` at the project root. Create one in the NextList repository:

```jsonc
{
  "name": "nextlist",
  "entry": "./dist/api/[...route].js",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "buildCommand": "pnpm run build",
  "assets": { "directory": "./dist" },
}
```

The fields mirror the `esa.jsonc` used by OpenList Worker: `entry` points to the built edge function entry, `installCommand` and `buildCommand` are executed automatically when you deploy via Git import in the ESA console, and `assets` declares the static assets directory so frontend pages are served straight from the edge CDN. Push the repository to GitHub and use **Edge Routine → Create function → Git import** in the ESA console for automatic builds.

## Data Persistence

NextList has no EdgeKV binding on ESA, so persistence works as follows. The **recommended setup is a remote Cloudflare KV (REST API mode)**: configure the three variables below in the function's environment and NextList reads/writes data through the Cloudflare KV REST API, behaving like a Workers deployment with data that survives instance restarts:

| Variable               | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| `CF_ACCOUNT_ID`        | Cloudflare account ID (visible in the dashboard sidebar)                    |
| `CF_KV_NAMESPACE_ID`   | KV namespace ID (created via `wrangler kv namespace create NEXTLIST_KV`)    |
| `CF_API_TOKEN`         | Cloudflare API token with KV read/write permission                          |

Also recommended: `ADMIN_USERNAME` / `ADMIN_PASSWORD` (initial admin account, default `admin` / `admin`) and `JWT_SECRET` (signing key, 32+ characters). The full variable reference lives at [Environment Variables & Bindings](/deploy/env).

> [!WARNING]
> Without a remote KV configured, NextList falls back to **memory mode** — all data lives only for the lifetime of the current function instance and is lost on recycle or scale-out. Memory mode is fine for smoke-testing the build, but production deployments must configure the remote KV.

## Known Limitations

ESA deployment is a community path with a few caveats. First, NextList does not adapt EdgeKV, so the platform's native free KV store cannot be used; persistence relies on the remote Cloudflare KV above (the cross-cloud KV round-trip adds tens of milliseconds to admin operations, while hot file access is unaffected — file traffic goes through driver direct links and never touches the KV). Second, the module-level TTL cache that OpenList Worker builds for EdgeKV's eventual consistency has no counterpart in NextList and is not needed — the REST API mode is strongly consistent. Third, the `Local` storage driver is unavailable on edge functions; use object storage or cloud drive drivers, and features requiring background daemons (offline download) are limited. If you want native EdgeKV support, the `esa-entry.ts` adapter in OpenList Worker is a good reference: implement an EdgeKV driver in the KV binding layer at `src/backend/internal/model/db.ts` — pull requests are welcome.

<GiscusComment />
