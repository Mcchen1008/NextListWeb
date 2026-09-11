/// <reference types="@cloudflare/workers-types" />

/**
 * HTTP 响应工具：统一 JSON 输出与 CORS 头。
 * 前端与 API 同源部署（/plugins 与 /api），CORS 头主要为本地开发与第三方调用提供便利。
 */

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
      ...init.headers,
    },
  })
}

export function errorResponse(message: string, status = 500, extra: Record<string, unknown> = {}): Response {
  return jsonResponse({ error: message, ...extra }, { status })
}

/** OPTIONS 预检 */
export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/** 从 Authorization 头解析 Bearer token */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match ? match[1].trim() : null
}
