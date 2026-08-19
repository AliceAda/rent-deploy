<template>
  <div class="page-max">
    <h3>订单</h3>
    <p class="sub">查看房源产生的预订订单</p>

    <el-card shadow="never" class="card">
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="orders" stripe v-loading="loading" empty-text="暂无订单">
        <el-table-column prop="orderNo" label="订单号" width="150" />
        <el-table-column prop="title" label="房源" min-width="140" />
        <el-table-column prop="tenant" label="租客" width="90" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }"><span class="price">¥{{ Number(row.amount).toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已支付' || row.status === '已完成' ? 'success' : row.status === '待确认' || row.status === '待支付' ? 'warning' : row.status === '已取消' ? 'info' : ''" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '已确认' || row.status === '已支付'"
              text
              type="primary"
              size="small"
              @click="checkin(row)"
            >入住办理</el-button>
            <el-button
              text
              type="primary"
              size="small"
              @click="detail(row)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getLandlordOrders, checkinOrder, type OrderItem } from '@/api/order'

const router = useRouter()
const { list: orders, loading, error, reload } = useTable<OrderItem>(() => getLandlordOrders())

async function checkin(row: OrderItem) {
  const r = await safe(checkinOrder(row.orderId), {})
  if (okRes(r)) {
    ElMessage.success('入住办理成功')
    reload()
  } else {
    ElMessage.error(msgOf(r))
  }
}

function detail(row: OrderItem) {
  router.push(`/orders/${row.orderId}`)
}
</script>

<style scoped>
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.card {
  border-radius: 12px;
}
.price {
  color: var(--orange);
  font-weight: 700;
}
</style>