<template>
  <el-card shadow="never">
    <el-tabs v-model="tab">
      <el-tab-pane label="全部" name="全部" />
      <el-tab-pane label="报修" name="报修" />
      <el-tab-pane label="投诉" name="投诉" />
    </el-tabs>
    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="ticketNo" label="工单号" width="150" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }"><el-tag :type="row.type === '报修' ? 'warning' : 'danger'" size="small">{{ row.type }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="houseTitle" label="房源" min-width="150" />
      <el-table-column prop="tenantName" label="发起人" width="90" />
      <el-table-column prop="content" label="内容" min-width="180" />
      <el-table-column prop="handler" label="处理人" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '已关闭' ? 'info' : row.status === '待分派' ? 'danger' : 'warning'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      <el-table-column label="操作" width="340" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === '待分派'" size="small" type="primary" plain :loading="submitting" @click="doAssign(row)">分派</el-button>
          <el-button v-if="row.status === '处理中'" size="small" plain :loading="submitting" @click="openTransfer(row)">转派</el-button>
          <el-button v-if="row.status === '待回访'" size="small" type="success" plain :loading="submitting" @click="doVisit(row)">回访</el-button>
          <el-button v-if="row.status === '处理中' || row.status === '待回访'" size="small" plain @click="doDetail(row)">详情</el-button>
          <el-button v-if="row.status !== '已关闭'" size="small" type="danger" plain :loading="submitting" @click="doClose(row)">关闭</el-button>
          <el-button v-if="row.status === '已关闭'" size="small" type="success" plain :loading="submitting" @click="doReopen(row)">重开</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && rows.length === 0" description="暂无工单" />

    <el-dialog v-model="detailVisible" title="工单详情" width="480px">
      <el-descriptions :column="1" border v-if="detail">
        <el-descriptions-item label="工单号">{{ detail.ticketNo }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ detail.houseTitle }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ detail.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ detail.content }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ detail.handler }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="transferVisible" title="转派工单" width="400px">
      <el-form label-width="80px">
        <el-form-item label="转派至"><el-select v-model="transferTo" placeholder="选择处理人" style="width: 100%">
          <el-option label="维修组-李师傅" value="维修组-李师傅" />
          <el-option label="客服组-王专员" value="客服组-王专员" />
          <el-option label="投诉组-刘主管" value="投诉组-刘主管" />
        </el-select></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitTransfer">确认转派</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import { getAdminTickets, assignTicket, transferTicket, visitTicket, type AdminTicket } from '@/api/admin'
import { closeTicket, reopenTicket } from '@/api/workorder'

const list = ref<AdminTicket[]>([])
const loading = ref(false)
const submitting = ref(false)
const tab = ref('全部')
const detailVisible = ref(false)
const detail = ref<AdminTicket | null>(null)
const transferVisible = ref(false)
const transferTarget = ref<AdminTicket | null>(null)
const transferTo = ref('')

async function fetch() {
  loading.value = true
  const res = await safe(getAdminTickets(), [])
  if (okRes(res)) list.value = res.data
  loading.value = false
}

const rows = computed(() => (tab.value === '全部' ? list.value : list.value.filter((t) => t.type === tab.value)))

async function doAssign(row: AdminTicket) {
  submitting.value = true
  const res = await safe(assignTicket(row.id), {})
  if (okRes(res)) {
    row.status = '处理中'
    row.handler = '维修组-张师傅'
    ElMessage.success(`工单 ${row.ticketNo} 已分派`)
  }
  submitting.value = false
}
function openTransfer(row: AdminTicket) {
  transferTarget.value = row
  transferTo.value = ''
  transferVisible.value = true
}
async function submitTransfer() {
  if (!transferTarget.value || !transferTo.value) return
  submitting.value = true
  const res = await safe(transferTicket(transferTarget.value.id, transferTo.value), {})
  if (okRes(res)) {
    transferTarget.value.handler = transferTo.value
    ElMessage.success(`工单已转派给 ${transferTo.value}`)
  }
  submitting.value = false
  transferVisible.value = false
  transferTarget.value = null
}
async function doVisit(row: AdminTicket) {
  try {
    await ElMessageBox.confirm(`确认结单工单 ${row.ticketNo}？`, '回访确认', { type: 'info', confirmButtonText: '确认结单' })
    submitting.value = true
    const res = await safe(visitTicket(row.id), {})
    if (okRes(res)) {
      row.status = '已关闭'
      ElMessage.success(`工单 ${row.ticketNo} 已回访结单`)
    }
    submitting.value = false
  } catch { /* 取消 */ }
}
function doDetail(row: AdminTicket) {
  detail.value = row
  detailVisible.value = true
}
async function doClose(row: AdminTicket) {
  try {
    const { value } = await ElMessageBox.prompt('请输入关闭备注（可选）', `关闭工单 ${row.ticketNo}`, {
      confirmButtonText: '确认关闭',
      cancelButtonText: '取消',
      type: 'warning',
      inputPlaceholder: '关闭原因/备注…',
      inputValidator: () => true
    })
    submitting.value = true
    const res = await safe(closeTicket(row.id, value), {})
    if (okRes(res)) {
      row.status = '已关闭'
      ElMessage.success(`工单 ${row.ticketNo} 已关闭`)
    }
    submitting.value = false
  } catch { /* 取消 */ }
}
async function doReopen(row: AdminTicket) {
  try {
    const { value } = await ElMessageBox.prompt('请输入重开备注（可选）', `重开工单 ${row.ticketNo}`, {
      confirmButtonText: '确认重开',
      cancelButtonText: '取消',
      type: 'info',
      inputPlaceholder: '重开原因/备注…',
      inputValidator: () => true
    })
    submitting.value = true
    const res = await safe(reopenTicket(row.id, value), {})
    if (okRes(res)) {
      row.status = '处理中'
      ElMessage.success(`工单 ${row.ticketNo} 已重开`)
    }
    submitting.value = false
  } catch { /* 取消 */ }
}

onMounted(fetch)
</script>