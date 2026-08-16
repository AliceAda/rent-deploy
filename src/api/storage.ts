import { get } from './http'

// ===== 存储接口（与后端 StorageController 对齐） =====

export interface PresignQuery {
  ownerId: number
  bizType: string
  objectKey: string
}

/** 获取对象存储预签名直传 URL */
export const getPresignUrl = (query: PresignQuery) => get<string>('/storage/presign', { ...query })
