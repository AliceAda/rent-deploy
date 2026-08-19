import { get } from './http'

// ===== 类型定义（与后端 PointsVO / MyCouponVO 对齐） =====

export interface PointsInfo {
  points: number
  level: string
}

export interface CouponItem {
  id: number
  name: string
  amount: number
  threshold: number
  expireAt: string
  status: string // unused/used/expired
}

export interface CouponList {
  list: CouponItem[]
  total: number
}

// ===== 积分 / 优惠券接口 =====

/** 我的积分 */
export const getMyPoints = () => get<PointsInfo>('/user/points')

/** 我的优惠券 */
export const getMyCoupons = () => get<CouponList>('/user/coupon')
