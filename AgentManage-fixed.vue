<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="toolbar">
        <h3>经纪人管理</h3>
        <div class="actions">
          <el-input v-model="search" placeholder="Search by name/phone" clearable style="width: 240px" />
          <el-button type="primary" @click="openAdd">+ Add Agent</el-button>
          <el-button @click="exportData">Export</el-button>
        </div>
      </div>
      <el-table :data="filteredAgents" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Name" width="120" />
        <el-table-column prop="phone" label="Phone" width="140" />
        <el-table-column prop="agency" label="Agency" min-width="160" />
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="Commission %" width="100">
          <template #default="{ row }">{{ row.commission }}%</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="160" />
        <el-table-column label="Actions" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="editAgent(row)">Edit</el-button>
            <el-button text size="small" type="danger" @click="deleteAgent(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="editingId ? 'Edit Agent' : 'Add Agent'" width="480px">
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Agent name" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="form.phone" placeholder="Phone number" />
        </el-form-item>
        <el-form-item label="Agency" prop="agency">
          <el-input v-model="form.agency" placeholder="Agency/Branch" />
        </el-form-item>
        <el-form-item label="Commission %">
          <el-input-number v-model="form.commission" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="Active" value="正常" />
            <el-option label="Frozen" value="冻结" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="saveAgent">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable } from '@/composables/useTable'
import { getAdminAgents, createAdminAgent, updateAdminAgent, deleteAdminAgent, type AgentItem } from '@/api/admin'
import { downloadCsv } from '@/utils/export'

const search = ref('')
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const rules = {
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  phone: [{ required: true, message: 'Phone is required', trigger: 'blur' }]
}

const { list: agents, loading, reload } = useTable<AgentItem>(() => getAdminAgents())

const filteredAgents = computed(() => {
  if (!search.value) return agents.value
  const s = search.value.toLowerCase()
  return agents.value.filter(a => 
    a.name.toLowerCase().includes(s) || 
    a.phone.includes(s) || 
    a.agency.toLowerCase().includes(s)
  )
})

const form = ref({
  id: 0,
  name: '',
  phone: '',
  agency: '',
  commission: 5,
  status: '正常' as '正常' | '冻结'
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
    return ElMessage.warning('Please fill in required fields')
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateAdminAgent(editingId.value, form.value)
      ElMessage.success('Updated successfully')
    } else {
      await createAdminAgent(form.value)
      ElMessage.success('Created successfully')
    }
    dialogVisible.value = false
    reload()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : 'Save failed')
  } finally {
    submitting.value = false
  }
}

async function deleteAgent(row: AgentItem) {
  try {
    await ElMessageBox.confirm(`Confirm delete agent "${row.name}"?`, 'Confirm Delete', { type: 'warning' })
    submitting.value = true
    await deleteAdminAgent(row.id)
    ElMessage.success('Deleted successfully')
    reload()
  } catch {
    // cancelled
  } finally {
    submitting.value = false
  }
}

function exportData() {
  downloadCsv(filteredAgents.value, {
    filename: 'agents',
    headers: { id: 'ID', name: 'Name', phone: 'Phone', agency: 'Agency', commission: 'Commission %', status: 'Status', createdAt: 'Created' }
  })
}
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
