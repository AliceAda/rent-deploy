// ===== MSW handlers：实现整套 /api/* 契约（后端就绪后删除本目录即可整体切换） =====
import { http, HttpResponse } from 'msw'
import * as db from './db'
import type { MockUser } from './db'
import type { House } from './data'

const ok = (data: unknown) =>
  HttpResponse.json({ code: 0, message: 'ok', data, timestamp: Date.now() })
const fail = (message: string) =>
  HttpResponse.json({ code: 1, message, data: null, timestamp: Date.now() })

const UNAUTH = () =>
  HttpResponse.json({ code: 401, message: '未登录或登录已过期', data: null, timestamp: Date.now() }, { status: 401 })

function guard(request: Request): MockUser {
  const u = db.userOf(request)
  if (!u) throw UNAUTH()
  return u
}

async function bodyOf(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>
  } catch {
    return {}
  }
}

function qs(url: string): URLSearchParams {
  return new URL(url).searchParams
}

// 交易事件自动生成站内信（消息中心联动，市面平台标配）
function notify(title: string, content: string) {
  db.messagesDb.unshift({ messageId: db.nextId(), title, content, read: false, createTime: db.now() })
}

const page = (url: string, list: unknown[]) => {
  const p = Number(qs(url).get('page') || 1)
  const s = Number(qs(url).get('size') || 20)
  const start = (p - 1) * s
  return { list: list.slice(start, start + s), total: list.length }
}

// 主键兼容 id / orderId / ticketId 三种命名
const next = (list: unknown[], base: number): number =>
  Math.max(
    base,
    ...list.map((x) => {
      const o = x as { id?: number; orderId?: number; ticketId?: number }
      return o.id ?? o.orderId ?? o.ticketId ?? 0
    })
  ) + 1

