// ===== 模拟数据（后端接口未就绪前的占位，结构对齐后端 HouseVO） =====

import type { HouseItem } from '@/api/house'

export interface House extends HouseItem {
  // 配套/标签为后端 HouseFacilityVO / HouseTagVO 聚合展示字段
  facilities: string[]
  tags: string[]
  // 地图找房模拟坐标（真实项目替换为 lng/lat + 高德/百度地图）
  x?: number
  y?: number
}

export const houses: House[] = [
  { id: 1, title: '望京 SOHO 精装一居 近地铁', city: '北京', district: '朝阳区', rentType: '整租', layout: '1室1厅', area: 52, floor: '12/24', orientation: '南', decoration: '精装', price: 6800, depositType: '押一付三', facilities: ['电梯', '燃气', '宠物'], tags: ['近地铁', '精装修', '可短租'], status: '可租', views: 328, collectCount: 42, landlordId: 101, agentId: 201, source: '经纪人代发', description: '望京核心区，步行5分钟到14号线，采光好，拎包入住。', grade: 4.8, x: 72, y: 38 },
  { id: 2, title: '回龙观 温馨合租主卧 性价比高', city: '北京', district: '昌平区', rentType: '合租', layout: '4室1厅', area: 18, floor: '6/18', orientation: '南', decoration: '简装', price: 2300, depositType: '押一付一', facilities: ['电梯', '车位'], tags: ['近地铁', '低价', '合租'], status: '可租', views: 512, collectCount: 88, landlordId: 102, source: '房东自发布', description: '回龙观东大街，13号线直达，主卧独卫，公共区域干净。', grade: 4.5, x: 40, y: 22 },
  { id: 3, title: '国贸 高端公寓 拎包入住', city: '北京', district: '朝阳区', rentType: '公寓', layout: '开间', area: 35, floor: '20/30', orientation: '东', decoration: '精装', price: 5200, depositType: '押一付三', facilities: ['电梯', '车位', '燃气'], tags: ['公寓', '管家服务', '可养宠'], status: '可租', views: 201, collectCount: 30, landlordId: 103, agentId: 202, source: '经纪人代发', description: 'CBD核心，24h安保，含保洁维修，适合白领。', grade: 4.9, x: 80, y: 55 },
  { id: 4, title: '天通苑 三居整租 大空间', city: '北京', district: '昌平区', rentType: '整租', layout: '3室2厅', area: 118, floor: '8/11', orientation: '南北', decoration: '精装', price: 8900, depositType: '押一付三', facilities: ['电梯', '燃气', '车位'], tags: ['南北通透', '大户型', '地铁房'], status: '可租', views: 176, collectCount: 25, landlordId: 104, source: '房东自发布', description: '南北通透三居，小区环境好，适合家庭。', grade: 4.6, x: 46, y: 12 },
  { id: 5, title: '中关村 一居 学区周边', city: '北京', district: '海淀区', rentType: '整租', layout: '1室1厅', area: 46, floor: '5/9', orientation: '南', decoration: '简装', price: 5600, depositType: '押一付三', facilities: ['电梯', '燃气'], tags: ['近地铁', '学区', '安静'], status: '已租', views: 140, collectCount: 18, landlordId: 105, source: '房东自发布', description: '中关村核心，近多所高校，生活便利。', grade: 4.3, x: 30, y: 60 },
  { id: 6, title: '亦庄 合租次卧 通勤友好', city: '北京', district: '大兴区', rentType: '合租', layout: '3室1厅', area: 15, floor: '3/6', orientation: '北', decoration: '简装', price: 1800, depositType: '押一付一', facilities: ['电梯'], tags: ['低价', '近产业园'], status: '可租', views: 390, collectCount: 51, landlordId: 106, agentId: 203, source: '经纪人代发', description: '亦庄经开区，产业园通勤15分钟，次卧朝北安静。', grade: 4.4, x: 64, y: 80 }
]

export interface PlatformUser {
  id: number
  name: string
  role: '租客' | '房东' | '经纪人' | '平台'
  phone: string
  cert: '已认证' | '待审核' | '未通过'
  status: '正常' | '冻结' | '封禁'
  credit: number
  regTime: string
}

export const users: PlatformUser[] = [
  { id: 101, name: '王女士', role: '房东', phone: '138****1021', cert: '已认证', status: '正常', credit: 98, regTime: '2025-11-02' },
  { id: 102, name: '李先生', role: '房东', phone: '139****2233', cert: '已认证', status: '正常', credit: 95, regTime: '2026-01-15' },
  { id: 201, name: '赵中介', role: '经纪人', phone: '137****8890', cert: '已认证', status: '正常', credit: 92, regTime: '2025-09-20' },
  { id: 203, name: '钱中介', role: '经纪人', phone: '136****5512', cert: '待审核', status: '正常', credit: 80, regTime: '2026-03-08' },
  { id: 301, name: '小陈', role: '租客', phone: '135****6677', cert: '已认证', status: '正常', credit: 88, regTime: '2026-02-11' },
  { id: 302, name: '老周', role: '租客', phone: '134****0098', cert: '未通过', status: '冻结', credit: 60, regTime: '2026-04-01' }
]

