import { get, post, put, del } from './http'

// ===== 类型定义 =====

export interface HouseItem {
  id: number
  title: string
  city: string
  district: string
  community?: string
  addressDetail?: string
  rentType: string
  layout: string
  area: number
  floor: string
  orientation: string
  decoration: string
  price: number
  depositType: string
  depositAmount?: number
  status: string
  source: string
  landlordId: number
  agentId?: number
  description: string
  videoUrl?: string
  coverImage?: string
  views: number
  collectCount: number
  grade: number
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

export interface HouseRoom {
  id: number
  houseId: number
  name: string
  area?: number
  price?: number
  orientation?: string
  status?: string
}

export interface HouseImage {
  id: number
  houseId: number
  url: string
  type: string
  sort?: number
}

export interface PriceHistory {
  date: string
  price: number
}

export interface ScheduleItem {
  id: number
  date: string
  timeSlot: string
  status: string
}

export interface BrowseHistoryItem {
  id: number
  houseId: number
  title: string
  coverImage?: string
  price: number
  city: string
  district: string
  viewTime: string
}

export interface LandlordHouseStats {
  views: number
  collects: number
  orders: number
  inquiries: number
}

// ===== 房源接口（租客端） =====

/** 房源列表 */
export const getHouseList = (query?: Record<string, unknown>) =>
  get<HouseList>('/house/list', query)

/** 房源详情 */
export const getHouseDetail = (id: number) => get<HouseItem>(`/house/${id}`)

/** 房源评价列表 */
export const getHouseReviews = (houseId: number) => get<ReviewList>(`/house/${houseId}/review`)

/** 提交评价 */
export const submitReview = (houseId: number, data: ReviewSubmit) =>
  post(`/house/${houseId}/review`, data)

/** 查询房源价格历史 */
export const getPriceHistory = (id: number) =>
  get<{ list: PriceHistory[]; total: number }>(`/house/${id}/price-history`)

/** 查询房源房间列表 */
export const getHouseRooms = (id: number) =>
  get<{ list: HouseRoom[]; total: number }>(`/house/${id}/rooms`)

/** 查询房源看房日程 */
export const getHouseSchedule = (id: number) =>
  get<{ list: ScheduleItem[]; total: number }>(`/house/${id}/schedule`)

/** 查询房源图片列表 */
export const getHouseImages = (id: number) =>
  get<{ list: HouseImage[]; total: number }>(`/house/${id}/images`)

/** 举报房源 */
export const reportHouse = (data: { houseId: number; reason: string; description?: string }) =>
  post('/house/report', data)

/** 记录房源浏览 */
export const recordView = (houseId: number) => post('/house/view', { houseId })

/** 查询浏览历史 */
export const getBrowseHistory = (page?: number, size?: number) =>
  get<{ list: BrowseHistoryItem[]; total: number }>('/house/view/history', { page: page || 1, size: size || 20 })

// ===== 基础数据接口 =====

/** 查询地区(省/市/区) */
export const getRegions = (parentId?: number) =>
  get('/house/region', parentId ? { parentId } : undefined)

/** 查询地铁线路 */
export const getMetroLines = () => get('/house/metro')

/** 查询周边配套 */
export const getPOIs = (query: Record<string, unknown>) => get('/house/poi', query)

/** 查询楼栋信息 */
export const getBuildings = (query?: Record<string, unknown>) => get('/house/building', query)

/** 查询房源设施 */
export const getFacilities = () => get('/house/facility')

/** 查询房源标签 */
export const getHouseTags = () => get('/house/tag')

// ===== 房源接口（房东端） =====

/** 查询房东全部房源 */
export const getLandlordHouses = (status?: string) =>
  get<HouseList>('/landlord/houses', status ? { status } : undefined)

/** 房东批量新增房源 */
export const createLandlordHouse = (data: Record<string, unknown>) => post('/landlord/houses', data)

/** 更新房源信息 */
export const updateHouse = (id: number, data: Partial<HouseItem>) => put(`/house/${id}`, data)

/** 删除房源 */
export const deleteHouse = (id: number) => del(`/house/${id}`)

/** 新增房源图片 */
export const addHouseImage = (id: number, data: { url: string; type: string }) =>
  post(`/house/${id}/images`, data)

/** 新增房源房间 */
export const addHouseRoom = (id: number, data: Partial<HouseRoom>) => post(`/house/${id}/rooms`, data)

/** 查询房源统计 */
export const getLandlordHouseStats = (id: number) => get<LandlordHouseStats>(`/landlord/house/${id}/stats`)

/** 获取房源状态 */
export const getLandlordHouseStatus = (id: number) => get<{ status: string }>(`/landlord/house/${id}/status`)

/** 修改房源状态 */
export const updateLandlordHouseStatus = (id: number, status: string) =>
  post(`/landlord/house/${id}/status`, { status })

// ===== 收藏接口 =====

/** 查询用户收藏列表 */
export const getMyCollects = () => get<{ list: HouseItem[]; total: number }>('/user/collect')

/** 新增收藏 */
export const addCollect = (houseId: number) => post('/user/collect', { houseId })

/** 取消收藏 */
export const removeCollect = (houseId: number) => del(`/user/collect/${houseId}`)
