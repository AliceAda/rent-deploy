import { get } from './http'

// ===== 类型定义（与后端 Contract 实体对齐） =====

export interface ContractItem {
  id: number
  contractNo: string
  houseId: number
  houseTitle?: string
  status: string
  signedAt: string
}

// ===== 合同接口 =====

/** 我的合同列表 */
export const getMyContracts = () => get<{ list: ContractItem[]; total: number }>('/contract/my')

/** 房东合同列表 */
export const getLandlordContracts = () =>
  get<{ list: ContractItem[]; total: number }>('/contract/landlord')

/** 合同详情 */
export const getContractDetail = (id: number) => get<ContractItem>(`/contract/${id}`)
