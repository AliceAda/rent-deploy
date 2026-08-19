<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>押金管理</span>
          <el-space>
            <el-select v-model="filterType" placeholder="类型" clearable style="width: 120px">
              <el-option label="收取" value="collect" />
              <el-option label="退还" value="return" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="deposits" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'collect' ? 'var(--green)' : 'var(--red)', fontWeight: 'bold' }">
              {{ row.type === 'collect' ? '+' : '-' }}¥{{ row.amount?.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'collect' ? 'success' : 'warning'" size="small">
              {{ row.type === 'collect' ? '收取' : '退还' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'settled' ? 'success' : 'info'" size="small">
              {{ row.status === 'settled' ? '已结算' : '待结算' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column prop="settledAt" label="结算时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="settle(row)">结算</el-button>
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
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
import { getDeposits, settleDeposit, type DepositRecord } from '@/api/extensions'

const loading = ref(false)
const deposits = ref<DepositRecord[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterType = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await getDeposits({ page: page.value, size: size.value, type: filterType.value })
    if (res.code === 0) {
      deposits.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载押金记录失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: DepositRecord) {
  ElMessage.info('查看详情功能开发中')
}

async function settle(row: DepositRecord) {
  try {
    const res = await settleDeposit(row.id, { action: 'settle' })
    if (res.code === 0) {
      ElMessage.success('结算成功')
      loadData()
    }
  } catch (e) {
    ElMessage.error('结算失败')
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
