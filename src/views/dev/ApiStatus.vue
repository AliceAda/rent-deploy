<template>
  <div class="page-max" style="padding: 24px">
    <h3>API 就绪矩阵</h3>
    <p class="sub">
      探测 src/api 下全部 GET 端点，输出「已实现 / 未实现」矩阵。仅开发环境可用，后端一就绪即可用本页验收。
      <span v-if="!isDev" class="text-sub">（生产构建不可用）</span>
    </p>

    <div v-if="isDev">
      <div style="margin-bottom: 14px; display: flex; gap: 12px; align-items: center">
        <el-button type="primary" :loading="running" @click="probe">重新探测</el-button>
        <el-tag type="success">{{ stats.ok }} 就绪</el-tag>
        <el-tag type="danger">{{ stats.fail }} 未实现</el-tag>
        <el-tag type="warning">{{ stats.timeout }} 超时</el-tag>
        <el-tag v-if="stats.total" type="info">共 {{ stats.total }} 个端点</el-tag>
      </div>

      <el-table :data="rows" v-loading="running" size="small" border>
        <el-table-column prop="module" label="模块" width="110" />
        <el-table-column prop="name" label="接口" min-width="200" />
        <el-table-column prop="path" label="路径" min-width="220">
          <template #default="{ row }"><code>{{ row.path }}</code></template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ms" label="耗时" width="90">
          <template #default="{ row }">{{ row.ms ? row.ms + 'ms' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="detail" label="说明" min-width="200">
          <template #default="{ row }"><span class="text-sub">{{ row.detail }}</span></template>
        </el-table-column>
      </el-table>
    </div>
    <el-empty v-else description="仅开发环境可用（import.meta.env.DEV）" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getAuthUser } from '@/api/auth'
import { getHouseList, getHouseDetail, getRegions, getMetroLines, getFacilities, getHouseTags, getLandlordHouses } from '@/api/house'
import { getMyBookings, getLandlordBookings, getBookingDetail } from '@/api/booking'
import { getMyContracts, getLandlordContracts, getContractTemplates } from '@/api/contract'
import { getMyBills, getLandlordBills } from '@/api/bill'
import { getMyOrders, getLandlordOrders } from '@/api/order'
import { getPayMethods, getRefundList, getWithdrawList } from '@/api/pay'
import { getMyMessages } from '@/api/message'
import { getMyAddresses } from '@/api/address'
import { getMyCollects } from '@/api/collect'
import { getMyPoints, getMyCoupons } from '@/api/points'
import { getSessions } from '@/api/session'
import { getMyWorkOrders, getRepairOrders } from '@/api/workorder'
import { getHotKeywords, getSearchLogs } from '@/api/search'
import { getUserProfile, getRealnameStatus } from '@/api/user'
import { getNotifySetting } from '@/api/notify'
import { getBlacklist, getRiskRules, getReportDetail } from '@/api/risk'
import {
  getAdminHouses, getAdminUsers, getAdminOrders, getAdminContracts,
  getAdminFinances, getAdminTickets, getAdminRoles, getAdminDicts,
  getAdminMenus, getAdminLogs, getSysParams, getAdminContents,
  getDashboardToday, getGmvStat, getStockStat
} from '@/api/admin'

const isDev = import.meta.env.DEV

type Status = 'ok' | 'fail' | 'timeout'

interface Endpoint {
  module: string
  name: string
  path: string
  run: () => Promise<{ code: number; message?: string; msg?: string }>
}

