<template>
  <div class="page-max">
    <h3>看房预约</h3>
    <p class="sub">租客发来的看房申请，确认后请主动联系约定时间</p>

    <el-card shadow="never" class="card">
      <el-table :data="bookings" stripe v-loading="loading" empty-text="暂无预约">
        <el-table-column label="房源" min-width="140">
          <template #default="{ row }">{{ row.houseTitle || `房源#${row.houseId}` }}</template>
        </el-table-column>
        <el-table-column prop="userName" label="租客" width="90" />
        <el-table-column prop="userPhone" label="联系电话" width="130" />
        <el-table-column prop="appointmentTime" label="期望时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '待确认' ? 'warning' : row.status === '已确认' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '待确认'"
              text
              type="success"
              size="small"
              @click="confirm(row)"
            >确认</el-button>
            <el-button
              v-if="row.status === '待确认'"
              text
              type="danger"
              size="small"
              @click="reject(row)"
            >拒绝</el-button>
            <el-button
              text
              type="primary"
              size="small"
              @click="detail(row)"
            >详情</el-button>
            <span v-if="row.status !== '待确认'" class="done">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showReject" title="拒绝预约" width="400px">
      <el-form label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReject = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="doReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { getLandlordBookings, confirmBooking, rejectBooking, type BookingItem } from '@/api/booking'

const router = useRouter()
const bookings = ref<BookingItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const showReject = ref(false)
const rejectReason = ref('')
const rejectTarget = ref<BookingItem | null>(null)

async function load() {
  loading.value = true
  const r = await safe(getLandlordBookings(), { list: [], total: 0 })
  bookings.value = r.data?.list ?? []
  loading.value = false
}

async function confirm(row: BookingItem) {
  const r = await safe(confirmBooking(row.id), {})
  if (okRes(r)) {
    ElMessage.success('已确认，请尽快联系租客')
    load()
  } else {
    ElMessage.error(msgOf(r))
  }
}

function reject(row: BookingItem) {
  rejectTarget.value = row
  rejectReason.value = ''
  showReject.value = true
}

async function doReject() {
  if (!rejectTarget.value) return
  submitting.value = true
  const r = await safe(rejectBooking(rejectTarget.value.id, rejectReason.value), {})
  submitting.value = false
  if (okRes(r)) {
    ElMessage.info('已拒绝该预约')
    showReject.value = false
    rejectTarget.value = null
    load()
  } else {
    ElMessage.error(msgOf(r))
  }
}

function detail(row: BookingItem) {
  router.push(`/landlord/bookings/${row.id}`)
}

onMounted(load)
</script>

<style scoped>
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.card {
  border-radius: 12px;
}
.done {
  color: var(--sub);
  font-size: 13px;
}
</style>
