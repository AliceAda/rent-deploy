import { get, post } from './http'

// ===== 类型定义（与后端 MyWorkOrderVO / RepairDTO 对齐） =====

export interface WorkOrderItem {
  ticketId: number
  type: string
  title: string
  status: string
  createTime: string
  // 平台/房东侧展示字段（可选）
  user?: string
  houseTitle?: string
  content?: string
  handler?: string
  handleResult?: string
  closedAt?: string
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

/** 平台/房东工作台：全部工单列表（含实名处理） */
export const getWorkOrders = (status?: string) =>
  get<{ list: WorkOrderItem[]; total: number }>('/workorder/list', status ? { status } : undefined)

/** 处理工单（更新状态 + 处理备注/结果） */
export const handleWorkOrder = (id: number, data: { status: string; handleResult?: string }) =>
  post(`/workorder/${id}/handle`, data)
