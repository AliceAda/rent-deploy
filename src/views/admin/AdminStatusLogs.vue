<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>状态日志</span>
          <el-space>
            <el-input v-model="searchOrder" placeholder="搜索订单号" clearable style="width: 200px" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column prop="action" label="操作" width="120" />
        <el-table-column prop="fromStatus" label="原状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.fromStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="toStatus" label="新状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.toStatus)" size="small">{{ row.toStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="createdAt" label="时间" width="160" />
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderStatusLogs, type OrderStatusLog } from '@/api/extensions'

const loading = ref(false)
const logs = ref<OrderStatusLog[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const searchOrder = ref('')

const statusMap: Record<string, string> = {
  '待支付': 'pending',
  '已支付': 'paid',
  '已取消': 'cancelled',
  '已完成': 'completed'
}

function statusType(status: string): '' | 'warning' | 'success' | 'danger' | 'info' {
  const types: Record<string, '' | 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'danger',
    completed: 'info'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderStatusLogs({ page: page.value, size: size.value })
    if (res.code === 0) {
      logs.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载状态日志失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
