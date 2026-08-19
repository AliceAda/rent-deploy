<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>我的账单</h3>
        <el-radio-group v-model="statusTab" size="small" @change="reload">
          <el-radio-button label="all" value="all">全部</el-radio-button>
          <el-radio-button label="待支付" value="待支付">待支付</el-radio-button>
          <el-radio-button label="已支付" value="已支付">已支付</el-radio-button>
        </el-radio-group>
      </div>

      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无账单">
        <el-table-column label="账单" min-width="180">
          <template #default="{ row }">
            <div class="bill-title">{{ row.title }}</div>
            <div class="text-sub">{{ row.houseTitle || `房源 #${row.houseId}` }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="period" label="周期" width="110" />
        <el-table-column label="金额" width="130" align="right">
          <template #default="{ row }"><b class="amount">¥{{ row.amount }}</b></template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '待支付' || row.status === '已逾期'"
              size="small"
              type="primary"
              @click="pay(row)"
            >去支付</el-button>
            <span v-else class="text-sub">已结清</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getMyBills, payBill, type BillItem } from '@/api/bill'
import { statusTag } from '@/utils/status'

const statusTab = ref('all')
const { list, loading, error, reload } = useTable<BillItem>(({ page, size }) =>
  getMyBills(statusTab.value === 'all' ? undefined : statusTab.value)
)

function statusType(s: string) {
  return statusTag('bill', s)
}
async function pay(row: BillItem) {
  const r = await safe(payBill(row.id), {})
  if (r.code === 0) {
    ElMessage.success('支付成功')
    reload()
  } else {
    ElMessage.warning((r.data as { payUrl?: string } | undefined)?.payUrl || r.message || '支付发起失败')
  }
}
</script>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.bill-title {
  font-weight: 600;
}
.amount {
  color: var(--brand);
  font-size: 15px;
}
.text-sub {
  color: var(--sub);
  font-size: 12px;
  margin-top: 2px;
}
</style>