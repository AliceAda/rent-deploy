import { get, post } from './http'

// ===== 类型定义 =====

export interface PayRecord {
  id: number
  orderNo?: string
  amount: number
  channel: string
  status: string
  createTime: string
}

export interface PayRecordList {
  list: PayRecord[]
  total: number
}

export interface PayOrder {
  id: number
  amount: number
  channel: string
  status: string
  createTime: string
  payTime?: string
}

export interface RefundItem {
  id: number
  orderId: number
  amount: number
  reason: string
  status: string
  createTime: string
}

export interface RefundList {
  list: RefundItem[]
  total: number
}

export interface WithdrawItem {
  id: number
  amount: number
  bankCard?: string
  status: string
  createTime: string
}

export interface WithdrawList {
  list: WithdrawItem[]
  total: number
}

export interface PayMethod {
  id: number
  channel: string
  name: string
  enabled: boolean
}

// ===== 支付接口 =====

/** 创建支付单 */
export const createPay = (data: { orderId: number; channel: string }) =>
  post<{ payUrl?: string; payNo?: string }>('/pay/create', data)

/** 查询支付方式 */
export const getPayMethods = () => get<{ list: PayMethod[]; total: number }>('/pay/methods')

/** 配置支付方式 */
export const savePayMethod = (data: Partial<PayMethod>) => post('/pay/methods', data)

/** 获取支付单详情 */
export const getPayOrderDetail = (id: number) => get<PayOrder>(`/pay/order/${id}`)

/** 我的支付记录 */
export const getMyPayRecords = (page?: number, size?: number) =>
  get<PayRecordList>('/pay/record/my', { page: page || 1, size: size || 20 })

// ===== 退款接口 =====

/** 查询退款列表 */
export const getRefundList = (status?: string) =>
  get<RefundList>('/pay/refund', status ? { status } : undefined)

/** 发起退款 */
export const createRefund = (data: { orderId: number; amount: number; reason: string }) =>
  post('/pay/refund', data)

/** 获取退款详情 */
export const getRefundDetail = (id: number) => get<RefundItem>(`/pay/refund/${id}`)

/** 审批通过退款 */
export const approveRefund = (id: number) => post(`/pay/refund/${id}/approve`)

/** 驳回退款 */
export const rejectRefund = (id: number, reason: string) =>
  post(`/pay/refund/${id}/reject`, { reason })

// ===== 提现接口 =====

/** 查询提现列表 */
export const getWithdrawList = (status?: string) =>
  get<WithdrawList>('/pay/withdraw', status ? { status } : undefined)

/** 发起提现 */
export const createWithdraw = (data: { amount: number; bankCard?: string }) =>
  post('/pay/withdraw', data)

/** 获取提现详情 */
export const getWithdrawDetail = (id: number) => get<WithdrawItem>(`/pay/withdraw/${id}`)

/** 审批通过提现 */
export const approveWithdraw = (id: number) => post(`/pay/withdraw/${id}/approve`)

/** 驳回提现 */
export const rejectWithdraw = (id: number, reason: string) =>
  post(`/pay/withdraw/${id}/reject`, { reason })
