<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>纠纷管理</span>
          <el-space>
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="investigating" />
              <el-option label="已解决" value="resolved" />
              <el-option label="已撤销" value="withdrawn" />
              <el-option label="已关闭" value="closed" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="disputes" v-loading="loading" stripe>
        <el-table-column prop="disputeNo" label="纠纷编号" width="180" />
        <el-table-column prop="orderId" label="订单号" width="120">
          <template #default="{ row }">{{ row.orderNo }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ typeMap[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="complainantName" label="投诉人" width="100" />
        <el-table-column prop="respondentName" label="被投诉人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="investigate(row)">处理</el-button>
            <el-button v-if="row.status === 'investigating'" size="small" type="success" @click="closeDispute(row)">关闭</el-button>
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
    <el-dialog v-model="detailVisible" title="纠纷详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="纠纷编号">{{ currentDispute?.disputeNo }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentDispute?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag>{{ typeMap[currentDispute?.type] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentDispute?.status)">{{ statusMap[currentDispute?.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="投诉人">{{ currentDispute?.complainantName }}</el-descriptions-item>
        <el-descriptions-item label="被投诉人">{{ currentDispute?.respondentName }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentDispute?.title }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentDispute?.description }}</el-descriptions-item>
        <el-descriptions-item label="证据" :span="2">
          <el-image
            v-for="(img, idx) in currentDispute?.evidence"
            :key="idx"
            :src="img"
            style="width: 80px; height: 80px; margin-right: 8px"
            fit="cover"
          />
        </el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2">{{ currentDispute?.result || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDispute?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="解决时间">{{ currentDispute?.resolvedAt || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 处理弹窗 -->
    <el-dialog v-model="investigateVisible" title="处理纠纷" width="500px">
      <el-form label-width="80px">
        <el-form-item label="处理结果">
          <el-input v-model="investigateForm.result" type="textarea" :rows="4" placeholder="请输入处理结果" />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="investigateForm.action" style="width: 100%">
            <el-option label="平台介入调解" value="mediate" />
            <el-option label="判定投诉成立" value="support_complainant" />
            <el-option label="判定投诉不成立" value="reject_complainant" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="investigateVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleInvestigate">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDisputes, getDisputeDetail, investigateDispute, closeDispute, type Dispute } from '@/api/extensions'

const loading = ref(false)
const submitting = ref(false)
const disputes = ref<Dispute[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterStatus = ref('')

const detailVisible = ref(false)
const investigateVisible = ref(false)
const currentDispute = ref<Dispute | null>(null)
const investigateForm = ref({ result: '', action: 'mediate' })

const typeMap: Record<string, string> = {
  quality: '质量问题',
  service: '服务问题',
  fee: '费用问题',
  contract: '合同问题'
}

const statusMap: Record<string, string> = {
  pending: '待处理',
  investigating: '处理中',
  resolved: '已解决',
  withdrawn: '已撤销',
  closed: '已关闭'
}

function statusType(status: string): '' | 'warning' | 'primary' | 'success' | 'info' {
  const types: Record<string, '' | 'warning' | 'primary' | 'success' | 'info'> = {
    pending: 'warning',
    investigating: 'primary',
    resolved: 'success',
    withdrawn: 'info',
    closed: 'info'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getDisputes({ page: page.value, size: size.value, status: filterStatus.value })
    if (res.code === 0) {
      disputes.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载纠纷列表失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: Dispute) {
  currentDispute.value = row
  detailVisible.value = true
}

function investigate(row: Dispute) {
  currentDispute.value = row
  investigateForm.value = { result: '', action: 'mediate' }
  investigateVisible.value = true
}

async function handleInvestigate() {
  if (!currentDispute.value?.id) return
  if (!investigateForm.value.result) return ElMessage.warning('请填写处理结果')
  submitting.value = true
  try {
    const res = await investigateDispute(currentDispute.value.id, investigateForm.value)
    if (res.code === 0) {
      ElMessage.success('处理成功')
      investigateVisible.value = false
      loadData()
    }
  } catch (e) {
    ElMessage.error('处理失败')
  } finally {
    submitting.value = false
  }
}

async function closeDispute(row: Dispute) {
  try {
    await ElMessageBox.confirm('确定关闭此纠纷？', '确认关闭', { type: 'warning' })
    const res = await closeDispute(row.id, {})
    if (res.code === 0) {
      ElMessage.success('关闭成功')
      loadData()
    }
  } catch { /* cancelled */ }
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
