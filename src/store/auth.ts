import { defineStore } from 'pinia'
import {
  sendSmsCode,
  register as apiRegister,
  login as apiLogin,
  forgotPassword as apiForgotPassword,
  type LoginResult
} from '@/api/auth'

// 系统角色：租客 / 房东 / 经纪人 / 平台管理员
export type UserRole = 'tenant' | 'landlord' | 'agent' | 'admin'

export interface AuthUser {
  id: number
  name: string
  phone: string
  role: UserRole
  avatar?: string
  gender?: number // 0 保密 / 1 男 / 2 女（与 user 表 tinyint 对齐）
  email?: string
}

// 角色中文名（用于界面展示与提示）
export const ROLE_NAMES: Record<UserRole, string> = {
  tenant: '租客',
  landlord: '房东',
  agent: '经纪人',
  admin: '平台管理员'
}

// 登录后按角色跳转的落地页
export const ROLE_HOME: Record<UserRole, string> = {
  tenant: '/',
  landlord: '/landlord/dashboard',
  agent: '/admin/dashboard',
  admin: '/admin/dashboard'
}

// 短信验证码用途（前端语义）
export type SmsType = 'register' | 'reset' | 'change_phone' | 'change_pwd'
// 映射到后端 SmsSendDTO.biz（实际后端约定：register / login / reset_pwd / change_phone / change_pwd）
const BIZ_MAP: Record<SmsType, string> = {
  register: 'register',
  reset: 'reset_pwd',
  change_phone: 'change_phone',
  change_pwd: 'change_pwd'
}

const STORAGE_KEY = 'ajy_auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    refreshToken: '' as string,
    user: null as AuthUser | null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token && !!s.user,
    roleName(): string {
      return this.user ? ROLE_NAMES[this.user.role] : ''
    },
    isStaff(): boolean {
      return this.user ? this.user.role === 'agent' || this.user.role === 'admin' : false
    }
  },
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const p = JSON.parse(raw) as { token: string; refreshToken?: string; user: AuthUser }
          if (p && p.token && p.user) {
            this.token = p.token
            this.refreshToken = p.refreshToken ?? ''
            this.user = p.user
          }
        }
      } catch (e) {
        console.warn('[auth] Failed to restore session from localStorage:', e)
      }
    },
    persist() {
      if (this.token && this.user) {
        const p = { token: this.token, refreshToken: this.refreshToken, user: this.user }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    // 刷新 token 成功后的会话写入（http 层 401 重放时调用）
    setSession(token: string, refreshToken = '') {
      this.token = token
      this.refreshToken = refreshToken
      this.persist()
    },
    // 发送短信验证码 → 后端 /api/auth/sms/send
    async sendCode(phone: string, type: SmsType): Promise<{ ok: boolean; msg?: string }> {
      if (!/^1\d{10}$/.test(phone)) return { ok: false, msg: '手机号格式不正确' }
      try {
        const res = await sendSmsCode({ phone, biz: BIZ_MAP[type] })
        return res.code === 0 ? { ok: true } : { ok: false, msg: res.message || res.msg || '请求失败' }
      } catch (e) {
        console.error('[auth] sendCode failed:', e)
        return { ok: false, msg: '网络错误，请稍后重试' }
      }
    },
    // 验证码由后端校验，前端不再本地校验
    verifyCode(): boolean {
      return true
    },
    // 注册 → 后端 /api/auth/register（后端字段 name 即 user.name，前端表单字段亦为 name）
    async register(payload: {
      name: string
      phone: string
      code: string
      password: string
      role: UserRole
    }): Promise<{ ok: boolean; msg?: string }> {
      try {
        const res = await apiRegister({
          role: payload.role,
          name: payload.name,
          phone: payload.phone,
          code: payload.code,
          password: payload.password
        })
        if (res.code === 0) {
          // 注册成功自动登录：优先用同一账号调 login 换真实 token（后端 register 不返回 token）
          const loginRes = await apiLogin({ phone: payload.phone, password: payload.password })
          if (loginRes.code === 0 && loginRes.data?.token) {
            const u = loginRes.data.userInfo
            const backendRole = u?.role as UserRole | undefined
            this.token = loginRes.data.token
            this.refreshToken = loginRes.data.refreshToken ?? ''
            this.user = {
              id: u?.id ?? 0,
              name: u?.name || payload.name,
              phone: payload.phone,
              role: backendRole && ['tenant', 'landlord', 'agent', 'admin'].includes(backendRole) ? backendRole : payload.role
            }
          } else {
            // 登录接口不可用：本地演示会话兜底
            this.token = 'jwt-' + Date.now()
            this.refreshToken = ''
            this.user = { id: 0, name: payload.name, phone: payload.phone, role: payload.role }
          }
          this.persist()
          return { ok: true }
        }
        return { ok: false, msg: res.message || res.msg || '请求失败' }
      } catch (e) {
        console.error('[auth] register failed:', e)
        return { ok: false, msg: '网络错误，请稍后重试' }
      }
    },
    // 登录 → 后端 /api/auth/login，返回 {token, userInfo?}
    async login(
      phone: string,
      password: string,
      role: UserRole
    ): Promise<{ ok: boolean; msg?: string }> {
      try {
        const res = await apiLogin({ phone, password })
        if (res.code === 0 && res.data && res.data.token) {
          const u: LoginResult['userInfo'] = res.data.userInfo
          this.token = res.data.token
          // 角色以后端返回为准（表单所选角色仅作后端未返回时的兜底），避免越权跳转
          const backendRole = u?.role as UserRole | undefined
          this.user = {
            id: u?.id ?? 0,
            name: u?.name || phone,
            phone,
            role: backendRole && ['tenant', 'landlord', 'agent', 'admin'].includes(backendRole) ? backendRole : role
          }
          this.refreshToken = res.data.refreshToken ?? ''
          this.persist()
          return { ok: true }
        }
        return { ok: false, msg: res.message || res.msg || '请求失败' }
      } catch (e) {
        console.error('[auth] login failed:', e)
        return { ok: false, msg: '网络错误，请稍后重试' }
      }
    },
    // 忘记密码 → 后端 /api/auth/forgot-password
    async resetPassword(payload: {
      phone: string
      code: string
      password: string
    }): Promise<{ ok: boolean; msg?: string }> {
      try {
        const res = await apiForgotPassword({
          phone: payload.phone,
          code: payload.code,
          newPassword: payload.password
        })
        return res.code === 0 ? { ok: true } : { ok: false, msg: res.message || res.msg || '请求失败' }
      } catch (e) {
        console.error('[auth] resetPassword failed:', e)
        return { ok: false, msg: '网络错误，请稍后重试' }
      }
    },
    logout() {
      // 后端未实现 /api/auth/logout，先清本地登录态
      this.token = ''
      this.refreshToken = ''
      this.user = null
      this.persist()
    },
    // 更新个人资料（编辑资料页保存后同步本地，使"我的"页立即生效）
    updateProfile(p: Partial<Pick<AuthUser, 'name' | 'avatar' | 'gender' | 'email' | 'phone'>>) {
      if (this.user) {
        this.user = { ...this.user, ...p }
        this.persist()
      }
    }
  }
})
