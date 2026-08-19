// ===== 用户端扩展接口 =====

import { get, post, put, del } from './http'

// 邀请记录
export interface InviteRecord {
  id: number
  inviteCode: string
  inviterId: number
  inviteeId: number
  inviteeName: string
  inviteePhone: string
  reward: number
  status: '待使用' | '已使用' | '已过期'
  usedAt?: string
  createdAt: string
}

export const getMyInvites = (params?: { page?: number; size?: number }) =>
  get<{ list: InviteRecord[]; total: number }>('/user/invites', params)

export const getInviteCode = () => get<{ code: string; expiresAt: string }>('/user/invite/code')

// 入住记录
export interface CheckinRecord {
  id: number
  orderId: number
  orderNo: string
  houseId: number
  houseTitle: string
  checkinDate: string
  checkoutDate?: string
  deposit: number
  status: '入住中' | '已退租'
  createdAt: string
}

export const getMyCheckins = (params?: { page?: number; size?: number }) =>
  get<{ list: CheckinRecord[]; total: number }>('/user/checkins', params)

// 押金记录
export interface DepositRecord {
  id: number
  orderId: number
  orderNo: string
  amount: number
  type: '收押金' | '退押金'
  status: '待结算' | '已完结'
  reason?: string
  createdAt: string
  settledAt?: string
}

export const getMyDeposits = (params?: { page?: number; size?: number }) =>
  get<{ list: DepositRecord[]; total: number }>('/user/deposits', params)

// 账单列表（租客）
export interface TenantBill {
  id: number
  billNo: string
  houseId: number
  houseTitle: string
  amount: number
  type: '租金' | '水电' | '物业' | '其他'
  dueDate: string
  status: '待支付' | '已支付' | '已逾期'
  createdAt: string
}

export const getMyBills = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: TenantBill[]; total: number }>('/user/bills', params)

// 支付记录
export interface PaymentRecord {
  id: number
  paymentNo: string
  orderId: number
  orderNo: string
  amount: number
  channel: '微信' | '支付宝' | '银行卡' | '余额'
  status: '待支付' | '已支付' | '已退款' | '退款中' | '失败'
  paidAt?: string
  createdAt: string
}

export const getMyPayments = (params?: { page?: number; size?: number }) =>
  get<{ list: PaymentRecord[]; total: number }>('/user/payments', params)

// 退款记录
export interface RefundRecord {
  id: number
  refundNo: string
  orderId: number
  orderNo: string
  amount: number
  reason: string
  status: '待处理' | '已处理' | '已拒绝'
  createdAt: string
  processedAt?: string
}

export const getMyRefunds = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: RefundRecord[]; total: number }>('/user/refunds', params)

// 信用分
export interface CreditInfo {
  userId: number
  score: number
  level: '极好' | '优秀' | '良好' | '一般' | '较差'
  history: Array<{
    date: string
    score: number
    reason: string
  }>
  rules: Array<{
    name: string
    description: string
    weight: number
  }>
}

export const getMyCredit = () => get<CreditInfo>('/user/credit')

// 发票申请
export interface InvoiceApply {
  id: number
  invoiceNo: string
  title: string
  taxNo: string
  amount: number
  type: '电子发票' | '纸质发票'
  status: '待开具' | '已开具' | '已邮寄' | '已作废'
  mailAddress?: string
  mailContact?: string
  mailPhone?: string
  createdAt: string
  sentAt?: string
}

export const applyInvoice = (data: { orderId: number; title: string; taxNo: string; type: string; mailAddress?: string; mailContact?: string; mailPhone?: string }) =>
  post('/user/invoice', data)

export const getMyInvoices = (params?: { page?: number; size?: number }) =>
  get<{ list: InvoiceApply[]; total: number }>('/user/invoices', params)

// 地址管理扩展
export interface AddressItem {
  id: number
  contactName: string
  phone: string
  provinceId: number
  cityId: number
  districtId: number
  detail: string
  tag: ' home' | 'company' | 'other'
  isDefault: boolean
  createdAt: string
}

export const getMyAddresses = () => get<AddressItem[]>('/user/address')
export const createAddress = (data: Partial<AddressItem>) => post('/user/address', data)
export const updateAddress = (id: number, data: Partial<AddressItem>) => put(`/user/address/${id}`, data)
export const setDefaultAddress = (id: number) => put(`/user/address/${id}/default`, {})
export const deleteAddress = (id: number) => del(`/user/address/${id}`)
