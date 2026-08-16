<template>
  <div>
    <el-row :gutter="14">
      <el-col :span="6" v-for="s in sums" :key="s.k">
        <el-card shadow="hover" class="sum">
          <div class="sk text-sub">{{ s.k }}</div>
          <div class="sv">¥{{ s.v.toLocaleString() }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="block">
      <template #header><b>分账与结算</b>（平台抽佣 + 房东 + 经纪人）</template>
      <el-table :data="finances" border v-loading="loading">
        <el-table-column prop="settleNo" label="结算单号" width="150" />
        <el-table-column prop="bizDesc" label="业务" min-width="150" />
        <el-table-column label="总额" width="110"><template #default="{ row }">¥{{ row.totalAmount.toLocaleString() }}</template></el-table-column>
        <el-table-column label="平台佣金" width="110"><template #default="{ row }"><span class="price">¥{{ row.platformFee.toLocaleString() }}</span></template></el-table-column>
        <el-table-column label="房东" width="110"><template #default="{ row }">¥{{ row.landlordAmount.toLocaleString() }}</template></el-table-column>
        <el-table-column label="经纪人" width="110"><template #default="{ row }">¥{{ row.agentAmount.toLocaleString() }}</template></el-table-column>
        <el-table-column label="结算状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.settleStatus === '冻结' ? 'danger' : row.settleStatus === '已提现' ? 'info' : 'success'" size="small">{{ row.settleStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="120" />
        <el-table-column label="操作" width="210">
          <template #default="{ row }">
            <el-button v-if="row.settleStatus === '冻结'" size="small" type="warning" plain :loading="submitting" @click="doDispute(row)">争议处理</el-button>
            <el-button v-if="row.settleStatus === '已结算'" size="small" type="primary" plain :loading="submitting" @click="doWithdraw(row)">提现</el-button>
            <el-button size="small" plain @click="doDetail(row)">明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && finances.length === 0" description="暂无结算数据" />
    </el-card>

    <el-dialog v-model="detailVisible" title="分账明细" width="520px">
      <el-descriptions :column="1" border v-if="detail">
        <el-descriptions-item label="结算单号">{{ detail.settleNo }}</el-descriptions-item>
        <el-descriptions-item label="业务">{{ detail.bizDesc }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ detail.totalAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="平台佣金（25%）">¥{{ detail.platformFee.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="房东分账">¥{{ detail.landlordAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="经纪人分账">¥{{ detail.agentAmount.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="结算状态">{{ detail.settleStatus }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import { getAdminFinances, withdrawFinance, disputeFinance, type FinanceItem } from '@/api/admin'

const list = ref<FinanceItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const detailVisible = ref(false)
const detail = ref<FinanceItem | null>(null)

async function fetch() {
  loading.value = true
  const res = await safe(getAdminFinances(), [])
  if (okRes(res)) list.value = res.data
  loading.value = false
}

const finances = computed(() => list.value)
const sums = computed(() => {
  const total = list.value.reduce((s, f) => s + f.totalAmount, 0)
  const fee = list.value.reduce((s, f) => s + f.platformFee, 0)
  const land = list.value.reduce((s, f) => s + f.landlordAmount, 0)
  const agent = list.value.reduce((s, f) => s + f.agentAmount, 0)
  return [
    { k: '累计交易额', v: total },
    { k: '平台佣金收入', v: fee },
    { k: '房东分账', v: land },
    { k: '经纪人分账', v: agent }
  ]
})

function doDetail(row: FinanceItem) {
  detail.value = row
  detailVisible.value = true
}
async function doWithdraw(row: FinanceItem) {
  try {
    await ElMessageBox.confirm(`确认对 ${row.settleNo}（¥${row.landlordAmount.toLocaleString()}）发起提现？`, '提现确认', { type: 'info', confirmButtonText: '确认提现' })
    submitting.value = true
    const res = await safe(withdrawFinance(row.id), {})
    if (okRes(res)) {
      row.settleStatus = '已提现'
      ElMessage.success(`提现审核通过，¥${row.landlordAmount.toLocaleString()} 已转入房东账户`)
    }
    submitting.value = false
  } catch { /* 取消 */ }
}
async function doDispute(row: FinanceItem) {
  submitting.value = true
  const res = await safe(disputeFinance(row.id), {})
  if (okRes(res)) {
    row.settleStatus = '冻结'
    ElMessage.warning('争议已提交，该笔款项已冻结')
  }
  submitting.value = false
}

onMounted(fetch)
</script>

<style scoped>
.sum { text-align: center; }
.sk { font-size: 13px; }
.sv { font-size: 22px; font-weight: 800; color: var(--brand); margin-top: 4px; }
.block { margin-top: 14px; }
</style>