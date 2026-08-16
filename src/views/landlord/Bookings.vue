<template>
  <div class="page-max">
    <h3>看房预约</h3>
    <p class="sub">租客发来的看房申请，确认后请主动联系约定时间</p>

    <el-card shadow="never" class="card">
      <el-table :data="landlord.bookings" stripe>
        <el-table-column prop="houseTitle" label="房源" min-width="140" />
        <el-table-column prop="tenant" label="租客" width="90" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="time" label="期望时间" width="150" />
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '待确认' ? 'warning' : row.status === '已确认' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
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
            <span v-if="row.status !== '待确认'" class="done">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useLandlordStore } from '@/store/landlord'
import type { Booking } from '@/mock/data'

const landlord = useLandlordStore()

function confirm(row: Booking) {
  landlord.confirmBooking(row.id)
  ElMessage.success('已确认，请尽快联系租客')
}
function reject(row: Booking) {
  landlord.rejectBooking(row.id)
  ElMessage.info('已拒绝该预约')
}
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
