import { useAuthStore } from '@/store/auth'

// API 基础路径：相对 /api，由 nginx / vite 反代到本地后端
const API_BASE: string = (import.meta.env.VITE_API_BASE_URL as string) || '/api'

export interface ApiResp<T = unknown> {
  code: number
  message?: string
  msg?: string
  data: T
  timestamp?: number
}

// 401 统一处理钩子：由 main.ts 注册（避免 http 与 router 循环依赖）。
// 触发时清登录态并跳转登录页，页面无需各自处理 token 过期。
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn
}

// 刷新接口的响应形态（避免与 api/auth 循环依赖，这里只声明用到的字段）
interface RefreshResult {
  token?: string
  refreshToken?: string
}

// 并发去重的刷新 Promise：多个请求同时 401 时只刷新一次
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const auth = useAuthStore()
  const rt = auth.refreshToken
  if (!rt) return false
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const resp = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      })
      if (!resp.ok) return false
      const data = (await resp.json()) as ApiResp<RefreshResult>
      if (data.code !== 0 || !data.data?.token) return false
      auth.setSession(data.data.token, data.data.refreshToken ?? rt)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
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
  const send = (headers: Record<string, string>) =>
    fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })

  // 携带 JWT（网关严格校验）
  const auth = useAuthStore()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth.token) headers['Authorization'] = 'Bearer ' + auth.token

  let resp = await send(headers)
  // 登录态过期：先静默刷新一次并重放原请求，刷新失败再统一登出跳转
  if (resp.status === 401 && (await tryRefresh())) {
    resp = await send({ ...headers, Authorization: 'Bearer ' + useAuthStore().token })
  }
  if (resp.status === 401) {
    unauthorizedHandler?.()
    throw new Error('登录已过期，请重新登录')
  }
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
 * 失败会 console.warn 上报，方便开发期识别「接口未就绪」而非「没有数据」。
 */
export async function safe<T>(p: Promise<ApiResp<T>>, def: T): Promise<ApiResp<T>> {
  try {
    return await p
  } catch (e) {
    console.warn('[api] request failed:', e instanceof Error ? e.message : e)
    return { code: -1, message: '网络错误，请稍后重试', data: def }
  }
}

export function okRes(res: ApiResp): boolean {
  return res.code === 0
}
export function msgOf(res: ApiResp): string {
  return res.message || res.msg || '请求失败'
}

/**
 * 列表数据归一化：后端契约存在两种形态（数组 / { list, total }），
 * 统一收敛为 { list, total } 供表格与分页使用。
 */
export function toList<T>(data: unknown): { list: T[]; total: number } {
  if (Array.isArray(data)) return { list: data as T[], total: (data as T[]).length }
  const d = data as { list?: T[]; total?: number } | null | undefined
  return { list: Array.isArray(d?.list) ? (d as { list: T[] }).list : [], total: d?.total ?? 0 }
}
