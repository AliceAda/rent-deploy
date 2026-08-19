/**
 * 关联数据查询接口
 * 提供表之间的关联查询能力
 */

import { get } from './http'

// ===== 房源关联查询 =====

/**
 * 获取房源详情（包含关联数据）
 */
export interface HouseDetail extends HouseItem {
  images?: HouseImage[]
  facilities?: FacilityItem[]
  tags?: TagItem[]
  reviews?: ReviewItem[]
  collectCount?: number
  avgScore?: number
  landlord?: UserInfo
  agent?: AgentItem
}

export const getHouseDetail = (id: number) => 
  get<HouseDetail>(`/house/${id}/detail`)

// ===== 订单关联查询 =====

export interface OrderDetail extends OrderItem {
  house?: HouseItem
  tenant?: UserInfo
  landlord?: UserInfo
  agent?: AgentItem
  payments?: PaymentItem[]
  contract?: ContractItem
}

export const getOrderDetail = (id: number) => 
  get<OrderDetail>(`/order/${id}/detail`)

// ===== 合同关联查询 =====

export interface ContractDetail extends ContractItem {
  house?: HouseItem
  tenant?: UserInfo
  landlord?: UserInfo
  agent?: AgentItem
  template?: ContractTemplate
  attachments?: ContractAttachment[]
  signLogs?: SignLog[]
  statusLogs?: StatusLog[]
}

export const getContractDetail = (id: number) => 
  get<ContractDetail>(`/contract/${id}/detail`)

// ===== 用户关联查询 =====

export interface UserDetail extends UserInfo {
  roles?: RoleItem[]
  addresses?: AddressItem[]
  contracts?: ContractItem[]
  orders?: OrderItem[]
  bookings?: BookingItem[]
  reviews?: ReviewItem[]
  points?: PointsInfo
  coupons?: CouponItem[]
}

export const getUserDetail = (id: number) => 
  get<UserDetail>(`/user/${id}/detail`)

// ===== 房东关联查询 =====

export interface LandlordDetail extends UserInfo {
  houses?: HouseItem[]
  contracts?: ContractItem[]
  orders?: OrderItem[]
  bills?: BillItem[]
  bookings?: BookingItem[]
  withdraws?: WithdrawItem[]
  stats?: LandlordStats
}

export const getLandlordDetail = (id: number) => 
  get<LandlordDetail>(`/landlord/${id}/detail`)

// ===== 经纪人关联查询 =====

export interface AgentDetail extends AgentItem {
  store?: AgentStore
  houses?: HouseItem[]
  orders?: OrderItem[]
  contracts?: ContractItem[]
  stats?: AgentStats
}

export const getAgentDetail = (id: number) => 
  get<AgentDetail>(`/agent/${id}/detail`)

// ===== 预约关联查询 =====

export interface BookingDetail extends BookingItem {
  house?: HouseItem
  tenant?: UserInfo
  landlord?: UserInfo
}

export const getBookingDetail = (id: number) => 
  get<BookingDetail>(`/booking/${id}/detail`)

// ===== 支付关联查询 =====

export interface PaymentDetail extends PaymentItem {
  order?: OrderItem
  user?: UserInfo
  refund?: RefundItem
}

export const getPaymentDetail = (id: number) => 
  get<PaymentDetail>(`/pay/${id}/detail`)

// ===== 工单关联查询 =====

export interface TicketDetail extends TicketItem {
  creator?: UserInfo
  handler?: UserInfo
  attachments?: TicketAttachment[]
  logs?: TicketLog[]
}

export const getTicketDetail = (id: number) => 
  get<TicketDetail>(`/ticket/${id}/detail`)

// ===== 报表关联查询 =====

export interface DashboardStats {
  today: {
    newHouse: number
    newOrder: number
    deal: number
    todo: number
  }
  gmv: {
    labels: string[]
    data: number[]
  }
  stock: {
    name: string
    value: number
  }[]
  funnel: {
    expose: number
    inquiry: number
    visit: number
    sign: number
  }
}

export const getDashboardStats = () => 
  get<DashboardStats>('/admin/statistics/dashboard')
