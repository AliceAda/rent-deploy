import { get, post, put, del } from './http'

// ===== Agent (Broker) Management =====

export interface AgentItem {
  id: number
  name: string
  phone: string
  agency: string
  commission: number
  status: '正常' | '冻结'
  createdAt: string
}

export const getAdminAgents = () => get<AgentItem[]>('/admin/agents')
export const createAdminAgent = (data: Partial<AgentItem>) => post('/admin/agents', data)
export const updateAdminAgent = (id: number, data: Partial<AgentItem>) =>
  put(`/admin/agents/${id}`, data)
export const deleteAdminAgent = (id: number) => del(`/admin/agents/${id}`)
