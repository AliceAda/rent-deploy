<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" :loading="reconciling" @click="doReconcile">财务对账</el-button>
    </div>

    <el-row :gutter="14">
      <el-col :span="6" v-for="s in sums" :key="s.k">
        <el-card shadow="hover" class="sum">
          <div class="sk text-sub">{{ s.k }}</div>
          <div class="sv">¥{{ s.v.toLocaleString() }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="block">
      <el-tabs v-model="finTab">
        <el-tab-pane label="分账与结算（平台抽佣 + 房东 + 经纪人）" name="settle">
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
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
        </el-tab-pane>
        <el-tab-pane label="支付记录" name="payment">
          <el-alert v-if="paymentError" type="warning" :title="'加载失败：' + paymentError" show-icon :closable="false" style="margin-bottom: 12px" />
          <el-table :data="payments" border v-loading="paymentLoading">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="payNo" label="支付单号" width="160" />
            <el-table-column prop="orderNo" label="订单号" width="160" />
            <el-table-column prop="payer" label="付款人" width="100" />
            <el-table-column label="金额" width="110"><template #default="{ row }">¥{{ row.amount?.toLocaleString() }}</template></el-table-column>
            <el-table-column prop="method" label="支付方式" width="110" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '成功' ? 'success' : row.status === '失败' ? 'danger' : 'warning'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="payTime" label="支付时间" width="160" />
          </el-table>
          <el-empty v-if="!paymentLoading && payments.length === 0" description="暂无支付记录" />
        </el-tab-pane>
      </el-tabs>
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
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes, post, get } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getAdminFinances, withdrawFinance, disputeFinance, type FinanceItem } from '@/api/admin'

interface PaymentItem {
  id: number
  payNo?: string
  orderNo?: string
  amount: number
  method?: string
  status?: string
  payer?: string
  payTime?: string
}

const submitting = ref(false)
const detailVisible = ref(false)
const detail = ref<FinanceItem | null>(null)

const finTab = ref('settle')
const reconciling = ref(false)
const { list, loading, error, reload } = useTable<FinanceItem>(() => getAdminFinances())
const { list: payments, loading: paymentLoading, error: paymentError, reload: reloadPayments } =
  useTable<PaymentItem>(() => get('/admin/payments'))

async function doReconcile() {
  reconciling.value = true
  const res = await safe(post('/finance/reconcile'), {})
  if (okRes(res)) {
    ElMessage.success('财务对账完成')
    await reload()
    await reloadPayments()
  }
  reconciling.value = false
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
</script>

<style scoped>
.toolbar { margin-bottom: 14px; }
.sum { text-align: center; }
.sk { font-size: 13px; }
.sv { font-size: 22px; font-weight: 800; color: var(--brand); margin-top: 4px; }
.block { margin-top: 14px; }
</style>