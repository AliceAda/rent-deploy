// ===== 房东端接口 =====

import { get, post, put, del } from './http'

// 房东资料
export interface LandlordProfile {
  id: number
  name: string
  phone: string
  realName?: string
  idCard?: string
  bankCard?: string
  bankName?: string
  avatar?: string
  rating?: number
  totalOrders?: number
  totalHouses?: number
  joinDays?: number
}

export const getLandlordProfile = () => get<LandlordProfile>('/landlord/profile')
export const updateLandlordProfile = (data: Partial<LandlordProfile>) => put('/landlord/profile', data)

// 账单列表
export interface LandlordBill {
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

export const getLandlordBills = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: LandlordBill[]; total: number }>('/landlord/bills', params)

// 账单详情
export const getLandlordBillDetail = (id: number) => get<LandlordBill>(`/landlord/bills/${id}`)

// 生成月度账单
export const generateMonthlyBill = (data: { month: string; houseId?: number }) =>
  post('/landlord/bills/generate', data)

// 合同列表
export interface LandlordContract {
  id: number
  contractNo: string
  houseId: number
  houseTitle: string
  tenantId: number
  tenantName: string
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  status: '草稿' | '生效中' | '已到期' | '已终止'
  createdAt: string
}

export const getLandlordContracts = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: LandlordContract[]; total: number }>('/landlord/contracts', params)

// 合同详情
export const getLandlordContractDetail = (id: number) => get<LandlordContract>(`/landlord/contracts/${id}`)

// 工单列表
export interface LandlordWorkOrder {
  id: number
  ticketNo: string
  title: string
  type: '报修' | '投诉' | '咨询'
  status: '待受理' | '处理中' | '已完成' | '已关闭'
  priority: '低' | '中' | '高'
  createdAt: string
  completedAt?: string
}

export const getLandlordWorkOrders = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: LandlordWorkOrder[]; total: number }>('/landlord/workorders', params)

// 工单详情
export const getLandlordWorkOrderDetail = (id: number) => get<LandlordWorkOrder>(`/landlord/workorders/${id}`)

// 提现记录
export interface LandlordWithdraw {
  id: number
  withdrawNo: string
  amount: number
  bankCard: string
  bankName: string
  status: '待审核' | '已打款' | '已拒绝'
  createdAt: string
  processedAt?: string
}

export const getLandlordWithdraws = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: LandlordWithdraw[]; total: number }>('/landlord/withdraws', params)

// 提现申请
export const applyWithdraw = (data: { amount: number; bankCard: string; bankName: string }) =>
  post('/landlord/withdraw', data)

// 房东统计
export interface LandlordStats {
  totalHouses: number
  totalContracts: number
  totalOrders: number
  totalIncome: number
  pendingWithdraw: number
  expiringContracts: number
  pendingRepairs: number
}

export const getLandlordStats = () => get<LandlordStats>('/landlord/stats')
