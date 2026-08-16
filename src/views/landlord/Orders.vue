<template>
  <div class="page-max">
    <h3>订单与合同</h3>
    <p class="sub">查看房源产生的预订订单与签署的电子合同</p>

    <el-tabs v-model="tab" class="tabs">
      <el-tab-pane label="预订订单" name="order">
        <el-card shadow="never" class="card">
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
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="电子合同" name="contract">
        <el-card shadow="never" class="card">
          <el-table :data="landlordContracts" stripe>
            <el-table-column prop="no" label="合同号" width="150" />
            <el-table-column prop="houseTitle" label="房源" min-width="130" />
            <el-table-column prop="tenant" label="租客" width="90" />
            <el-table-column label="租期" width="200">
              <template #default="{ row }">{{ row.start }} ~ {{ row.end }}</template>
            </el-table-column>
            <el-table-column label="租金" width="100">
              <template #default="{ row }"><span class="price">¥{{ row.rent }}</span></template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '生效中' ? 'success' : row.status === '待签署' ? 'warning' : 'info'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { safe } from '@/api/http'
import { getLandlordOrders, type OrderItem } from '@/api/order'
import { landlordContracts } from '@/mock/data'

const tab = ref('order')
const orders = ref<OrderItem[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  const r = await safe(getLandlordOrders(), { list: [], total: 0 })
  orders.value = r.data?.list ?? []
  loading.value = false
}
onMounted(load)
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
