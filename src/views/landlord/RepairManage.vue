<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <div>
          <h3>工单处理</h3>
          <p class="sub">处理租客提交的报修与投诉工单</p>
        </div>
        <el-radio-group v-model="statusTab" size="small" @change="load">
          <el-radio-button label="all" value="all">全部</el-radio-button>
          <el-radio-button label="待处理" value="待处理">待处理</el-radio-button>
          <el-radio-button label="处理中" value="处理中">处理中</el-radio-button>
          <el-radio-button label="已完成" value="已完成">已完成</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="list" v-loading="loading" empty-text="暂无工单">
        <el-table-column prop="ticketId" label="工单号" width="100" />
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="title" label="标题" min-width="130" />
        <el-table-column prop="user" label="报修人" width="90" />
        <el-table-column prop="houseTitle" label="房源" min-width="120" />
        <el-table-column prop="createTime" label="提交时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '待处理' || row.status === '处理中'"
              size="small"
              type="primary"
              plain
              @click="openHandle(row)"
            >处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="'处理工单 #' + current.ticketId" width="520px">
      <el-descriptions :column="1" border style="margin-bottom: 16px" v-if="current.ticketId">
        <el-descriptions-item label="标题">{{ current.title }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ current.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报修人">{{ current.user || '-' }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ current.houseTitle || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-position="top">
        <el-form-item label="处理结果">
          <el-input v-model="handleResult" type="textarea" :rows="3" placeholder="填写处理结果 / 答复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitHandle">提交处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getWorkOrders, handleWorkOrder, type WorkOrderItem } from '@/api/workorder'

const list = ref<WorkOrderItem[]>([])
const loading = ref(false)
const statusTab = ref('all')
const dialogVisible = ref(false)
const current = ref<WorkOrderItem>({} as WorkOrderItem)
const handleResult = ref('')

function statusType(s: string) {
  if (s === '已完成') return 'success'
  if (s === '处理中') return 'warning'
  return 'danger'
}
async function load() {
  loading.value = true
  const status = statusTab.value === 'all' ? undefined : statusTab.value
  const r = await safe(getWorkOrders(status), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}
function openHandle(row: WorkOrderItem) {
  current.value = row
  handleResult.value = row.handleResult || ''
  dialogVisible.value = true
}
async function submitHandle() {
  if (!handleResult.value.trim()) {
    ElMessage.warning('请填写处理结果')
    return
  }
  loading.value = true
  const r = await safe(
    handleWorkOrder(current.value.ticketId, { status: '已完成', handleResult: handleResult.value }),
    {}
  )
  loading.value = false
  if (r.code === 0) {
    ElMessage.success('处理成功')
    dialogVisible.value = false
    load()
  } else {
    ElMessage.error(r.message || '提交失败')
  }
}
onMounted(load)
</script>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}
.sub {
  color: var(--sub);
  margin: 4px 0 0;
}
</style>