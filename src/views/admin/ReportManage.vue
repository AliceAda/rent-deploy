<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>房源举报管理</h3>
      <el-radio-group v-model="statusTab" size="small" @change="load" style="margin-bottom:12px">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="待处理">待处理</el-radio-button>
        <el-radio-button value="已处理">已处理</el-radio-button>
      </el-radio-group>
      <el-table :data="list" v-loading="loading" empty-text="暂无举报">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="houseTitle" label="房源" min-width="160" />
        <el-table-column prop="reporterName" label="举报人" width="120" />
        <el-table-column prop="reason" label="举报原因" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '已处理' ? 'success' : 'warning'">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="举报时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="handle(row)">处理</el-button>
            <el-button text size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showHandle" title="处理举报" width="500px">
      <el-form label-width="100px">
        <el-form-item label="举报原因">{{ current?.reason }}</el-form-item>
        <el-form-item label="处理结果">
          <el-input v-model="handleResult" type="textarea" :rows="3" placeholder="请输入处理结果" />
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="handleStatus" style="width:100%">
            <el-option label="已处理-警告" value="已处理" />
            <el-option label="已处理-下架" value="已下架" />
            <el-option label="已处理-驳回" value="已驳回" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showHandle = false">取消</el-button>
        <el-button type="primary" @click="submit">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf, get } from '@/api/http'
import { handleReport, getReportDetail, type ReportItem } from '@/api/risk'

const list = ref<ReportItem[]>([])
const loading = ref(false)
const statusTab = ref('all')
const showHandle = ref(false)
const current = ref<ReportItem | null>(null)
const handleResult = ref('')
const handleStatus = ref('已处理')

async function load() {
  loading.value = true
  const status = statusTab.value === 'all' ? undefined : statusTab.value
  const r = await safe(get('/admin/house/report', status ? { status } : undefined), { list: [], total: 0 })
  list.value = (r.data as { list?: ReportItem[] })?.list ?? []
  loading.value = false
}

function handle(row: ReportItem) {
  current.value = row
  handleResult.value = ''
  handleStatus.value = '已处理'
  showHandle.value = true
}

async function viewDetail(row: ReportItem) {
  const r = await safe(getReportDetail(row.id), {} as ReportItem)
  if (r.data) {
    current.value = r.data
    showHandle.value = true
    handleResult.value = r.data.handleResult || ''
  }
}

async function submit() {
  if (!current.value) return
  const r = await safe(handleReport({ id: current.value.id, handleResult: handleResult.value, status: handleStatus.value }), {})
  if (okRes(r)) { ElMessage.success('已处理'); showHandle.value = false; load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>
