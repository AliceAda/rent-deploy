<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="`用户详情 #${userId}`" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="user" shadow="never" class="mb16">
        <div class="status-bar">
          <div class="user-info">
            <el-avatar :size="48" :src="user.avatar">{{ user.name?.[0] }}</el-avatar>
            <div>
              <div class="name">{{ user.name }}</div>
              <div class="sub">{{ user.phone }} · {{ user.role }}</div>
            </div>
          </div>
          <div class="actions">
            <el-button v-if="user.status === '正常'" type="danger" plain @click="toggleStatus('封禁')">封禁用户</el-button>
            <el-button v-else type="success" @click="toggleStatus('正常')">解封用户</el-button>
          </div>
        </div>
      </el-card>

      <el-row :gutter="16" v-if="user">
        <el-col :span="12">
          <el-card shadow="never" class="mb16">
            <template #header><span>基本信息</span></template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
              <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
              <el-descriptions-item label="角色">{{ user.role }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="user.status === '正常' ? 'success' : 'danger'">{{ user.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ user.createTime }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never" class="mb16">
            <template #header><span>认证资料</span></template>
            <el-descriptions :column="1" border v-if="cert">
              <el-descriptions-item label="实名状态">
                <el-tag :type="cert.status === '已认证' ? 'success' : 'warning'">{{ cert.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="真实姓名">{{ cert.realName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="身份证号">{{ cert.idCardMask || '-' }}</el-descriptions-item>
              <el-descriptions-item label="认证时间">{{ cert.certTime || '-' }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="暂无认证信息" :image-size="60" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { get, post, put, safe, okRes, msgOf } from '@/api/http'

const route = useRoute()
const userId = Number(route.params.id)
const loading = ref(false)
const user = ref<{ id: number; name: string; phone: string; email?: string; role: string; status: string; avatar?: string; createTime: string } | null>(null)
const cert = ref<{ status: string; realName?: string; idCardMask?: string; certTime?: string } | null>(null)

async function load() {
  loading.value = true
  const [r1, r2, r3] = await Promise.all([
    safe(get<Record<string, any>>(`/admin/user/${userId}`), {}),
    safe(get<Record<string, any>>(`/admin/user/${userId}/cert`), {}),
    safe(get<{ status: string }>(`/admin/user/${userId}/status`), { status: '' })
  ])
  user.value = r1.data as typeof user.value
  cert.value = r2.data as typeof cert.value
  if (user.value && r3.data?.status) user.value.status = r3.data.status
  loading.value = false
}

async function toggleStatus(target: string) {
  await ElMessageBox.confirm(`确认${target === '封禁' ? '封禁' : '解封'}此用户？`, '提示', { type: 'warning' })
  const r = await safe(post(`/admin/user/${userId}/status`, { status: target }), {})
  if (okRes(r)) { ElMessage.success('操作成功'); load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.user-info { display: flex; align-items: center; gap: 12px; }
.name { font-size: 18px; font-weight: 600; }
.sub { font-size: 13px; color: var(--el-text-color-secondary); }
</style>
