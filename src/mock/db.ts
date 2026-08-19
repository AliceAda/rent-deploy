// ===== 内存数据库：MSW handlers 的单一数据源（模拟后端就绪后的状态） =====
// 结构对齐 src/api 各模块的 DTO/VO 类型；跨端一致性（预约/签约/支付/审核）都在这里联动。

import type { House } from './data'
import type { BookingItem } from '@/api/booking'
import type { OrderDetail } from '@/api/order'
import type { ContractItem, ContractTemplate, ContractAttachment, SignLog } from '@/api/contract'
import type { BillItem } from '@/api/bill'
import type { PayRecord, PayMethod, RefundItem, WithdrawItem, PayOrder } from '@/api/pay'
import type { MessageItem } from '@/api/message'
import type { AddressItem } from '@/api/address'
import type { SessionItem } from '@/api/session'
import type { WorkOrderItem, WorkOrderLog } from '@/api/workorder'
import type { HotKeyword, SearchLog } from '@/api/search'
import type { NotifySetting } from '@/api/notify'
import type { RealnameStatus, AccountCancelStatus } from '@/api/user'
import type { BlacklistItem, RiskRule, RiskRecord, ReportItem } from '@/api/risk'
import type {
  ContentItem, AdminContract, FinanceItem, AdminTicket, AdminOrder, AdminUser,
  RoleItem, AdminUserItem, MenuItem, DictItem, LogItem, SysParam
} from '@/api/admin'
import { houses, myHouses, orders, contracts, tickets, finances, landlordBookings, landlordBills, regions, dashboard } from './data'

// ===== 账号与会话 =====

export interface MockUser {
  id: number
  name: string
  phone: string
  password: string
  role: 'tenant' | 'landlord' | 'agent' | 'admin'
  avatar?: string
  gender?: number
  email?: string
}

// 账号与登录页「演示账号」提示保持一致（密码均为 123456）
export const accounts: MockUser[] = [
  { id: 301, name: '小陈', phone: '13800000001', password: '123456', role: 'tenant' },
  { id: 2, name: '张房东', phone: '13800000002', password: '123456', role: 'landlord' },
  { id: 201, name: '赵中介', phone: '13800000003', password: '123456', role: 'agent' },
  { id: 1, name: '平台管理员', phone: '13800000004', password: '123456', role: 'admin' }
]

// 令牌表持久化：MSW 内存库在页面重载后会重置，若不持久化则刷新即 401 登出。
const TOKEN_KEY = 'ajy_mock_tokens'

function loadTokens(): Map<string, number> {
  const m = new Map<string, number>()
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as [string, number][]
      for (const [t, id] of arr) {
        if (accounts.some((a) => a.id === id)) m.set(t, id)
      }
    }
  } catch {
    /* 忽略损坏数据 */
  }
  return m
}

function persistTokens() {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify([...tokenUsers.entries()]))
  } catch {
    /* 忽略 */
  }
}

const tokenUsers = loadTokens()

export function issueToken(u: MockUser): string {
  const token = 'mock-' + u.id + '-' + Math.random().toString(36).slice(2, 10)
  tokenUsers.set(token, u.id)
  persistTokens()
  return token
}

export function userOf(request: Request): MockUser | undefined {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  return userByToken(token)
}

export function userByToken(token: string): MockUser | undefined {
  const uid = tokenUsers.get(token)
  return accounts.find((u) => u.id === uid)
}

export function userIdOf(request: Request): number | undefined {
  return userOf(request)?.id
}

let seq = 100000
export function nextId(): number {
  return ++seq
}

// ===== 地区（省→市→区，带 id 支持 parentId 逐级查询） =====

interface RegionNode {
  id: number
  name: string
  parentId?: number
}

const regionTree = regions.map((p, pi) => ({
  id: pi + 1,
  name: p.name,
  children: (p.children ?? []).map((c, ci) => ({
    id: (pi + 1) * 100 + ci + 1,
    name: c.name,
    children: (c.children ?? []).map((d, di) => ({
      id: ((pi + 1) * 100 + ci + 1) * 10 + di + 1,
      name: d.name
    }))
  }))
}))

export const regionRows: RegionNode[] = []
for (const p of regionTree) {
  regionRows.push({ id: p.id, name: p.name })
  for (const c of p.children) {
    regionRows.push({ id: c.id, name: c.name, parentId: p.id })
    for (const d of c.children) {
      regionRows.push({ id: d.id, name: d.name, parentId: c.id })
    }
  }
}

