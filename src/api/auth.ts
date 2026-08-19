import { get, post } from './http'

// ===== 类型定义（与后端 AuthController DTO/VO 对齐） =====

export interface SmsSendData {
  phone: string
  biz: string // register / login / reset_pwd / change_phone / change_pwd
}

export interface RegisterData {
  role: string
  name: string
  phone: string
  code: string
  password: string
}

export interface LoginData {
  phone: string
  password: string
}

export interface ForgotPwdData {
  phone: string
  code: string
  newPassword: string
}

export interface LoginResult {
  token?: string
  refreshToken?: string
  userInfo?: {
    id: number
    name: string
    phone: string
    role: string
    avatar?: string
    gender?: number
    email?: string
  }
  expireIn?: number
}

// ===== 认证接口 =====

/** 发送短信验证码 */
export const sendSmsCode = (data: SmsSendData) => post('/auth/sms/send', data)

/** 注册 */
export const register = (data: RegisterData) => post('/auth/register', data)

/** 登录 */
export const login = (data: LoginData) => post<LoginResult>('/auth/login', data)

/** 忘记密码 */
export const forgotPassword = (data: ForgotPwdData) => post('/auth/forgot-password', data)

/** 获取当前登录用户信息（用于登录态恢复） */
export const getAuthUser = () => get<LoginResult['userInfo']>('/user/me')
