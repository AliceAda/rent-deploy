<template>
  <div class="page-max">
    <el-card shadow="never" style="margin-bottom: 16px">
      <h3>提交报修 / 投诉</h3>
      <el-form :model="form" label-width="90px" style="max-width: 520px">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio value="repair">报修</el-radio>
            <el-radio value="complaint">投诉</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="房源">
          <el-input v-model="form.houseId" placeholder="房源 ID（演示）" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="如：空调不制冷" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <h3>我的工单</h3>
      <el-table :data="list" v-loading="loading" empty-text="暂无工单">
        <el-table-column prop="title" label="标题" min-width="160" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }"><el-tag size="small">{{ row.type }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getMyWorkOrders, submitRepair, type WorkOrderItem } from '@/api/workorder'

const list = ref<WorkOrderItem[]>([])
const loading = ref(false)
const form = ref({ type: 'repair', houseId: '', title: '', content: '' })

function statusType(s: string) {
  if (s === 'done' || s === '已完成') return 'success'
  if (s === 'processing' || s === '处理中') return 'warning'
  if (s === 'closed' || s === '已关闭') return 'info'
  return 'primary'
}
async function load() {
  loading.value = true
  const r = await safe(getMyWorkOrders(), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}
async function submit() {
  if (!form.value.title) return ElMessage.warning('请填写标题')
  const r = await safe(submitRepair({ ...form.value, houseId: Number(form.value.houseId) || undefined }), {})
  if (r.code === 0) {
    ElMessage.success('已提交，等待处理')
    form.value = { type: 'repair', houseId: '', title: '', content: '' }
    load()
  } else {
    ElMessage.error(r.message || '提交失败')
  }
}
onMounted(load)
</script>
