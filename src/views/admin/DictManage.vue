<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>数据字典</h3>
        <el-button type="primary" @click="showAdd = true">新增字典项</el-button>
      </div>
      <el-table :data="list" v-loading="loading" empty-text="暂无字典数据">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="value" label="值" min-width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button text size="small" @click="edit(row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAdd" :title="editing ? '编辑字典项' : '新增字典项'" width="400px">
      <el-form label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型"><el-input v-model="form.type" /></el-form-item>
        <el-form-item label="值"><el-input v-model="form.value" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, post, put, del, safe, okRes, msgOf } from '@/api/http'

interface DictItem { id: number; name: string; type: string; value: string; sort: number }

const list = ref<DictItem[]>([])
const loading = ref(false)
const showAdd = ref(false)
const editing = ref(false)
const form = ref<Partial<DictItem>>({})

async function load() {
  loading.value = true
  const r = await safe(get('/admin/dict'), { list: [], total: 0 })
  list.value = (r.data as { list?: DictItem[] })?.list ?? []
  loading.value = false
}

function edit(row: DictItem) {
  editing.value = true
  form.value = { ...row }
  showAdd.value = true
}

async function submit() {
  const r = editing.value
    ? await safe(put('/admin/dict', form.value), {})
    : await safe(post('/admin/dict', form.value), {})
  if (okRes(r)) { ElMessage.success('操作成功'); showAdd.value = false; editing.value = false; form.value = {}; load() }
  else ElMessage.error(msgOf(r))
}

async function remove(id: number) {
  await ElMessageBox.confirm('确认删除此字典项？', '提示', { type: 'warning' })
  const r = await safe(del(`/admin/dict/${id}`), {})
  if (okRes(r)) { ElMessage.success('已删除'); load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
</style>
