import { get, post, put, del } from './http'

// ===== 类型定义 =====

export interface ContractItem {
  id: number
  contractNo: string
  houseId: number
  houseTitle?: string
  tenantId?: number
  tenantName?: string
  landlordId?: number
  landlordName?: string
  status: string
  startDate?: string
  endDate?: string
  rentAmount?: number
  depositAmount?: number
  signedAt: string
  terminatedAt?: string
}

export interface ContractDetail extends ContractItem {
  content?: string
  templateId?: number
  remark?: string
}

export interface ContractAttachment {
  id: number
  contractId: number
  name: string
  url: string
  type: string
  createTime: string
}

export interface SignLog {
  id: number
  action: string
  operator: string
  remark?: string
  createTime: string
}

export interface ContractTemplate {
  id: number
  name: string
  type: string
  content: string
  status: string
  createTime: string
}

// ===== 合同接口 =====

/** 我的合同列表 */
export const getMyContracts = () => get<{ list: ContractItem[]; total: number }>('/contract/my')

/** 房东合同列表 */
export const getLandlordContracts = () =>
  get<{ list: ContractItem[]; total: number }>('/contract/landlord')

/** 合同详情 */
export const getContractDetail = (id: number) => get<ContractDetail>(`/contract/${id}`)

/** 更新合同 */
export const updateContract = (id: number, data: Partial<ContractDetail>) =>
  put(`/contract/${id}`, data)

/** 签署合同 */
export const signContract = (data: { orderId: number; templateId?: number }) =>
  post('/contract/sign', data)

/** 合同续租 */
export const renewContract = (data: { contractId: number; endDate: string }) =>
  post('/contract/renew', data)

/** 终止合同 */
export const terminateContract = (id: number, reason: string) =>
  post(`/contract/${id}/terminate`, { reason })

/** 查询合同附件 */
export const getContractAttachments = (id: number) =>
  get<{ list: ContractAttachment[]; total: number }>(`/contract/${id}/attachments`)

/** 新增合同附件 */
export const addContractAttachment = (id: number, data: { name: string; url: string; type: string }) =>
  post(`/contract/${id}/attachments`, data)

/** 查询合同签约记录 */
export const getContractSignLog = (id: number) =>
  get<{ list: SignLog[]; total: number }>(`/contract/${id}/sign-log`)

// ===== 合同模板接口 =====

/** 查询合同模板列表 */
export const getContractTemplates = () =>
  get<{ list: ContractTemplate[]; total: number }>('/contract/template')

/** 获取合同模板详情 */
export const getContractTemplateDetail = (id: number) =>
  get<ContractTemplate>(`/contract/template/${id}`)

/** 更新合同模板 */
export const updateContractTemplate = (id: number, data: Partial<ContractTemplate>) =>
  put(`/contract/template/${id}`, data)

/** 删除合同模板 */
export const deleteContractTemplate = (id: number) => del(`/contract/template/${id}`)
