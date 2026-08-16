import { defineStore } from 'pinia'
import { type House, type Booking } from '@/mock/data'
import { useAppStore } from '@/store'
import { useAuthStore } from '@/store/auth'

// 当前登录房东在 appStore 房源中的归属 id（与 auth 房东账号 id 对齐）
const CURRENT_LANDLORD_ID = 2

// 房东中心状态：房源与看房预约全部以 appStore 为唯一事实源（不另存一份），
// 这里只做「按当前房东归属过滤」的派生与写操作委派。
export const useLandlordStore = defineStore('landlord', {
  state: () => ({
    _cache: { lid: 0, houses: [] as House[], bookings: [] as Booking[] }
  }),
  getters: {
    _lid(): number {
      return useAuthStore().user?.id ?? CURRENT_LANDLORD_ID
    },
    // 我的房源 = 全局房源中归属当前房东的部分（单一事实源映射）
    myHouses(): House[] {
      const app = useAppStore()
      const lid = this._lid
      // 缓存失效时重新计算
      if (this._cache.lid !== lid || this._cache.houses.length !== app.houses.length) {
        this._cache.lid = lid
        this._cache.houses = app.houses.filter((h) => h.landlordId === lid)
      }
      return this._cache.houses
    },
    // 看房预约 = 全局预约中归属当前房东房源的部分（单一事实源映射）
    bookings(): Booking[] {
      const app = useAppStore()
      const lid = this._lid
      // 缓存失效时重新计算
      if (this._cache.lid !== lid || this._cache.bookings.length !== app.bookings.length) {
        this._cache.lid = lid
        this._cache.bookings = app.bookings.filter((b) => {
          const h = app.houses.find((x) => x.id === b.houseId)
          return h && h.landlordId === lid
        })
      }
      return this._cache.bookings
    },
    rentableCount(): number {
      return this.myHouses.filter((h) => h.status === '可租').length
    },
    reviewCount(): number {
      return this.myHouses.filter((h) => h.status === '待审核').length
    },
    offCount(): number {
      return this.myHouses.filter((h) => h.status === '已下架').length
    },
    pendingBookings(): number {
      return this.bookings.filter((b) => b.status === '待确认').length
    }
  },
  actions: {
    // 发布：写入全局房源（租客端与后台即时可见，按 status 控制是否对租客公开）
    addHouse(h: House) {
      const app = useAppStore()
      const auth = useAuthStore()
      h.landlordId = auth.user?.id ?? CURRENT_LANDLORD_ID
      app.houses.unshift(h)
    },
    removeHouse(id: number) {
      const app = useAppStore()
      app.houses = app.houses.filter((h) => h.id !== id)
    },
    setStatus(id: number, status: House['status']) {
      const app = useAppStore()
      const h = app.houses.find((x) => x.id === id)
      if (h) h.status = status
    },
    // 确认 / 拒绝预约：委派回 appStore（单一事实源写入口）
    confirmBooking(id: number) {
      useAppStore().confirmBooking(id)
    },
    rejectBooking(id: number) {
      useAppStore().rejectBooking(id)
    }
  }
})
