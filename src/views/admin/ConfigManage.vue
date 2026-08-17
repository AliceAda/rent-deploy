<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>系统配置</h3>
        <el-button type="primary" @click="showAdd = true">新增配置</el-button>
      </div>
      <el-table :data="list" v-loading="loading" empty-text="暂无配置">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="key" label="配置键" min-width="160" />
        <el-table-column prop="value" label="配置值" min-width="200" />
        <el-table-column prop="name" label="说明" min-width="160" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button text size="small" @click="edit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAdd" :title="editing ? '编辑配置' : '新增配置'" width="440px">
      <el-form label-width="80px">
        <el-form-item label="配置键"><el-input v-model="form.key" :disabled="editing" /></el-form-item>
        <el-form-item label="配置值"><el-input v-model="form.value" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.name" /></el-form-item>
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
import { ElMessage } from 'element-plus'
import { get, post, put, safe, okRes, msgOf } from '@/api/http'

interface ConfigItem { id: number; key: string; value: string; name: string }

const list = ref<ConfigItem[]>([])
const loading = ref(false)
const showAdd = ref(false)
const editing = ref(false)
const form = ref<Partial<ConfigItem>>({})

async function load() {
  loading.value = true
  const r = await safe(get('/admin/config'), { list: [], total: 0 })
  list.value = (r.data as { list?: ConfigItem[] })?.list ?? []
  loading.value = false
}

function edit(row: ConfigItem) {
  editing.value = true
  form.value = { ...row }
  showAdd.value = true
}

async function submit() {
  const r = editing.value
    ? await safe(put('/admin/config', form.value), {})
    : await safe(post('/admin/config', form.value), {})
  if (okRes(r)) { ElMessage.success('操作成功'); showAdd.value = false; editing.value = false; form.value = {}; load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
</style>
