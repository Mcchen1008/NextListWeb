/// <reference types="@cloudflare/workers-types" />
import type { Env } from '../utils/types'
import { jsonResponse, preflight } from '../utils/http'

/**
 * GET /api/auth/config
 *
 * 返回 GitHub OAuth 前端配置（补充端点）。
 * Client ID 本身是公开信息，由服务端下发的好处是：
 * 修改 OAuth App 后只需改环境变量重新部署 Functions，无需重新构建前端。
 *
 * 响应：{ configured, clientId, authorizeUrl, scope }
 */
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const clientId = ctx.env.GITHUB_CLIENT_ID ?? ''
  const configured = Boolean(clientId && ctx.env.GITHUB_CLIENT_SECRET)
  return jsonResponse({
    configured,
    clientId,
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    // 只申请 public_repo：只读公开仓库，不涉及任何私有数据
    scope: 'public_repo',
  })
}

export const onRequestOptions: PagesFunction<Env> = async () => preflight()
