<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>退租管理</span>
          <el-space>
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="terminations" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="contractNo" label="合同编号" width="180" />
        <el-table-column prop="houseTitle" label="房源" min-width="180" />
        <el-table-column prop="tenantName" label="租客" width="100" />
        <el-table-column prop="reason" label="退租原因" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ typeMap[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退款金额" width="120">
          <template #default="{ row }">
            <span v-if="row.refundAmount" style="color: var(--green)">¥{{ row.refundAmount.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="penaltyAmount" label="违约金" width="120">
          <template #default="{ row }">
            <span v-if="row.penaltyAmount" style="color: var(--red)">¥{{ row.penaltyAmount.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="process(row)">处理</el-button>
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

    <!-- 处理弹窗 -->
    <el-dialog v-model="processVisible" title="处理退租" width="500px">
      <el-form label-width="100px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="processForm.action">
            <el-radio value="approve">批准退租</el-radio>
            <el-radio value="reject">拒绝退租</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退款金额" v-if="processForm.action === 'approve'">
          <el-input-number v-model="processForm.refundAmount" :precision="2" :min="0" style="width: 150px" />
          <span style="margin-left: 8px">元</span>
        </el-form-item>
        <el-form-item label="违约金" v-if="processForm.action === 'approve'">
          <el-input-number v-model="processForm.penaltyAmount" :precision="2" :min="0" style="width: 150px" />
          <span style="margin-left: 8px">元</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="processForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleProcess">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTerminations, processTermination, type Termination } from '@/api/extensions'

const loading = ref(false)
const submitting = ref(false)
const terminations = ref<Termination[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterStatus = ref('')

const processVisible = ref(false)
const currentTermination = ref<Termination | null>(null)
const processForm = ref({ action: 'approve', refundAmount: 0, penaltyAmount: 0, remark: '' })

const typeMap: Record<string, string> = {
  normal: '正常退租',
  breach: '违约退租',
  negotiation: '协商解约'
}

const statusMap: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  rejected: '已拒绝'
}

function statusType(status: string): '' | 'warning' | 'primary' | 'success' | 'danger' {
  const types: Record<string, '' | 'warning' | 'primary' | 'success' | 'danger'> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getTerminations({ page: page.value, size: size.value, status: filterStatus.value })
    if (res.code === 0) {
      terminations.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载退租列表失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: Termination) {
  ElMessage.info('查看详情功能开发中')
}

function process(row: Termination) {
  currentTermination.value = row
  processForm.value = { action: 'approve', refundAmount: 0, penaltyAmount: 0, remark: '' }
  processVisible.value = true
}

async function handleProcess() {
  if (!currentTermination.value?.id) return
  submitting.value = true
  try {
    const res = await processTermination(currentTermination.value.id, {
      action: processForm.value.action,
      remark: processForm.value.remark
    })
    if (res.code === 0) {
      ElMessage.success('处理成功')
      processVisible.value = false
      loadData()
    }
  } catch (e) {
    ElMessage.error('处理失败')
  } finally {
    submitting.value = false
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
