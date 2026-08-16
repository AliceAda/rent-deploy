import { get, post } from './http'

// ===== 类型定义（与后端 HouseVO / ReviewVO / ReviewListVO / ReviewDTO 对齐） =====

export interface HouseItem {
  id: number
  title: string
  city: string
  district: string
  community?: string // DB: community（小区名）
  addressDetail?: string // DB: address_detail
  rentType: string // DB: rent_type（整租/合租/公寓）
  layout: string // DB: layout（户型，如 1室1厅）
  area: number // DB: area
  floor: string // DB: floor（如 8/18）
  orientation: string // DB: orientation（朝向）
  decoration: string // DB: decoration（装修）
  price: number // DB: price（月租）
  depositType: string // DB: deposit_type（押一付三）
  depositAmount?: number // DB: deposit_amount
  status: string // DB: status（可租/已租/待审核/违规/已下架）
  source: string // DB: source（房东自发布/经纪人代发）
  landlordId: number // DB: landlord_id
  agentId?: number // DB: agent_id
  description: string // DB: description
  videoUrl?: string // DB: video_url
  coverImage?: string // DB: cover_image
  views: number // DB: views
  collectCount: number // DB: collect_count
  grade: number // DB: grade（评分）
  createdAt?: string
}

export interface HouseList {
  list: HouseItem[]
  total: number
}

export interface ReviewItem {
  id: number
  user: string
  score: number
  content: string
  createTime: string
}

export interface ReviewList {
  list: ReviewItem[]
  total: number
  avgScore: number
}

export interface ReviewSubmit {
  score: number
  content: string
}

// ===== 房源接口 =====

/** 房源列表（租客端公开房源） */
export const getHouseList = (query?: Record<string, unknown>) =>
  get<HouseList>('/house/list', query)

/** 房源详情 */
export const getHouseDetail = (id: number) => get<HouseItem>(`/house/${id}`)

/** 房源评价列表 */
export const getHouseReviews = (houseId: number) => get<ReviewList>(`/house/${houseId}/review`)

/** 提交评价 */
export const submitReview = (houseId: number, data: ReviewSubmit) =>
  post(`/house/${houseId}/review`, data)
