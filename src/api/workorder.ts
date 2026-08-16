import { get, post } from './http'

// ===== 类型定义（与后端 MyWorkOrderVO / RepairDTO 对齐） =====

export interface WorkOrderItem {
  ticketId: number
  type: string
  title: string
  status: string
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
