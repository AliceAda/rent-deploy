import { useAuthStore } from '@/store/auth'

// API 基础路径：相对 /api，由 nginx 反代到本机 frps → 本地后端
const API_BASE: string = (import.meta.env.VITE_API_BASE_URL as string) || '/api'

export interface ApiResp<T = unknown> {
  code: number
  message?: string
  msg?: string
  data: T
  timestamp?: number
}

async function call<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, unknown>
): Promise<ApiResp<T>> {
  let url = `${API_BASE}${path}`
  if (query) {
    const qs = Object.keys(query)
      .filter((k) => query[k] !== undefined && query[k] !== null && query[k] !== '')
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`)
      .join('&')
    if (qs) url += (url.includes('?') ? '&' : '?') + qs
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  // 携带 JWT（网关严格校验）
  const token = useAuthStore().token
  if (token) headers['Authorization'] = 'Bearer ' + token

  const resp = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  if (!resp.ok) throw new Error('HTTP ' + resp.status)
  return (await resp.json()) as ApiResp<T>
}

export const get = <T = unknown>(path: string, query?: Record<string, unknown>) =>
  call<T>('GET', path, undefined, query)
export const post = <T = unknown>(path: string, body?: unknown) => call<T>('POST', path, body)
export const put = <T = unknown>(path: string, body?: unknown) => call<T>('PUT', path, body)
export const del = <T = unknown>(path: string, body?: unknown) => call<T>('DELETE', path, body)

/**
 * 安全包装：网络异常/接口未实现时返回默认值，避免一个接口失败拖垮整页。
 * 后端尚未实现的接口会走这里，页面优雅展示空数据。
 */
export async function safe<T>(p: Promise<ApiResp<T>>, def: T): Promise<ApiResp<T>> {
  try {
    return await p
  } catch {
    return { code: -1, message: '网络错误，请稍后重试', data: def }
  }
}

export function okRes(res: ApiResp): boolean {
  return res.code === 0
}
export function msgOf(res: ApiResp): string {
  return res.message || res.msg || '请求失败'
}
