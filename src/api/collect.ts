import { get, post, del } from './http'

// ===== 类型定义（与后端 CollectVO / UserCollectDTO 对齐） =====

export interface CollectItem {
  houseId: number
  title: string
  cover: string
  price: number
  collectTime: string
}

export interface CollectList {
  list: CollectItem[]
  total: number
}

// ===== 收藏接口 =====

/** 我的收藏列表 */
export const getMyCollects = () => get<CollectList>('/user/collect')

/** 收藏房源 */
export const addCollect = (houseId: number) => post('/user/collect', { houseId })

/** 取消收藏 */
export const removeCollect = (houseId: number) => del(`/user/collect/${houseId}`)
