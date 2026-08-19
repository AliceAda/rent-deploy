import { defineStore } from 'pinia'
import { safe } from '@/api/http'
import { getMyOrders, type OrderItem } from '@/api/order'
import { getMyCollects, type CollectItem } from '@/api/collect'
import { getMyBookings, type BookingItem } from '@/api/booking'
import { getMyContracts, type ContractItem } from '@/api/contract'
import { getMyWorkOrders, type WorkOrderItem } from '@/api/workorder'
import { getMyMessages, readMessage, type MessageItem } from '@/api/message'
import { getMyAddresses, type AddressItem } from '@/api/address'
import { getRealnameStatus, type RealnameStatus } from '@/api/user'
import { getMyPoints, getMyCoupons, type PointsInfo, type CouponItem } from '@/api/points'

interface ListData<T> {
  list: T[]
  total: number
}

export const useUserCenterStore = defineStore('userCenter', {
  state: () => ({
    collectList: [] as CollectItem[],
    bookings: [] as BookingItem[],
    orders: [] as OrderItem[],
    contracts: [] as ContractItem[],
    repairs: [] as WorkOrderItem[],
    messages: [] as MessageItem[],
    addresses: [] as AddressItem[],
    realname: null as RealnameStatus | null,
    points: { points: 0, level: '' } as PointsInfo,
    coupons: [] as CouponItem[],
    loading: false
  }),
  actions: {
    // 进入"我的"时一次性拉取所有二级数据；各接口独立容错
    async loadAll() {
      this.loading = true
      const [c, b, o, ct, r, m, a, rn, p, cp] = await Promise.all([
        safe(getMyCollects(), { list: [], total: 0 }),
        safe(getMyBookings(), { list: [], total: 0 }),
        safe(getMyOrders(), { list: [], total: 0 }),
        safe(getMyContracts(), { list: [], total: 0 }),
        safe(getMyWorkOrders(), { list: [], total: 0 }),
        safe(getMyMessages(), { list: [], total: 0 }),
        safe(getMyAddresses(), { list: [], total: 0 }),
        safe(getRealnameStatus(), { status: 'none' } as RealnameStatus),
        safe(getMyPoints(), { points: 0, level: '' } as PointsInfo),
        safe(getMyCoupons(), { list: [], total: 0 })
      ])
      this.collectList = c.data?.list ?? []
      this.bookings = b.data?.list ?? []
      this.orders = o.data?.list ?? []
      this.contracts = ct.data?.list ?? []
      this.repairs = r.data?.list ?? []
      this.messages = m.data?.list ?? []
      this.addresses = a.data?.list ?? []
      this.realname = rn.data ?? null
      this.points = p.data ?? { points: 0, level: '' }
      this.coupons = cp.data?.list ?? []
      this.loading = false
    },
    async readMessage(id: number) {
      await safe(readMessage(id), {})
      const it = this.messages.find((x) => x.messageId === id)
      if (it) it.read = true
    }
  }
})
