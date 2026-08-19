<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>税务管理</span>
        </div>
      </template>

      <el-table :data="taxRecords" v-loading="loading" stripe>
        <el-table-column prop="taxNo" label="税务编号" width="180" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="taxRate" label="税率" width="100">
          <template #default="{ row }">{{ row.taxRate }}%</template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" width="120">
          <template #default="{ row }">¥{{ row.taxAmount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column prop="declaredAt" label="申报时间" width="160" />
        <el-table-column prop="paidAt" label="缴纳时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="declare(row)">申报</el-button>
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
    <el-dialog v-model="detailVisible" title="税务详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="税务编号">{{ currentRecord?.taxNo }}</el-descriptions-item>
        <el-descriptions-item label="金额">
          <span style="color: var(--red); font-weight: bold">¥{{ currentRecord?.amount?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="税率">{{ currentRecord?.taxRate }}%</el-descriptions-item>
        <el-descriptions-item label="税额">
          <span style="color: var(--orange); font-weight: bold">¥{{ currentRecord?.taxAmount?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentRecord?.status)">{{ statusMap[currentRecord?.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRecord?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="申报时间">{{ currentRecord?.declaredAt || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="缴纳时间">{{ currentRecord?.paidAt || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTaxRecords, submitTaxDeclaration, type TaxRecord } from '@/api/extensions'

const loading = ref(false)
const taxRecords = ref<TaxRecord[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const detailVisible = ref(false)
const currentRecord = ref<TaxRecord | null>(null)

const statusMap: Record<string, string> = {
  pending: '待申报',
  declared: '已申报',
  paid: '已缴纳'
}

function statusType(status: string): '' | 'warning' | 'primary' | 'success' {
  const types: Record<string, '' | 'warning' | 'primary' | 'success'> = {
    pending: 'warning',
    declared: 'primary',
    paid: 'success'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getTaxRecords({ page: page.value, size: size.value })
    if (res.code === 0) {
      taxRecords.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载税务记录失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: TaxRecord) {
  currentRecord.value = row
  detailVisible.value = true
}

async function declare(row: TaxRecord) {
  try {
    const res = await submitTaxDeclaration(row.id)
    if (res.code === 0) {
      ElMessage.success('申报成功')
      loadData()
    }
  } catch (e) {
    ElMessage.error('申报失败')
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
