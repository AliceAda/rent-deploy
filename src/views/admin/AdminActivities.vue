<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" @click="openAdd">+ 新增活动</el-button>
        </div>
      </template>

      <el-table :data="activities" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="180" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ typeMap[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="banner" label="海报" width="80">
          <template #default="{ row }">
            <el-image v-if="row.banner" :src="row.banner" style="width:40px;height:40px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editActivity(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="toggleActivity(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteActivity(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadActivities"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑活动' : '新增活动'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="新用户" value="new_user" />
            <el-option label="邀请" value="invite" />
            <el-option label="租房" value="rent" />
            <el-option label="节日" value="festival" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动海报">
          <el-upload action="/api/storage/upload" list-type="picture-card">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="not_started">未开始</el-radio>
            <el-radio value="active">进行中</el-radio>
            <el-radio value="ended">已结束</el-radio>
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
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getActivities, createActivity, updateActivity, deleteActivity, toggleActivity, type Activity } from '@/api/extensions'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const submitting = ref(false)
const activities = ref<Activity[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)

const form = reactive<Partial<Activity>>({
  name: '',
  type: 'new_user',
  status: 'not_started',
  startTime: '',
  endTime: ''
})

const typeMap: Record<string, string> = {
  new_user: '新用户',
  invite: '邀请',
  rent: '租房',
  festival: '节日'
}

const statusMap: Record<string, string> = {
  not_started: '未开始',
  active: '进行中',
  ended: '已结束'
}

function statusType(status: string): '' | 'success' | 'warning' | 'info' {
  const types: Record<string, '' | 'success' | 'warning' | 'info'> = {
    not_started: 'info',
    active: 'success',
    ended: 'warning'
  }
  return types[status] || ''
}

async function loadActivities() {
  loading.value = true
  try {
    const res = await getActivities({ page: page.value, size: size.value })
    if (res.code === 0) {
      activities.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', type: 'new_user', status: 'not_started', startTime: '', endTime: '' })
  dialogVisible.value = true
}

function editActivity(row: Activity) {
  editingId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleSave() {
  if (!form.name) return ElMessage.warning('请填写活动名称')
  submitting.value = true
  try {
    const res = editingId.value
      ? await updateActivity(editingId.value, form)
      : await createActivity(form)
    if (res.code === 0) {
      ElMessage.success(editingId.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadActivities()
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

async function toggleActivity(row: Activity) {
  try {
    const res = await toggleActivity(row.id, row.status === 'active' ? 'ended' : 'active')
    if (res.code === 0) {
      ElMessage.success('操作成功')
      loadActivities()
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

async function deleteActivity(row: Activity) {
  try {
    await ElMessageBox.confirm(`确定删除活动「${row.name}」？`, '确认删除', { type: 'warning' })
    const res = await deleteActivity(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadActivities()
    }
  } catch {
    // cancelled
  }
}

onMounted(loadActivities)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
