<template>
  <div class="page-max">
    <h3>租金账单</h3>
    <p class="sub">平台托管代收租金，按合同账期结算到你的账户</p>

    <el-row :gutter="14" class="sum">
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n price">¥{{ total.toLocaleString() }}</div>
          <div class="l">应收合计</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n ok">¥{{ paid.toLocaleString() }}</div>
          <div class="l">已收</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n warn">¥{{ due.toLocaleString() }}</div>
          <div class="l">待收</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n danger">¥{{ overdue.toLocaleString() }}</div>
          <div class="l">逾期</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="card" style="margin-top: 14px">
      <el-table :data="landlordBills" stripe>
        <el-table-column prop="month" label="账期" width="110" />
        <el-table-column prop="houseTitle" label="房源" min-width="140" />
        <el-table-column prop="tenant" label="租客" width="90" />
        <el-table-column label="应收" width="110">
          <template #default="{ row }"><span class="price">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="实收" width="110">
          <template #default="{ row }">¥{{ row.paid.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已收' ? 'success' : row.status === '待收' ? 'warning' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { landlordBills } from '@/mock/data'

const total = computed(() => landlordBills.reduce((s, b) => s + b.amount, 0))
const paid = computed(() => landlordBills.reduce((s, b) => s + b.paid, 0))
const due = computed(() => landlordBills.filter((b) => b.status === '待收').reduce((s, b) => s + b.amount, 0))
const overdue = computed(() => landlordBills.filter((b) => b.status === '逾期').reduce((s, b) => s + (b.amount - b.paid), 0))
</script>

<style scoped>
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.s {
  text-align: center;
  border-radius: 12px;
}
.s .n {
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
}
.s .n.price {
  color: var(--orange);
}
.s .n.ok {
  color: var(--ok);
}
.s .n.warn {
  color: var(--warn);
}
.s .n.danger {
  color: #e2483d;
}
.s .l {
  color: var(--sub);
  margin-top: 4px;
}
.card {
  border-radius: 12px;
}
.price {
  color: var(--orange);
  font-weight: 700;
}
</style>
