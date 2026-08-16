<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>我的合同</h3>
      <el-table :data="list" v-loading="loading" empty-text="暂无合同，签约成功后会显示在这里">
        <el-table-column label="合同号" prop="contractNo" min-width="160" />
        <el-table-column label="房源" min-width="120">
          <template #default="{ row }">{{ row.houseTitle || (row.houseId ? '房源 #' + row.houseId : '—') }}</template>
        </el-table-column>
        <el-table-column prop="signedAt" label="签约时间" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" text @click="view(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getMyContracts, getContractDetail, type ContractItem } from '@/api/contract'

const list = ref<ContractItem[]>([])
const loading = ref(false)

function statusType(s: string) {
  if (s === '生效中') return 'success'
  if (s === '已解约') return 'danger'
  if (s === '待签署' || s === '续租中' || s === '退租中') return 'warning'
  if (s === '已到期') return 'info'
  return 'info' // 草稿
}
async function load() {
  loading.value = true
  const r = await safe(getMyContracts(), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}
function view(row: ContractItem) {
  const r = safe(getContractDetail(row.id), {})
  r.then((res) => {
    if (res.code === 0) ElMessage.success('已加载合同详情（演示）')
    else ElMessage.error(res.message || '获取失败')
  })
}
onMounted(load)
</script>
