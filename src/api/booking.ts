import { get, post } from './http'

// ===== 类型定义（与后端 BookingVO 对齐） =====

export interface BookingItem {
  id: number
  houseId: number
  status: string
  appointmentTime: string
  remark?: string
}

// ===== 预约接口 =====

/** 我的预约列表 */
export const getMyBookings = () => get<{ list: BookingItem[]; total: number }>('/booking/my')

/** 取消预约 */
export const cancelBooking = (id: number) => post(`/booking/${id}/cancel`)