const ENDPOINTS: Endpoint[] = [
  { module: '认证', name: '当前用户', path: 'GET /user/me', run: () => getAuthUser() },
  { module: '房源', name: '房源列表', path: 'GET /house/list', run: () => getHouseList() },
  { module: '房源', name: '房源详情', path: 'GET /house/1', run: () => getHouseDetail(1) },
  { module: '房源', name: '地区级联', path: 'GET /house/region', run: () => getRegions() },
  { module: '房源', name: '地铁线路', path: 'GET /house/metro', run: () => getMetroLines() },
  { module: '房源', name: '设施字典', path: 'GET /house/facility', run: () => getFacilities() },
  { module: '房源', name: '标签字典', path: 'GET /house/tag', run: () => getHouseTags() },
  { module: '房源', name: '房东房源', path: 'GET /landlord/houses', run: () => getLandlordHouses() },
  { module: '预约', name: '我的预约', path: 'GET /booking/my', run: () => getMyBookings() },
  { module: '预约', name: '房东预约', path: 'GET /landlord/bookings', run: () => getLandlordBookings() },
  { module: '预约', name: '预约详情', path: 'GET /booking/1', run: () => getBookingDetail(1) },
  { module: '合同', name: '我的合同', path: 'GET /contract/my', run: () => getMyContracts() },
  { module: '合同', name: '房东合同', path: 'GET /contract/landlord', run: () => getLandlordContracts() },
  { module: '合同', name: '合同模板', path: 'GET /contract/templates', run: () => getContractTemplates() },
  { module: '账单', name: '我的账单', path: 'GET /bill/my', run: () => getMyBills() },
  { module: '账单', name: '房东账单', path: 'GET /landlord/bills', run: () => getLandlordBills() },
  { module: '订单', name: '我的订单', path: 'GET /order/my', run: () => getMyOrders() },
  { module: '订单', name: '房东订单', path: 'GET /landlord/orders', run: () => getLandlordOrders() },
  { module: '支付', name: '支付方式', path: 'GET /pay/methods', run: () => getPayMethods() },
  { module: '支付', name: '退款列表', path: 'GET /pay/refund', run: () => getRefundList() },
  { module: '支付', name: '提现列表', path: 'GET /pay/withdraw', run: () => getWithdrawList() },
  { module: '消息', name: '我的消息', path: 'GET /message/my', run: () => getMyMessages() },
  { module: '地址', name: '我的地址', path: 'GET /user/address', run: () => getMyAddresses() },
  { module: '收藏', name: '我的收藏', path: 'GET /user/collect', run: () => getMyCollects() },
  { module: '积分', name: '积分信息', path: 'GET /user/points', run: () => getMyPoints() },
  { module: '积分', name: '优惠券', path: 'GET /user/coupon', run: () => getMyCoupons() },
  { module: '会话', name: '登录会话', path: 'GET /user/session', run: () => getSessions() },
  { module: '工单', name: '我的工单', path: 'GET /workorder/my', run: () => getMyWorkOrders() },
  { module: '工单', name: '房东报修', path: 'GET /landlord/workorder', run: () => getRepairOrders() },
  { module: '搜索', name: '热搜词', path: 'GET /search/hot', run: () => getHotKeywords() },
  { module: '搜索', name: '搜索日志', path: 'GET /admin/search/logs', run: () => getSearchLogs() },
  { module: '用户', name: '个人资料', path: 'GET /user/me', run: () => getUserProfile() },
  { module: '用户', name: '实名状态', path: 'GET /user/realname', run: () => getRealnameStatus() },
  { module: '用户', name: '通知设置', path: 'GET /user/notify-setting', run: () => getNotifySetting() },
  { module: '风控', name: '黑名单', path: 'GET /admin/blacklist', run: () => getBlacklist() },
  { module: '风控', name: '风控规则', path: 'GET /risk/rule', run: () => getRiskRules() },
  { module: '风控', name: '举报详情', path: 'GET /admin/house/report/1', run: () => getReportDetail(1) },
  { module: '后台', name: '今日指标', path: 'GET /admin/statistics/today', run: () => getDashboardToday() },
  { module: '后台', name: 'GMV 统计', path: 'GET /admin/statistics/gmv', run: () => getGmvStat('month') },
  { module: '后台', name: '库存统计', path: 'GET /admin/statistics/stock', run: () => getStockStat() },
  { module: '后台', name: '房源管理', path: 'GET /admin/houses', run: () => getAdminHouses() },
  { module: '后台', name: '用户管理', path: 'GET /admin/users', run: () => getAdminUsers() },
  { module: '后台', name: '订单管理', path: 'GET /admin/orders', run: () => getAdminOrders() },
  { module: '后台', name: '合同管理', path: 'GET /admin/contracts', run: () => getAdminContracts() },
  { module: '后台', name: '财务流水', path: 'GET /admin/finances', run: () => getAdminFinances() },
  { module: '后台', name: '工单管理', path: 'GET /admin/tickets', run: () => getAdminTickets() },
  { module: '后台', name: '角色管理', path: 'GET /admin/system/roles', run: () => getAdminRoles() },
  { module: '后台', name: '数据字典', path: 'GET /admin/system/dicts', run: () => getAdminDicts() },
  { module: '后台', name: '菜单管理', path: 'GET /admin/system/menus', run: () => getAdminMenus() },
  { module: '后台', name: '操作日志', path: 'GET /admin/system/logs', run: () => getAdminLogs() },
  { module: '后台', name: '系统参数', path: 'GET /admin/system/params', run: () => getSysParams() },
  { module: '后台', name: '内容管理', path: 'GET /admin/contents', run: () => getAdminContents() }
]

interface Row {
  module: string
  name: string
  path: string
  status: Status | 'pending'
  ms: number
  detail: string
}

const running = ref(false)
const rows = ref<Row[]>(
  ENDPOINTS.map((e) => ({ module: e.module, name: e.name, path: e.path, status: 'pending' as const, ms: 0, detail: '' }))
)

const stats = computed(() => {
  const s = { ok: 0, fail: 0, timeout: 0, total: rows.value.length }
  for (const r of rows.value) {
    if (r.status === 'ok') s.ok++
    else if (r.status === 'fail') s.fail++
    else if (r.status === 'timeout') s.timeout++
  }
  return s
})

function statusType(s: Row['status']): string {
  return { ok: 'success', fail: 'danger', timeout: 'warning', pending: 'info' }[s]
}
function statusText(s: Row['status']): string {
  return { ok: '已实现', fail: '未实现', timeout: '超时', pending: '探测中…' }[s]
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms)
    p.then((v) => { clearTimeout(t); resolve(v) }, (e) => { clearTimeout(t); reject(e) })
  })
}

async function probe() {
  running.value = true
  rows.value = ENDPOINTS.map((e) => ({ module: e.module, name: e.name, path: e.path, status: 'pending' as const, ms: 0, detail: '' }))
  await Promise.all(
    rows.value.map(async (row, i) => {
      const e = ENDPOINTS[i]
      const start = performance.now()
      try {
        const res = await withTimeout(Promise.resolve(e.run()), 5000)
        row.ms = Math.round(performance.now() - start)
        if (res.code === 0) {
          row.status = 'ok'
          row.detail = '接口已实现'
        } else {
          row.status = 'fail'
          row.detail = `code=${res.code} ${res.message || res.msg || ''}`.trim()
        }
      } catch (err) {
        row.ms = Math.round(performance.now() - start)
        const msg = err instanceof Error ? err.message : String(err)
        if (msg === 'timeout') {
          row.status = 'timeout'
          row.detail = '5s 无响应'
        } else {
          row.status = 'fail'
          row.detail = msg
        }
      }
    })
  )
  running.value = false
}

if (isDev) probe()
</script>

<style scoped>
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
</style>
