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
  gender?: number // 0 保密 / 1 男 / 2 女
  email?: string
}

// 角色中文名
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

export type SmsType = 'register' | 'reset' | 'change_phone' | 'change_pwd'

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
    isTenant: (s) => s.user?.role === 'tenant',
    isLandlord: (s) => s.user?.role === 'landlord',
    isAdmin: (s) => s.user?.role === 'admin' || s.user?.role === 'agent',
  },
  actions: {
    async login(credentials: { phone: string; pwd: string; code?: string }) {
      const res = await apiLogin(credentials)
      if (res.code === 0 && res.data) {
        this.token = res.data.token
        this.refreshToken = res.data.refreshToken
        this.user = res.data.user
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          token: this.token,
          refreshToken: this.refreshToken,
          user: this.user
        }))
        return { success: true, user: this.user }
      }
      return { success: false, message: res.message }
    },
    async register(data: { phone: string; pwd: string; code: string; name?: string }) {
      const res = await apiRegister(data)
      if (res.code === 0) {
        return { success: true }
      }
      return { success: false, message: res.message }
    },
    logout() {
      this.token = ''
      this.refreshToken = ''
      this.user = null
      localStorage.removeItem(STORAGE_KEY)
    },
    async refreshToken() {
      if (!this.refreshToken) return false
      // TODO: 实现刷新 token 逻辑
      return false
    },
    initFromStorage() {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.token = parsed.token
          this.refreshToken = parsed.refreshToken
          this.user = parsed.user
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  }
})
