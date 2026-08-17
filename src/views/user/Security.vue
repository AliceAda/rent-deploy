<template>
  <div class="page-max">
    <el-card shadow="never" class="mb16">
      <h3>密码安全</h3>
      <el-descriptions :column="1" border v-if="security">
        <el-descriptions-item label="密码强度">
          <el-tag :type="security.strength === '强' ? 'success' : security.strength === '中' ? 'warning' : 'danger'">{{ security.strength || '未知' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="上次修改">{{ security.lastChange || '-' }}</el-descriptions-item>
        <el-descriptions-item label="安全等级">
          <el-rate :model-value="security.level || 3" disabled />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <template #header><span>修改密码</span></template>
      <el-form :model="form" label-width="100px" style="max-width:480px">
        <el-form-item label="当前密码">
          <el-input v-model="form.oldPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="confirmPassword" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="手机验证码" />
            <el-button :disabled="countdown > 0" @click="sendCode">{{ countdown > 0 ? `${countdown}s` : '发送验证码' }}</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf, get } from '@/api/http'
import { changePassword } from '@/api/user'
import { sendSmsCode } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const security = ref<{ strength?: string; lastChange?: string; level?: number } | null>(null)
const form = ref({ oldPassword: '', newPassword: '', code: '' })
const confirmPassword = ref('')
const submitting = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

async function loadSecurity() {
  const r = await safe(get('/user/password'), {})
  security.value = r.data || {}
}

async function sendCode() {
  const r = await safe(sendSmsCode({ phone: auth.user?.phone || '', biz: 'change_pwd' }), {})
  if (okRes(r)) {
    ElMessage.success('验证码已发送')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && timer) { clearInterval(timer); timer = null }
    }, 1000)
  } else {
    ElMessage.error(msgOf(r))
  }
}

async function submit() {
  if (!form.value.oldPassword || !form.value.newPassword) return ElMessage.warning('请填写完整')
  if (form.value.newPassword !== confirmPassword.value) return ElMessage.error('两次密码不一致')
  submitting.value = true
  const r = await safe(changePassword(form.value), {})
  submitting.value = false
  if (okRes(r)) {
    ElMessage.success('密码修改成功，请重新登录')
    form.value = { oldPassword: '', newPassword: '', code: '' }
    confirmPassword.value = ''
  } else {
    ElMessage.error(msgOf(r))
  }
}

onMounted(loadSecurity)
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.code-row { display: flex; gap: 8px; width: 100%; }
.code-row .el-input { flex: 1; }
</style>
