<template>
  <div class="page-max">
    <el-card shadow="never" class="mb16">
      <div class="head">
        <h3>提现管理</h3>
        <el-button type="primary" @click="showWithdraw = true">申请提现</el-button>
      </div>
      <el-radio-group v-model="statusTab" size="small" @change="load">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="待审核">待审核</el-radio-button>
        <el-radio-button value="已通过">已通过</el-radio-button>
        <el-radio-button value="已驳回">已驳回</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" empty-text="暂无提现记录">
        <el-table-column prop="id" label="提现单号" width="100" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }"><b class="amount">¥{{ row.amount }}</b></template>
        </el-table-column>
        <el-table-column prop="bankCard" label="收款账户" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button text size="small" @click="viewDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showWithdraw" title="申请提现" width="400px">
      <el-form label-width="100px">
        <el-form-item label="提现金额">
          <el-input-number v-model="form.amount" :min="1" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="收款账户">
          <el-input v-model="form.bankCard" placeholder="银行卡号/支付宝" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWithdraw = false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="submitting">确认提现</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { getWithdrawList, createWithdraw, getWithdrawDetail, type WithdrawItem } from '@/api/pay'

const list = ref<WithdrawItem[]>([])
const loading = ref(false)
const statusTab = ref('all')
const showWithdraw = ref(false)
const submitting = ref(false)
const form = ref({ amount: 0, bankCard: '' })

function statusType(s: string) {
  if (s === '已通过') return 'success'
  if (s === '已驳回') return 'danger'
  return 'warning'
}

async function load() {
  loading.value = true
  const status = statusTab.value === 'all' ? undefined : statusTab.value
  const r = await safe(getWithdrawList(status), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}

async function submit() {
  if (form.value.amount <= 0) return ElMessage.warning('请输入金额')
  submitting.value = true
  const r = await safe(createWithdraw(form.value), {})
  submitting.value = false
  if (okRes(r)) { ElMessage.success('提现申请已提交'); showWithdraw.value = false; form.value = { amount: 0, bankCard: '' }; load() }
  else ElMessage.error(msgOf(r))
}

async function viewDetail(id: number) {
  const r = await safe(getWithdrawDetail(id), {} as WithdrawItem)
  if (r.data) {
    ElMessage.info(`提现单 #${r.data.id}，金额 ¥${r.data.amount}，状态：${r.data.status}`)
  }
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.amount { color: #f56c6c; font-size: 15px; }
</style>
