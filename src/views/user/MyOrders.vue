<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>我的订单</h3>
      <el-tabs v-model="tab">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待确认" name="confirm" />
        <el-tab-pane label="待支付" name="unpaid" />
        <el-tab-pane label="进行中" name="active" />
        <el-tab-pane label="已完成" name="done" />
      </el-tabs>
      <el-table :data="filtered" v-loading="loading" empty-text="暂无订单">
        <el-table-column prop="title" label="房源/服务" min-width="160" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button v-if="row.status === '待支付'" size="small" type="primary" @click="pay(row)">去支付</el-button>
            <el-button size="small" text @click="detail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getMyOrders, payOrder, type OrderItem } from '@/api/order'

const list = ref<OrderItem[]>([])
const loading = ref(false)
const tab = ref('all')
const router = useRouter()

function statusType(s: string) {
  if (s === '已支付' || s === '已完成') return 'success'
  if (s === '待确认' || s === '待支付') return 'warning'
  if (s === '已取消') return 'info'
  return ''
}
const filtered = computed(() => {
  if (tab.value === 'all') return list.value
  const map: Record<string, string[]> = {
    confirm: ['待确认'],
    unpaid: ['待支付'],
    active: ['已确认', '已支付'],
    done: ['已完成']
  }
  return list.value.filter((o) => (map[tab.value] || []).includes(o.status))
})
async function load() {
  loading.value = true
  const r = await safe(getMyOrders(), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}
async function pay(row: OrderItem) {
  const r = await safe(payOrder(row.orderId), {})
  if (r.code === 0 && r.data?.payUrl) {
    window.open(r.data.payUrl, '_blank')
  } else if (r.code === 0) {
    ElMessage.success('支付成功')
    load()
  } else {
    ElMessage.error(r.message || '支付失败')
  }
}
function detail(row: OrderItem) {
  router.push('/orders/' + row.orderId)
}
onMounted(load)
</script>