// ===== 房源 =====

export const housesDb: House[] = [...houses, ...myHouses]

export function publicHouses(): House[] {
  return housesDb.filter((h) => h.status === '可租' || h.status === '已租')
}

export function landlordHouses(lid: number): House[] {
  return housesDb.filter((h) => h.landlordId === lid)
}

// 房源扩展数据（按房源 id 索引）
export const reviews: Record<number, { list: { id: number; user: string; score: number; content: string; createTime: string }[]; avgScore: number }> = {}
export const priceHistory: Record<number, { date: string; price: number }[]> = {}
export const rooms: Record<number, { id: number; houseId: number; name: string; area?: number; price?: number; orientation?: string; status?: string }[]> = {}
export const schedules: Record<number, { id: number; date: string; timeSlot: string; status: string }[]> = {}
export const images: Record<number, { id: number; houseId: number; url: string; type: string; sort?: number }[]> = {}

for (const h of housesDb) {
  reviews[h.id] = {
    list: [
      { id: 1, user: '看房用户**', score: h.grade, content: '实地看过，与描述一致，周边配套齐全。', createTime: '2026-07-20 14:00' },
      { id: 2, user: '已签约租客**', score: Math.max(3.5, h.grade - 0.3), content: '入住体验不错，管家响应及时。', createTime: '2026-07-02 10:30' }
    ],
    avgScore: h.grade
  }
  priceHistory[h.id] = [
    { date: '2026-06', price: h.price - 200 },
    { date: '2026-07', price: h.price },
    { date: '2026-08', price: h.price }
  ]
  rooms[h.id] = [
    { id: h.id * 10 + 1, houseId: h.id, name: '主卧', area: h.area * 0.5, price: h.price, orientation: h.orientation, status: '可租' },
    { id: h.id * 10 + 2, houseId: h.id, name: '次卧', area: h.area * 0.3, price: Math.round(h.price * 0.7), orientation: h.orientation === '南' ? '北' : '南', status: '可租' }
  ]
  schedules[h.id] = [
    { id: h.id * 10 + 1, date: '2026-08-20', timeSlot: '10:00-12:00', status: '可约' },
    { id: h.id * 10 + 2, date: '2026-08-21', timeSlot: '14:00-16:00', status: '可约' }
  ]
  images[h.id] = [
    { id: h.id * 10 + 1, houseId: h.id, url: '', type: 'main', sort: 1 },
    { id: h.id * 10 + 2, houseId: h.id, url: '', type: 'sub', sort: 2 }
  ]
}

export const browseHistory: { id: number; houseId: number; title: string; coverImage?: string; price: number; city: string; district: string; viewTime: string }[] = []
export const houseViews: Record<number, number> = {}

// ===== 周边配套（地铁/商超/医院/学校，按房源确定性生成，供详情页「位置与周边」） =====

export interface PoiItem {
  id: number
  type: 'metro' | 'mall' | 'hospital' | 'school' | 'park'
  name: string
  distance: string
}

export const poiDb: Record<number, PoiItem[]> = {}

const POI_TYPES: Record<PoiItem['type'], { icon: string; label: string; names: string[]; base: number; step: number }> = {
  metro: { icon: '🚇', label: '地铁', names: ['14号线 望京站', '10号线 国贸站', '13号线 回龙观站', '4号线 中关村站'], base: 280, step: 137 },
  mall: { icon: '🛍️', label: '购物', names: ['万达广场', '合生汇', '万象汇', '印象城'], base: 600, step: 211 },
  hospital: { icon: '🏥', label: '医院', names: ['朝阳医院', '中日友好医院', '积水潭医院', '安贞医院'], base: 900, step: 173 },
  school: { icon: '🏫', label: '学校', names: ['重点小学', '市重点中学', '国际学校', '大学城'], base: 420, step: 149 },
  park: { icon: '🌳', label: '公园', names: ['城市公园', '滨河公园', '社区公园', '体育公园'], base: 500, step: 191 }
}

for (const h of housesDb) {
  const idx = h.id % 4
  poiDb[h.id] = (Object.keys(POI_TYPES) as PoiItem['type'][]).map((type, i) => {
    const t = POI_TYPES[type]
    const name = t.names[(idx + i) % t.names.length]
    const meters = t.base + ((h.id * t.step) % 900)
    return { id: i + 1, type, name, distance: meters >= 1000 ? (meters / 1000).toFixed(1) + 'km' : meters + 'm' }
  })
}

// ===== 收藏（userId → houseId 列表） =====

