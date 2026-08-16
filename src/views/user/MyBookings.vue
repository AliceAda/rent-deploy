<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>我的预约</h3>
      <el-table :data="list" v-loading="loading" empty-text="暂无预约，去房源详情预约看房吧">
        <el-table-column label="房源" min-width="160">
          <template #default="{ row }">房源 #{{ row.houseId }}</template>
        </el-table-column>
        <el-table-column prop="appointmentTime" label="预约时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button v-if="row.status === '待确认'" size="small" type="danger" text @click="cancel(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import { getMyBookings, cancelBooking, type BookingItem } from '@/api/booking'

const list = ref<BookingItem[]>([])
const loading = ref(false)

function statusType(s: string) {
  if (s === '已确认') return 'success'
  if (s === '已拒绝') return 'danger'
  return 'warning' // 待确认
}
async function load() {
  loading.value = true
  const r = await safe(getMyBookings(), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}
async function cancel(row: BookingItem) {
  await ElMessageBox.confirm('确认取消该看房预约？', '提示', { type: 'warning' })
  const r = await safe(cancelBooking(row.id), {})
  if (r.code === 0) {
    ElMessage.success('已取消')
    load()
  } else {
    ElMessage.error(r.message || '取消失败')
  }
}
onMounted(load)
</script>
