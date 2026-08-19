<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" content="预约详情" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="booking" shadow="never" class="mb16">
        <div class="status-bar">
          <el-tag :type="statusType(booking.status)" size="large">{{ booking.status }}</el-tag>
          <div v-if="booking.status === '待确认'" class="actions">
            <el-button type="success" @click="confirm">确认预约</el-button>
            <el-button type="danger" plain @click="showReject = true">拒绝</el-button>
          </div>
        </div>
      </el-card>

      <el-card v-if="booking" shadow="never">
        <template #header><span>预约信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房源">{{ booking.houseTitle || `房源#${booking.houseId}` }}</el-descriptions-item>
          <el-descriptions-item label="预约人">{{ booking.userName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ booking.userPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="预约时间">{{ booking.appointmentTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ booking.status }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ booking.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ booking.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <el-dialog v-model="showReject" title="拒绝预约" width="400px">
      <el-form label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReject = false">取消</el-button>
        <el-button type="danger" @click="doReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { getBookingDetail, confirmBooking, rejectBooking, type BookingItem } from '@/api/booking'
import { statusTag } from '@/utils/status'

const route = useRoute()
const router = useRouter()
const bookingId = Number(route.params.id)
const booking = ref<BookingItem | null>(null)
const loading = ref(false)
const showReject = ref(false)
const rejectReason = ref('')

function statusType(s: string) {
  return statusTag('booking', s)
}

async function load() {
  loading.value = true
  const r = await safe(getBookingDetail(bookingId), {} as BookingItem)
  booking.value = r.data
  loading.value = false
}

async function confirm() {
  const r = await safe(confirmBooking(bookingId), {})
  if (okRes(r)) { ElMessage.success('已确认预约'); load() }
  else ElMessage.error(msgOf(r))
}

async function doReject() {
  const r = await safe(rejectBooking(bookingId, rejectReason.value), {})
  if (okRes(r)) { ElMessage.success('已拒绝'); showReject.value = false; load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 8px; }
</style>
