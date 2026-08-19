<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>入住记录</span>
          <el-space>
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="在住" value="active" />
              <el-option label="已退住" value="checked_out" />
            </el-select>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="checkins" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="houseTitle" label="房源" min-width="180" />
        <el-table-column prop="checkinDate" label="入住日期" width="120" />
        <el-table-column prop="checkoutDate" label="退住日期" width="120">
          <template #default="{ row }">{{ row.checkoutDate || '-' }}</template>
        </el-table-column>
        <el-table-column prop="deposit" label="押金" width="120">
          <template #default="{ row }">¥{{ row.deposit?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在住' : '已退住' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'active'" size="small" type="warning" @click="checkout(row)">退住</el-button>
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCheckins, checkout, type CheckinRecord } from '@/api/extensions'

const loading = ref(false)
const checkins = ref<CheckinRecord[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const filterStatus = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await getCheckins({ page: page.value, size: size.value, status: filterStatus.value })
    if (res.code === 0) {
      checkins.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载入住记录失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row: CheckinRecord) {
  ElMessage.info('查看详情功能开发中')
}

async function checkout(row: CheckinRecord) {
  try {
    await ElMessageBox.confirm(`确定办理「${row.houseTitle}」的退住手续？`, '确认退住', { type: 'warning' })
    const res = await checkout(row.id, {})
    if (res.code === 0) {
      ElMessage.success('退住成功')
      loadData()
    }
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
