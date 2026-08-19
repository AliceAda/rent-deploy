import { get, post, put } from './http'

// ===== 类型定义 =====

export interface BlacklistItem {
  id: number
  userId: number
  userName?: string
  reason: string
  createTime: string
}

export interface RiskRule {
  id: number
  name: string
  type: string
  threshold: string
  enabled: boolean
  description?: string
}

export interface RiskRecord {
  id: number
  userId: number
  userName?: string
  action: string
  riskLevel: string
  detail: string
  createTime: string
}

export interface ReportItem {
  id: number
  houseId: number
  houseTitle?: string
  reporterId: number
  reporterName?: string
  reason: string
  status: string
  createTime: string
  handleResult?: string
}

// ===== 风控接口 =====

/** 查询风控黑名单 */
export const getBlacklist = (page?: number, size?: number) =>
  get<{ list: BlacklistItem[]; total: number }>('/risk/blacklist', { page: page || 1, size: size || 20 })

/** 查询风控规则 */
export const getRiskRules = () => get<{ list: RiskRule[]; total: number }>('/risk/rule')

/** 查询用户风控记录 */
export const getUserRiskRecord = (userId: number) =>
  get<{ list: RiskRecord[]; total: number }>(`/risk/record/${userId}`)

/** 风控决策 */
export const riskDecide = (data: { userId: number; action: string; reason: string }) =>
  post('/risk/decide', data)

// ===== 房源举报接口 =====

/** 获取房源举报详情 */
export const getReportDetail = (id: number) => get<ReportItem>(`/admin/house/report/${id}`)

/** 处理房源举报 */
export const handleReport = (data: { id: number; handleResult: string; status: string }) =>
  post('/admin/house/report', data)

/** 更新房源举报处理 */
export const updateReport = (id: number, data: { handleResult: string; status: string }) =>
  put(`/admin/house/report/${id}`, data)
