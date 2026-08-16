import { get, post } from './http'

// ===== 类型定义（与后端 MyMessageVO 对齐） =====

export interface MessageItem {
  messageId: number
  title: string
  content: string
  read: boolean
  createTime: string
}

// ===== 消息接口 =====

/** 我的消息列表 */
export const getMyMessages = () => get<{ list: MessageItem[]; total: number }>('/message/my')

/** 单条已读 */
export const readMessage = (id: number) => post(`/message/${id}/read`)

/** 全部已读 */
export const readAllMessages = () => post('/message/read-all')
