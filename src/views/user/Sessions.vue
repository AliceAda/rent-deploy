<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>登录会话管理</h3>
        <el-button text @click="reload">刷新</el-button>
      </div>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无会话">
        <el-table-column prop="device" label="设备" min-width="160" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="location" label="登录地点" width="160" />
        <el-table-column prop="lastActiveTime" label="最后活跃" width="180" />
        <el-table-column prop="createTime" label="登录时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.current" type="success">当前设备</el-tag>
            <el-tag v-else type="info">在线</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.current" type="danger" text size="small" @click="revoke(row.id)">注销</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getSessions, deleteSession, type SessionItem } from '@/api/session'

const { list, loading, error, reload } = useTable<SessionItem>(() => getSessions())

async function revoke(id: number) {
  await ElMessageBox.confirm('确认注销该设备的登录会话？', '提示', { type: 'warning' })
  const r = await safe(deleteSession(id), {})
  if (r.code === 0) {
    ElMessage.success('已注销')
    list.value = list.value.filter((s) => s.id !== id)
  } else {
    ElMessage.error(r.message || '操作失败')
  }
}
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
</style>
