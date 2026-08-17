<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>我的账单</h3>
        <el-radio-group v-model="statusTab" size="small" @change="load">
          <el-radio-button label="all" value="all">全部</el-radio-button>
          <el-radio-button label="待支付" value="待支付">待支付</el-radio-button>
          <el-radio-button label="已支付" value="已支付">已支付</el-radio-button>
        </el-radio-group>
      </div>

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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getMyBills, payBill, type BillItem } from '@/api/bill'

const list = ref<BillItem[]>([])
const loading = ref(false)
const statusTab = ref('all')

function statusType(s: string) {
  if (s === '已支付') return 'success'
  if (s === '已逾期') return 'danger'
  return 'warning'
}
async function load() {
  loading.value = true
  const status = statusTab.value === 'all' ? undefined : statusTab.value
  const r = await safe(getMyBills(status), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}
async function pay(row: BillItem) {
  const r = await safe(payBill(row.id), {})
  if (r.code === 0) {
    ElMessage.success('支付成功')
    load()
  } else {
    ElMessage.warning((r.data as { payUrl?: string } | undefined)?.payUrl || r.message || '支付发起失败')
  }
}
onMounted(load)
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