<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>广告管理</span>
          <el-space>
            <el-button type="primary" @click="openAddSlot">+ 新增广告位</el-button>
            <el-button @click="openAddMaterial">+ 新增素材</el-button>
          </el-space>
        </div>
      </template>

      <!-- 广告位列表 -->
      <el-table :data="slots" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="广告位名称" min-width="150" />
        <el-table-column prop="code" label="编码" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="位置" width="100" />
        <el-table-column prop="width" label="尺寸" width="120">
          <template #default="{ row }">{{ row.width }}×{{ row.height }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'" size="small">{{ row.status ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editSlot(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteSlot(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 广告素材弹窗 -->
    <el-dialog v-model="materialVisible" title="广告素材" width="800px">
      <el-table :data="materials" v-loading="materialLoading">
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="image" label="图片" width="100">
          <template #default="{ row }">
            <el-image :src="row.image" style="width:60px;height:60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="url" label="链接" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '投放中' : '未投放' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="editMaterial(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteMaterial(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑广告位' : '新增广告位'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="广告位名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="form.code" placeholder="如：home_banner" />
        </el-form-item>
        <el-form-item label="位置">
          <el-select v-model="form.position" style="width: 100%">
            <el-option label="首页轮播" value="home_banner" />
            <el-option label="侧边栏" value="sidebar" />
            <el-option label="底部" value="footer" />
          </el-select>
        </el-form-item>
        <el-form-item label="尺寸">
          <el-input v-model="form.width" placeholder="宽度" style="width: 100px" />
          <span>×</span>
          <el-input v-model="form.height" placeholder="高度" style="width: 100px" />
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
import { getAdSlots, getAdMaterials, createAdSlot, updateAdSlot, deleteAdSlot, type AdSlot } from '@/api/extensions'

const loading = ref(false)
const materialLoading = ref(false)
const submitting = ref(false)
const slots = ref<AdSlot[]>([])
const materials = ref<any[]>([])

const dialogVisible = ref(false)
const materialVisible = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  name: '',
  code: '',
  position: 'home_banner',
  width: 1200,
  height: 400,
  status: 1
})

async function loadSlots() {
  loading.value = true
  try {
    const res = await getAdSlots()
    if (res.code === 0) slots.value = res.data
  } catch (e) {
    ElMessage.error('加载广告位失败')
  } finally {
    loading.value = false
  }
}

function openAddSlot() {
  editingId.value = null
  form.value = { name: '', code: '', position: 'home_banner', width: 1200, height: 400, status: 1 }
  dialogVisible.value = true
}

function editSlot(row: AdSlot) {
  editingId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.value.name || !form.value.code) return ElMessage.warning('请填写完整信息')
  submitting.value = true
  try {
    const res = editingId.value
      ? await updateAdSlot(editingId.value, form.value)
      : await createAdSlot(form.value)
    if (res.code === 0) {
      ElMessage.success(editingId.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadSlots()
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

async function deleteSlot(row: AdSlot) {
  try {
    await ElMessageBox.confirm(`确定删除广告位「${row.name}」？`, '确认删除', { type: 'warning' })
    const res = await deleteAdSlot(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadSlots()
    }
  } catch { /* cancelled */ }
}

function openAddMaterial() {
  materialVisible.value = true
  materialLoading.value = true
  getAdMaterials().then(res => {
    if (res.code === 0) materials.value = res.data.list
  }).finally(() => materialLoading.value = false)
}

function editMaterial(row: any) {
  ElMessage.info('编辑素材功能开发中')
}

function deleteMaterial(row: any) {
  ElMessage.info('删除素材功能开发中')
}

onMounted(loadSlots)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
