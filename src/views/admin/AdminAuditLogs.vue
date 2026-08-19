<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>审核日志</span>
          <el-space>
            <el-input v-model="searchHouse" placeholder="搜索房源" clearable style="width: 200px" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="houseTitle" label="房源" min-width="200" />
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column prop="action" label="操作" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ actionMap[row.action] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column prop="createdAt" label="时间" width="160" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getHouseAuditLogs, type HouseAuditLog } from '@/api/extensions'

const loading = ref(false)
const logs = ref<HouseAuditLog[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const searchHouse = ref('')

const actionMap: Record<string, string> = {
  audit_pass: '审核通过',
  audit_reject: '审核拒绝',
  offline: '下架',
  online: '上架'
}

async function loadData() {
  loading.value = true
  try {
    const res = await getHouseAuditLogs({ page: page.value, size: size.value, houseId: null })
    if (res.code === 0) {
      logs.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载审核日志失败')
  } finally {
    loading.value = false
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
