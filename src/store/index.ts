import { defineStore } from 'pinia'
import {
  houses as houseData,
  myHouses as myHouseData,
  landlordBookings as bookingSeed,
  type House,
  type Booking
} from '@/mock/data'

// 租客在线签约生成的合同（与房源一致，存于 app store 单一事实源）
export interface TenantContract {
  id: number
  houseId: number
  houseTitle: string
  term: number
  start: string
  amount: number
  status: '生效中'
  createdAt: string
}

// 全站唯一房源事实源：租客/房东/后台三方都从这里读，写也只写这里。
// 合并「平台/经纪人房源(houses)」与「房东自发布房源(myHouses)」两套种子数据。
// 看房预约、签约合同同样归 app store 管理，保证租客提交与房东查看是同一份数据。
export const useAppStore = defineStore('app', {
  state: () => ({
    city: '北京',
    houses: [...houseData, ...myHouseData] as House[],
    collects: new Set<number>(),
    // 看房预约：租客提交与房东查看共用（单一事实源）
    bookings: bookingSeed.map((b) => ({ ...b })) as Booking[],
    // 租客在线签约生成的合同
    contracts: [] as TenantContract[]
  }),
  getters: {
    collectList(state): House[] {
      return state.houses.filter((h) => state.collects.has(h.id))
    },
    // 租客端公开可浏览的房源：仅「可租 / 已租」，过滤掉待审核 / 已下架 / 违规
    publicHouses(state): House[] {
      return state.houses.filter((h) => h.status === '可租' || h.status === '已租')
    }
  },
  actions: {
    toggleCollect(id: number) {
      if (this.collects.has(id)) this.collects.delete(id)
      else this.collects.add(id)
    },
    isCollected(id: number) {
      return this.collects.has(id)
    },
    // 租客提交看房预约
    addBooking(b: Booking) {
      this.bookings.unshift(b)
    },
    // 房东确认 / 拒绝预约
    confirmBooking(id: number) {
      const b = this.bookings.find((x) => x.id === id)
      if (b) b.status = '已确认'
    },
    rejectBooking(id: number) {
      const b = this.bookings.find((x) => x.id === id)
      if (b) b.status = '已拒绝'
    },
    // 租客签约落成合同
    addContract(c: TenantContract) {
      this.contracts.unshift(c)
    }
  }
})
