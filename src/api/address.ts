import { get, post, put, del } from './http'

// ===== 类型定义（与后端 UserAddressVO / UserAddressDTO 对齐） =====

export interface AddressItem {
  id: number
  userId?: number
  contactName: string // DB: contact_name
  phone: string // DB: phone
  provinceId?: number // DB: province_id（int，关联 region 表）
  cityId?: number // DB: city_id
  districtId?: number // DB: district_id
  detail: string // DB: detail
  tag?: string // DB: tag（家/公司/其他）
  isDefault: boolean // DB: is_default
  createdAt?: string
}

export interface AddressList {
  list: AddressItem[]
  total: number
}

// ===== 地址接口 =====

/** 我的地址列表 */
export const getMyAddresses = () => get<AddressList>('/user/address')

/** 新增地址 */
export const createAddress = (data: Partial<AddressItem>) => post('/user/address', data)

/** 更新地址 */
export const updateAddress = (id: number, data: Partial<AddressItem>) =>
  put(`/user/address/${id}`, data)

/** 设为默认 */
export const setDefaultAddress = (id: number) => put(`/user/address/${id}/default`, {})

/** 删除地址 */
export const deleteAddress = (id: number) => del(`/user/address/${id}`)
