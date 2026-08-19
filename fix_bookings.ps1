$content = @'
<template>
  <div class="page-max">
    <div class="toolbar">
      <div>
        <h3>看房预约</h3>
        <p class="sub">租客发来的看房申请，确认后请主动联系约定时间</p>
      </div>
      <div class="actions" v-if="selected.length">
        <span class="selected-count">已选 {{ selected.length }} 条</span>
        <el-button size="small" type="success" @click="batchConfirm">批量确认</el-button>
        <el-button size="small" type="danger" plain @click="batchReject">批量拒绝</el-button>
      </div>
    </div>

    <el-card shadow="never" class="card">
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="bookings" stripe v-loading="loading" @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column label="房源" min-width="140">
          <template #default="{ row }">{{ row.houseTitle || ('房源#' + row.houseId) }}</template>
        </el-table-column>
        <el-table-column prop="userName" label="租客" width="90" />
        <el-table-column prop="userPhone" label="联系电话" width="130" />
        <el-table-column prop="appointmentTime" label="期望时间" width="160" />
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag('booking', row.status)" size="small">{{ row.status }}</el-tag>
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

    <!-- 批量拒绝弹窗 -->
    <el-dialog v-model="showBatchReject" title="批量拒绝预约" width="400px">
      <el-form label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="batchRejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchReject = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="doBatchReject">确认批量拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getLandlordBookings, confirmBooking, rejectBooking, type BookingItem } from '@/api/booking'
import { statusTag } from '@/utils/status'

const router = useRouter()
const { list: bookings, loading, error, reload } = useTable<BookingItem>(() => getLandlordBookings())
const submitting = ref(false)
const showReject = ref(false)
const rejectReason = ref('')
const rejectTarget = ref<BookingItem | null>(null)
const selected = ref<BookingItem[]>([])

// 批量拒绝
const showBatchReject = ref(false)
const batchRejectReason = ref('')

function handleSelection(rows: BookingItem[]) {
  selected.value = rows
}

async function confirm(row: BookingItem) {
  const r = await safe(confirmBooking(row.id), {})
  if (okRes(r)) {
    ElMessage.success('已确认，请尽快联系租客')
    reload()
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
    reload()
  } else {
    ElMessage.error(msgOf(r))
  }
}

function detail(row: BookingItem) {
  router.push(`/landlord/bookings/${row.id}`)
}

// 批量操作
function batchConfirm() {
  ElMessageBox.confirm(`确认批量确认 ${selected.value.length} 条预约？`, '批量确认', { type: 'info' })
    .then(async () => {
      for (const row of selected.value) {
        if (row.status === '待确认') {
          await safe(confirmBooking(row.id), {})
        }
      }
      ElMessage.success('已批量确认')
      selected.value = []
      reload()
    })
    .catch(() => {})
}

function batchReject() {
  if (!selected.value.some(r => r.status === '待确认')) {
    return ElMessage.warning('没有可拒绝的预约')
  }
  batchRejectReason.value = ''
  showBatchReject.value = true
}

async function doBatchReject() {
  if (!batchRejectReason.value) {
    return ElMessage.warning('请输入拒绝原因')
  }
  submitting.value = true
  let successCount = 0
  for (const row of selected.value) {
    if (row.status === '待确认') {
      const r = await safe(rejectBooking(row.id, batchRejectReason.value), {})
      if (okRes(r)) successCount++
    }
  }
  submitting.value = false
  ElMessage.success(`已拒绝 ${successCount} 条预约`)
  showBatchReject.value = false
  selected.value = []
  reload()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}
.sub {
  color: var(--sub);
  margin: 0 0 4px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.selected-count {
  color: var(--sub);
  font-size: 13px;
}
.card {
  border-radius: 12px;
}
.done {
  color: var(--sub);
  font-size: 13px;
}
</style>
'@
$content | Out-File -FilePath 'D:\Project\rent-deploy\src\views\landlord\Bookings.vue' -Encoding UTF8
Write-Host 'Bookings.vue fixed with batch operations'
