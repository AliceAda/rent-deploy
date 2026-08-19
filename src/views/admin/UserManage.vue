<template>
  <el-card shadow="never">
    <el-tabs v-model="role">
      <el-tab-pane label="全部" name="全部" />
      <el-tab-pane label="租客" name="租客" />
      <el-tab-pane label="房东" name="房东" />
      <el-tab-pane label="经纪人" name="经纪人" />
    </el-tabs>
    <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="role" label="角色" width="90">
        <template #default="{ row }">
          <el-tag :type="row.role === '经纪人' ? 'warning' : row.role === '房东' ? 'success' : 'info'" size="small">{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column label="实名" width="100">
        <template #default="{ row }">
          <el-tag :type="row.certStatus === '已认证' ? 'success' : row.certStatus === '待审核' ? 'warning' : 'danger'" size="small">{{ row.certStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creditScore" label="信用分" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="regTime" label="注册时间" width="120" />
      <el-table-column label="操作" width="230" fixed="right">
        <template #default="{ row }">
          <el-button size="small" plain @click="viewDetail(row)">查看</el-button>
          <el-button size="small" type="primary" plain @click="goDetail(row)">详情</el-button>
          <el-button v-if="row.status === '正常'" size="small" type="danger" plain :loading="loadingId === row.id" @click="doFreeze(row)">冻结</el-button>
          <el-button v-else size="small" type="success" plain :loading="loadingId === row.id" @click="doUnfreeze(row)">解冻</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && rows.length === 0" description="暂无数据" />

    <el-dialog v-model="detailVisible" title="用户详情" width="460px">
      <el-descriptions :column="1" border v-if="current">
        <el-descriptions-item label="用户ID">{{ current.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ current.name }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ current.role }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ current.phone }}</el-descriptions-item>
        <el-descriptions-item label="实名认证">{{ current.certStatus }}</el-descriptions-item>
        <el-descriptions-item label="信用分">{{ current.creditScore }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ current.status }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ current.regTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getAdminUserList, toggleUserStatus, type AdminUser } from '@/api/admin'

const router = useRouter()

const loadingId = ref<number | null>(null)
const role = ref('全部')
const { list, loading, error, reload } = useTable<AdminUser>(() => getAdminUserList())
const detailVisible = ref(false)
const current = ref<AdminUser | null>(null)

const rows = computed(() => (role.value === '全部' ? list.value : list.value.filter((u) => u.role === role.value)))

function viewDetail(row: AdminUser) {
  current.value = row
  detailVisible.value = true
}
function goDetail(row: AdminUser) {
  router.push(`/admin/users/${row.id}`)
}
async function doFreeze(row: AdminUser) {
  try {
    await ElMessageBox.confirm(`确定要冻结用户「${row.name}」吗？`, '确认冻结', { type: 'warning', confirmButtonText: '确定冻结', confirmButtonClass: 'el-button--danger' })
    loadingId.value = row.id
    const res = await safe(toggleUserStatus(row.id, '冻结'), {})
    if (okRes(res)) {
      row.status = '冻结'
      ElMessage.warning(`已冻结 ${row.name}`)
    }
    loadingId.value = null
  } catch { /* 取消 */ }
}
async function doUnfreeze(row: AdminUser) {
  try {
    await ElMessageBox.confirm(`确定要解冻用户「${row.name}」吗？`, '确认解冻', { type: 'info', confirmButtonText: '确定解冻' })
    loadingId.value = row.id
    const res = await safe(toggleUserStatus(row.id, '正常'), {})
    if (okRes(res)) {
      row.status = '正常'
      ElMessage.success(`已解冻 ${row.name}`)
    }
    loadingId.value = null
  } catch { /* 取消 */ }
}
</script>