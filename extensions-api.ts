/**
 * 扩展功能模块 - 16张表 API 接口
 * 包含：运营活动、广告管理、纠纷管理、发票管理、财务对账、退租/转租/续租管理等
 */

import { get, post, put, del } from './http'

// ===== 1. 运营活动模块 =====

export interface Activity {
  id: number
  name: string
  type: 'new_user' | 'invite' | 'rent' | 'festival'
  banner?: string
  startTime: string
  endTime: string
  status: 'not_started' | 'active' | 'ended'
  config?: Record<string, any>
  createdAt: string
}

export const getActivities = (params?: { page?: number; size?: number; type?: string }) =>
  get<{ list: Activity[]; total: number }>('/admin/activities', params)

export const createActivity = (data: Partial<Activity>) => post('/admin/activities', data)
export const updateActivity = (id: number, data: Partial<Activity>) => put(`/admin/activities/${id}`, data)
export const deleteActivity = (id: number) => del(`/admin/activities/${id}`)
export const toggleActivity = (id: number, status: string) => post(`/admin/activities/${id}/toggle`, { status })

// ===== 2. 广告管理模块 =====

export interface AdSlot {
  id: number
  name: string
  code: string
  width: number
  height: number
  position: string
  status: number
  createdAt: string
}

export interface AdMaterial {
  id: number
  slotId: number
  title?: string
  image?: string
  url?: string
  startTime?: string
  endTime?: string
  status: 'draft' | 'active' | 'offline'
  sort: number
  createdAt: string
}

export const getAdSlots = () => get<AdSlot[]>('/admin/ad-slots')
export const createAdSlot = (data: Partial<AdSlot>) => post('/admin/ad-slots', data)
export const updateAdSlot = (id: number, data: Partial<AdSlot>) => put(`/admin/ad-slots/${id}`, data)
export const deleteAdSlot = (id: number) => del(`/admin/ad-slots/${id}`)

export const getAdMaterials = (params?: { slotId?: number; status?: string }) =>
  get<{ list: AdMaterial[]; total: number }>('/admin/ad-materials', params)
export const createAdMaterial = (data: Partial<AdMaterial>) => post('/admin/ad-materials', data)
export const updateAdMaterial = (id: number, data: Partial<AdMaterial>) => put(`/admin/ad-materials/${id}`, data)
export const deleteAdMaterial = (id: number) => del(`/admin/ad-materials/${id}`)

// ===== 3. 纠纷管理模块 =====

export interface Dispute {
  id: number
  disputeNo: string
  orderId: number
  orderNo: string
  complainantId: number
  complainantName: string
  respondentId: number
  respondentName: string
  type: 'quality' | 'service' | 'fee' | 'contract'
  title: string
  description: string
  evidence?: string[]
  status: 'pending' | 'investigating' | 'resolved' | 'withdrawn' | 'closed'
  result?: string
  createdAt: string
  resolvedAt?: string
}

export const getDisputes = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: Dispute[]; total: number }>('/admin/disputes', params)

export const getDisputeDetail = (id: number) => get<Dispute>(`/admin/disputes/${id}`)

export const investigateDispute = (id: number, data: { result: string; action?: string }) =>
  post(`/admin/disputes/${id}/investigate`, data)

export const closeDispute = (id: number, data: { remark?: string }) =>
  post(`/admin/disputes/${id}/close`, data)

// ===== 4. 发票管理模块 =====

export interface Invoice {
  id: number
  invoiceNo: string
  userId: number
  userName: string
  title: string
  taxNo: string
  amount: number
  type: 'electronic' | 'paper'
  status: 'pending' | 'issued' | 'mailed' | 'voided'
  mailAddress?: string
  mailContact?: string
  mailPhone?: string
  createdAt: string
  issuedAt?: string
  mailedAt?: string
}

export const getInvoices = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: Invoice[]; total: number }>('/admin/invoices', params)

export const createInvoice = (data: Partial<Invoice>) => post('/admin/invoices', data)
export const updateInvoice = (id: number, data: Partial<Invoice>) => put(`/admin/invoices/${id}`, data)
export const deleteInvoice = (id: number) => del(`/admin/invoices/${id}`)
export const mailInvoice = (id: number, data: { address: string; contact: string; phone: string }) =>
  post(`/admin/invoices/${id}/mail`, data)

// ===== 5. 财务对账模块 =====

export interface Reconciliation {
  id: number
  batchNo: string
  date: string
  totalAmount: number
  platformFee: number
  landlordAmount: number
  agentAmount: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  createdAt: string
  completedAt?: string
}

export const getReconciliations = (params?: { page?: number; size?: number; date?: string }) =>
  get<{ list: Reconciliation[]; total: number }>('/admin/reconciliations', params)

export const reconcileBatch = (id: number) => post(`/admin/reconciliations/${id}/reconcile`, {})

// ===== 6. 税务管理模块 =====

export interface TaxRecord {
  id: number
  taxNo: string
  amount: number
  taxRate: number
  taxAmount: number
  status: 'pending' | 'declared' | 'paid'
  createdAt: string
  declaredAt?: string
  paidAt?: string
}

export const getTaxRecords = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: TaxRecord[]; total: number }>('/admin/taxes', params)

export const submitTaxDeclaration = (id: number) => post(`/admin/taxes/${id}/declare`, {})

// ===== 7. 退租管理模块 =====

