import { get, del, put } from './http'

// ===== 类型定义 =====

export interface SessionItem {
  id: number
  device: string
  ip: string
  location?: string
  lastActiveTime: string
  createTime: string
  current?: boolean
}

export interface SessionList {
  list: SessionItem[]
  total: number
}

// ===== 会话接口 =====

/** 查询登录会话列表 */
export const getSessions = () => get<SessionList>('/user/session')

/** 获取登录会话详情 */
export const getSessionDetail = (id: number) => get<SessionItem>(`/user/session/${id}`)

/** 更新登录会话 */
export const updateSession = (id: number, data: Partial<SessionItem>) =>
  put(`/user/session/${id}`, data)

/** 注销登录会话 */
export const deleteSession = (id: number) => del(`/user/session/${id}`)
