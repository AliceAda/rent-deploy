<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>账单管理</span>
          <el-space>
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="待支付" value="待支付" />
              <el-option label="已支付" value="已支付" />
              <el-option label="已逾期" value="已逾期" />
            </el-select>
            <el-button type="primary" @click="handleGenerate">生成月度账单</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="bills" v-loading="loading" stripe>
        <el-table-column prop="billNo" label="账单号" width="180" />
        <el-table-column prop="houseTitle" label="房源" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="到期日" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === '待支付'" size="small" type="primary" @click="handlePay(row)">
              支付
            </el-button>
            <el-button size="small" @click="handleView(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadBills"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 生成账单弹窗 -->
    <el-dialog v-model="generateVisible" title="生成月度账单" width="400px">
      <el-form label-width="100px">
        <el-form-item label="月份">
          <el-date-picker
            v-model="generateForm.month"
            type="month"
            placeholder="选择月份"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="房源">
          <el-select v-model="generateForm.houseId" placeholder="全部房源" clearable style="width: 100%">
            <el-option v-for="h in houses" :key="h.id" :label="h.title" :value="h.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="handleConfirmGenerate">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLandlordBills, generateMonthlyBill, type LandlordBill } from '@/api/landlord'

const loading = ref(false)
const bills = ref<LandlordBill[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterStatus = ref<string>('')

const generateVisible = ref(false)
const generating = ref(false)
const generateForm = ref({ month: '', houseId: 0 })

const houses = ref([
  { id: 1, title: '望京西园精装两居' },
  { id: 2, title: '朝阳公园附近一居室' }
])

function getStatusType(status: string): 'warning' | 'success' | 'danger' {
  const types: Record<string, 'warning' | 'success' | 'danger'> = {
    '待支付': 'warning',
    '已支付': 'success',
    '已逾期': 'danger'
  }
  return types[status] || 'info'
}

async function loadBills() {
  loading.value = true
  try {
    const res = await getLandlordBills({
      page: page.value,
      size: size.value,
  status: filterStatus.value
    })
    if (res.code === 0) {
      bills.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载账单失败')
  } finally {
    loading.value = false
  }
}

function handleGenerate() {
  generateForm.value = { month: '', houseId: 0 }
  generateVisible.value = true
}

async function handleConfirmGenerate() {
  if (!generateForm.value.month) {
    return ElMessage.warning('请选择月份')
  }
  generating.value = true
  try {
    const res = await generateMonthlyBill(generateForm.value)
    if (res.code === 0) {
      ElMessage.success('账单生成成功')
      generateVisible.value = false
      loadBills()
    }
  } catch (e) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

function handlePay(bill: LandlordBill) {
  ElMessage.info(`跳转支付：¥${bill.amount}`)
}

function handleView(bill: LandlordBill) {
  ElMessage.info(`查看账单详情：${bill.billNo}`)
}

onMounted(loadBills)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount {
  font-weight: 600;
  color: #F56C6C;
}
</style>
