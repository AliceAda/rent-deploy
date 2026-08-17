<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>我的合同</h3>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无合同，签约成功后会显示在这里">
        <el-table-column label="合同号" prop="contractNo" min-width="160" />
        <el-table-column label="房源" min-width="120">
          <template #default="{ row }">{{ row.houseTitle || (row.houseId ? '房源 #' + row.houseId : '—') }}</template>
        </el-table-column>
        <el-table-column prop="signedAt" label="签约时间" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" text @click="view(row)">查看</el-button>
            <el-button size="small" text type="primary" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getMyContracts, getContractDetail, type ContractItem } from '@/api/contract'
import { statusTag } from '@/utils/status'

const router = useRouter()
const { list, loading, error } = useTable<ContractItem>(() => getMyContracts())

function statusType(s: string) {
  return statusTag('contract', s)
}
function view(row: ContractItem) {
  const r = safe(getContractDetail(row.id), {} as ContractItem)
  r.then((res) => {
    if (res.code === 0) ElMessage.success('已加载合同详情（演示）')
    else ElMessage.error(res.message || '获取失败')
  })
}
function viewDetail(row: ContractItem) {
  router.push('/contracts/' + row.id)
}
</script>
