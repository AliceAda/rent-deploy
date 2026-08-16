import { get, post, put, del } from './http'

// ===== 类型定义（与后端 admin/contract/finance/house/common 各域 VO 对齐） =====

// 内容管理（ContentVO）
export interface ContentItem {
  id: number
  type: string // 公告/资讯/Banner/帮助中心
  title: string
  cover?: string
  body: string
  url?: string
  sort?: number
  status: string // 草稿/已发布
  publishTime?: string
  createdAt?: string
}

// 合同管理（ContractVO）
export interface AdminContract {
  id: number
  contractNo: string
  houseId?: number
  houseTitle: string
  tenantId?: number
  tenantName: string
  landlordId?: number
  landlordName: string
  startDate?: string
  endDate?: string
  monthlyRent?: number
  deposit?: number
  status: string // 待签署/生效中/已到期/已终止
  signedAt?: string
}

// 财务结算（FinanceSettlementVO）
export interface FinanceItem {
  id: number
  settleNo: string
  bizDesc: string
  orderId?: number
  houseId?: number
  totalAmount: number
  platformFee: number
  landlordAmount: number
  agentAmount: number
  settleStatus: string // 冻结/已结算/已提现
  settleDate?: string
  createdAt?: string
}

// 房源管理（HouseVO）
export interface AdminHouse {
  id: number
  title: string
  district?: string
  layout?: string
  area?: number
  price?: number
  source?: string
  status: string // 待审核/可租/已租/已下架/违规
  depositType?: string
  description?: string
}

// 工单管理（TicketVO）
export interface AdminTicket {
  id: number
  ticketNo: string
  type: string // 报修/投诉
  houseId?: number
  houseTitle?: string
  tenantId?: number
  tenantName?: string
  content: string
  status: string // 待分派/处理中/待回访/已关闭
  handler?: string
  createdAt?: string
  closedAt?: string
}

// 交易管理（订单/预约）
export interface AdminOrder {
  id: number
  orderNo: string
  houseTitle?: string
  type: string // 看房预约/预订
  tenantName?: string
  agent?: string
  amount: number
  status: string
  createdAt?: string
}

// 用户管理（User entity）
export interface AdminUser {
  id: number
  name: string
  role: string // 租客/房东/经纪人
  phone: string
  certStatus?: string // 已认证/待审核/未认证
  creditScore?: number
  status: string // 正常/冻结
  regTime?: string
}

// 角色（RoleVO）
export interface RoleItem {
  id?: number
  code?: string
  name: string
  remark?: string
  status?: number
  perms?: string[]
  scope?: string
}

// 管理员账号
export interface AdminUserItem {
  id?: number
  user: string
  role: string
  status: string
  last?: string
}

// 菜单树
export interface MenuItem {
  id: number
  name: string
  path: string
  perm: string
  children?: MenuItem[]
}

// 数据字典（SysDictItemVO）
export interface DictItem {
  id?: number
  type: string
  label: string
  value: string
  remark?: string
}

// 操作日志（OperateLogVO）
export interface LogItem {
  id?: number
  userId?: number
  module: string
  action: string
  ip?: string
  createdAt?: string
}

// 系统参数
export interface SysParam {
  auditHour: number
  feeRate: number
  minImg: number
}

// ===== 内容管理 =====

export const getAdminContents = () => get<ContentItem[]>('/admin/contents')
export const createAdminContent = (data: Partial<ContentItem>) => post('/admin/contents', data)
export const updateAdminContent = (id: number, data: Partial<ContentItem>) =>
  put(`/admin/contents/${id}`, data)
export const publishAdminContent = (id: number) => post(`/admin/contents/${id}/publish`)
export const offlineAdminContent = (id: number) => post(`/admin/contents/${id}/offline`)

// ===== 合同管理 =====

export const getAdminContracts = () => get<AdminContract[]>('/admin/contracts')
export const remindContract = (id: number) => post(`/admin/contracts/${id}/remind`)
export const cancelContract = (id: number) => post(`/admin/contracts/${id}/cancel`)

// ===== 财务结算 =====

export const getAdminFinances = () => get<FinanceItem[]>('/admin/finances')
export const withdrawFinance = (id: number) => post(`/admin/finances/${id}/withdraw`)
export const disputeFinance = (id: number) => post(`/admin/finances/${id}/dispute`)

// ===== 房源管理 =====

export const getAdminHouses = () => get<AdminHouse[]>('/admin/houses')
export const auditHouse = (id: number, status: string) => post('/admin/houses/audit', { id, status })
export const rejectHouse = (id: number, reason: string) => post('/admin/houses/reject', { id, reason })

// ===== 统计 =====

export interface GmvData {
  labels: string[]
  data: number[]
}
export interface StockData {
  name: string
  value: number
}
export const getGmvStat = (dim: string) => get<GmvData>('/admin/statistics/gmv', { dim })
export const getStockStat = () => get<StockData[]>('/admin/statistics/stock')
export const exportStat = (data: { dim: string; range: string }) => post('/admin/statistics/export', data)

// ===== 系统管理 =====

export const getAdminRoles = () => get<RoleItem[]>('/admin/system/roles')
export const createAdminRole = (data: Partial<RoleItem>) => post('/admin/system/roles', data)
export const updateAdminRole = (id: number, data: Partial<RoleItem>) =>
  put(`/admin/system/roles/${id}`, data)
export const deleteAdminRole = (id: number) => del(`/admin/system/roles/${id}`)

export const getAdminUsers = () => get<AdminUserItem[]>('/admin/system/admins')
export const createAdminUser = (data: Partial<AdminUserItem>) => post('/admin/system/admins', data)
export const updateAdminUser = (id: number, data: Partial<AdminUserItem>) =>
  put(`/admin/system/admins/${id}`, data)
export const toggleAdminUser = (id: number, status: string) =>
  post(`/admin/system/admins/${id}/toggle-status`, { status })

export const getAdminMenus = () => get<MenuItem[]>('/admin/system/menus')
export const getAdminDicts = () => get<DictItem[]>('/admin/system/dicts')
export const getAdminLogs = () => get<LogItem[]>('/admin/system/logs')
export const getSysParams = () => get<SysParam>('/admin/system/params')
export const saveSysParams = (data: SysParam) => put('/admin/system/params', data)

// ===== 工单管理 =====

export const getAdminTickets = () => get<AdminTicket[]>('/admin/tickets')
export const assignTicket = (id: number) => post(`/admin/tickets/${id}/assign`)
export const transferTicket = (id: number, handler: string) =>
  post(`/admin/tickets/${id}/transfer`, { handler })
export const visitTicket = (id: number) => post(`/admin/tickets/${id}/visit`)

// ===== 交易管理 =====

export const getAdminOrders = () => get<AdminOrder[]>('/admin/orders')
export const confirmOrder = (id: number) => post(`/admin/orders/${id}/confirm`)
export const refundOrder = (id: number) => post(`/admin/orders/${id}/refund`)

// ===== 用户管理 =====

export const getAdminUserList = () => get<AdminUser[]>('/admin/users')
export const toggleUserStatus = (id: number, status: string) =>
  post(`/admin/users/${id}/toggle-status`, { status })
