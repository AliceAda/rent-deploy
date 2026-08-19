// ===== 管理后台扩展接口 =====

import { get, post, put, del } from './http'

// 楼栋管理
export interface Building {
  id: number
  name: string
  district: string
  community: string
  regionId: number
  totalFloors: number
  totalUnits: number
  status: '正常' | '停用'
  createdAt: string
}

export const getBuildings = (params?: { page?: number; size?: number; district?: string }) =>
  get<{ list: Building[]; total: number }>('/admin/buildings', params)

export const createBuilding = (data: Partial<Building>) => post('/admin/buildings', data)
export const updateBuilding = (id: number, data: Partial<Building>) => put(`/admin/buildings/${id}`, data)
export const deleteBuilding = (id: number) => del(`/admin/buildings/${id}`)

// 区域管理
export interface Region {
  id: number
  name: string
  city: string
  parentIds: string
  level: number
  sort: number
}

export const getRegions = (params?: { city?: string }) => get<Region[]>('/admin/regions', params)
export const createRegion = (data: Partial<Region>) => post('/admin/regions', data)
export const updateRegion = (id: number, data: Partial<Region>) => put(`/admin/regions/${id}`, data)
export const deleteRegion = (id: number) => del(`/admin/regions/${id}`)

// 地铁站点管理
export interface MetroStation {
  id: number
  name: string
  line: string
  city: string
  lng: number
  lat: number
  sort: number
}

export const getMetroStations = (params?: { city?: string; line?: string }) =>
  get<MetroStation[]>('/admin/metros', params)

export const createMetroStation = (data: Partial<MetroStation>) => post('/admin/metros', data)
export const updateMetroStation = (id: number, data: Partial<MetroStation>) => put(`/admin/metros/${id}`, data)
export const deleteMetroStation = (id: number) => del(`/admin/metros/${id}`)

// 兴趣点管理
export interface POI {
  id: number
  name: string
  type: string
  city: string
  district: string
  lng: number
  lat: number
  address: string
}

export const getPOIs = (params?: { city?: string; type?: string }) => get<POI[]>('/admin/pois', params)
export const createPOI = (data: Partial<POI>) => post('/admin/pois', data)
export const updatePOI = (id: number, data: Partial<POI>) => put(`/admin/pois/${id}`, data)
export const deletePOI = (id: number) => del(`/admin/pois/${id}`)

// 设施管理
export interface Facility {
  id: number
  name: string
  category: string
  icon?: string
  sort: number
}

export const getFacilities = (params?: { category?: string }) => get<Facility[]>('/admin/facilities', params)
export const createFacility = (data: Partial<Facility>) => post('/admin/facilities', data)
export const updateFacility = (id: number, data: Partial<Facility>) => put(`/admin/facilities/${id}`, data)
export const deleteFacility = (id: number) => del(`/admin/facilities/${id}`)

// 标签管理
export interface Tag {
  id: number
  name: string
  category: string
  color?: string
  sort: number
}

export const getTags = (params?: { category?: string }) => get<Tag[]>('/admin/tags', params)
export const createTag = (data: Partial<Tag>) => post('/admin/tags', data)
export const updateTag = (id: number, data: Partial<Tag>) => put(`/admin/tags/${id}`, data)
export const deleteTag = (id: number) => del(`/admin/tags/${id}`)

// 活动管理
export interface Activity {
  id: number
  name: string
  type: '新用户' | '邀请' | '租房' | '节日'
  banner?: string
  startTime: string
  endTime: string
  status: '未开始' | '进行中' | '已结束'
  config?: Record<string, any>
}

export const getActivities = (params?: { page?: number; size?: number; type?: string }) =>
  get<{ list: Activity[]; total: number }>('/admin/activities', params)

export const createActivity = (data: Partial<Activity>) => post('/admin/activities', data)
export const updateActivity = (id: number, data: Partial<Activity>) => put(`/admin/activities/${id}`, data)
export const deleteActivity = (id: number) => del(`/admin/activities/${id}`)
export const toggleActivity = (id: number, status: string) => post(`/admin/activities/${id}/toggle`, { status })

// 发票管理
export interface Invoice {
  id: number
  invoiceNo: string
  userId: number
  userName: string
  title: string
  taxNo: string
  amount: number
  status: '待开具' | '已开具' | '已邮寄' | '已作废'
  createdAt: string
  sentAt?: string
}

export const getInvoices = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: Invoice[]; total: number }>('/admin/invoices', params)

export const createInvoice = (data: Partial<Invoice>) => post('/admin/invoices', data)
export const updateInvoice = (id: number, data: Partial<Invoice>) => put(`/admin/invoices/${id}`, data)
export const deleteInvoice = (id: number) => del(`/admin/invoices/${id}`)

// 对账管理
export interface Reconciliation {
  id: number
  batchNo: string
  date: string
  totalAmount: number
  platformFee: number
  landlordAmount: number
  agentAmount: number
  status: '待对账' | '对账中' | '已完成' | '异常'
  createdAt: string
}

export const getReconciliations = (params?: { page?: number; size?: number; date?: string }) =>
  get<{ list: Reconciliation[]; total: number }>('/admin/reconciliations', params)

export const reconcileBatch = (id: number) => post(`/admin/reconciliations/${id}/reconcile`, {})

// 税务管理
export interface TaxRecord {
  id: number
  taxNo: string
  amount: number
  taxRate: number
  taxAmount: number
  status: '待申报' | '已申报' | '已缴纳'
  createdAt: string
}

export const getTaxRecords = (params?: { page?: number; size?: number; status?: string }) =>
  get<{ list: TaxRecord[]; total: number }>('/admin/taxes', params)

export const submitTaxDeclaration = (id: number) => post(`/admin/taxes/${id}/declare`, {})
