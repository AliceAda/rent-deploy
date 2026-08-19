import { get, put } from './http'

// ===== 类型定义（与后端 NotifySettingVO / UserNotifySettingDTO 对齐） =====

export interface NotifySetting {
  sms: boolean
  site: boolean
  booking: boolean
  bill: boolean
  market: boolean
}

// ===== 通知设置接口 =====

/** 查询通知设置 */
export const getNotifySetting = () => get<NotifySetting>('/user/notify-setting')

/** 保存通知设置 */
export const saveNotifySetting = (data: NotifySetting) => put('/user/notify-setting', data)
