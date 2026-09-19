---
title: Deploy to Cloudflare Workers
description: Deploy NextList to the Cloudflare Workers edge — GitHub-connected console builds or CLI, KV binding, environment variables, custom domains.
---

The NextList backend is built on Hono and depends only on Web standard APIs (fetch, Web Crypto, ReadableStream), which makes it a natural fit for Cloudflare Workers. This guide covers the complete setup from zero, in two flavors: **Option 1** connects your GitHub repository to the Cloudflare console for automatic graphical builds — no local tooling required; **Option 2** builds and deploys from your machine with the Wrangler CLI.

## Prerequisites

Make sure the following are ready. First, a registered [Cloudflare Dashboard](https://dash.cloudflare.com/) account — the free plan is enough for personal use. Second, a [GitHub](https://github.com/) account: option one needs it to connect the repository, and option two needs Node.js 18+ plus pnpm (`npm i -g pnpm`) installed locally. Third, for the CLI route, run `npx wrangler login` in the project directory and finish the authorization in the browser that opens.

## Option 1: Console Build with GitHub (recommended)

This route uses Cloudflare Workers Builds: hand your forked NextList repository to Cloudflare and every push is built and deployed automatically, entirely from the browser.

### Step 1: Fork the repo and create an application

First fork [Mcchen1008/NextList](https://github.com/Mcchen1008/NextList) to your own GitHub account. Then open the **Workers & Pages** section of the Cloudflare dashboard, click **Create application** and choose **Connect to GitHub**. Cloudflare asks for GitHub authorization — click **Authorize** and select the account (or organization) that holds your fork.

![Create an application — connect GitHub](/img/worker/create_app1.png)

> [!TIP]
> If Cloudflare reports "unable to fetch repository content" for the upstream repo, make sure you forked NextList and that the fork's owner is selected during authorization.

### Step 2: Select the repository and configure the build

Pick your forked `NextList` repository and keep the default build settings shown below. Cloudflare builds the Worker and deploys it to a `*.workers.dev` subdomain:

| Setting          | Value                                |
| ---------------- | ------------------------------------ |
| Project name     | custom (determines the subdomain)    |
| Build command    | `pnpm run build`                     |
| Deploy command   | `npx wrangler deploy`                |
| Production branch| `main`                               |

![Keep default build settings](/img/worker/create_app3.png)

The NextList repository already ships a `wrangler.toml` (worker entry `src/backend/worker.ts`, the `nodejs_compat` flag, static assets directory `./dist`), so nothing else needs adjusting — click **Deploy** and wait for the build to finish.

### Step 3: Set environment variables and secrets

Open your new Worker and go to **Settings → Variables and Secrets**, then add the runtime variables:

| Variable         | Example        | Description                                                        |
| ---------------- | -------------- | ------------------------------------------------------------------ |
| `ADMIN_USERNAME` | `admin`        | Initial admin username                                             |
| `ADMIN_PASSWORD` | strong password| Initial admin password                                             |
| `JWT_SECRET`     | random string  | JWT signing key, 32+ characters; store sensitive values as secrets |

![Add environment variables](/img/worker/create_app4.png)

The full variable reference with fallback behavior lives at [Environment Variables & Bindings](/deploy/env). If `JWT_SECRET` is unset, NextList generates a random key on first start and persists it to KV, which is shared across instances — setting it explicitly is still the recommended practice.

### Step 4: Bind the KV namespace

In serverless environments there is no local filesystem, so all configuration, users, storages and shares persist to Cloudflare KV (the edge equivalent of the local `public_data/db.json`). The KV binding is mandatory. Go to **Settings → Bindings** and add a KV namespace binding:

| Type          | Variable name |
| ------------- | ------------- |
| KV namespace  | `NEXTLIST_KV` |

![Bind the KV namespace](/img/worker/create_app5.png)

> [!IMPORTANT]
> The binding name must stay exactly `NEXTLIST_KV` — the backend looks the namespace up by this name. If you have not created a namespace yet, create one right in this dialog, or use the `wrangler kv namespace create` command from the CLI route below.

### Step 5: Bind a custom domain

Add your own domain under **Settings → Domains and Routes**. Domains hosted at Cloudflare get DNS and certificates configured automatically; for domains hosted elsewhere, create a CNAME record pointing the subdomain to your `*.workers.dev` hostname.

![Bind a custom domain](/img/worker/create_app6.png)

### After deployment

When the build succeeds, open the assigned `*.workers.dev` domain (or your custom domain) to see the login page. NextList initializes the admin account from the `ADMIN_USERNAME` / `ADMIN_PASSWORD` variables (default `admin` / `admin`) — **change the password right after the first login**. Visit `/api/health` to verify the deployment.

## Option 2: CLI deployment from your local machine

If you prefer the command line, the same result can be achieved locally with full control over the build.

### Create and bind the KV namespace

Open a terminal in the project directory and create the KV namespace:

```bash
npx wrangler kv namespace create NEXTLIST_KV
```

The command prints something like the following — copy the ID:

```text
🌀 Creating namespace with title "nextlist-NEXTLIST_KV"
✨ Success! Created namespace nextlist-NEXTLIST_KV with ID "a1b2c3d4e5f67890abcdef1234567890"
```

Then put it into the root `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "NEXTLIST_KV"
id = "a1b2c3d4e5f67890abcdef1234567890"  # replace with your own ID
```

> [!TIP]
> Wrangler 4.x supports Automatic resource provisioning: omit the `id` and keep only the binding name — on deploy, Wrangler creates/associates a KV namespace with the same name automatically. The bundled one-shot deploy script `scripts/deploy.js` already includes this logic.

### Build and deploy

```bash
pnpm install        # install dependencies
pnpm build          # build the Vite frontend + edge backend
pnpm deploy:worker  # deploy to the Cloudflare edge (equals npx wrangler deploy)
```

Or use the one-shot script, which also makes sure the KV namespace exists:

```bash
node scripts/deploy.js
```

On success the CLI prints the default domain (like `https://nextlist.<your-subdomain>.workers.dev`).

### Local preview

Before going live you can simulate the full Workers runtime locally (mock KV included):

```bash
pnpm dev:worker
```

This equals `wrangler dev`; open the printed local address. It initializes the environment from the `vars` in `wrangler.toml`, which makes it a good smoke test of the deployment artifact.

### Secrets

Production-sensitive values (like the JWT signing key) should be stored as Secrets rather than plain vars:

```bash
npx wrangler secret put JWT_SECRET
```

## Serverless Notes

Cloudflare Workers is a stateless edge environment with a few limitations worth knowing. First, the `Local` storage driver is unavailable (no persistent filesystem) — use object storage or cloud drive drivers (S3, WebDAV, etc.) instead. Second, features that require background daemons (like offline download) are limited. Finally, mind the free plan quotas: 100,000 requests, 100,000 KV reads and 1,000 KV writes per day — usually plenty for personal use.

## Cloud Drives & Datacenter IP Limits

Datacenter egress IPs can be restricted by some providers' login policies; the most typical case is **123 Cloud**: its login endpoint replies with an "overseas login risk" message to datacenter IPs. That is 123's server-side policy and the original Go version hits it identically. The restriction only affects new account logins, not already-mounted storages.

Recommended ways to connect, in order of preference. First, **use the official Open API**: 123 Cloud offers an open platform — apply for an app, complete the official OAuth authorization to get an access_token, and fill it into the storage configuration. Second, **deploy to a Node container in mainland China** (`pnpm build && npm run start`), where a residential broadband egress allows normal password logins. Third, if an account was already flagged, log in once on the official site and complete verification to recover it.

All mainstream drivers (Quark, Aliyun Drive Open, OneDrive, Google Drive, 115, Baidu Netdisk and others) provide official open-platform or OAuth flows whose token credentials are unaffected by datacenter IP restrictions and work on Workers out of the box.

<GiscusComment />