export const collects = new Map<number, number[]>()

// ===== 预约 =====

export const bookingsDb: (BookingItem & { userId?: number })[] = landlordBookings.map((b) => ({
  id: b.id,
  houseId: b.houseId,
  houseTitle: b.houseTitle,
  userId: b.tenant === '小陈' ? 301 : undefined,
  userName: b.tenant,
  userPhone: b.phone,
  status: b.status,
  appointmentTime: b.time,
  remark: b.remark,
  createTime: '2026-08-10 09:00'
}))

// ===== 订单 =====

export const ordersDb: (OrderDetail & { userId?: number })[] = orders.map((o) => ({
  orderId: o.id,
  orderNo: o.no,
  houseId: o.houseId,
  title: o.houseTitle,
  tenant: o.tenant,
  tenantName: o.tenant,
  amount: o.amount,
  status: o.status,
  createTime: o.time,
  rentType: '整租',
  userId: o.tenant === '小陈' ? 301 : o.tenant === '老周' ? 302 : undefined
}))

// ===== 合同 =====

const houseTitleOf = (id: number): string => housesDb.find((h) => h.id === id)?.title ?? ''

export const contractsDb: ContractItem[] = contracts.map((c, i) => ({
  id: c.id,
  contractNo: c.no,
  houseId: i + 1,
  houseTitle: c.houseTitle,
  tenantId: c.tenant === '小陈' ? 301 : 302,
  tenantName: c.tenant,
  landlordId: 2,
  landlordName: c.landlord,
  status: c.status,
  startDate: c.start,
  endDate: c.end,
  rentAmount: c.rent,
  depositAmount: c.deposit,
  signedAt: '2026-08-01 10:00'
}))

export const contractTemplates: ContractTemplate[] = [
  { id: 1, name: '标准整租合同', type: '整租', content: '…（标准合同正文）…', status: '启用', createTime: '2026-01-01' },
  { id: 2, name: '合租分租合同', type: '合租', content: '…（合租合同正文）…', status: '启用', createTime: '2026-01-01' }
]

export const contractAttachments: Record<number, ContractAttachment[]> = {}
export const contractSignLogs: Record<number, SignLog[]> = {}

// ===== 账单 =====

export const billsDb: BillItem[] = landlordBills.map((b) => ({
  id: b.id,
  billNo: 'B2026' + String(b.id).padStart(4, '0'),
  houseId: b.houseTitle.includes('百子湾') ? 201 : b.houseTitle.includes('国贸') ? 203 : 204,
  houseTitle: b.houseTitle,
  title: b.month + ' 租金',
  type: '租金',
  amount: b.amount,
  paid: b.paid,
  status: b.status === '已收' ? '已支付' : b.status === '逾期' ? '已逾期' : '待支付',
  period: b.month,
  tenantName: b.tenant,
  tenantId: b.tenant === '小陈' ? 301 : undefined,
  createdAt: b.month + '-01 10:00'
}))

// ===== 工单 =====

export const workordersDb: (WorkOrderItem & { tenantId?: number })[] = tickets.map((t) => ({
  ticketId: t.id,
  type: t.type,
  title: (t.type === '报修' ? '报修：' : '投诉：') + t.houseTitle,
  status: t.status,
  createTime: t.time,
  user: t.tenant,
  tenantId: t.tenant === '小陈' ? 301 : undefined,
  houseTitle: t.houseTitle,
  content: t.content,
  handler: t.handler
}))
export const workorderLogs: Record<number, WorkOrderLog[]> = {}

// ===== 消息 / 地址 / 会话 / 积分 =====

export const messagesDb: MessageItem[] = [
  { messageId: 1, title: '预约提醒', content: '您预约的看房将于明天 14:00 进行，请准时到场。', read: false, createTime: '2026-08-16 09:00' },
  { messageId: 2, title: '合同待签署', content: '您的《望京 SOHO 精装一居》合同已生成，请尽快完成签署。', read: false, createTime: '2026-08-14 10:00' },
  { messageId: 3, title: '平台公告', content: '为保障交易安全，请勿线下转账，平台交易资金受监管。', read: true, createTime: '2026-08-01 18:00' }
]

export const addressesDb: AddressItem[] = [
  { id: 1, userId: 301, contactName: '小陈', phone: '13800000001', detail: '朝阳区望京西园 3 号楼 2 单元 501', tag: '家', isDefault: true, createdAt: '2026-07-01' }
]

