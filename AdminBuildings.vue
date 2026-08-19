<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>楼栋管理</span>
          <el-button type="primary" @click="openAdd">+ 新增楼栋</el-button>
        </div>
      </template>

      <el-table :data="buildings" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="楼栋名称" width="180" />
        <el-table-column prop="district" label="区域" width="120" />
        <el-table-column prop="community" label="小区" min-width="160" />
        <el-table-column prop="totalFloors" label="总楼层" width="100" />
        <el-table-column prop="totalUnits" label="总户数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editBuilding(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteBuilding(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadBuildings"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑楼栋' : '新增楼栋'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="楼栋名称">
          <el-input v-model="form.name" placeholder="如：1号楼" />
        </el-form-item>
        <el-form-item label="所属区域">
          <el-cascader
            v-model="form.regionPath"
            :options="regionOptions"
            placeholder="选择省/市/区"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="小区名称">
          <el-input v-model="form.community" placeholder="如：望京西园" />
        </el-form-item>
        <el-form-item label="总楼层">
          <el-input-number v-model="form.totalFloors" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="总户数">
          <el-input-number v-model="form.totalUnits" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="正常">正常</el-radio>
            <el-radio value="停用">停用</el-radio>
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
import { getBuildings, createBuilding, updateBuilding, deleteBuilding, type Building } from '@/api/admin-extensions'

const loading = ref(false)
const submitting = ref(false)
const buildings = ref<Building[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = ref<Partial<Building>>({
  name: '',
  district: '',
  community: '',
  totalFloors: 1,
  totalUnits: 1,
  status: '正常'
})

const regionOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      { value: 'chaoyang', label: '朝阳区' },
      { value: 'haidian', label: '海淀区' },
      { value: 'dongcheng', label: '东城区' }
    ]
  }
]

async function loadBuildings() {
  loading.value = true
  try {
    const res = await getBuildings({ page: page.value, size: size.value })
    if (res.code === 0) {
      buildings.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载楼栋列表失败')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', district: '', community: '', totalFloors: 1, totalUnits: 1, status: '正常' }
  dialogVisible.value = true
}

function editBuilding(row: Building) {
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name) {
    return ElMessage.warning('请填写楼栋名称')
  }
  submitting.value = true
  try {
    const res = editingId.value
      ? await updateBuilding(editingId.value, form.value)
      : await createBuilding(form.value)
    if (res.code === 0) {
      ElMessage.success(editingId.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      loadBuildings()
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

async function deleteBuilding(row: Building) {
  try {
    await ElMessageBox.confirm(`确定删除楼栋「${row.name}」？`, '确认删除', { type: 'warning' })
    const res = await deleteBuilding(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadBuildings()
    }
  } catch {
    // cancelled
  }
}

onMounted(loadBuildings)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
