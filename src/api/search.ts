import { get, post } from './http'

// ===== 类型定义 =====

export interface HotKeyword {
  keyword: string
  count: number
}

export interface SearchLog {
  id: number
  keyword: string
  userId?: number
  userName?: string
  resultCount: number
  createTime: string
}

export interface SearchSuggest {
  keyword: string
}

// ===== 搜索接口 =====

/** 搜索房源（条件） */
export const searchHouse = (data: Record<string, unknown>) => post('/search/house', data)

/** 搜索房源（GET） */
export const searchHouseGet = (query: Record<string, unknown>) => get('/search/house', query)

/** 查询热门搜索词 */
export const getHotKeywords = () => get<{ list: HotKeyword[]; total: number }>('/search/hot')

/** 查询搜索联想词 */
export const getSuggest = (keyword: string) =>
  get<{ list: SearchSuggest[]; total: number }>('/search/suggest', { keyword })

/** 查询搜索日志 */
export const getSearchLogs = (page?: number, size?: number) =>
  get<{ list: SearchLog[]; total: number }>('/search/log', { page: page || 1, size: size || 20 })

/** 重建搜索索引 */
export const rebuildIndex = () => post('/search/index/rebuild')
