import { get, post, put, del } from './http'

// ===== Agent (Broker) Management =====

export interface AgentItem {
  id: number
  userId?: number
  storeId: number
  storeName?: string
  name: string
  phone?: string
  level: '见习' | '初级' | '中级' | '高级' | '金牌'
  certNo?: string
  status: number // 1=正常 0=冻结
  createdAt: string
}

export interface AgentStore {
  id: number
  name: string
  company?: string
  regionId?: number
  city?: string
  address?: string
  lng?: number
  lat?: number
  managerId?: number
  phone?: string
  status: number
}

// 获取经纪人列表
export const getAdminAgents = (params?: { page?: number; size?: number; storeId?: number; status?: number }) => 
  get<AgentItem[]>('/admin/agents', params)

// 获取门店列表
export const getAgentStores = (params?: { page?: number; size?: number; city?: string }) => 
  get<AgentStore[]>('/admin/agent-stores', params)

// 创建经纪人
export const createAdminAgent = (data: Partial<AgentItem>) => post('/admin/agents', data)

// 更新经纪人
export const updateAdminAgent = (id: number, data: Partial<AgentItem>) =>
  put(`/admin/agents/${id}`, data)

// 删除经纪人
export const deleteAdminAgent = (id: number) => del(`/admin/agents/${id}`)

// 更新经纪人状态
export const updateAgentStatus = (id: number, status: number) =>
  post(`/admin/agents/${id}/status`, { status })

// 获取经纪人详情
export const getAgentDetail = (id: number) => get<AgentItem>(`/admin/agents/${id}`)