export const sessionsDb: SessionItem[] = [
  { id: 1, device: 'Chrome · Windows', ip: '114.243.42.7', location: '北京', lastActiveTime: '2026-08-16 09:12', createTime: '2026-08-01 10:00', current: true },
  { id: 2, device: 'iOS 微信浏览器', ip: '223.104.38.9', location: '北京', lastActiveTime: '2026-08-10 21:30', createTime: '2026-07-20 08:00' }
]

export const pointsDb = { points: 1280, level: '银卡会员' }
export const couponsDb = {
  list: [
    { id: 1, name: '首单立减券', amount: 200, threshold: 1000, expireAt: '2026-12-31', status: 'unused' },
    { id: 2, name: '搬家服务券', amount: 50, threshold: 0, expireAt: '2026-10-31', status: 'unused' }
  ],
  total: 2
}

// ===== 支付 =====

export const payMethods: { list: PayMethod[]; total: number } = {
  list: [
    { id: 1, channel: 'wechat', name: '微信支付', enabled: true },
    { id: 2, channel: 'alipay', name: '支付宝', enabled: true },
    { id: 3, channel: 'card', name: '银行卡', enabled: false }
  ],
  total: 3
}

export const payRecordsDb: PayRecord[] = [
  { id: 1, orderNo: 'O20260809003', amount: 10400, channel: '微信支付', status: '成功', createTime: '2026-08-09 19:22' },
  { id: 2, orderNo: 'B20260812001', amount: 0, channel: '—', status: '成功', createTime: '2026-08-12 10:00' }
]

export const payOrdersDb: PayOrder[] = [
  { id: 1, amount: 10400, channel: '微信支付', status: '成功', createTime: '2026-08-09 19:22', payTime: '2026-08-09 19:23' }
]

export const refundsDb: RefundItem[] = [
  { id: 1, orderId: 3, amount: 10400, reason: '房源信息与实际不符，申请全额退款', status: '待审核', createTime: '2026-08-12 11:00' }
]

export const withdrawsDb: WithdrawItem[] = [
  { id: 1, amount: 6500, bankCard: '招商银行(****6677)', status: '待审核', createTime: '2026-08-13 09:00' },
  { id: 2, amount: 17000, bankCard: '招商银行(****6677)', status: '已到账', createTime: '2026-08-05 10:00' }
]

// ===== 搜索 =====

export const hotKeywords: { list: HotKeyword[]; total: number } = {
  list: [
    { keyword: '望京', count: 328 },
    { keyword: '10号线', count: 256 },
    { keyword: '整租', count: 214 },
    { keyword: '合租', count: 188 },
    { keyword: '朝阳区', count: 166 }
  ],
  total: 5
}

export const searchLogsDb: SearchLog[] = [
  { id: 1, keyword: '望京', userId: 301, userName: '小陈', resultCount: 2, createTime: '2026-08-16 09:10' },
  { id: 2, keyword: '合租', resultCount: 3, createTime: '2026-08-15 20:00' }
]

// ===== 用户域 =====

export const realnameDb: RealnameStatus = { status: 'verified', realName: '陈小', idCardMask: '110***********1234' }
export const accountCancelDb: AccountCancelStatus = { status: '未申请' }
export const notifySettingDb: NotifySetting = { sms: true, site: true, booking: true, bill: true, market: false }

// ===== 风控 =====

export const blacklistDb: { list: BlacklistItem[]; total: number } = {
  list: [
    { id: 1, userId: 302, userName: '老周', reason: '虚假投诉多次', createTime: '2026-07-18' }
  ],
  total: 1
}
export const riskRulesDb: { list: RiskRule[]; total: number } = {
  list: [
    { id: 1, name: '频繁改签预警', type: '行为风控', threshold: '24h 内 ≥5 次', enabled: true, description: '预约或订单状态反复变更' },
    { id: 2, name: '异地登录检测', type: '账号安全', threshold: '常用地偏差 >800km', enabled: true, description: '触发短信验证' },
    { id: 3, name: '虚假房源识别', type: '内容风控', threshold: '相似图 >80%', enabled: true, description: '图片重复率过高' }
  ],
  total: 3
}
export const riskRecordsDb: Record<number, { list: RiskRecord[]; total: number }> = {}
export const reportsDb: ReportItem[] = [
  { id: 1, houseId: 6, houseTitle: '亦庄 合租次卧 通勤友好', reporterId: 301, reporterName: '小陈', reason: '图片与实景不符', status: '待处理', createTime: '2026-08-12 15:00' }
]

// ===== 后台 =====