export interface Termination {
  id: number
  contractId: number
  contractNo: string
  houseId: number
  houseTitle: string
  tenantId: number
  tenantName: string
  reason: string
  type: 'normal' | 'breach' | 'negotiation'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  refundAmount?: number
  penaltyAmount?: number
  createdAt: string
  completedAt?: string
}

export const getTerminations = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: Termination[]; total: number }>('/admin/terminations', params)

export const processTermination = (id: number, data: { action: string; remark?: string }) =>
  post(`/admin/terminations/${id}/process`, data)

// ===== 8. 转租管理模块 =====

export interface Sublease {
  id: number
  contractId: number
  houseId: number
  houseTitle: string
  originalTenantId: number
  originalTenantName: string
  newTenantId: number
  newTenantName: string
  subleaseDate: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
}

export const getSubleases = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: Sublease[]; total: number }>('/admin/subleases', params)

export const approveSublease = (id: number, data: { remark?: string }) =>
  post(`/admin/subleases/${id}/approve`, data)

export const rejectSublease = (id: number, data: { reason: string }) =>
  post(`/admin/subleases/${id}/reject`, data)

// ===== 9. 续租管理模块 =====

export interface LeaseRenewal {
  id: number
  contractId: number
  contractNo: string
  houseId: number
  houseTitle: string
  tenantId: number
  tenantName: string
  oldEndDate: string
  newStartDate: string
  newEndDate: string
  newMonthlyRent: number
  status: 'pending' | 'approved' | 'rejected' | 'signed'
  createdAt: string
}

export const getRenewals = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: LeaseRenewal[]; total: number }>('/admin/renewals', params)

export const approveRenewal = (id: number, data: { remark?: string }) =>
  post(`/admin/renewals/${id}/approve`, data)

export const rejectRenewal = (id: number, data: { reason: string }) =>
  post(`/admin/renewals/${id}/reject`, data)

// ===== 10. 入住记录模块 =====

export interface CheckinRecord {
  id: number
  orderId: number
  orderNo: string
  houseId: number
  houseTitle: string
  checkinDate: string
  checkoutDate?: string
  deposit: number
  status: 'active' | 'checked_out'
  createdAt: string
  checkedOutAt?: string
}

export const getCheckins = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: CheckinRecord[]; total: number }>('/admin/checkins', params)

export const checkout = (id: number, data: { remark?: string }) =>
  post(`/admin/checkins/${id}/checkout`, data)

// ===== 11. 押金记录模块 =====

export interface DepositRecord {
  id: number
  orderId: number
  orderNo: string
  amount: number
  type: 'collect' | 'return'
  status: 'pending' | 'settled'
  reason?: string
  createdAt: string
  settledAt?: string
}

export const getDeposits = (params?: { page?: number; size?: number; type?: string }) =>
  get<{ list: DepositRecord[]; total: number }>('/admin/deposits', params)

export const settleDeposit = (id: number, data: { action: string; reason?: string }) =>
  post(`/admin/deposits/${id}/settle`, data)

// ===== 12. 房源状态日志模块 =====

export interface HouseAuditLog {
  id: number
  houseId: number
  houseTitle: string
  operatorId: number
  operatorName: string
  action: 'audit_pass' | 'audit_reject' | 'offline' | 'online'
  remark?: string
  createdAt: string
}

export const getHouseAuditLogs = (params?: { page?: number; size?: number; houseId?: number }) =>
  get<{ list: HouseAuditLog[]; total: number }>('/admin/house-audit-logs', params)

// ===== 13. 订单状态日志模块 =====

export interface OrderStatusLog {
  id: number
  orderId: number
  orderNo: string
  operatorId: number
  operatorName: string
  action: string
  fromStatus: string
  toStatus: string
  remark?: string
  createdAt: string
}

export const getOrderStatusLogs = (params?: { page?: number; size?: number; orderId?: number }) =>
  get<{ list: OrderStatusLog[]; total: number }>('/admin/order-status-logs', params)

// ===== 14. 信用日志模块 =====

export interface CreditLog {
  id: number
  userId: number
  userName: string
  scoreChange: number
  currentScore: number
  reason: string
  type: 'positive' | 'negative'
  createdAt: string
}

export const getCreditLogs = (params?: { page?: number; size?: number; userId?: number }) =>
  get<{ list: CreditLog[]; total: number }>('/admin/credit-logs', params)

// ===== 15. 邀请记录模块 =====

export interface InviteRecord {
  id: number
  inviteCode: string
  inviterId: number
  inviterName: string
  inviteeId: number
  inviteeName: string
  inviteePhone: string
  reward: number
  status: 'unused' | 'used' | 'expired'
  usedAt?: string
  createdAt: string
}

export const getInviteRecords = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: InviteRecord[]; total: number }>('/admin/invite-records', params)

export const getUserInvites = () => get<InviteRecord[]>('/user/invites')

// ===== 16. 租期配置模块 =====

export interface RentPeriod {
  id: number
  name: string
  months: number
  discount?: number
  minRent?: number
  maxRent?: number
  status: number
  createdAt: string
}

export const getRentPeriods = () => get<RentPeriod[]>('/admin/rent-periods')
export const createRentPeriod = (data: Partial<RentPeriod>) => post('/admin/rent-periods', data)
export const updateRentPeriod = (id: number, data: Partial<RentPeriod>) => put(`/admin/rent-periods/${id}`, data)
export const deleteRentPeriod = (id: number) => del(`/admin/rent-periods/${id}`)
