import { get, post, put, del } from './http'

// ===== 类型定义（与后端 DTO/VO 对齐） =====

export interface UpdateProfileData {
  name: string
  avatar?: string
  gender?: number
  email?: string
}

export interface UserProfile {
  name?: string
  avatar?: string
  gender?: number
  email?: string
  phone?: string
  certStatus?: string
}

export interface ChangePhoneData {
  phone: string
  code: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
  code: string
}

export interface RealnameStatus {
  status: string
  realName?: string
  idCardMask?: string
}

export interface RealnameSubmitData {
  realName: string
  idCard: string
}

export interface AccountCancelStatus {
  status: string // 未申请 / 审核中 / 已驳回 / 已注销
  reason?: string
  applyTime?: string
  cancelAt?: string
}

export interface AccountCancelData {
  reason: string
}

// ===== 用户资料 =====

/** 查询当前用户资料 */
export const getUserProfile = () => get<UserProfile>('/user/me')
/** 更新当前用户资料（昵称/头像/性别/邮箱，无需验证码） */
export const updateUserProfile = (data: UpdateProfileData) => put('/user/me', data)

// ===== 修改手机号 / 密码 =====

/** 修改手机号（需新手机号验证码） */
export const changePhone = (data: ChangePhoneData) => post('/user/phone/change', data)
/** 修改密码（需旧密码 + 当前手机号验证码） */
export const changePassword = (data: ChangePasswordData) => post('/user/password/change', data)

// ===== 实名认证 =====

/** 查询实名认证状态 */
export const getRealnameStatus = () => get<RealnameStatus>('/user/realname')
/** 提交实名认证 */
export const submitRealname = (data: RealnameSubmitData) => post('/user/realname', data)

// ===== 账号注销 =====

/** 查询账号注销状态 */
export const getAccountCancelStatus = () => get<AccountCancelStatus>('/user/account-cancel')
/** 申请注销账号 */
export const applyAccountCancel = (data: AccountCancelData) => post('/user/account-cancel', data)
/** 撤销注销申请 */
export const cancelAccountCancel = () => del('/user/account-cancel')
