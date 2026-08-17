<template>
  <el-card shadow="never">
    <el-tabs v-model="tab">
      <el-tab-pane label="公告" name="公告" />
      <el-tab-pane label="资讯" name="资讯" />
      <el-tab-pane label="Banner" name="Banner" />
      <el-tab-pane label="帮助中心" name="帮助中心" />
    </el-tabs>
    <div class="bar">
      <el-input v-model="kw" placeholder="搜索标题" style="width: 240px" :prefix-icon="Search" />
      <el-button type="primary" @click="openNew">+ 新建{{ tab }}</el-button>
    </div>
    <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
    <el-table :data="filtered" border v-loading="loading">
      <el-table-column prop="title" label="标题" min-width="220" />
      <el-table-column prop="type" label="分类" width="110" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }"><el-tag :type="row.status === '已发布' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="publishTime" label="更新时间" width="140" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" plain @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.status === '已发布'" size="small" type="warning" plain :loading="submitting" @click="doOffline(row)">下架</el-button>
          <el-button v-else size="small" type="success" plain :loading="submitting" @click="doPublish(row)">发布</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && filtered.length === 0" description="暂无内容" />

    <el-dialog v-model="dialog" :title="dialogTitle" width="520px">
      <el-form label-width="80px">
        <el-form-item label="分类"><el-select v-model="form.type" style="width: 100%">
          <el-option label="公告" value="公告" />
          <el-option label="资讯" value="资讯" />
          <el-option label="Banner" value="Banner" />
          <el-option label="帮助中心" value="帮助中心" />
        </el-select></el-form-item>
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input type="textarea" :rows="4" v-model="form.body" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveContent">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { safe, okRes } from '@/api/http'
import { useTable } from '@/composables/useTable'
import {
  getAdminContents,
  createAdminContent,
  updateAdminContent,
  publishAdminContent,
  offlineAdminContent,
  type ContentItem
} from '@/api/admin'

const submitting = ref(false)
const tab = ref('公告')
const { list, loading, error, reload } = useTable<ContentItem>(() => getAdminContents())
const kw = ref('')
const dialog = ref(false)
const editingId = ref<number | null>(null)
const dialogTitle = computed(() => editingId.value ? '编辑' + tab.value : '新建' + tab.value)
const form = reactive({ title: '', body: '', type: '' })

const filtered = computed(() => {
  let items = list.value.filter((i) => i.type === tab.value)
  if (kw.value) items = items.filter((i) => i.title.includes(kw.value))
  return items
})

function openNew() {
  editingId.value = null
  form.title = ''
  form.body = ''
  form.type = tab.value
  dialog.value = true
}
function openEdit(row: ContentItem) {
  editingId.value = row.id
  form.title = row.title
  form.body = row.body
  form.type = row.type
  dialog.value = true
}
async function saveContent() {
  if (!form.title) { ElMessage.warning('请输入标题'); return }
  submitting.value = true
  const payload = { title: form.title, body: form.body, type: form.type }
  if (editingId.value) {
    const res = await safe(updateAdminContent(editingId.value, payload), {})
    if (okRes(res)) { ElMessage.success('已更新'); await reload() }
  } else {
    const res = await safe(createAdminContent(payload), {})
    if (okRes(res)) { ElMessage.success('已保存'); await reload() }
  }
  submitting.value = false
  dialog.value = false
}
async function doOffline(row: ContentItem) {
  submitting.value = true
  const res = await safe(offlineAdminContent(row.id), {})
  if (okRes(res)) { row.status = '草稿'; ElMessage.warning(`已下架「${row.title}」`) }
  submitting.value = false
}
async function doPublish(row: ContentItem) {
  submitting.value = true
  const res = await safe(publishAdminContent(row.id), {})
  if (okRes(res)) { row.status = '已发布'; ElMessage.success(`已发布「${row.title}」`) }
  submitting.value = false
}
</script>

<style scoped>
.bar { display: flex; gap: 12px; margin: 12px 0; }
</style>