export const handlers = [
  // ===================== 认证 =====================
  http.post('/api/auth/sms/send', async () => ok({ code: '123456' })),
  http.post('/api/auth/login', async ({ request }) => {
    const b = await bodyOf(request)
    const u = db.accounts.find((a) => a.phone === b.phone && a.password === b.password)
    if (!u) return fail('手机号或密码错误')
    const token = db.issueToken(u)
    const refreshToken = db.issueToken(u)
    return ok({
      token,
      refreshToken,
      expireIn: 7200,
      userInfo: { id: u.id, name: u.name, phone: u.phone, role: u.role, avatar: u.avatar, gender: u.gender, email: u.email }
    })
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const b = await bodyOf(request)
    if (!b.phone || !b.password || !b.name) return fail('注册信息不完整')
    if (db.accounts.some((a) => a.phone === b.phone)) return fail('该手机号已注册')
    const u: MockUser = {
      id: db.nextId(),
      name: String(b.name),
      phone: String(b.phone),
      password: String(b.password),
      role: (['tenant', 'landlord', 'agent', 'admin'] as const).includes(b.role as never) ? (b.role as MockUser['role']) : 'tenant'
    }
    db.accounts.push(u)
    return ok({ id: u.id })
  }),
  http.post('/api/auth/refresh', async ({ request }) => {
    const b = await bodyOf(request)
    const u = db.userByToken(String(b.refreshToken || ''))
    if (!u) return fail('刷新失败，请重新登录')
    const token = db.issueToken(u)
    const refreshToken = db.issueToken(u)
    return ok({ token, refreshToken })
  }),
  http.post('/api/auth/forgot-password', async ({ request }) => {
    const b = await bodyOf(request)
    const u = db.accounts.find((a) => a.phone === b.phone)
    if (!u) return fail('手机号未注册')
    u.password = String(b.newPassword || '123456')
    return ok(null)
  }),
  http.post('/api/auth/bind-phone', async ({ request }) => {
    const b = await bodyOf(request)
    const u = guard(request)
    u.phone = String(b.phone || u.phone)
    return ok(null)
  }),
  http.post('/api/user/password/change', async ({ request }) => {
    const b = await bodyOf(request)
    const u = guard(request)
    if (u.password !== b.oldPassword) return fail('原密码不正确')
    u.password = String(b.newPassword || u.password)
    return ok(null)
  }),

  // ===================== 用户 =====================
  http.get('/api/user/me', ({ request }) => {
    const u = guard(request)
    return ok({ name: u.name, avatar: u.avatar, gender: u.gender, email: u.email, phone: u.phone, certStatus: db.realnameDb.status })
  }),
  http.put('/api/user/me', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    if (b.name) u.name = String(b.name)
    if (b.avatar !== undefined) u.avatar = String(b.avatar)
    if (b.gender !== undefined) u.gender = Number(b.gender)
    if (b.email !== undefined) u.email = String(b.email)
    return ok(null)
  }),
  http.get('/api/user/realname', () => ok(db.realnameDb)),
  http.post('/api/user/realname', async ({ request }) => {
    const b = await bodyOf(request)
    db.realnameDb.status = 'pending'
    db.realnameDb.realName = String(b.realName || '')
    db.realnameDb.idCardMask = String(b.idCard || '').replace(/^(.{3}).*(.{4})$/, '$1********$2')
    return ok(null)
  }),
  http.get('/api/user/account-cancel', () => ok(db.accountCancelDb)),
  http.post('/api/user/account-cancel', async ({ request }) => {
    const b = await bodyOf(request)
    db.accountCancelDb.status = '审核中'
    db.accountCancelDb.reason = String(b.reason || '')
    db.accountCancelDb.applyTime = db.now()
    return ok(null)
  }),
  http.delete('/api/user/account-cancel', () => {
    db.accountCancelDb.status = '未申请'
    db.accountCancelDb.reason = undefined
    return ok(null)
  }),
  http.get('/api/user/notify-setting', () => ok(db.notifySettingDb)),
  http.put('/api/user/notify-setting', async ({ request }) => {
    Object.assign(db.notifySettingDb, await bodyOf(request))
    return ok(null)
  }),

  // ===================== 房源（公开） =====================
  http.get('/api/house/list', ({ request }) => {
    const q = qs(request.url)
    const kw = (q.get('q') || '').toLowerCase()
    let list = db.publicHouses()
    if (q.get('city')) list = list.filter((h) => h.city === q.get('city'))
    if (q.get('district')) list = list.filter((h) => h.district === q.get('district'))
    if (q.get('rent')) list = list.filter((h) => h.rentType === q.get('rent'))
    // 户型 / 朝向 / 租金上限 / 配套：与前端筛选条件对齐，做到 server-first
    const type = q.get('type')
    if (type && type !== 'all') list = list.filter((h) => h.layout.startsWith(type))
    const ori = q.get('ori')
    if (ori && ori !== 'all') list = list.filter((h) => h.orientation.includes(ori))
    const price = Number(q.get('price'))
    if (q.get('price') && !Number.isNaN(price)) list = list.filter((h) => h.price <= price)
    const fac = (q.get('fac') || '').split(',').filter(Boolean)
    if (fac.length) list = list.filter((h) => fac.every((x) => (h.facilities ?? []).includes(x)))
    if (kw) list = list.filter((h) => h.title.toLowerCase().includes(kw) || h.district.toLowerCase().includes(kw))
    return ok({ list, total: list.length })
  }),
  // ===== 基础数据（必须注册在 /api/house/:id 之前，否则静态路径会被参数路径吞掉） =====
  http.get('/api/house/region', ({ request }) => {
    const pid = qs(request.url).get('parentId')
    if (!pid) return ok(db.regionRows.filter((r) => !r.parentId))
    return ok(db.regionRows.filter((r) => r.parentId === Number(pid)))
  }),
  http.get('/api/house/metro', () => ok({ list: ['1号线', '2号线', '10号线', '13号线', '14号线'].map((n) => ({ id: n, name: n })), total: 5 })),
  http.get('/api/house/facility', () => ok({ list: ['电梯', '燃气', '宠物', '车位', '阳台'].map((n, i) => ({ id: i + 1, name: n })), total: 5 })),
  http.get('/api/house/tag', () => ok({ list: ['近地铁', '精装修', '可短租', '低价', '公寓'].map((n, i) => ({ id: i + 1, name: n })), total: 5 })),
  http.get('/api/house/poi', ({ request }) => {
    const houseId = Number(qs(request.url).get('houseId'))
    const list = db.poiDb[houseId] ?? []
    return ok({ list, total: list.length })
  }),
  http.get('/api/house/building', () => ok({ list: [], total: 0 })),
  http.get('/api/house/:id', ({ params }) => {
    const h = db.housesDb.find((x) => x.id === Number(params.id))
    if (!h) return fail('房源不存在')
    return ok(h)
  }),
  http.get('/api/house/:id/review', ({ params }) => ok(db.reviews[Number(params.id)] ?? { list: [], total: 0, avgScore: 0 })),
  http.post('/api/house/:id/review', async ({ params, request }) => {
    const b = await bodyOf(request)
    const r = db.reviews[Number(params.id)]
    if (r) r.list.unshift({ id: db.nextId(), user: guard(request).name + '**', score: Number(b.score ?? 5), content: String(b.content || ''), createTime: db.now() })
    return ok(null)
  }),
  http.get('/api/house/:id/price-history', ({ params }) => ok({ list: db.priceHistory[Number(params.id)] ?? [], total: 0 })),
  http.get('/api/house/:id/rooms', ({ params }) => ok({ list: db.rooms[Number(params.id)] ?? [], total: 0 })),
  http.get('/api/house/:id/schedule', ({ params }) => ok({ list: db.schedules[Number(params.id)] ?? [], total: 0 })),
  http.get('/api/house/:id/images', ({ params }) => ok({ list: db.images[Number(params.id)] ?? [], total: 0 })),
  http.post('/api/house/:id/images', async ({ params, request }) => {
    const b = await bodyOf(request)
    const list = (db.images[Number(params.id)] ??= [])
    list.push({ id: db.nextId(), houseId: Number(params.id), url: String(b.url || ''), type: String(b.type || 'sub') })
    return ok(null)
  }),
  http.post('/api/house/:id/rooms', async ({ params, request }) => {
    const b = await bodyOf(request)
    const list = (db.rooms[Number(params.id)] ??= [])
    list.push({ id: db.nextId(), houseId: Number(params.id), name: String(b.name || '房间'), area: Number(b.area || 0), price: Number(b.price || 0), orientation: String(b.orientation || ''), status: String(b.status || '可租') })
    return ok(null)
  }),
  http.post('/api/house/report', async ({ request }) => {
    const b = await bodyOf(request)
    const u = guard(request)
    const h = db.housesDb.find((x) => x.id === Number(b.houseId))
    db.reportsDb.push({
      id: db.nextId(),
      houseId: Number(b.houseId),
      houseTitle: h?.title,
      reporterId: u.id,
      reporterName: u.name,
      reason: String(b.reason || ''),
      status: '待处理',
      createTime: db.now()
    })
    return ok(null)
  }),
  http.post('/api/house/view', async ({ request }) => {
    const b = await bodyOf(request)
    const id = Number(b.houseId)
    const h = db.housesDb.find((x) => x.id === id)
    db.houseViews[id] = (db.houseViews[id] ?? 0) + 1
    if (h) {
      const u = db.userOf(request)
      db.browseHistory.unshift({ id: db.nextId(), houseId: id, title: h.title, price: h.price, city: h.city, district: h.district, viewTime: db.now() })
      if (u) db.browseHistory[0] = { ...db.browseHistory[0], id: db.nextId() }
    }
    return ok(null)
  }),
  http.get('/api/house/view/history', ({ request }) => {
    guard(request)
    return ok({ list: db.browseHistory.slice(0, 20), total: db.browseHistory.length })
  }),

  // ===================== 房源（房东端） =====================
  http.get('/api/landlord/houses', ({ request }) => {
    const u = guard(request)
    const list = db.landlordHouses(u.id)
    const st = qs(request.url).get('status')
    return ok({ list: st ? list.filter((h) => h.status === st) : list, total: list.length })
  }),
  http.post('/api/landlord/houses', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const h: House = {
      id: db.nextId(),
      title: String(b.title || '未命名房源'),
      city: String(b.city || '北京'),
      district: String(b.district || ''),
      rentType: String(b.rentType || '整租'),
      layout: String(b.layout || ''),
      area: Number(b.area || 0),
      floor: String(b.floor || ''),
      orientation: String(b.orientation || ''),
      decoration: String(b.decoration || ''),
      price: Number(b.price || 0),
      depositType: String(b.depositType || '押一付三'),
      facilities: Array.isArray(b.facilities) ? (b.facilities as string[]) : [],
      tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
      status: '待审核',
      views: 0,
      collectCount: 0,
      landlordId: u.id,
      source: '房东自发布',
      description: String(b.description || ''),
      grade: 4.5,
      x: 50,
      y: 50
    }
    db.housesDb.push(h)
    db.reviews[h.id] = { list: [], avgScore: 0 }
    db.priceHistory[h.id] = []
    db.rooms[h.id] = []
    db.schedules[h.id] = []
    db.images[h.id] = []
    return ok(h)
  }),
  http.put('/api/house/:id', async ({ params, request }) => {
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(params.id))
    if (h) Object.assign(h, b)
    return ok(h)
  }),
  http.delete('/api/house/:id', ({ params }) => {
    const i = db.housesDb.findIndex((x) => x.id === Number(params.id))
    if (i >= 0) db.housesDb.splice(i, 1)
    return ok(null)
  }),
  http.get('/api/landlord/house/:id/stats', ({ params }) =>
    ok({ views: 320, collects: 18, orders: 2, inquiries: 5 })),
  http.get('/api/landlord/house/:id/status', ({ params }) =>
    ok({ status: db.housesDb.find((x) => x.id === Number(params.id))?.status ?? '可租' })),
  http.post('/api/landlord/house/:id/status', async ({ params, request }) => {
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(params.id))
    if (h && b.status) h.status = String(b.status)
    return ok(null)
  }),

  // ===================== 收藏 =====================
  http.get('/api/user/collect', ({ request }) => {
    const u = guard(request)
    const ids = db.collects.get(u.id) ?? []
    const list = db.housesDb.filter((h) => ids.includes(h.id))
    return ok({ list, total: list.length })
  }),
  http.post('/api/user/collect', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const id = Number(b.houseId)
    const set = db.collects.get(u.id) ?? []
    if (!set.includes(id)) {
      set.push(id)
      db.collects.set(u.id, set)
    }
    return ok(null)
  }),
  http.delete('/api/user/collect/:houseId', ({ request, params }) => {
    const u = guard(request)
    const set = db.collects.get(u.id) ?? []
    db.collects.set(u.id, set.filter((x) => x !== Number(params.houseId)))
    return ok(null)
  }),

  // ===================== 预约 =====================
  http.get('/api/booking/my', ({ request }) => {
    const u = guard(request)
    const st = qs(request.url).get('status')
    let list = db.bookingsDb.filter((b) => b.userId === u.id)
    if (st) list = list.filter((b) => b.status === st)
    return ok({ list, total: list.length })
  }),
  http.get('/api/booking', ({ request }) => {
    const u = guard(request)
    let list = db.bookingsDb
    if (u.role === 'tenant') list = list.filter((b) => b.userId === u.id)
    return ok({ list, total: list.length })
  }),
  http.post('/api/booking', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(b.houseId))
    db.bookingsDb.unshift({
      id: next(db.bookingsDb, 1000),
      houseId: Number(b.houseId),
      houseTitle: h?.title,
      userId: u.id,
      userName: u.name,
      userPhone: u.phone,
      status: '待确认',
      appointmentTime: String(b.time || '待定'),
      remark: String(b.remark || ''),
      createTime: db.now()
    })
    notify('预约申请已提交', `您已预约《${h?.title ?? '该房源'}》看房，房东确认后将在消息中通知您。`)
    return ok(null)
  }),
  http.get('/api/booking/:id', ({ params }) => {
    const b = db.bookingsDb.find((x) => x.id === Number(params.id))
    if (!b) return fail('预约不存在')
    return ok(b)
  }),
  http.put('/api/booking/:id', async ({ params, request }) => {
    const b = db.bookingsDb.find((x) => x.id === Number(params.id))
    if (b) Object.assign(b, await bodyOf(request))
    return ok(b)
  }),
  http.post('/api/booking/:id/cancel', ({ params }) => {
    const b = db.bookingsDb.find((x) => x.id === Number(params.id))
    if (b) b.status = '已取消'
    return ok(null)
  }),
  http.get('/api/landlord/bookings', ({ request }) => {
    const u = guard(request)
    const mine = new Set(db.landlordHouses(u.id).map((h) => h.id))
    let list = db.bookingsDb.filter((b) => mine.has(b.houseId))
    const st = qs(request.url).get('status')
    if (st) list = list.filter((b) => b.status === st)
    return ok({ list, total: list.length })
  }),
  http.post('/api/landlord/bookings', async ({ request }) => {
    const b = await bodyOf(request)
    db.bookingsDb.unshift({
      id: next(db.bookingsDb, 1000),
      houseId: Number(b.houseId),
      houseTitle: String(b.houseTitle || ''),
      userName: String(b.userName || ''),
      userPhone: String(b.userPhone || ''),
      status: '待确认',
      appointmentTime: String(b.time || '待定'),
      createTime: db.now()
    })
    return ok(null)
  }),
  http.post('/api/landlord/booking/:id/confirm', ({ params }) => {
    const b = db.bookingsDb.find((x) => x.id === Number(params.id))
    if (b) b.status = '已确认'
    return ok(null)
  }),
  http.post('/api/landlord/booking/:id/reject', async ({ params, request }) => {
    const b = await bodyOf(request)
    const item = db.bookingsDb.find((x) => x.id === Number(params.id))
    if (item) {
      item.status = '已拒绝'
      item.remark = String(b.reason || '')
    }
    return ok(null)
  }),

  // ===================== 订单 =====================
  http.get('/api/order/my', ({ request }) => {
    const u = guard(request)
    let list = db.ordersDb.filter((o) => o.userId === u.id)
    const st = qs(request.url).get('status')
    if (st) list = list.filter((o) => o.status === st)
    return ok({ list, total: list.length })
  }),
  http.get('/api/order/landlord', ({ request }) => {
    const u = guard(request)
    const mine = new Set(db.landlordHouses(u.id).map((h) => h.id))
    let list = db.ordersDb.filter((o) => mine.has(o.houseId))
    const st = qs(request.url).get('status')
    if (st) list = list.filter((o) => o.status === st)
    return ok({ list, total: list.length })
  }),
  http.get('/api/order', ({ request }) => {
    const u = guard(request)
    let list = db.ordersDb
    if (u.role === 'tenant') list = list.filter((o) => o.userId === u.id)
    return ok({ list, total: list.length })
  }),
  http.get('/api/order/rent-period', () =>
    ok({ periods: [{ label: '半年', value: '6' }, { label: '一年', value: '12' }, { label: '两年', value: '24' }] })),
  http.get('/api/order/:id', ({ params }) => {
    const o = db.ordersDb.find((x) => x.orderId === Number(params.id))
    if (!o) return fail('订单不存在')
    return ok(o)
  }),
  http.post('/api/order', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(b.houseId))
    const o = {
      orderId: next(db.ordersDb, 1000),
      orderNo: 'O' + Date.now(),
      houseId: Number(b.houseId),
      title: h?.title ?? '预订订单',
      tenantName: u.name,
      userId: u.id,
      amount: Number(b.amount || 0),
      status: '已支付',
      createTime: db.now(),
      rentType: String(b.rentType || h?.rentType || '整租'),
      startDate: String(b.startDate || ''),
      endDate: String(b.endDate || '')
    }
    db.ordersDb.unshift(o)
    return ok(o)
  }),
  http.post('/api/order/:id', async ({ params, request }) => {
    const o = db.ordersDb.find((x) => x.orderId === Number(params.id))
    if (o) Object.assign(o, await bodyOf(request))
    return ok(null)
  }),
  http.post('/api/order/:id/pay', ({ params }) => {
    const o = db.ordersDb.find((x) => x.orderId === Number(params.id))
    if (o) o.status = '已支付'
    return ok({ payUrl: '' })
  }),
  http.post('/api/order/:id/cancel', ({ params }) => {
    const o = db.ordersDb.find((x) => x.orderId === Number(params.id))
    if (o) o.status = '已取消'
    return ok(null)
  }),
  http.post('/api/order/:id/checkin', ({ params }) => {
    const o = db.ordersDb.find((x) => x.orderId === Number(params.id))
    if (o) o.status = '已完成'
    return ok(null)
  }),
  http.post('/api/order/:id/renew', async ({ params, request }) => {
    const b = await bodyOf(request)
    const o = db.ordersDb.find((x) => x.orderId === Number(params.id))
    if (o && b.endDate) o.endDate = String(b.endDate)
    return ok(null)
  }),
  http.post('/api/order/:id/sublease', () => ok(null)),
  http.post('/api/order/:id/terminate', () => ok(null)),
  http.get('/api/order/:id/status-log', () =>
    ok({ list: [{ id: 1, fromStatus: '创建', toStatus: '已支付', operator: '系统', createTime: db.now() }], total: 1 })),
  http.post('/api/landlord/orders', async ({ request }) => {
    const b = await bodyOf(request)
    const u = guard(request)
    db.ordersDb.unshift({
      orderId: next(db.ordersDb, 1000),
      orderNo: 'L' + Date.now(),
      houseId: Number(b.houseId || 0),
      title: String(b.title || '房东订单'),
      tenantName: String(b.tenantName || ''),
      amount: Number(b.amount || 0),
      status: String(b.status || '待确认'),
      createTime: db.now(),
      userId: u.id
    })
    return ok(null)
  }),

  // ===================== 合同 =====================
  http.get('/api/contract/my', ({ request }) => {
    const u = guard(request)
    let list = db.contractsDb.filter((c) => c.tenantId === u.id)
    const st = qs(request.url).get('status')
    if (st) list = list.filter((c) => c.status === st)
    return ok({ list, total: list.length })
  }),
  http.get('/api/contract/landlord', ({ request }) => {
    const u = guard(request)
    let list = db.contractsDb.filter((c) => c.landlordId === u.id)
    const st = qs(request.url).get('status')
    if (st) list = list.filter((c) => c.status === st)
    return ok({ list, total: list.length })
  }),
  // 合同模板（必须注册在 /api/contract/:id 之前）
  http.get('/api/contract/template', () => ok({ list: db.contractTemplates, total: db.contractTemplates.length })),
  http.get('/api/contract/template/:id', ({ params }) =>
    ok(db.contractTemplates.find((t) => t.id === Number(params.id)) ?? null)),
  http.put('/api/contract/template/:id', async ({ params, request }) => {
    const t = db.contractTemplates.find((x) => x.id === Number(params.id))
    if (t) Object.assign(t, await bodyOf(request))
    return ok(null)
  }),
  http.delete('/api/contract/template/:id', ({ params }) => {
    const i = db.contractTemplates.findIndex((x) => x.id === Number(params.id))
    if (i >= 0) db.contractTemplates.splice(i, 1)
    return ok(null)
  }),
  http.get('/api/contract/:id', ({ params }) => {
    const c = db.contractsDb.find((x) => x.id === Number(params.id))
    if (!c) return fail('合同不存在')
    return ok({ ...c, content: '…（电子合同正文）…' })
  }),
  http.put('/api/contract/:id', async ({ params, request }) => {
    const c = db.contractsDb.find((x) => x.id === Number(params.id))
    if (c) Object.assign(c, await bodyOf(request))
    return ok(null)
  }),
  http.post('/api/contract/sign', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const o = db.ordersDb.find((x) => x.orderId === Number(b.orderId))
    const h = o ? db.housesDb.find((x) => x.id === o.houseId) : undefined
    const c = {
      id: next(db.contractsDb, 1000),
      contractNo: 'C' + Date.now(),
      houseId: o?.houseId ?? 0,
      houseTitle: o?.title ?? h?.title,
      tenantId: u.id,
      tenantName: u.name,
      landlordName: '张房东',
      landlordId: 2,
      status: '生效中',
      startDate: o?.startDate,
      endDate: o?.endDate,
      rentAmount: o?.amount,
      depositAmount: o?.amount ?? 0,
      signedAt: db.now()
    }
    db.contractsDb.unshift(c)
    if (h) h.status = '已租'
    notify('合同签署成功', `您与${c.landlordName}的《${c.houseTitle ?? '租房合同'}》已生效，首期费用已支付，可在「我的-合同」查看。`)
    // 签约即生成首期账单：房东端「我的账单」实时可见（跨端联动闭环）
    db.billsDb.unshift({
      id: next(db.billsDb, 1000),
      billNo: 'B' + Date.now(),
      houseId: o?.houseId ?? 0,
      houseTitle: c.houseTitle ?? '',
      title: '首期租金（押金 + 首月）',
      type: '租金',
      amount: c.rentAmount ?? 0,
      paid: c.rentAmount ?? 0,
      status: '已支付',
      period: (o?.startDate || '').slice(0, 7),
      tenantName: c.tenantName,
      tenantId: u.id,
      createdAt: db.now()
    })
    db.contractSignLogs[c.id] = [{ id: 1, action: '签署', operator: u.name, createTime: db.now() }]
    return ok(c)
  }),
  http.post('/api/contract/renew', () => ok(null)),
  http.post('/api/contract/:id/terminate', ({ params }) => {
    const c = db.contractsDb.find((x) => x.id === Number(params.id))
    if (c) c.status = '已终止'
    return ok(null)
  }),
  http.get('/api/contract/:id/attachments', ({ params }) =>
    ok({ list: db.contractAttachments[Number(params.id)] ?? [], total: 0 })),
  http.post('/api/contract/:id/attachments', async ({ params, request }) => {
    const b = await bodyOf(request)
    const list = (db.contractAttachments[Number(params.id)] ??= [])
    list.push({ id: db.nextId(), contractId: Number(params.id), name: String(b.name || ''), url: String(b.url || ''), type: String(b.type || 'pdf'), createTime: db.now() })
    return ok(null)
  }),
  http.get('/api/contract/:id/sign-log', ({ params }) =>
    ok({ list: db.contractSignLogs[Number(params.id)] ?? [], total: 0 })),

  // ===================== 账单 =====================
  http.get('/api/bill/my', ({ request }) => {
    const u = guard(request)
    let list = db.billsDb.filter((b) => b.tenantId === u.id)
    const st = qs(request.url).get('status')
    if (st) list = list.filter((b) => b.status === st)
    return ok({ list, total: list.length })
  }),
  http.post('/api/bill/:id/pay', ({ params }) => {
    const b = db.billsDb.find((x) => x.id === Number(params.id))
    if (b) {
      b.status = '已支付'
      b.paid = b.amount
      b.payTime = db.now()
    }
    return ok({ payUrl: '' })
  }),
  http.get('/api/landlord/bills', ({ request }) => {
    const u = guard(request)
    const mine = new Set(db.landlordHouses(u.id).map((h) => h.id))
    let list = db.billsDb.filter((b) => mine.has(b.houseId))
    const st = qs(request.url).get('status')
    if (st) list = list.filter((b) => b.status === st)
    return ok({ list, total: list.length })
  }),
  http.post('/api/landlord/bills', async ({ request }) => {
    const b = await bodyOf(request)
    db.billsDb.push({
      id: next(db.billsDb, 1000),
      billNo: 'B' + Date.now(),
      houseId: Number(b.houseId || 0),
      title: String(b.title || '租金账单'),
      type: String(b.type || '租金'),
      amount: Number(b.amount || 0),
      paid: 0,
      status: '待支付',
      period: String(b.period || ''),
      tenantName: String(b.tenantName || ''),
      createdAt: db.now()
    })
    return ok(null)
  }),
  http.get('/api/landlord/bills/:id', ({ params }) => {
    const b = db.billsDb.find((x) => x.id === Number(params.id))
    if (!b) return fail('账单不存在')
    return ok(b)
  }),
  http.put('/api/landlord/bills/:id', async ({ params, request }) => {
    const b = db.billsDb.find((x) => x.id === Number(params.id))
    if (b) Object.assign(b, await bodyOf(request))
    return ok(null)
  }),
  http.put('/api/landlord/bill/:id/pay', ({ params }) => {
    const b = db.billsDb.find((x) => x.id === Number(params.id))
    if (b) {
      b.status = '已支付'
      b.paid = b.amount
    }
    return ok(null)
  }),

  // ===================== 支付 =====================
  http.post('/api/pay/create', () => ok({ payUrl: '', payNo: 'P' + Date.now() })),
  http.get('/api/pay/methods', () => ok(db.payMethods)),
  http.post('/api/pay/methods', async ({ request }) => {
    const b = await bodyOf(request)
    if (b.id) {
      const m = db.payMethods.list.find((x) => x.id === b.id)
      if (m) Object.assign(m, b)
    } else {
      db.payMethods.list.push({ id: db.nextId(), channel: String(b.channel || ''), name: String(b.name || ''), enabled: Boolean(b.enabled) })
    }
    return ok(null)
  }),
  http.get('/api/pay/order/:id', ({ params }) =>
    ok(db.payOrdersDb.find((x) => x.id === Number(params.id)) ?? null)),
  http.get('/api/pay/record/my', ({ request }) => {
    guard(request)
    return ok(page(request.url, db.payRecordsDb))
  }),
  http.get('/api/pay/refund', ({ request }) => {
    const u = guard(request)
    let list = db.refundsDb
    if (u.role === 'tenant') list = list.filter((r) => db.ordersDb.find((o) => o.orderId === r.orderId)?.userId === u.id)
    const st = qs(request.url).get('status')
    if (st) list = list.filter((r) => r.status === st)
    return ok({ list, total: list.length })
  }),
  http.post('/api/pay/refund', async ({ request }) => {
    const b = await bodyOf(request)
    db.refundsDb.unshift({ id: next(db.refundsDb, 100), orderId: Number(b.orderId || 0), amount: Number(b.amount || 0), reason: String(b.reason || ''), status: '待审核', createTime: db.now() })
    notify('退款申请已提交', `您的退款申请 ¥${Number(b.amount || 0)} 已提交，平台将在 1-3 个工作日内审核。`)
    return ok(null)
  }),
  http.get('/api/pay/refund/:id', ({ params }) =>
    ok(db.refundsDb.find((x) => x.id === Number(params.id)) ?? null)),
  http.post('/api/pay/refund/:id/approve', ({ params }) => {
    const r = db.refundsDb.find((x) => x.id === Number(params.id))
    if (r) r.status = '已通过'
    return ok(null)
  }),
  http.post('/api/pay/refund/:id/reject', async ({ params, request }) => {
    const b = await bodyOf(request)
    const r = db.refundsDb.find((x) => x.id === Number(params.id))
    if (r) {
      r.status = '已驳回'
      r.reason += '（驳回：' + String(b.reason || '') + '）'
    }
    return ok(null)
  }),
  http.get('/api/pay/withdraw', ({ request }) => {
    const u = guard(request)
    let list = db.withdrawsDb
    if (u.role === 'landlord') list = list.filter((w) => w.id === 1 || w.id === 2)
    const st = qs(request.url).get('status')
    if (st) list = list.filter((w) => w.status === st)
    return ok({ list, total: list.length })
  }),
  http.post('/api/pay/withdraw', async ({ request }) => {
    const b = await bodyOf(request)
    db.withdrawsDb.unshift({ id: next(db.withdrawsDb, 100), amount: Number(b.amount || 0), bankCard: String(b.bankCard || '招商银行(****6677)'), status: '待审核', createTime: db.now() })
    return ok(null)
  }),
  http.get('/api/pay/withdraw/:id', ({ params }) =>
    ok(db.withdrawsDb.find((x) => x.id === Number(params.id)) ?? null)),
  http.post('/api/pay/withdraw/:id/approve', ({ params }) => {
    const w = db.withdrawsDb.find((x) => x.id === Number(params.id))
    if (w) w.status = '已到账'
    return ok(null)
  }),
  http.post('/api/pay/withdraw/:id/reject', async ({ params, request }) => {
    const b = await bodyOf(request)
    const w = db.withdrawsDb.find((x) => x.id === Number(params.id))
    if (w) w.status = '已驳回'
    void b
    return ok(null)
  }),

  // ===================== 消息 =====================
  http.get('/api/message/my', ({ request }) => {
    guard(request)
    return ok({ list: db.messagesDb, total: db.messagesDb.length })
  }),
  http.post('/api/message/:id/read', ({ params }) => {
    const m = db.messagesDb.find((x) => x.messageId === Number(params.id))
    if (m) m.read = true
    return ok(null)
  }),
  http.post('/api/message/read-all', () => {
    db.messagesDb.forEach((m) => (m.read = true))
    return ok(null)
  }),

  // ===================== 地址 =====================
  http.get('/api/user/address', ({ request }) => {
    const u = guard(request)
    return ok({ list: db.addressesDb.filter((a) => a.userId === u.id), total: db.addressesDb.length })
  }),
  http.post('/api/user/address', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const a = { id: next(db.addressesDb, 100), userId: u.id, contactName: String(b.contactName || u.name), phone: String(b.phone || u.phone), detail: String(b.detail || ''), tag: String(b.tag || '其他'), isDefault: Boolean(b.isDefault), createdAt: db.now() }
    db.addressesDb.push(a)
    return ok(a)
  }),
  http.put('/api/user/address/:id', async ({ params, request }) => {
    const a = db.addressesDb.find((x) => x.id === Number(params.id))
    if (a) Object.assign(a, await bodyOf(request))
    return ok(null)
  }),
  http.put('/api/user/address/:id/default', ({ params }) => {
    db.addressesDb.forEach((a) => (a.isDefault = a.id === Number(params.id)))
    return ok(null)
  }),
  http.delete('/api/user/address/:id', ({ params }) => {
    const i = db.addressesDb.findIndex((x) => x.id === Number(params.id))
    if (i >= 0) db.addressesDb.splice(i, 1)
    return ok(null)
  }),

  // ===================== 会话 / 积分 =====================
  http.get('/api/user/session', () => ok({ list: db.sessionsDb, total: db.sessionsDb.length })),
  http.get('/api/user/session/:id', ({ params }) =>
    ok(db.sessionsDb.find((x) => x.id === Number(params.id)) ?? null)),
  http.put('/api/user/session/:id', async ({ params, request }) => {
    const s = db.sessionsDb.find((x) => x.id === Number(params.id))
    if (s) Object.assign(s, await bodyOf(request))
    return ok(null)
  }),
  http.delete('/api/user/session/:id', ({ params }) => {
    const i = db.sessionsDb.findIndex((x) => x.id === Number(params.id))
    if (i >= 0) db.sessionsDb.splice(i, 1)
    return ok(null)
  }),
  http.get('/api/user/points', () => ok(db.pointsDb)),
  http.get('/api/user/coupon', () => ok(db.couponsDb)),

  // ===================== 工单 =====================
  http.get('/api/workorder/my', ({ request }) => {
    const u = guard(request)
    const list = db.workordersDb.filter((w) => w.tenantId === u.id || !w.tenantId)
    return ok({ list, total: list.length })
  }),
  http.post('/api/workorder/repair', async ({ request }) => {
    const u = guard(request)
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(b.houseId))
    db.workordersDb.unshift({
      ticketId: next(db.workordersDb, 1000),
      type: String(b.type || '报修'),
      title: String(b.title || (b.type === '投诉' ? '投诉' : '报修')),
      status: '待分派',
      createTime: db.now(),
      user: u.name,
      tenantId: u.id,
      houseTitle: h?.title,
      content: String(b.content || '')
    })
    notify('工单已提交', `您的${b.type === '投诉' ? '投诉' : '报修'}工单已受理，平台将尽快分派处理。`)
    return ok(null)
  }),
  http.get('/api/workorder/repair', ({ request }) => {
    guard(request)
    let list = db.workordersDb.filter((w) => w.type === '报修')
    const st = qs(request.url).get('status')
    if (st) list = list.filter((w) => w.status === st)
    return ok({ list, total: list.length })
  }),
  http.get('/api/workorder/list', ({ request }) => {
    guard(request)
    let list = db.workordersDb
    const st = qs(request.url).get('status')
    if (st) list = list.filter((w) => w.status === st)
    return ok({ list, total: list.length })
  }),
  http.get('/api/workorder/dispute', () => ok({ list: db.workordersDb.filter((w) => w.type === '投诉'), total: 0 })),
  http.get('/api/workorder/:id', ({ params }) =>
    ok(db.workordersDb.find((x) => x.ticketId === Number(params.id)) ?? null)),
  http.put('/api/workorder/:id', async ({ params, request }) => {
    const w = db.workordersDb.find((x) => x.ticketId === Number(params.id))
    if (w) Object.assign(w, await bodyOf(request))
    return ok(null)
  }),
  http.post('/api/workorder/:id/handle', async ({ params, request }) => {
    const b = await bodyOf(request)
    const w = db.workordersDb.find((x) => x.ticketId === Number(params.id))
    if (w) {
      w.status = String(b.status || '已关闭')
      w.handleResult = String(b.handleResult || '')
      w.closedAt = db.now()
      db.workorderLogs[w.ticketId] = [{ id: 1, action: '处理', operator: '管理员', toStatus: w.status, remark: w.handleResult, createTime: db.now() }]
    }
    return ok(null)
  }),
  http.post('/api/workorder/:id/cancel', ({ params }) => {
    const w = db.workordersDb.find((x) => x.ticketId === Number(params.id))
    if (w) w.status = '已关闭'
    return ok(null)
  }),
  http.get('/api/workorder/:id/log', ({ params }) =>
    ok({ list: db.workorderLogs[Number(params.id)] ?? [], total: 0 })),
  http.put('/api/admin/ticket/:id/assign', async ({ params, request }) => {
    const b = await bodyOf(request)
    const w = db.workordersDb.find((x) => x.ticketId === Number(params.id))
    if (w) {
      w.handler = String(b.handlerId || b.handler || '客服组')
      w.status = '处理中'
    }
    return ok(null)
  }),
  http.put('/api/admin/ticket/:id/close', () => ok(null)),
  http.put('/api/admin/ticket/:id/reopen', () => ok(null)),

  // ===================== 搜索 =====================
  http.get('/api/search/hot', () => ok(db.hotKeywords)),
  http.get('/api/search/suggest', ({ request }) => {
    const kw = qs(request.url).get('keyword') || ''
    const list = db.publicHouses()
      .filter((h) => h.title.includes(kw) || h.district.includes(kw))
      .slice(0, 6)
      .map((h) => ({ keyword: h.title }))
    return ok({ list, total: list.length })
  }),
  http.get('/api/search/house', () => ok({ list: db.publicHouses(), total: db.publicHouses().length })),
  http.post('/api/search/house', async ({ request }) => {
    const b = await bodyOf(request)
    const kw = String(b.q || '')
    const list = db.publicHouses().filter((h) => !kw || h.title.includes(kw))
    return ok({ list, total: list.length })
  }),
  http.get('/api/search/log', ({ request }) => {
    guard(request)
    return ok(page(request.url, db.searchLogsDb))
  }),
  http.post('/api/search/index/rebuild', () => ok(null)),

  // ===================== 风控 =====================
  http.get('/api/risk/blacklist', ({ request }) => {
    guard(request)
    return ok(page(request.url, db.blacklistDb.list))
  }),
  http.get('/api/risk/rule', () => ok(db.riskRulesDb)),
  http.get('/api/risk/record/:userId', ({ params }) =>
    ok(db.riskRecordsDb[Number(params.userId)] ?? { list: [], total: 0 })),
  http.post('/api/risk/decide', () => ok(null)),
  http.get('/api/admin/house/report/:id', ({ params }) =>
    ok(db.reportsDb.find((r) => r.id === Number(params.id)) ?? null)),
  http.post('/api/admin/house/report', async ({ request }) => {
    const b = await bodyOf(request)
    const r = db.reportsDb.find((x) => x.id === Number(b.id))
    if (r) {
      r.status = String(b.status || r.status)
      r.handleResult = String(b.handleResult || '')
    }
    return ok(null)
  }),
  http.put('/api/admin/house/report/:id', async ({ params, request }) => {
    const b = await bodyOf(request)
    const r = db.reportsDb.find((x) => x.id === Number(params.id))
    if (r) {
      r.status = String(b.status || r.status)
      r.handleResult = String(b.handleResult || '')
    }
    return ok(null)
  }),

  // ===================== 存储 =====================
  http.get('/api/storage/presign', () => ok('')),

  // ===================== 后台 =====================
  http.get('/api/admin/statistics/today', () => ok(db.dashboardToday)),
  http.get('/api/admin/statistics/gmv', () => ok(db.gmvData)),
  http.get('/api/admin/statistics/stock', () => ok(db.stockData)),
  http.post('/api/admin/statistics/export', () => ok(null)),
  http.get('/api/admin/houses', () => ok(db.housesDb.map((h) => ({ id: h.id, title: h.title, district: h.district, layout: h.layout, area: h.area, price: h.price, source: h.source, status: h.status, depositType: h.depositType, description: h.description })))),
  http.post('/api/admin/houses/audit', async ({ request }) => {
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(b.id))
    if (h) h.status = String(b.status || '可租')
    return ok(null)
  }),
  http.post('/api/admin/houses/reject', async ({ request }) => {
    const b = await bodyOf(request)
    const h = db.housesDb.find((x) => x.id === Number(b.id))
    if (h) h.status = '违规'
    void b
    return ok(null)
  }),
  http.get('/api/admin/users', () => ok(db.adminUsersDb)),
  http.post('/api/admin/users', async ({ request }) => {
    const b = await bodyOf(request)
    db.adminUsersDb.push({ id: db.nextId(), name: String(b.name || ''), role: String(b.role || '租客'), phone: String(b.phone || ''), status: '正常', regTime: db.now() })
    return ok(null)
  }),
  http.put('/api/admin/users/:id', async ({ params, request }) => {
    const u = db.adminUsersDb.find((x) => x.id === Number(params.id))
    if (u) Object.assign(u, await bodyOf(request))
    return ok(null)
  }),
  http.delete('/api/admin/users/:id', ({ params }) => {
    const i = db.adminUsersDb.findIndex((x) => x.id === Number(params.id))
    if (i >= 0) db.adminUsersDb.splice(i, 1)
    return ok(null)
  }),
  http.post('/api/admin/users/:id/toggle-status', async ({ params, request }) => {
    const b = await bodyOf(request)
    const u = db.adminUsersDb.find((x) => x.id === Number(params.id))
    if (u) u.status = String(b.status || '正常')
    return ok(null)
  }),
  http.get('/api/admin/orders', () => ok(db.adminOrdersDb)),
  http.post('/api/admin/orders/:id/confirm', ({ params }) => {
    const o = db.adminOrdersDb.find((x) => x.id === Number(params.id))
    if (o) o.status = '已完成'
    return ok(null)
  }),
  http.post('/api/admin/orders/:id/refund', ({ params }) => {
    const o = db.adminOrdersDb.find((x) => x.id === Number(params.id))
    if (o) o.status = '待支付'
    return ok(null)
  }),
  http.get('/api/admin/contracts', () => ok(db.adminContractsDb)),
  http.post('/api/admin/contracts/:id/remind', () => ok(null)),
  http.post('/api/admin/contracts/:id/cancel', ({ params }) => {
    const c = db.adminContractsDb.find((x) => x.id === Number(params.id))
    if (c) c.status = '已终止'
    return ok(null)
  }),
  http.get('/api/admin/finances', () => ok(db.adminFinancesDb)),
  http.post('/api/admin/finances/:id/withdraw', ({ params }) => {
    const f = db.adminFinancesDb.find((x) => x.id === Number(params.id))
    if (f) f.settleStatus = '已提现'
    return ok(null)
  }),
  http.post('/api/admin/finances/:id/dispute', ({ params }) => {
    const f = db.adminFinancesDb.find((x) => x.id === Number(params.id))
    if (f) f.settleStatus = '冻结'
    return ok(null)
  }),
  http.get('/api/admin/tickets', () => ok(db.adminTicketsDb)),
  http.post('/api/admin/tickets/:id/assign', async ({ params, request }) => {
    const b = await bodyOf(request)
    const t = db.adminTicketsDb.find((x) => x.id === Number(params.id))
    if (t) {
      t.handler = String(b.handler || '客服组')
      t.status = '处理中'
    }
    return ok(null)
  }),
  http.post('/api/admin/tickets/:id/transfer', async ({ params, request }) => {
    const b = await bodyOf(request)
    const t = db.adminTicketsDb.find((x) => x.id === Number(params.id))
    if (t) t.handler = String(b.handler || t.handler)
    return ok(null)
  }),
  http.post('/api/admin/tickets/:id/visit', () => ok(null)),
  http.get('/api/admin/contents', () => ok(db.adminContentsDb)),
  http.post('/api/admin/contents', async ({ request }) => {
    const b = await bodyOf(request)
    db.adminContentsDb.unshift({ id: next(db.adminContentsDb, 100), type: String(b.type || '公告'), title: String(b.title || ''), body: String(b.body || ''), status: '草稿', createdAt: db.now() })
    return ok(null)
  }),
  http.put('/api/admin/contents/:id', async ({ params, request }) => {
    const c = db.adminContentsDb.find((x) => x.id === Number(params.id))
    if (c) Object.assign(c, await bodyOf(request))
    return ok(null)
  }),
  http.post('/api/admin/contents/:id/publish', ({ params }) => {
    const c = db.adminContentsDb.find((x) => x.id === Number(params.id))
    if (c) {
      c.status = '已发布'
      c.publishTime = db.now()
    }
    return ok(null)
  }),
  http.post('/api/admin/contents/:id/offline', ({ params }) => {
    const c = db.adminContentsDb.find((x) => x.id === Number(params.id))
    if (c) c.status = '草稿'
    return ok(null)
  }),
  http.get('/api/admin/system/roles', () => ok(db.adminRolesDb)),
  http.post('/api/admin/system/roles', async ({ request }) => {
    const b = await bodyOf(request)
    db.adminRolesDb.push({ id: db.nextId(), name: String(b.name || ''), remark: String(b.remark || ''), status: 1 })
    return ok(null)
  }),
  http.put('/api/admin/system/roles/:id', async ({ params, request }) => {
    const r = db.adminRolesDb.find((x) => x.id === Number(params.id))
    if (r) Object.assign(r, await bodyOf(request))
    return ok(null)
  }),
  http.delete('/api/admin/system/roles/:id', ({ params }) => {
    const i = db.adminRolesDb.findIndex((x) => x.id === Number(params.id))
    if (i >= 0) db.adminRolesDb.splice(i, 1)
    return ok(null)
  }),
  http.get('/api/admin/system/admins', () => ok(db.adminUsersItemDb)),
  http.post('/api/admin/system/admins', async ({ request }) => {
    const b = await bodyOf(request)
    db.adminUsersItemDb.push({ id: db.nextId(), user: String(b.user || ''), role: String(b.role || '审核员'), status: '启用' })
    return ok(null)
  }),
  http.put('/api/admin/system/admins/:id', async ({ params, request }) => {
    const a = db.adminUsersItemDb.find((x) => x.id === Number(params.id))
    if (a) Object.assign(a, await bodyOf(request))
    return ok(null)
  }),
  http.post('/api/admin/system/admins/:id/toggle-status', ({ params }) => {
    const a = db.adminUsersItemDb.find((x) => x.id === Number(params.id))
    if (a) a.status = a.status === '启用' ? '停用' : '启用'
    return ok(null)
  }),
  http.get('/api/admin/system/menus', () => ok(db.adminMenusDb)),
  http.get('/api/admin/system/dicts', () => ok(db.adminDictsDb)),
  http.get('/api/admin/system/logs', () => ok(db.adminLogsDb)),
  http.get('/api/admin/system/params', () => ok(db.sysParamsDb)),
  http.put('/api/admin/system/params', async ({ request }) => {
    Object.assign(db.sysParamsDb, await bodyOf(request))
    return ok(null)
  })
]

// 兜底：未匹配的 /api 请求统一返回「接口未实现」（保持 safe() 回退语义）
export const fallbackHandler = http.all('/api/*', () => fail('接口未实现'))
