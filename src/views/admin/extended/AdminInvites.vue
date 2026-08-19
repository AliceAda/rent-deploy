<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>邀请记录</span>
          <el-space>
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="未使用" value="unused" />
              <el-option label="已使用" value="used" />
              <el-option label="已过期" value="expired" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="records" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="inviteCode" label="邀请码" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.inviteCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inviterName" label="邀请人" width="100" />
        <el-table-column prop="inviteeName" label="被邀请人" width="100" />
        <el-table-column prop="inviteePhone" label="手机号" width="120" />
        <el-table-column prop="reward" label="奖励" width="100">
          <template #default="{ row }">¥{{ row.reward?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usedAt" label="使用时间" width="160" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
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
import { getInviteRecords, type InviteRecord } from '@/api/extensions'

const loading = ref(false)
const records = ref<InviteRecord[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterStatus = ref('')

const statusMap: Record<string, string> = {
  unused: '未使用',
  used: '已使用',
  expired: '已过期'
}

function statusType(status: string): '' | 'success' | 'warning' | 'info' {
  const types: Record<string, '' | 'success' | 'warning' | 'info'> = {
    unused: 'warning',
    used: 'success',
    expired: 'info'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getInviteRecords({ page: page.value, size: size.value, status: filterStatus.value })
    if (res.code === 0) {
      records.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载邀请记录失败')
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
