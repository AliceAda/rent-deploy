<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>租期配置</span>
          <el-button type="primary" @click="openAdd">+ 新增配置</el-button>
        </div>
      </template>

      <el-table :data="periods" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="配置名称" width="150" />
        <el-table-column prop="months" label="月数" width="80" />
        <el-table-column prop="discount" label="折扣" width="100">
          <template #default="{ row }">
            <span v-if="row.discount">{{ row.discount }}折</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="minRent" label="最低租金" width="120">
          <template #default="{ row }">
            <span v-if="row.minRent">¥{{ row.minRent }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="maxRent" label="最高租金" width="120">
          <template #default="{ row }">
            <span v-if="row.maxRent">¥{{ row.maxRent }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editPeriod(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePeriod(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑租期配置' : '新增租期配置'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置名称">
          <el-input v-model="form.name" placeholder="如：半年租" />
        </el-form-item>
        <el-form-item label="月数">
          <el-input-number v-model="form.months" :min="1" :max="120" />
        </el-form-item>
        <el-form-item label="折扣">
          <el-input-number v-model="form.discount" :min="0" :max="10" :precision="1" />
          <span style="margin-left: 8px">折</span>
        </el-form-item>
        <el-form-item label="最低租金">
          <el-input-number v-model="form.minRent" :min="0" />
          <span style="margin-left: 8px">元/月</span>
        </el-form-item>
        <el-form-item label="最高租金">
          <el-input-number v-model="form.maxRent" :min="0" />
          <span style="margin-left: 8px">元/月</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRentPeriods, createRentPeriod, updateRentPeriod, deleteRentPeriod, type RentPeriod } from '@/api/extensions'

const loading = ref(false)
const submitting = ref(false)
const periods = ref<RentPeriod[]>([])

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  months: 12,
  discount: null as number | null,
  minRent: null as number | null,
  maxRent: null as number | null,
  status: 1
})

async function loadData() {
  loading.value = true
  try {
    const res = await getRentPeriods()
    if (res.code === 0) {
      periods.value = res.data
    }
  } catch (e) {
    ElMessage.error('加载租期配置失败')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', months: 12, discount: null, minRent: null, maxRent: null, status: 1 }
  dialogVisible.value = true
}

function editPeriod(row: RentPeriod) {
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name) return ElMessage.warning('请填写配置名称')
  submitting.value = true
  try {
    const res = editingId.value
      ? await updateRentPeriod(editingId.value, form.value)
      : await createRentPeriod(form.value)
    if (res.code === 0) {
      ElMessage.success(editingId.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

async function deletePeriod(row: RentPeriod) {
  try {
    await ElMessageBox.confirm(`确定删除租期配置「${row.name}」？`, '确认删除', { type: 'warning' })
    const res = await deleteRentPeriod(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
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
