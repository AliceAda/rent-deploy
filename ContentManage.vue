<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="toolbar">
        <h3>平台公告与Banner管理</h3>
        <div class="actions">
          <el-radio-group v-model="tab" size="small">
            <el-radio-button label="banner">首页Banner</el-radio-button>
            <el-radio-button label="notice">公告管理</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="openAdd">+ 新增</el-button>
        </div>
      </div>

      <!-- Banner列表 -->
      <template v-if="tab === 'banner'">
        <el-table :data="banners" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="图片" width="120">
            <template #default="{ row }">
              <img :src="row.cover" class="thumb" />
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="160" />
          <el-table-column prop="link" label="跳转链接" min-width="180" />
          <el-table-column prop="sort" label="排序" width="80" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button text size="small" @click="editBanner(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="deleteBanner(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 公告列表 -->
      <template v-else>
        <el-table :data="notices" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="160" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === '公告' ? 'primary' : 'warning'" size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '已发布' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="160" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button text size="small" @click="editNotice(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="deleteNotice(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <!-- Banner编辑弹窗 -->
    <el-dialog v-model="bannerDialog" :title="bannerEditing ? '编辑Banner' : '新增Banner'" width="560px">
      <el-form :model="bannerForm" label-width="100px">
        <el-form-item label="标题"><el-input v-model="bannerForm.title" /></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="bannerForm.cover" placeholder="请输入图片地址" /></el-form-item>
        <el-form-item label="跳转链接"><el-input v-model="bannerForm.link" placeholder="https://" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="bannerForm.sort" :min="0" :max="999" /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="bannerForm.status" style="width: 100%">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bannerDialog = false">取消</el-button>
        <el-button type="primary" @click="saveBanner">保存</el-button>
      </template>
    </el-dialog>

    <!-- 公告编辑弹窗 -->
    <el-dialog v-model="noticeDialog" :title="noticeEditing ? '编辑公告' : '新增公告'" width="600px">
      <el-form :model="noticeForm" label-width="100px">
        <el-form-item label="标题"><el-input v-model="noticeForm.title" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="noticeForm.type" style="width: 100%">
            <el-option label="公告" value="公告" />
            <el-option label="资讯" value="资讯" />
            <el-option label="帮助" value="帮助" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="noticeForm.content" type="textarea" :rows="5" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="noticeForm.status" style="width: 100%">
            <el-option label="草稿" value="草稿" />
            <el-option label="已发布" value="已发布" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNotice">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const tab = ref('banner')
const loading = ref(false)

// Banner数据
const banners = ref<Array<{ id: number; title: string; cover: string; link: string; sort: number; status: string; createdAt: string }>>([
  { id: 1, title: '新人专享优惠', cover: '', link: '/list', sort: 1, status: '启用', createdAt: '2024-01-01' },
  { id: 2, title: '周末看房活动', cover: '', link: '/market', sort: 2, status: '启用', createdAt: '2024-01-15' },
])
const bannerDialog = ref(false)
const bannerEditing = ref(false)
const bannerForm = reactive({ id: 0, title: '', cover: '', link: '', sort: 0, status: '启用' })

// 公告数据
const notices = ref<Array<{ id: number; title: string; type: string; content: string; status: string; publishTime: string }>>([
  { id: 1, title: '平台升级公告', type: '公告', content: '平台将于本周末进行系统升级...', status: '已发布', publishTime: '2024-01-20' },
])
const noticeDialog = ref(false)
const noticeEditing = ref(false)
const noticeForm = reactive({ id: 0, title: '', type: '公告', content: '', status: '草稿' })

function openAdd() {
  if (tab.value === 'banner') {
    bannerEditing.value = false
    Object.assign(bannerForm, { id: 0, title: '', cover: '', link: '', sort: 0, status: '启用' })
    bannerDialog.value = true
  } else {
    noticeEditing.value = false
    Object.assign(noticeForm, { id: 0, title: '', type: '公告', content: '', status: '草稿' })
    noticeDialog.value = true
  }
}

function editBanner(row: any) {
  bannerEditing.value = true
  Object.assign(bannerForm, row)
  bannerDialog.value = true
}

function editNotice(row: any) {
  noticeEditing.value = true
  Object.assign(noticeForm, row)
  noticeDialog.value = true
}

async function saveBanner() {
  if (!bannerForm.title) return ElMessage.warning('请填写标题')
  if (bannerEditing.value) {
    const idx = banners.value.findIndex(b => b.id === bannerForm.id)
    if (idx >= 0) banners.value[idx] = { ...banners.value[idx], ...bannerForm }
    ElMessage.success('已更新')
  } else {
    banners.value.push({ ...bannerForm, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) })
    ElMessage.success('已新增')
  }
  bannerDialog.value = false
}

async function saveNotice() {
  if (!noticeForm.title) return ElMessage.warning('请填写标题')
  if (noticeEditing.value) {
    const idx = notices.value.findIndex(n => n.id === noticeForm.id)
    if (idx >= 0) notices.value[idx] = { ...notices.value[idx], ...noticeForm }
    ElMessage.success('已更新')
  } else {
    notices.value.push({ ...noticeForm, id: Date.now(), publishTime: new Date().toISOString().slice(0, 10) })
    ElMessage.success('已新增')
  }
  noticeDialog.value = false
}

async function deleteBanner(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该Banner？', '确认删除', { type: 'warning' })
    banners.value = banners.value.filter(b => b.id !== row.id)
    ElMessage.success('已删除')
  } catch { /* 取消 */ }
}

async function deleteNotice(row: any) {
  try {
    await ElMessageBox.confirm('确定删除该公告？', '确认删除', { type: 'warning' })
    notices.value = notices.value.filter(n => n.id !== row.id)
    ElMessage.success('已删除')
  } catch { /* 取消 */ }
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
  align-items: center;
  gap: 12px;
}
.thumb {
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 4px;
  background: var(--bg);
}
</style>
