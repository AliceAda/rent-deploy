<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>财务对账</span>
          <el-button type="primary" @click="loadData">刷新</el-button>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-box">
              <div class="stat-label">今日对账金额</div>
              <div class="stat-value">¥{{ todayAmount?.toFixed(2) || '0.00' }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-box">
              <div class="stat-label">平台佣金</div>
              <div class="stat-value" style="color: var(--blue)">¥{{ todayPlatformFee?.toFixed(2) || '0.00' }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-box">
              <div class="stat-label">房东金额</div>
              <div class="stat-value" style="color: var(--green)">¥{{ todayLandlordAmount?.toFixed(2) || '0.00' }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-box">
              <div class="stat-label">经纪人金额</div>
              <div class="stat-value" style="color: var(--orange)">¥{{ todayAgentAmount?.toFixed(2) || '0.00' }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table :data="reconciliations" v-loading="loading" stripe>
        <el-table-column prop="batchNo" label="批次号" width="180" />
        <el-table-column prop="date" label="对账日期" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">¥{{ row.totalAmount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="platformFee" label="平台佣金" width="120">
          <template #default="{ row }">¥{{ row.platformFee?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="landlordAmount" label="房东金额" width="120">
          <template #default="{ row }">¥{{ row.landlordAmount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="agentAmount" label="经纪人金额" width="120">
          <template #default="{ row }">¥{{ row.agentAmount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="reconcile(row)">对账</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="对账详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="批次号">{{ currentRecord?.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="对账日期">{{ currentRecord?.date }}</el-descriptions-item>
        <el-descriptions-item label="总金额">
          <span style="color: var(--red); font-weight: bold">¥{{ currentRecord?.totalAmount?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="平台佣金">¥{{ currentRecord?.platformFee?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="房东金额">¥{{ currentRecord?.landlordAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="经纪人金额">¥{{ currentRecord?.agentAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentRecord?.status)">{{ statusMap[currentRecord?.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRecord?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentRecord?.completedAt || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReconciliations, reconcileBatch, type Reconciliation } from '@/api/extensions'

const loading = ref(false)
const reconciliations = ref<Reconciliation[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const detailVisible = ref(false)
const currentRecord = ref<Reconciliation | null>(null)

const statusMap: Record<string, string> = {
  pending: '待对账',
  processing: '对账中',
  completed: '已完成',
  error: '异常'
}

const todayAmount = computed(() => reconciliations.value.find(r => r.date === new Date().toISOString().split('T')[0])?.totalAmount)
const todayPlatformFee = computed(() => reconciliations.value.find(r => r.date === new Date().toISOString().split('T')[0])?.platformFee)
const todayLandlordAmount = computed(() => reconciliations.value.find(r => r.date === new Date().toISOString().split('T')[0])?.landlordAmount)
const todayAgentAmount = computed(() => reconciliations.value.find(r => r.date === new Date().toISOString().split('T')[0])?.agentAmount)

function statusType(status: string): '' | 'warning' | 'primary' | 'success' | 'danger' {
  const types: Record<string, '' | 'warning' | 'primary' | 'success' | 'danger'> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    error: 'danger'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getReconciliations({ page: page.value, size: size.value })
    if (res.code === 0) {
      reconciliations.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载对账列表失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: Reconciliation) {
  currentRecord.value = row
  detailVisible.value = true
}

async function reconcile(row: Reconciliation) {
  try {
    const res = await reconcileBatch(row.id)
    if (res.code === 0) {
      ElMessage.success('对账成功')
      loadData()
    }
  } catch (e) {
    ElMessage.error('对账失败')
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
.stat-box {
  text-align: center;
}
.stat-label {
  font-size: 13px;
  color: var(--sub);
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--txt);
}
</style>
