<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="toolbar">
        <h3>经纪人管理</h3>
        <div class="actions">
          <el-input v-model="search" placeholder="搜索经纪人姓名/手机号" clearable style="width: 240px" />
          <el-button type="primary" @click="openAdd">+ 新增经纪人</el-button>
          <el-button @click="exportData">导出</el-button>
        </div>
      </div>
      <el-table :data="filteredAgents" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="agency" label="所属门店" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="佣金比例" width="100">
          <template #default="{ row }">{{ row.commission }}%</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="editAgent(row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="deleteAgent(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑经纪人' : '新增经纪人'" width="480px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="所属门店"><el-input v-model="form.agency" /></el-form-item>
        <el-form-item label="佣金比例(%)">
          <el-input-number v-model="form.commission" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="冻结" value="冻结" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAgent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable } from '@/composables/useTable'
import { getAdminHouses } from '@/api/admin'

interface AgentItem {
  id: number
  name: string
  phone: string
  agency: string
  status: string
  commission: number
  createdAt: string
}

const search = ref('')
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const loading = ref(false)
const agents = ref<AgentItem[]>([])

// 模拟数据（实际应调用 API）
function loadAgents() {
  loading.value = true
  setTimeout(() => {
    agents.value = [
      { id: 1, name: '张三', phone: '13800138001', agency: '朝阳门店', status: '正常', commission: 5, createdAt: '2024-01-01' },
      { id: 2, name: '李四', phone: '13800138002', agency: '海淀门店', status: '正常', commission: 5, createdAt: '2024-01-15' },
      { id: 3, name: '王五', phone: '13800138003', agency: '西城门店', status: '冻结', commission: 3, createdAt: '2024-02-01' },
    ]
    loading.value = false
  }, 300)
}

const filteredAgents = computed(() => {
  if (!search.value) return agents.value
  const s = search.value.toLowerCase()
  return agents.value.filter(a => 
    a.name.includes(s) || a.phone.includes(s) || a.agency.includes(s)
  )
})

const form = ref({
  id: 0,
  name: '',
  phone: '',
  agency: '',
  commission: 5,
  status: '正常'
})

function openAdd() {
  editingId.value = null
  form.value = { id: 0, name: '', phone: '', agency: '', commission: 5, status: '正常' }
  dialogVisible.value = true
}

function editAgent(row: AgentItem) {
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function saveAgent() {
  if (!form.value.name || !form.value.phone) {
    return ElMessage.warning('请填写完整信息')
  }
  if (editingId.value) {
    // 更新
    const idx = agents.value.findIndex(a => a.id === editingId.value)
    if (idx >= 0) {
      agents.value[idx] = { ...agents.value[idx], ...form.value }
    }
    ElMessage.success('已更新')
  } else {
    // 新增
    agents.value.push({
      ...form.value,
      id: Date.now(),
      createdAt: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('已新增')
  }
  dialogVisible.value = false
}

async function deleteAgent(row: AgentItem) {
  try {
    await ElMessageBox.confirm(`确定删除经纪人「${row.name}」？`, '确认删除', { type: 'warning' })
    agents.value = agents.value.filter(a => a.id !== row.id)
    ElMessage.success('已删除')
  } catch { /* 取消 */ }
}

function exportData() {
  const csvContent = filteredAgents.value.map(a =>
    `${a.id},${a.name},${a.phone},${a.agency},${a.status},${a.commission}%,${a.createdAt}`
  ).join('\n')
  const blob = new Blob([`ID,姓名,手机号,所属门店,状态,佣金比例,注册时间\n${csvContent}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '经纪人列表.csv'
  a.click()
  URL.revokeObjectURL(url)
}

loadAgents()
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar h3 {
  margin: 0;
}
.actions {
  display: flex;
  gap: 8px;
}
</style>