export interface Order {
  id: number
  no: string
  houseId: number
  houseTitle: string
  type: '看房预约' | '预订'
  tenant: string
  agent: string
  amount: number
  status: '待确认' | '已确认' | '已取消' | '已完成' | '待支付' | '已支付'
  time: string
}

export const orders: Order[] = [
  { id: 1, no: 'B20260812001', houseId: 1, houseTitle: '望京 SOHO 精装一居', type: '看房预约', tenant: '小陈', agent: '赵中介', amount: 0, status: '待确认', time: '2026-08-15 14:00' },
  { id: 2, no: 'B20260811002', houseId: 2, houseTitle: '回龙观 合租主卧', type: '看房预约', tenant: '小陈', agent: '—', amount: 0, status: '已完成', time: '2026-08-10 10:30' },
  { id: 3, no: 'O20260809003', houseId: 3, houseTitle: '国贸 高端公寓', type: '预订', tenant: '老周', agent: '赵中介', amount: 10400, status: '已支付', time: '2026-08-09 19:22' }
]

export interface Contract {
  id: number
  no: string
  houseTitle: string
  tenant: string
  landlord: string
  start: string
  end: string
  rent: number
  deposit: number
  status: '草稿' | '待签署' | '生效中' | '已到期' | '已终止'
}

export const contracts: Contract[] = [
  { id: 1, no: 'C2026080001', houseTitle: '望京 SOHO 精装一居', tenant: '小陈', landlord: '王女士', start: '2026-09-01', end: '2027-08-31', rent: 6800, deposit: 6800, status: '待签署' },
  { id: 2, no: 'C2026070007', houseTitle: '回龙观 合租主卧', tenant: '小陈', landlord: '李先生', start: '2026-07-10', end: '2027-07-09', rent: 2300, deposit: 2300, status: '生效中' },
  { id: 3, no: 'C2026050012', houseTitle: '天通苑 三居整租', tenant: '老周', landlord: '刘先生', start: '2026-05-20', end: '2027-05-19', rent: 8900, deposit: 8900, status: '生效中' }
]

export interface Ticket {
  id: number
  no: string
  type: '报修' | '投诉'
  houseTitle: string
  tenant: string
  content: string
  status: '待分派' | '处理中' | '待回访' | '已关闭'
  handler: string
  time: string
}

export const tickets: Ticket[] = [
  { id: 1, no: 'R20260812001', type: '报修', houseTitle: '望京 SOHO 精装一居', tenant: '小陈', content: '水龙头漏水，需上门维修', status: '处理中', handler: '维修组-张师傅', time: '2026-08-12 09:30' },
  { id: 2, no: 'T20260811002', type: '投诉', houseTitle: '回龙观 合租主卧', tenant: '小陈', content: '合租室友深夜噪音', status: '待分派', handler: '—', time: '2026-08-11 22:10' }
]

export interface FinanceRow {
  id: number
  no: string
  biz: string
  total: number
  platformFee: number
  landlordAmt: number
  agentAmt: number
  settle: '待结算' | '已结算' | '已提现' | '冻结'
  time: string
}

export const finances: FinanceRow[] = [
  { id: 1, no: 'S20260809003', biz: '国贸公寓 预订', total: 10400, platformFee: 2600, landlordAmt: 6500, agentAmt: 1300, settle: '已结算', time: '2026-08-09' },
  { id: 2, no: 'S20260805002', biz: '望京一居 预订', total: 27200, platformFee: 6800, landlordAmt: 17000, agentAmt: 3400, settle: '已提现', time: '2026-08-05' },
  { id: 3, no: 'S20260812001', biz: '亦庄合租 预订', total: 3600, platformFee: 900, landlordAmt: 2250, agentAmt: 450, settle: '冻结', time: '2026-08-12' }
]

// 看板数据
export const dashboard = {
  today: { newHouse: 12, newOrder: 8, deal: 3, todo: 5 },
  trend: [320, 412, 380, 510, 600, 720, 690, 810, 760, 920, 880, 1040],
  funnel: { expose: 12000, inquiry: 3200, visit: 860, sign: 240 },
  cityDist: [
    { name: '朝阳区', value: 38 },
    { name: '昌平区', value: 22 },
    { name: '海淀区', value: 18 },
    { name: '大兴区', value: 12 },
    { name: '其他', value: 10 }
  ]
}

