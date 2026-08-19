/**
 * 全局共享类型定义
 * 各模块类型统一来源，避免重复定义和类型不一致
 */

// ===== 分页相关 =====
export interface PaginationParams {
  page: number
  size: number
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page?: number
  size?: number
}

// ===== 通用 API 响应 =====
export interface ApiResponse<T = unknown> {
  code: number
  message?: string
  data: T | null
}

// ===== 用户角色 =====
export type UserRole = 'tenant' | 'landlord' | 'agent' | 'admin'

export const ROLE_NAMES: Record<UserRole, string> = {
  tenant: '租客',
  landlord: '房东',
  agent: '经纪人',
  admin: '平台管理员'
}

// ===== 基础实体 =====
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt?: string
}

// ===== 用户 =====
export interface User extends BaseEntity {
  name: string
  phone: string
  role: UserRole
  avatar?: string
  status: '正常' | '禁用'
  email?: string
}

// ===== 房源 =====
export type RentType = '整租' | '合租' | '公寓'
export type HouseStatus = '可租' | '已租' | '待审核' | '已下架' | '违规'

export interface House extends BaseEntity {
  title: string
  district?: string
  layout?: string
  area?: number
  price?: number
  rentType: RentType
  orientation?: string
  floor?: string
  decoration?: string
  depositType?: string
  facilities?: string[]
  tags?: string[]
  status: HouseStatus
  views: number
  collectCount: number
  landlordId?: number
  landlordName?: string
}

// ===== 合同 =====
export type ContractStatus = '草稿' | '生效中' | '已到期' | '已终止' | '已取消'

export interface Contract extends BaseEntity {
  contractNo: string
  houseId?: number
  houseTitle: string
  tenantId?: number
  tenantName: string
  term: number
  startDate?: string
  endDate?: string
  monthlyRent?: number
  deposit?: number
  amount?: number
  status: ContractStatus
  signedAt?: string
}

// ===== 订单 =====
export type OrderType = '预订' | '看房预约' | '其他'
export type OrderStatus = '待支付' | '已支付' | '已取消' | '已完成'

export interface Order extends BaseEntity {
  orderNo: string
  houseId?: number
  houseTitle: string
  userId?: number
  userName: string
  amount: number
  type: OrderType
  status: OrderStatus
}

// ===== 账单 =====
export type BillType = '租金' | '水电' | '物业' | '其他'
export type BillStatus = '待支付' | '已支付' | '已逾期'

export interface Bill extends BaseEntity {
  billNo: string
  houseId?: number
  houseTitle?: string
  userId?: number
  userName?: string
  amount: number
  type: BillType
  dueDate: string
  status: BillStatus
}

// ===== 工单 =====
export type TicketType = '报修' | '投诉' | '咨询'
export type TicketStatus = '待受理' | '处理中' | '已完成' | '已关闭'
export type TicketPriority = '低' | '中' | '高'

export interface Ticket extends BaseEntity {
  ticketNo: string
  title: string
  description: string
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  assignee?: string
  creatorId: number
}

// ===== 角色权限 =====
export interface RoleItem {
  id?: number
  name: string
  scope: '全平台' | '按城市' | '本人/门店'
  perms: string[]
}

export interface AdminUser {
  id?: number
  user: string
  role: string
  status: '启用' | '禁用'
  last?: string
}

// ===== 统计数据 =====
export interface GmvStat {
  labels: string[]
  data: number[]
}

export interface StockStat {
  name: string
  value: number
}

// ===== 导出工具 =====
export interface ExportRow {
  [key: string]: string | number
}

export function generateCsv(rows: ExportRow[], headers?: string[]): string {
  if (!rows.length) return ''
  const h = headers || Object.keys(rows[0])
  const csvRows = [h.join(','), ...rows.map(r => h.map(k => `"${String(r[k] ?? '')}"`).join(','))]
  return csvRows.join('\n')
}
