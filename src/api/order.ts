import { get, post } from './http'

// ===== 类型定义（与后端 OrderVO / OrderListVO / PayResultVO 对齐） =====

export interface OrderItem {
  orderId: number
  orderNo?: string
  houseId: number
  title: string
  tenant?: string
  amount: number
  status: string
  createTime: string
}

export interface OrderList {
  list: OrderItem[]
  total: number
}

export interface PayResult {
  payUrl?: string
}

// ===== 订单接口 =====

/** 我的订单列表（租客） */
export const getMyOrders = (status?: string) =>
  get<OrderList>('/order/my', status ? { status } : undefined)

/** 房东订单列表 */
export const getLandlordOrders = (status?: string) =>
  get<OrderList>('/order/landlord', status ? { status } : undefined)

/** 订单支付 */
export const payOrder = (orderId: number) => post<PayResult>(`/order/${orderId}/pay`)
