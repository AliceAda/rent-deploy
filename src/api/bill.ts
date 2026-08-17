import { get, post, put } from './http'

// ===== 类型定义 =====

export interface BillItem {
  id: number
  billNo?: string
  houseId: number
  houseTitle?: string
  title: string
  type: string
  amount: number
  paid?: number
  status: string
  period?: string
  createdAt?: string
  payTime?: string
  orderId?: number
  tenantId?: number
  tenantName?: string
  remark?: string
}

export interface BillList {
  list: BillItem[]
  total: number
}

// ===== 账单接口（租客端） =====

/** 我的账单列表（租客） */
export const getMyBills = (status?: string) =>
  get<BillList>('/bill/my', status ? { status } : undefined)

/** 账单支付 */
export const payBill = (id: number) => post<{ payUrl?: string }>(`/bill/${id}/pay`)

// ===== 账单接口（房东端） =====

/** 查询房东账单列表 */
export const getLandlordBills = (status?: string) =>
  get<BillList>('/landlord/bills', status ? { status } : undefined)

/** 生成房东账单 */
export const createLandlordBill = (data: {
  houseId: number
  title: string
  type: string
  amount: number
  period: string
  tenantId?: number
}) => post('/landlord/bills', data)

/** 获取房东账单详情 */
export const getLandlordBillDetail = (id: number) => get<BillItem>(`/landlord/bills/${id}`)

/** 更新房东账单 */
export const updateLandlordBill = (id: number, data: Partial<BillItem>) =>
  put(`/landlord/bills/${id}`, data)

/** 房东账单付款 */
export const payLandlordBill = (id: number) => put(`/landlord/bill/${id}/pay`)
