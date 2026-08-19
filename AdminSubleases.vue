<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>转租管理</span>
          <el-space>
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="待审批" value="pending" />
              <el-option label="已批准" value="approved" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="subleases" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="contractNo" label="原合同编号" width="180" />
        <el-table-column prop="houseTitle" label="房源" min-width="180" />
        <el-table-column prop="originalTenantName" label="原租客" width="100" />
        <el-table-column prop="newTenantName" label="新租客" width="100" />
        <el-table-column prop="subleaseDate" label="转租日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="success" @click="approve(row)">批准</el-button>
            <el-button v-if="row.status === 'pending'" size="small" type="danger" @click="reject(row)">拒绝</el-button>
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

    <!-- 拒绝弹窗 -->
    <el-dialog v-model="rejectVisible" title="拒绝转租" width="400px">
      <el-form label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubleases, approveSublease, rejectSublease, type Sublease } from '@/api/extensions'

const loading = ref(false)
const subleases = ref<Sublease[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterStatus = ref('')

const rejectVisible = ref(false)
const currentSublease = ref<Sublease | null>(null)
const rejectForm = ref({ reason: '' })

const statusMap: Record<string, string> = {
  pending: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
  completed: '已完成'
}

function statusType(status: string): '' | 'warning' | 'success' | 'danger' | 'info' {
  const types: Record<string, '' | 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'info'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getSubleases({ page: page.value, size: size.value, status: filterStatus.value })
    if (res.code === 0) {
      subleases.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载转租列表失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: Sublease) {
  ElMessage.info('查看详情功能开发中')
}

function approve(row: Sublease) {
  ElMessageBox.confirm('确定批准此转租申请？', '确认批准', { type: 'success' })
    .then(async () => {
      const res = await approveSublease(row.id, {})
      if (res.code === 0) {
        ElMessage.success('批准成功')
        loadData()
      }
    })
    .catch(() => {})
}

function reject(row: Sublease) {
  currentSublease.value = row
  rejectForm.value = { reason: '' }
  rejectVisible.value = true
}

async function handleReject() {
  if (!currentSublease.value?.id) return
  if (!rejectForm.value.reason) return ElMessage.warning('请填写拒绝原因')
  const res = await rejectSublease(currentSublease.value.id, { reason: rejectForm.value.reason })
  if (res.code === 0) {
    ElMessage.success('已拒绝')
    rejectVisible.value = false
    loadData()
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
