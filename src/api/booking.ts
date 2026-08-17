import { get, post, put } from './http'

// ===== 类型定义 =====

export interface BookingItem {
  id: number
  houseId: number
  houseTitle?: string
  userId?: number
  userName?: string
  userPhone?: string
  status: string
  appointmentTime: string
  remark?: string
  createTime: string
}

export interface BookingList {
  list: BookingItem[]
  total: number
}

// ===== 预约接口（租客端） =====

/** 我的预约列表 */
export const getMyBookings = () => get<BookingList>('/booking/my')

/** 获取预约详情 */
export const getBookingDetail = (id: number) => get<BookingItem>(`/booking/${id}`)

/** 修改预约 */
export const updateBooking = (id: number, data: Partial<BookingItem>) => put(`/booking/${id}`, data)

/** 取消预约 */
export const cancelBooking = (id: number) => post(`/booking/${id}/cancel`)

/** 提交看房预约 */
export const createBooking = (data: { houseId: number; time?: string; remark?: string }) =>
  post<BookingItem>('/booking', data)

// ===== 预约接口（房东端） =====

/** 查询房东预约列表 */
export const getLandlordBookings = (status?: string) =>
  get<BookingList>('/landlord/bookings', status ? { status } : undefined)

/** 房东新增预约 */
export const createLandlordBooking = (data: Record<string, unknown>) =>
  post('/landlord/bookings', data)

/** 房东确认预约 */
export const confirmBooking = (id: number) => post(`/landlord/booking/${id}/confirm`)

/** 房东拒绝预约 */
export const rejectBooking = (id: number, reason?: string) =>
  post(`/landlord/booking/${id}/reject`, { reason })

/** 查询预约列表（通用） */
export const getBookingList = (query?: Record<string, unknown>) => get<BookingList>('/booking', query)
