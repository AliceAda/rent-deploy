<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>退款审批</h3>        <el-radio-group v-model="statusTab" size="small" @change="reload" style="margin-bottom:12px">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="待审核">待审核</el-radio-button>
        <el-radio-button value="已通过">已通过</el-radio-button>
        <el-radio-button value="已驳回">已驳回</el-radio-button>
      </el-radio-group>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无退款申请">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderId" label="订单ID" width="100" />
        <el-table-column prop="amount" label="退款金额" width="120" align="right">
          <template #default="{ row }"><b class="amount">¥{{ row.amount }}</b></template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === '待审核'">
              <el-button text size="small" type="success" @click="approve(row.id)">通过</el-button>
              <el-button text size="small" type="danger" @click="reject(row.id)">驳回</el-button>
            </template>
            <el-button text size="small" @click="viewDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getRefundList, approveRefund, rejectRefund, getRefundDetail, type RefundItem } from '@/api/pay'
import { statusTag } from '@/utils/status'

const statusTab = ref('all')
const { list, loading, error, reload } = useTable<RefundItem>(({ page, size }) =>
  getRefundList(statusTab.value === 'all' ? undefined : statusTab.value)
)

function statusType(s: string) {
  return statusTag('refund', s)
}

async function approve(id: number) {
  await ElMessageBox.confirm('确认通过此退款申请？', '提示', { type: 'success' })
  const r = await safe(approveRefund(id), {})
  if (okRes(r)) { ElMessage.success('已通过'); reload() }
  else ElMessage.error(msgOf(r))
}

async function reject(id: number) {
  const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回退款', { type: 'warning' })
  const r = await safe(rejectRefund(id, value), {})
  if (okRes(r)) { ElMessage.success('已驳回'); reload() }
  else ElMessage.error(msgOf(r))
}

async function viewDetail(id: number) {
  const r = await safe(getRefundDetail(id), {} as RefundItem)
  if (r.data) ElMessage.info(`退款单 #${r.data.id}，金额 ¥${r.data.amount}，状态：${r.data.status}`)
}
</script>

<style scoped>
.amount { color: #f56c6c; font-size: 15px; }
</style>
