---
title: FAQ
description: Frequently asked questions about deploying and running NextList
---

## Q: Why is the Local driver unavailable on Cloudflare Workers?

Workers is a filesystem-less environment. The Local driver only works in Node container mode (where `fs` is loaded on demand); on edge deployments use cloud drive / WebDAV / S3 storage drivers instead.

## Q: 123 Cloud shows an "overseas login risk" error when deployed on Workers?

This is a 123 Cloud server-side policy that restricts logins from datacenter / unfamiliar IPs; the Go-based OpenList hits the same wall. The recommended approach is to obtain an `access_token` through the official Open API authorization flow and fill it into the storage configuration, or deploy to a server located in mainland China.

## Q: Where is my data stored?

In Node container mode data persists to `public_data/db.json`; on Cloudflare Workers it persists to the bound `NEXTLIST_KV` namespace; on EdgeOne it persists to Blob storage. See [Environment Variables & Bindings](/deploy/env).

## Q: Is WebDAV supported?

Both ways: you can mount a remote WebDAV server (Nextcloud, ownCloud, Synology, etc.) as a storage driver, and NextList also serves a complete WebDAV endpoint at `/dav` (RFC 4918 Class 1/2) that can be mounted by Windows Explorer, macOS Finder, rclone and other clients. See [Add Storage](/storage/).

## Q: Why doesn't `npm run start` start a server?

`dist/api/[...route].js` is a Serverless handle and does not open a port. The project is edge-deployment-first; self-hosting on Node requires wiring up `@hono/node-server` yourself and serving the static assets. For local development use `pnpm dev`.

## Q: What is the default admin account?

`admin` / `admin`. Change the password right after the first deployment in **Admin Panel → Users**.

## Q: I forgot the admin password — what now?

Delete the persisted data (the user records in `public_data/db.json` or in the KV namespace) and restart; the system re-initializes the default account from the `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables.

## Q: How do I join the plugin ecosystem?

Tag your plugin repository with the `nextlist-plugin` topic, then log in at the [plugin market](/plugins/) and hit refresh — it gets indexed automatically. See the [Plugin Development Guide](/plugins/development) for development questions.

## Q: How is this website built?

The source code of this website (home / docs / plugin market) lives at [Mcchen1008/NextListWeb](https://github.com/Mcchen1008/NextListWeb): the home page and plugin market are SolidJS + Vite, the docs are Valaxy + valaxy-theme-press, everything is deployed on Cloudflare Pages, and the plugin market stores its data in Cloudflare KV.

<GiscusComment />
