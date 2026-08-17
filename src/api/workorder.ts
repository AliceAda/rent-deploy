import { get, post, put } from './http'

// ===== 类型定义 =====

export interface WorkOrderItem {
  ticketId: number
  type: string
  title: string
  status: string
  createTime: string
  user?: string
  houseTitle?: string
  content?: string
  handler?: string
  handleResult?: string
  closedAt?: string
  houseId?: number
  images?: string[]
  priority?: string
}

export interface WorkOrderLog {
  id: number
  action: string
  operator: string
  fromStatus?: string
  toStatus?: string
  remark?: string
  createTime: string
}

export interface RepairSubmit {
  type: string
  houseId?: number
  title: string
  content: string
}

// ===== 工单接口 =====

/** 我的工单列表 */
export const getMyWorkOrders = () => get<{ list: WorkOrderItem[]; total: number }>('/workorder/my')

/** 提交报修/投诉 */
export const submitRepair = (data: RepairSubmit) => post('/workorder/repair', data)

/** 报修工单列表 */
export const getRepairOrders = (status?: string) =>
  get<{ list: WorkOrderItem[]; total: number }>('/workorder/repair', status ? { status } : undefined)

/** 全部工单列表 */
export const getWorkOrders = (status?: string) =>
  get<{ list: WorkOrderItem[]; total: number }>('/workorder/list', status ? { status } : undefined)

/** 纠纷工单列表 */
export const getDisputeOrders = () =>
  get<{ list: WorkOrderItem[]; total: number }>('/workorder/dispute')

/** 获取工单详情 */
export const getWorkOrderDetail = (id: number) => get<WorkOrderItem>(`/workorder/${id}`)

/** 更新工单 */
export const updateWorkOrder = (id: number, data: Partial<WorkOrderItem>) =>
  put(`/workorder/${id}`, data)

/** 处理工单 */
export const handleWorkOrder = (id: number, data: { status: string; handleResult?: string }) =>
  post(`/workorder/${id}/handle`, data)

/** 取消工单 */
export const cancelWorkOrder = (id: number, reason?: string) =>
  post(`/workorder/${id}/cancel`, { reason })

/** 查询工单处理日志 */
export const getWorkOrderLog = (id: number) =>
  get<{ list: WorkOrderLog[]; total: number }>(`/workorder/${id}/log`)

// ===== 后台工单接口 =====

/** 分配工单 */
export const assignTicket = (id: number, handlerId: number) =>
  put(`/admin/ticket/${id}/assign`, { handlerId })

/** 关闭工单 */
export const closeTicket = (id: number, remark?: string) =>
  put(`/admin/ticket/${id}/close`, { remark })

/** 重开工单 */
export const reopenTicket = (id: number, remark?: string) =>
  put(`/admin/ticket/${id}/reopen`, { remark })
