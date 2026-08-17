<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="`账单 #${billId}`" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="bill" shadow="never" class="mb16">
        <div class="status-bar">
          <el-tag :type="statusType(bill.status)" size="large">{{ bill.status }}</el-tag>
          <div v-if="bill.status === '待支付'">
            <el-button type="primary" @click="pay">确认收款</el-button>
          </div>
        </div>
      </el-card>

      <el-card v-if="bill" shadow="never">
        <template #header><span>账单信息</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="账单编号">{{ bill.billNo || `#${bill.id}` }}</el-descriptions-item>
          <el-descriptions-item label="账单名称">{{ bill.title }}</el-descriptions-item>
          <el-descriptions-item label="房源">{{ bill.houseTitle || `房源#${bill.houseId}` }}</el-descriptions-item>
          <el-descriptions-item label="租客">{{ bill.tenantName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ bill.type }}</el-descriptions-item>
          <el-descriptions-item label="周期">{{ bill.period || '-' }}</el-descriptions-item>
          <el-descriptions-item label="金额"><b class="price">¥{{ bill.amount }}</b></el-descriptions-item>
          <el-descriptions-item label="状态">{{ bill.status }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ bill.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ bill.payTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ bill.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { getLandlordBillDetail, payLandlordBill, type BillItem } from '@/api/bill'

const route = useRoute()
const billId = Number(route.params.id)
const bill = ref<BillItem | null>(null)
const loading = ref(false)

function statusType(s: string) {
  if (s === '已支付') return 'success'
  if (s === '已逾期') return 'danger'
  return 'warning'
}

async function load() {
  loading.value = true
  const r = await safe(getLandlordBillDetail(billId), {} as BillItem)
  bill.value = r.data
  loading.value = false
}

async function pay() {
  await ElMessageBox.confirm('确认标记此账单为已收款？', '提示', { type: 'info' })
  const r = await safe(payLandlordBill(billId), {})
  if (okRes(r)) { ElMessage.success('已确认收款'); load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-size: 18px; }
</style>
