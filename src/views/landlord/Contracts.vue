<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <div>
          <h3>合同管理</h3>
          <p class="sub">查看租客签署的所有电子合同</p>
        </div>
        <el-radio-group v-model="statusTab" size="small" @change="load">
          <el-radio-button label="all" value="all">全部</el-radio-button>
          <el-radio-button label="待签署" value="待签署">待签署</el-radio-button>
          <el-radio-button label="生效中" value="生效中">生效中</el-radio-button>
          <el-radio-button label="已结束" value="已结束">已结束</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="list" v-loading="loading" empty-text="暂无合同">
        <el-table-column prop="contractNo" label="合同号" width="180" />
        <el-table-column label="房源" min-width="150">
          <template #default="{ row }">{{ row.houseTitle || `房源 #${row.houseId}` }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="signedAt" label="签署时间" width="180" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="showDetail(row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="合同详情" width="560px">
      <el-descriptions :column="1" border v-if="detail.id">
        <el-descriptions-item label="合同号">{{ detail.contractNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="房源">{{ detail.houseTitle || `房源 #${detail.houseId}` }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签署时间">{{ detail.signedAt || '-' }}</el-descriptions-item>
      </el-descriptions>
      <p v-else class="text-sub">接口未返回完整数据，详情待后端补充。</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { safe } from '@/api/http'
import { getLandlordContracts, getContractDetail, type ContractItem } from '@/api/contract'

const list = ref<ContractItem[]>([])
const loading = ref(false)
const statusTab = ref('all')
const detailVisible = ref(false)
const detail = ref<ContractItem>({} as ContractItem)

function statusType(s: string) {
  if (s === '生效中') return 'success'
  if (s === '待签署') return 'warning'
  return 'info'
}
async function load() {
  loading.value = true
  const r = await safe(getLandlordContracts(), { list: [], total: 0 })
  list.value = (r.data?.list ?? []).filter(
    (c) => statusTab.value === 'all' || c.status === statusTab.value
  )
  loading.value = false
}
async function showDetail(id: number) {
  const r = await safe(getContractDetail(id), {} as ContractItem)
  detail.value = r.data ?? ({} as ContractItem)
  detailVisible.value = true
}
onMounted(load)
</script>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}
.sub {
  color: var(--sub);
  margin: 4px 0 0;
}
.text-sub {
  color: var(--sub);
}
</style>