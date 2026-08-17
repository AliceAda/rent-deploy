<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>支付记录</h3>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无支付记录">
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }"><b class="amount">¥{{ row.amount }}</b></template>
        </el-table-column>
        <el-table-column prop="channel" label="支付渠道" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '成功' ? 'success' : row.status === '失败' ? 'danger' : 'warning'">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="支付时间" width="180" />
      </el-table>
      <el-pagination
        v-if="total > size"
        style="margin-top: 12px; justify-content: flex-end"
        layout="total, prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="setPage"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useTable } from '@/composables/useTable'
import { getMyPayRecords, type PayRecord } from '@/api/pay'

const { list, loading, error, reload, total, page, size, setPage, setSize } =
  useTable<PayRecord>(({ page, size }) => getMyPayRecords(page, size), { pageSize: 10 })
</script>

<style scoped>
.amount { color: #f56c6c; font-size: 15px; }
</style>
