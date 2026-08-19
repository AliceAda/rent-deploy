<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>信用日志</span>
          <el-space>
            <el-input v-model="searchUser" placeholder="搜索用户" clearable style="width: 200px" />
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="scoreChange" label="分数变化" width="120">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'positive' ? 'var(--green)' : 'var(--red)', fontWeight: 'bold' }">
              {{ row.type === 'positive' ? '+' : '' }}{{ row.scoreChange }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="currentScore" label="当前分数" width="120" />
        <el-table-column prop="reason" label="原因" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'positive' ? 'success' : 'danger'" size="small">
              {{ row.type === 'positive' ? '正面' : '负面' }}
            </el-tag>
          </template>
        </el-table-column>
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
import { getCreditLogs, type CreditLog } from '@/api/extensions'

const loading = ref(false)
const logs = ref<CreditLog[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const searchUser = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await getCreditLogs({ page: page.value, size: size.value })
    if (res.code === 0) {
      logs.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载信用日志失败')
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