// ===== 房东中心模拟数据（当前登录房东视角） =====

// 我的房源（房东自己发布的房源，含审核/上架/出租/下架等状态）
export const myHouses: House[] = [
  { id: 201, title: '百子湾 两居 业主直租', city: '北京', district: '朝阳区', rentType: '整租', layout: '2室1厅', area: 78, floor: '9/18', orientation: '南', decoration: '精装', price: 7800, depositType: '押一付三', facilities: ['电梯', '燃气', '宠物'], tags: ['近地铁', '精装修', '可短租'], status: '可租', views: 156, collectCount: 23, landlordId: 2, source: '房东自发布', description: '百子湾核心区，近7号线，业主直租无中介费，南北通透。', grade: 4.7, x: 68, y: 45 },
  { id: 202, title: '天通苑 次卧 合租', city: '北京', district: '昌平区', rentType: '合租', layout: '4室1厅', area: 15, floor: '3/6', orientation: '北', decoration: '简装', price: 1900, depositType: '押一付一', facilities: ['电梯'], tags: ['低价', '合租'], status: '待审核', views: 40, collectCount: 5, landlordId: 2, source: '房东自发布', description: '天通苑东区次卧，近5号线，拎包入住。', grade: 4.2, x: 46, y: 12 },
  { id: 203, title: '国贸 开间 公寓', city: '北京', district: '朝阳区', rentType: '公寓', layout: '开间', area: 38, floor: '20/30', orientation: '东', decoration: '精装', price: 5400, depositType: '押一付三', facilities: ['电梯', '车位', '燃气'], tags: ['公寓', '管家服务'], status: '已租', views: 88, collectCount: 12, landlordId: 2, source: '房东自发布', description: '国贸 CBD 开间公寓，含保洁维修，已出租。', grade: 4.6, x: 80, y: 55 },
  { id: 204, title: '回龙观 一居 整租', city: '北京', district: '昌平区', rentType: '整租', layout: '1室1厅', area: 50, floor: '5/9', orientation: '南', decoration: '简装', price: 5200, depositType: '押一付三', facilities: ['电梯', '燃气'], tags: ['近地铁', '低价'], status: '已下架', views: 62, collectCount: 9, landlordId: 2, source: '房东自发布', description: '回龙观一居，近13号线，已下架待重新发布。', grade: 4.1, x: 40, y: 22 }
]

// 看房预约（租客发来的看房申请）
export interface Booking {
  id: number
  houseId: number
  houseTitle: string
  tenant: string
  phone: string
  time: string
  remark: string
  status: '待确认' | '已确认' | '已拒绝'
}
export const landlordBookings: Booking[] = [
  { id: 1, houseId: 201, houseTitle: '百子湾 两居', tenant: '小陈', phone: '135****6677', time: '2026-08-15 14:00', remark: '想看采光和周边配套', status: '待确认' },
  { id: 2, houseId: 201, houseTitle: '百子湾 两居', tenant: '小王', phone: '138****2233', time: '2026-08-16 10:00', remark: '周末看房，两人同行', status: '已确认' },
  { id: 3, houseId: 203, houseTitle: '国贸 开间', tenant: '老周', phone: '134****0098', time: '2026-08-12 19:00', remark: '已租，咨询续约', status: '已拒绝' },
  { id: 4, houseId: 204, houseTitle: '回龙观 一居', tenant: '小李', phone: '137****8890', time: '2026-08-14 16:30', remark: '复租意向，先看房', status: '待确认' }
]

// 房东账单（租金收缴）
export interface LandlordBill {
  id: number
  month: string
  houseTitle: string
  tenant: string
  amount: number
  paid: number
  status: '待收' | '已收' | '逾期'
}
export const landlordBills: LandlordBill[] = [
  { id: 1, month: '2026-08', houseTitle: '百子湾 两居', tenant: '小陈', amount: 7800, paid: 7800, status: '已收' },
  { id: 2, month: '2026-08', houseTitle: '国贸 开间', tenant: '老周', amount: 5400, paid: 5400, status: '已收' },
  { id: 3, month: '2026-07', houseTitle: '回龙观 一居', tenant: '小赵', amount: 5200, paid: 5200, status: '已收' },
  { id: 4, month: '2026-09', houseTitle: '百子湾 两居', tenant: '小陈', amount: 7800, paid: 0, status: '待收' },
  { id: 5, month: '2026-06', houseTitle: '回龙观 一居', tenant: '小赵', amount: 5200, paid: 2600, status: '逾期' }
]

// (房东合同数据已迁移至独立合同页，接入 /contract/landlord，此处不再保留 mock)
