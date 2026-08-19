/**
 * HTTP 请求拦截器 - 统一字段命名转换
 * 自动将后端返回的 snake_case 转换为 camelCase
 */

import { get, post, put, del, type ApiResp } from './http'
import { toCamelCaseObject, parsePaginatedResponse } from '@/utils/field-mapping'

// 响应拦截器
function handleResponse<T>(response: ApiResp<T>): T {
  if (response.data) {
    return toCamelCaseObject(response.data)
  }
  return response.data
}

// 请求拦截器 - 将请求参数的 camelCase 转换为 snake_case
function prepareRequestParams(params: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      result[snakeKey] = params[key]
    }
  }
  return result
}

/**
 * 带字段转换的 GET 请求
 */
export const getWithTransform = <T = unknown>(path: string, query?: Record<string, unknown>): Promise<ApiResp<T>> => {
  return get<T>(path, query).then(handleResponse)
}

/**
 * 带字段转换的 POST 请求
 */
export const postWithTransform = <T = unknown>(path: string, body?: Record<string, any>): Promise<ApiResp<T>> => {
  const preparedBody = body ? prepareRequestParams(body) : body
  return post<T>(path, preparedBody).then(handleResponse)
}

/**
 * 带字段转换的 PUT 请求
 */
export const putWithTransform = <T = unknown>(path: string, body?: Record<string, any>): Promise<ApiResp<T>> => {
  const preparedBody = body ? prepareRequestParams(body) : body
  return put<T>(path, preparedBody).then(handleResponse)
}

/**
 * 带字段转换的 DELETE 请求
 */
export const delWithTransform = <T = unknown>(path: string, body?: Record<string, any>): Promise<ApiResp<T>> => {
  const preparedBody = body ? prepareRequestParams(body) : body
  return del<T>(path, preparedBody).then(handleResponse)
}

/**
 * 分页列表请求（自动转换）
 */
export const getListWithTransform = <T = unknown>(
  path: string,
  params?: Record<string, any>
): Promise<{ list: T[]; total: number; page: number; size: number }> => {
  const preparedParams = params ? prepareRequestParams(params) : undefined
  return getWithTransform(path, preparedParams).then(res => {
    if (res.data && 'list' in res.data) {
      return {
        list: toCamelCaseArray(res.data.list),
        total: res.data.total,
        page: res.data.page,
        size: res.data.size
      }
    }
    return res.data as any
  })
}

/**
 * 辅助函数：将数组中的对象全部转换
 */
function toCamelCaseArray<T extends Record<string, any>>(arr: T[]): T[] {
  return arr.map(item => toCamelCaseObject(item))
}
