<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="`工单 #${ticketId}`" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="wo" shadow="never" class="mb16">
        <div class="status-bar">
          <div>
            <el-tag :type="statusType(wo.status)" size="large">{{ wo.status }}</el-tag>
            <el-tag v-if="wo.priority" :type="wo.priority === '紧急' ? 'danger' : 'warning'" size="small" style="margin-left:8px">{{ wo.priority }}</el-tag>
          </div>
          <el-button v-if="['待处理','处理中'].includes(wo.status)" type="danger" plain @click="cancel">取消工单</el-button>
        </div>
      </el-card>

      <el-row :gutter="16" v-if="wo">
        <el-col :span="14">
          <el-card shadow="never" class="mb16">
            <template #header><span>工单信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="标题">{{ wo.title }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ wo.type }}</el-descriptions-item>
              <el-descriptions-item label="房源">{{ wo.houseTitle || '-' }}</el-descriptions-item>
              <el-descriptions-item label="提交人">{{ wo.user || '-' }}</el-descriptions-item>
              <el-descriptions-item label="处理人">{{ wo.handler || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ wo.createTime }}</el-descriptions-item>
              <el-descriptions-item label="关闭时间">{{ wo.closedAt || '-' }}</el-descriptions-item>
              <el-descriptions-item label="处理结果" :span="2">{{ wo.handleResult || '-' }}</el-descriptions-item>
              <el-descriptions-item label="问题描述" :span="2">{{ wo.content || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card shadow="never">
            <template #header><span>处理日志</span></template>
            <el-timeline v-if="logs.length">
              <el-timeline-item
                v-for="log in logs"
                :key="log.id"
                :timestamp="log.createTime"
                :type="log.toStatus === '已关闭' ? 'info' : log.toStatus === '已完成' ? 'success' : 'primary'"
              >
                <div class="log-item">
                  <span class="log-action">{{ log.action }}</span>
                  <span v-if="log.fromStatus && log.toStatus" class="log-status">{{ log.fromStatus }} → {{ log.toStatus }}</span>
                  <span class="log-operator">操作人：{{ log.operator }}</span>
                  <span v-if="log.remark" class="log-remark">{{ log.remark }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无日志" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import { getWorkOrderDetail, getWorkOrderLog, cancelWorkOrder, type WorkOrderItem, type WorkOrderLog } from '@/api/workorder'

const route = useRoute()
const ticketId = Number(route.params.id)
const wo = ref<WorkOrderItem | null>(null)
const logs = ref<WorkOrderLog[]>([])
const loading = ref(false)

function statusType(s: string) {
  if (s === '已完成' || s === '已关闭') return 'success'
  if (s === '处理中') return 'primary'
  if (s === '待处理') return 'warning'
  if (s === '已取消') return 'info'
  return ''
}

async function load() {
  loading.value = true
  const [r1, r2] = await Promise.all([
    safe(getWorkOrderDetail(ticketId), {} as WorkOrderItem),
    safe(getWorkOrderLog(ticketId), { list: [], total: 0 })
  ])
  wo.value = r1.data
  logs.value = r2.data?.list ?? []
  loading.value = false
}

async function cancel() {
  const { value } = await ElMessageBox.prompt('请输入取消原因（可选）', '取消工单', {
    type: 'warning', inputPlaceholder: '取消原因'
  })
  const r = await safe(cancelWorkOrder(ticketId, value), {})
  if (r.code === 0) { ElMessage.success('已取消'); load() }
  else ElMessage.error(r.message || '操作失败')
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.log-item { display: flex; flex-direction: column; }
.log-action { font-weight: 600; }
.log-status { font-size: 13px; }
.log-operator { font-size: 12px; color: var(--el-text-color-secondary); }
.log-remark { font-size: 12px; color: var(--el-text-color-secondary); }
</style>