export const adminContentsDb: ContentItem[] = [
  { id: 1, type: '公告', title: '关于保障交易安全的公告', body: '请勿线下转账，平台交易资金受监管。', status: '已发布', sort: 1, publishTime: '2026-08-01', createdAt: '2026-07-30' },
  { id: 2, type: '资讯', title: '北京租房市场 8 月月报', body: '租金环比 +0.8%。', status: '草稿', createdAt: '2026-08-10' }
]

export const adminContractsDb: AdminContract[] = contracts.map((c, i) => ({
  id: c.id,
  contractNo: c.no,
  houseId: i + 1,
  houseTitle: c.houseTitle,
  tenantName: c.tenant,
  landlordName: c.landlord,
  startDate: c.start,
  endDate: c.end,
  monthlyRent: c.rent,
  deposit: c.deposit,
  status: c.status,
  signedAt: '2026-08-01'
}))

export const adminFinancesDb: FinanceItem[] = finances.map((f) => ({
  id: f.id,
  settleNo: f.no,
  bizDesc: f.biz,
  totalAmount: f.total,
  platformFee: f.platformFee,
  landlordAmount: f.landlordAmt,
  agentAmount: f.agentAmt,
  settleStatus: f.settle,
  settleDate: f.time,
  createdAt: f.time
}))

export const adminTicketsDb: AdminTicket[] = tickets.map((t) => ({
  id: t.id,
  ticketNo: t.no,
  type: t.type,
  houseTitle: t.houseTitle,
  tenantName: t.tenant,
  content: t.content,
  status: t.status,
  handler: t.handler,
  createdAt: t.time
}))

export const adminOrdersDb: AdminOrder[] = orders.map((o) => ({
  id: o.id,
  orderNo: o.no,
  houseTitle: o.houseTitle,
  type: o.type,
  tenantName: o.tenant,
  agent: o.agent,
  amount: o.amount,
  status: o.status,
  createdAt: o.time
}))

export const adminUsersDb: AdminUser[] = [
  { id: 301, name: '小陈', role: '租客', phone: '135****6677', certStatus: '已认证', creditScore: 88, status: '正常', regTime: '2026-02-11' },
  { id: 302, name: '老周', role: '租客', phone: '134****0098', certStatus: '未认证', creditScore: 60, status: '冻结', regTime: '2026-04-01' },
  { id: 2, name: '张房东', role: '房东', phone: '138****0002', certStatus: '已认证', creditScore: 95, status: '正常', regTime: '2026-01-15' }
]

export const adminRolesDb: RoleItem[] = [
  { id: 1, name: '超级管理员', remark: '全部权限', status: 1, perms: ['*'] },
  { id: 2, name: '审核员', remark: '房源/财务审核', status: 1, perms: ['house:audit', 'finance:audit'] },
  { id: 3, name: '客服', remark: '工单处理', status: 1, perms: ['ticket:handle'] }
]

export const adminUsersItemDb: AdminUserItem[] = [
  { id: 1, user: 'admin', role: '超级管理员', status: '启用', last: '2026-08-16 09:00' }
]

export const adminMenusDb: MenuItem[] = [
  { id: 1, name: '工作台', path: '/admin/dashboard', perm: 'dashboard' },
  { id: 2, name: '房源管理', path: '/admin/houses', perm: 'house:list' },
  { id: 3, name: '用户管理', path: '/admin/users', perm: 'user:list' },
  { id: 4, name: '交易管理', path: '/admin/trades', perm: 'order:list' }
]

export const adminDictsDb: DictItem[] = [
  { id: 1, type: 'house_status', label: '可租', value: '可租' },
  { id: 2, type: 'house_status', label: '待审核', value: '待审核' },
  { id: 3, type: 'rent_type', label: '整租', value: '整租' },
  { id: 4, type: 'rent_type', label: '合租', value: '合租' }
]

export const adminLogsDb: LogItem[] = [
  { id: 1, userId: 1, module: '房源管理', action: '审核通过 房源#202', ip: '127.0.0.1', createdAt: '2026-08-16 09:05' },
  { id: 2, userId: 1, module: '系统设置', action: '更新系统参数', createdAt: '2026-08-15 18:00' }
]

export const sysParamsDb: SysParam = { auditHour: 24, feeRate: 0.1, minImg: 3 }

// ===== 统计看板 =====

export const dashboardToday = dashboard.today
export const gmvData = { labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], data: dashboard.trend }
export const stockData = dashboard.cityDist

// ===== 通用 =====

export function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export { houseTitleOf }
