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

export interface OrderDetail extends OrderItem {
  roomId?: number
  rentType?: string
  startDate?: string
  endDate?: string
  payTime?: string
  checkinTime?: string
  tenantId?: number
  tenantName?: string
  tenantPhone?: string
  landlordId?: number
  landlordName?: string
  remark?: string
}

export interface StatusLog {
  id: number
  fromStatus: string
  toStatus: string
  operator: string
  remark?: string
  createTime: string
}

export interface RentPeriod {
  periods: { label: string; value: string }[]
}

// ===== 订单接口 =====

/** 我的订单列表（租客） */
export const getMyOrders = (status?: string) =>
  get<OrderList>('/order/my', status ? { status } : undefined)

/** 房东订单列表 */
export const getLandlordOrders = (status?: string) =>
  get<OrderList>('/order/landlord', status ? { status } : undefined)

/** 订单列表（通用） */
export const getOrderList = (query?: Record<string, unknown>) => get<OrderList>('/order', query)

/** 获取订单详情 */
export const getOrderDetail = (id: number) => get<OrderDetail>(`/order/${id}`)

/** 创建订单 */
export const createOrder = (data: {
  houseId: number
  roomId?: number
  rentType: string
  amount: number
  startDate: string
  endDate: string
}) => post('/order', data)

/** 更新订单 */
export const updateOrder = (id: number, data: Partial<OrderDetail>) =>
  post(`/order/${id}`, data)

/** 订单支付 */
export const payOrder = (orderId: number) => post<PayResult>(`/order/${orderId}/pay`)

/** 取消订单 */
export const cancelOrder = (id: number) => post(`/order/${id}/cancel`)

/** 入住办理 */
export const checkinOrder = (id: number) => post(`/order/${id}/checkin`)

/** 续租 */
export const renewOrder = (id: number, data: { endDate: string }) =>
  post(`/order/${id}/renew`, data)

/** 转租 */
export const subleaseOrder = (id: number, data: { tenantPhone: string; remark?: string }) =>
  post(`/order/${id}/sublease`, data)

/** 终止合同 */
export const terminateOrder = (id: number, reason: string) =>
  post(`/order/${id}/terminate`, { reason })

/** 查询订单状态变更日志 */
export const getOrderStatusLog = (id: number) =>
  get<{ list: StatusLog[]; total: number }>(`/order/${id}/status-log`)

/** 查询可租期 */
export const getRentPeriod = (houseId: number) =>
  get<RentPeriod>('/order/rent-period', { houseId })

/** 房东新增订单 */
export const createLandlordOrder = (data: Record<string, unknown>) =>
  post('/landlord/orders', data)
