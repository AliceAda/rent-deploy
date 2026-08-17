import { get, post } from './http'

// ===== 类型定义（与后端 BillVO / BillListVO 对齐） =====

export interface BillItem {
  id: number
  billNo?: string
  houseId: number
  houseTitle?: string
  title: string // 账单名称（如 2026-05租金）
  type: string // 租金 / 物业费 / 水电费 / 押金 / 其他
  amount: number
  status: string // 待支付 / 已支付 / 已逾期
  period?: string // 账单周期，如 2026-05
  createdAt?: string
  payTime?: string
}

export interface BillList {
  list: BillItem[]
  total: number
}

// ===== 账单接口 =====

/** 我的账单列表（租客） */
export const getMyBills = (status?: string) =>
  get<BillList>('/bill/my', status ? { status } : undefined)

/** 房东账单列表（收款流水） */
export const getLandlordBills = (status?: string) =>
  get<BillList>('/bill/landlord', status ? { status } : undefined)

/** 账单支付 */
export const payBill = (id: number) => post<{ payUrl?: string }>(`/bill/${id}/pay`)