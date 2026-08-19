<template>
  <el-card shadow="never">
    <div class="bar">
      <el-radio-group v-model="tab">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button label="待签署" value="待签署" />
        <el-radio-button label="生效中" value="生效中" />
        <el-radio-button label="已到期/终止" value="end" />
      </el-radio-group>
      <el-button type="primary" plain @click="ElMessage.info('新增合同模板')">模板管理</el-button>
    </div>
    <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
    <el-table :data="rows" border v-loading="loading">
      <el-table-column prop="contractNo" label="合同号" width="150" />
      <el-table-column prop="houseTitle" label="房源" min-width="160" />
      <el-table-column prop="tenantName" label="承租方" width="90" />
      <el-table-column prop="landlordName" label="出租方" width="90" />
      <el-table-column label="租期" min-width="180">
        <template #default="{ row }">{{ row.startDate }} ~ {{ row.endDate }}</template>
      </el-table-column>
      <el-table-column label="租金/押金" width="140">
        <template #default="{ row }"><span class="price">¥{{ row.monthlyRent }}</span> / ¥{{ row.deposit }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '生效中' ? 'success' : row.status === '待签署' ? 'warning' : 'info'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button size="small" plain @click="view(row)">查看</el-button>
          <el-button v-if="row.status === '待签署'" size="small" type="primary" plain :loading="submitting" @click="doRemind(row)">催签</el-button>
          <el-button v-if="row.status === '待签署' || row.status === '生效中'" size="small" type="danger" plain :loading="submitting" @click="doCancel(row)">作废</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && rows.length === 0" description="暂无合同" />

    <el-dialog v-model="detailVisible" title="合同详情" width="520px">
      <el-descriptions :column="1" border v-if="current">
        <el-descriptions-item label="合同号">{{ current.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ current.houseTitle }}</el-descriptions-item>
        <el-descriptions-item label="承租方">{{ current.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="出租方">{{ current.landlordName }}</el-descriptions-item>
        <el-descriptions-item label="租期">{{ current.startDate }} ~ {{ current.endDate }}</el-descriptions-item>
        <el-descriptions-item label="月租金">¥{{ current.monthlyRent }}</el-descriptions-item>
        <el-descriptions-item label="押金">¥{{ current.deposit }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ current.status }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getAdminContracts, remindContract, cancelContract, type AdminContract } from '@/api/admin'

const submitting = ref(false)
const tab = ref('全部')
const { list, loading, error, reload } = useTable<AdminContract>(() => getAdminContracts())
const detailVisible = ref(false)
const current = ref<AdminContract | null>(null)

const rows = computed(() =>
  tab.value === '全部' ? list.value
    : tab.value === 'end' ? list.value.filter((c) => c.status === '已到期' || c.status === '已终止')
    : list.value.filter((c) => c.status === tab.value)
)

function view(row: AdminContract) {
  current.value = row
  detailVisible.value = true
}
async function doRemind(row: AdminContract) {
  submitting.value = true
  const res = await safe(remindContract(row.id), {})
  if (okRes(res)) ElMessage.success(`已向承租方「${row.tenantName}」发送签约提醒`)
  submitting.value = false
}
async function doCancel(row: AdminContract) {
  try {
    await ElMessageBox.confirm(`确定要作废合同 ${row.contractNo} 吗？`, '作废合同', { type: 'warning', confirmButtonText: '确定作废', confirmButtonClass: 'el-button--danger' })
    submitting.value = true
    const res = await safe(cancelContract(row.id), {})
    if (okRes(res)) {
      row.status = '已终止'
      ElMessage.warning(`合同 ${row.contractNo} 已作废`)
    }
    submitting.value = false
  } catch { /* 取消 */ }
}
</script>

<style scoped>
.bar { display: flex; justify-content: space-between; margin-bottom: 14px; }
</style>