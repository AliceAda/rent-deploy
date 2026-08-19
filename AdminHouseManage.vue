<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>房源列表</span>
          <el-space>
            <el-input v-model="search" placeholder="搜索房源" clearable style="width: 200px" />
            <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
              <el-option label="可租" value="可租" />
              <el-option label="已租" value="已租" />
              <el-option label="待审核" value="待审核" />
              <el-option label="已下架" value="已下架" />
            </el-select>
            <el-button type="primary" @click="handleBatchToggle">批量上下架</el-button>
            <el-button @click="handleExport">导出</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="houses" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="district" label="区域" width="100" />
        <el-table-column prop="layout" label="户型" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}/月</template>
        </el-table-column>
        <el-table-column prop="rentType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getRentTypeType(row.rentType)">{{ row.rentType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="80" />
        <el-table-column prop="collectCount" label="收藏" width="80" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleToggle(row)">
              {{ row.status === '可租' ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadHouses"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminHouses, type AdminHouse } from '@/api/admin'
import { downloadCsv } from '@/utils/export'

const loading = ref(false)
const houses = ref<AdminHouse[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const search = ref('')
const filterStatus = ref('')
const selectedHouses = ref<AdminHouse[]>([])

function getStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    '可租': 'success',
    '已租': 'info',
    '待审核': 'warning',
    '已下架': 'info',
    '违规': 'danger'
  }
  return types[status] || 'info'
}

function getRentTypeType(type: string): '' | 'primary' | 'success' | 'warning' {
  const types: Record<string, '' | 'primary' | 'success' | 'warning'> = {
    '整租': 'primary',
    '合租': 'success',
    '公寓': 'warning'
  }
  return types[type] || ''
}

async function loadHouses() {
  loading.value = true
  try {
    const res = await getAdminHouses()
    if (res.code === 0) {
      houses.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载房源列表失败')
  } finally {
    loading.value = false
  }
}

function handleSelectionChange(selection: AdminHouse[]) {
  selectedHouses.value = selection
}

function handleEdit(row: AdminHouse) {
  ElMessage.info(`编辑房源：${row.title}`)
}

async function handleToggle(row: AdminHouse) {
  const action = row.status === '可租' ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定${action}房源「${row.title}」？`, '确认操作', { type: 'warning' })
    ElMessage.success(`已${action}`)
    loadHouses()
  } catch {
    // cancelled
  }
}

async function handleDelete(row: AdminHouse) {
  try {
    await ElMessageBox.confirm(`确定删除房源「${row.title}」？`, '确认删除', { type: 'warning' })
    ElMessage.success('删除成功')
    loadHouses()
  } catch {
    // cancelled
  }
}

async function handleBatchToggle() {
  if (selectedHouses.value.length === 0) {
    return ElMessage.warning('请选择要操作的房源')
  }
  const action = selectedHouses.value[0].status === '可租' ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定批量${action} ${selectedHouses.value.length} 套房源？`, '确认操作', { type: 'warning' })
    ElMessage.success(`已批量${action}`)
    selectedHouses.value = []
    loadHouses()
  } catch {
    // cancelled
  }
}

function handleExport() {
  const data = houses.value.map(h => ({
    ID: h.id,
    标题: h.title,
    区域: h.district,
    户型: h.layout,
    价格: h.price,
    类型: h.rentType,
    状态: h.status,
    浏览: h.views,
    创建时间: h.createdAt
  }))
  downloadCsv(data, { filename: '房源列表' })
}

onMounted(loadHouses)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
