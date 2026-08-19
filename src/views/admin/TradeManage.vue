<template>
  <div>
    <el-card shadow="never" class="block">
      <template #header><b>看房预约</b></template>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="bookings" border v-loading="loading">
        <el-table-column prop="orderNo" label="预约号" width="150" />
        <el-table-column prop="houseTitle" label="房源" min-width="160" />
        <el-table-column prop="tenantName" label="租客" width="90" />
        <el-table-column prop="agent" label="经纪人" width="90" />
        <el-table-column prop="createdAt" label="预约时间" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '已完成' ? 'success' : row.status === '待确认' ? 'warning' : 'info'" size="small">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="success" plain v-if="row.status === '待确认'" :loading="submitting" @click="doConfirm(row)">确认</el-button>
            <el-button size="small" plain @click="doDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && bookings.length === 0" description="暂无预约" />
    </el-card>

    <el-card shadow="never" class="block">
      <template #header><b>订单 / 支付流水</b></template>
      <el-table :data="payments" border v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="150" />
        <el-table-column prop="houseTitle" label="房源" min-width="160" />
        <el-table-column prop="tenantName" label="租客" width="90" />
        <el-table-column label="金额" width="110">
          <template #default="{ row }"><span class="price">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '已支付' ? 'success' : row.status === '待支付' ? 'warning' : 'info'" size="small">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="160" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" plain @click="doFlow(row)">流水</el-button>
            <el-button size="small" type="danger" plain v-if="row.status === '已支付'" :loading="submitting" @click="doRefund(row)">退款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && payments.length === 0" description="暂无订单" />
    </el-card>

    <el-dialog v-model="detailVisible" title="预约详情" width="460px">
      <el-descriptions :column="1" border v-if="detail">
        <el-descriptions-item label="预约号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ detail.houseTitle }}</el-descriptions-item>
        <el-descriptions-item label="租客">{{ detail.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="经纪人">{{ detail.agent }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getAdminOrders, confirmOrder, refundOrder, type AdminOrder } from '@/api/admin'

const submitting = ref(false)
const { list, loading, error, reload } = useTable<AdminOrder>(() => getAdminOrders())
const detailVisible = ref(false)
const detail = ref<AdminOrder | null>(null)

const bookings = computed(() => list.value.filter((o) => o.type === '看房预约'))
const payments = computed(() => list.value.filter((o) => o.type === '预订'))

async function doConfirm(row: AdminOrder) {
  submitting.value = true
  const res = await safe(confirmOrder(row.id), {})
  if (okRes(res)) {
    row.status = '已完成'
    ElMessage.success(`已确认预约 ${row.orderNo}`)
  }
  submitting.value = false
}
function doDetail(row: AdminOrder) {
  detail.value = row
  detailVisible.value = true
}
async function doRefund(row: AdminOrder) {
  try {
    await ElMessageBox.confirm(`确定对订单 ${row.orderNo}（¥${row.amount}）发起退款？`, '退款确认', { type: 'warning', confirmButtonText: '确定退款', confirmButtonClass: 'el-button--danger' })
    submitting.value = true
    const res = await safe(refundOrder(row.id), {})
    if (okRes(res)) {
      row.status = '待支付'
      ElMessage.success(`退款已发起，金额 ¥${row.amount}`)
    }
    submitting.value = false
  } catch { /* 取消 */ }
}
function doFlow(row: AdminOrder) {
  ElMessage.info(`流水号：P${row.orderNo}001，金额：¥${row.amount}，支付渠道：微信支付，时间：${row.createdAt}，状态：成功`)
}
</script>

<style scoped>
.block { margin-bottom: 14px; }
</style>