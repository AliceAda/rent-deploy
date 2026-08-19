/**
 * 全局类型定义
 * 统一类型来源，避免各组件重复定义
 */

// ===== 基础分页 =====
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

// ===== 通用操作结果 =====
export interface ApiResult<T = unknown> {
  code: number
  message?: string
  data: T | null
}

// ===== 用户相关 =====
export interface UserBase {
  id: number
  name: string
  phone: string
  role: 'tenant' | 'landlord' | 'agent' | 'admin'
  avatar?: string
  status: '正常' | '禁用'
  createdAt: string
}

// ===== 房源相关 =====
export interface HouseBase {
  id: number
  title: string
  district: string
  layout: string
  area: number
  price: number
  rentType: '整租' | '合租' | '公寓'
  orientation: string
  status: '可租' | '已租' | '待审核' | '已下架' | '违规'
  views: number
  collectCount: number
}

// ===== 合同相关 =====
export interface ContractBase {
  id: number
  contractNo: string
  houseId: number
  houseTitle: string
  tenantId: number
  tenantName: string
  term: number
  startDate: string
  endDate: string
  amount: number
  status: '草稿' | '生效中' | '已到期' | '已终止' | '已取消'
  createdAt: string
}

// ===== 订单相关 =====
export interface OrderBase {
  id: number
  orderNo: string
  houseId: number
  houseTitle: string
  userId: number
  userName: string
  amount: number
  status: '待支付' | '已支付' | '已取消' | '已完成'
  type: '预订' | '看房预约' | '其他'
  createdAt: string
}

// ===== 账单相关 =====
export interface BillBase {
  id: number
  billNo: string
  houseId: number
  houseTitle?: string
  userId: number
  userName?: string
  amount: number
  type: '租金' | '水电' | '物业' | '其他'
  dueDate: string
  status: '待支付' | '已支付' | '已逾期'
  createdAt: string
}

// ===== 工单相关 =====
export interface TicketBase {
  id: number
  ticketNo: string
  title: string
  description: string
  type: '报修' | '投诉' | '咨询'
  status: '待受理' | '处理中' | '已完成' | '已关闭'
  priority: '低' | '中' | '高'
  assignee?: string
  creatorId: number
  createdAt: string
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

// ===== 导出格式 =====
export interface ExportRow {
  [key: string]: string | number
}

export function generateCsv(rows: ExportRow[], headers?: string[]): string {
  const h = headers || (rows.length > 0 ? Object.keys(rows[0]) : [])
  const csvRows = [h.join(','), ...rows.map(r => h.map(k => `"${String(r[k] ?? '')}"`).join(','))]
  return csvRows.join('\n')
}
