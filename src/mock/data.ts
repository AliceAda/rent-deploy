// 房源类型定义
export interface House {
  id: number
  title: string
  district: string
  community: string
  address: string
  layout: string
  area: number
  floor: string
  totalFloors: number
  orientation: string
  decoration: string
  rentType: '整租' | '合租' | '公寓'
  price: number
  deposit: number
  status: '可租' | '已租' | '待审核' | '违规' | '已下架'
  views: number
  collectCount: number
  rating: number
  reviewCount: number
  landlordId: number
  landlordName: string
  images: string[]
  facilities: string[]
  tags: string[]
  lng?: number
  lat?: number
  roomId?: number
  createdAt: string
}

// 订单类型定义
export interface Order {
  id: number
  orderNo: string
  houseId: number
  tenantId: number
  landlordId: number
  amount: number
  status: '待支付' | '已支付' | '已取消' | '已完成'
  startDate: string
  endDate: string
  createdAt: string
}

// 合同类型定义
export interface Contract {
  id: number
  contractNo: string
  houseId: number
  tenantId: number
  landlordId: number
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  status: '草稿' | '待签订' | '生效中' | '已到期' | '已终止'
  signedAt: string
  createdAt: string
}

// 预约类型定义
export interface Booking {
  id: number
  houseId: number
  tenantId: number
  time: string
  status: '待确认' | '已确认' | '已拒绝'
  remark: string
  createdAt: string
}

// 评价类型定义
export interface Review {
  id: number
  houseId: number
  orderId: number
  fromUserId: number
  toUserId: number
  type: '房源' | '房东' | '租客'
  rating: number
  content: string
  createdAt: string
}

// 用户类型定义
export interface User {
  id: number
  name: string
  phone: string
  role: 'tenant' | 'landlord' | 'agent' | 'admin'
  avatar?: string
  email?: string
  certStatus?: string
  accountStatus?: string
}

// 经纪人类型定义
export interface Agent {
  id: number
  name: string
  phone: string
  storeName: string
  level: '见习' | '初级' | '中级' | '高级' | '金牌'
  certNo: string
  status: number
  createdAt: string
}

// 楼栋类型定义
export interface Building {
  id: number
  name: string
  district: string
  community: string
  totalFloors: number
  totalUnits: number
  status: '正常' | '停用'
  createdAt: string
}

// 区域类型定义
export interface Region {
  id: number
  name: string
  cityId: number
}

// 地铁站点类型定义
export interface Metro {
  id: number
  name: string
  line: string
}

// 区域列表数据
export const regions: Region[] = [
  { id: 1, name: '朝阳区', cityId: 1 },
  { id: 2, name: '海淀区', cityId: 1 },
  { id: 3, name: '东城区', cityId: 1 },
  { id: 4, name: '西城区', cityId: 1 },
  { id: 5, name: '丰台区', cityId: 1 },
  { id: 6, name: '石景山区', cityId: 1 },
  { id: 7, name: '通州区', cityId: 1 },
  { id: 8, name: '大兴区', cityId: 1 },
  { id: 9, name: '昌平区', cityId: 1 },
  { id: 10, name: '顺义区', cityId: 1 }
]

// 地铁站点列表数据
export const metros: Metro[] = [
  { id: 1, name: '天安门西站', line: '1号线' },
  { id: 2, name: '王府井站', line: '1号线' },
  { id: 3, name: '东单站', line: '1号线' },
  { id: 4, name: '西单站', line: '1号线' },
  { id: 5, name: '四惠站', line: '1号线' },
  { id: 6, name: '国贸站', line: '1号线' },
  { id: 7, name: '芍药居站', line: '10号线' },
  { id: 8, name: '惠新西街北口', line: '5号线' },
  { id: 9, name: '立水桥站', line: '5号线' },
  { id: 10, name: '天通苑站', line: '5号线' }
]

// 模拟房源数据（用于开发阶段）
export const houses: House[] = []

// 模拟订单数据
export const orders: Order[] = []

// 模拟合同数据
export const contracts: Contract[] = []

// 模拟预约数据
export const bookings: Booking[] = []

// 模拟评价数据
export const reviews: Review[] = []

// 模拟管理员数据
export const adminUsers: User[] = []

// 模拟经纪人数据
export const agents: Agent[] = []

// 模拟楼栋数据
export const buildings: Building[] = []

// 模拟仪表盘数据
export const dashboard = {
  newHouse: 0,
  newOrder: 0,
  deal: 0,
  todo: 0
}

// 模拟房东账单数据
export const landlordBills = []
