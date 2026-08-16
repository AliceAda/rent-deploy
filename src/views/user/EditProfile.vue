<template>
  <div class="page-max">
    <el-card shadow="never" style="max-width: 640px">
      <h3>编辑个人资料</h3>
      <el-form :model="form" label-width="80px" style="margin-top: 12px">
        <el-form-item label="头像">
          <div class="avatar-row">
            <el-avatar :size="56" :src="form.avatar || ''" v-if="form.avatar">
              {{ form.name?.[0] }}
            </el-avatar>
            <el-avatar :size="56" v-else>{{ form.name?.[0] || '?' }}</el-avatar>
            <el-upload :show-file-list="false" :http-request="uploadAvatar" accept="image/*">
              <el-button>上传头像</el-button>
            </el-upload>
          </div>
          <div class="tip">支持 jpg / png，建议 200x200 以上</div>
        </el-form-item>

        <el-form-item label="昵称" required>
          <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="2-50 个字符" />
        </el-form-item>

        <el-form-item label="性别">
          <el-select v-model="form.gender" style="width: 160px">
            <el-option label="保密" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="可选，用于接收通知" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
          <el-button @click="go('/mine')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="max-width: 640px; margin-top: 16px">
      <h3>修改手机号</h3>
      <el-form :model="phoneForm" label-width="80px" style="margin-top: 12px">
        <el-form-item label="当前手机号">
          <el-input :model-value="maskPhone(auth.user?.phone || '')" disabled />
        </el-form-item>
        <el-form-item label="新手机号" required>
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="验证码" required>
          <div class="code-row">
            <el-input v-model="phoneForm.code" placeholder="6 位验证码" maxlength="6" />
            <el-button :disabled="phoneCounter > 0 || phoneSending" @click="sendPhoneCode">
              {{ phoneCounter > 0 ? phoneCounter + 's 后重发' : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="phoneSaving" @click="submitPhone">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="max-width: 640px; margin-top: 16px">
      <h3>修改密码</h3>
      <el-form :model="pwdForm" label-width="80px" style="margin-top: 12px">
        <el-form-item label="旧密码" required>
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="6-20 位字母或数字" />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="pwdForm.confirm" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
        <el-form-item label="验证码" required>
          <div class="code-row">
            <el-input v-model="pwdForm.code" placeholder="6 位验证码" maxlength="6" />
            <el-button :disabled="pwdCounter > 0 || pwdSending" @click="sendPwdCode">
              {{ pwdCounter > 0 ? pwdCounter + 's 后重发' : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="pwdSaving" @click="submitPwd">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import { safe } from '@/api/http'
import { getPresignUrl } from '@/api/storage'
import {
  getUserProfile,
  updateUserProfile,
  changePhone,
  changePassword,
  type UserProfile
} from '@/api/user'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ name: '', avatar: '', gender: 0, email: '' })
const saving = ref(false)

const phoneForm = ref({ phone: '', code: '' })
const phoneSaving = ref(false)
const phoneSending = ref(false)
const phoneCounter = ref(0)

const pwdForm = ref({ oldPassword: '', newPassword: '', confirm: '', code: '' })
const pwdSaving = ref(false)
const pwdSending = ref(false)
const pwdCounter = ref(0)

function maskPhone(phone: string) {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

function startTimer(counter: Ref<number>) {
  counter.value = 60
  const t = window.setInterval(() => {
    counter.value--
    if (counter.value <= 0) window.clearInterval(t)
  }, 1000)
}

async function load() {
  const r = await safe(getUserProfile(), {})
  const d = r.data || {}
  form.value = {
    name: d.name ?? auth.user?.name ?? '',
    avatar: d.avatar ?? auth.user?.avatar ?? '',
    gender: typeof d.gender === 'number' ? d.gender : 0,
    email: d.email ?? auth.user?.email ?? ''
  }
}

// 头像上传：预签名直传（需后端 anju-storage 就绪）
async function uploadAvatar(options: { file: File }) {
  const file = options.file
  if (!file.type.startsWith('image/')) return ElMessage.warning('请选择图片文件')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const objectKey = `avatar/${auth.user?.id ?? 0}/${Date.now()}.${ext}`
  try {
    const r = await safe(
      getPresignUrl({ ownerId: auth.user?.id ?? 0, bizType: 'avatar', objectKey }),
      ''
    )
    const presignedUrl = r.data
    if (!presignedUrl) throw new Error('no presign url')
    const up = await fetch(presignedUrl, { method: 'PUT', body: file })
    if (!up.ok) throw new Error('upload failed')
    form.value.avatar = presignedUrl.split('?')[0]
    ElMessage.success('头像已上传')
  } catch (e) {
    ElMessage.error('头像上传失败，请检查存储服务')
  }
}

async function submit() {
  const name = form.value.name.trim()
  if (!name) return ElMessage.warning('昵称不能为空')
  if (name.length < 2) return ElMessage.warning('昵称至少 2 个字符')
  const email = form.value.email.trim()
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return ElMessage.warning('邮箱格式不正确')
  }
  const body = {
    name,
    avatar: form.value.avatar.trim(),
    gender: form.value.gender,
    email
  }
  saving.value = true
  const r = await safe(updateUserProfile(body), {})
  saving.value = false
  if (r.code === 0) {
    auth.updateProfile(body)
    ElMessage.success('资料已保存')
    router.push('/mine')
  } else {
    ElMessage.error(r.message || '保存失败')
  }
}

async function sendPhoneCode() {
  const phone = phoneForm.value.phone
  if (!/^1\d{10}$/.test(phone)) return ElMessage.warning('请输入正确的手机号')
  phoneSending.value = true
  const res = await auth.sendCode(phone, 'change_phone')
  phoneSending.value = false
  if (!res.ok) return ElMessage.error(res.msg || '发送失败')
  ElMessage.success('验证码已发送')
  startTimer(phoneCounter)
}

async function submitPhone() {
  if (!/^1\d{10}$/.test(phoneForm.value.phone)) return ElMessage.warning('请输入正确的手机号')
  if (!/^\d{6}$/.test(phoneForm.value.code)) return ElMessage.warning('请输入 6 位验证码')
  phoneSaving.value = true
  const r = await safe(changePhone({
    phone: phoneForm.value.phone,
    code: phoneForm.value.code
  }), {})
  phoneSaving.value = false
  if (r.code === 0) {
    auth.updateProfile({ phone: phoneForm.value.phone })
    ElMessage.success('手机号修改成功')
    phoneForm.value = { phone: '', code: '' }
  } else {
    ElMessage.error(r.message || '修改失败')
  }
}

async function sendPwdCode() {
  const phone = auth.user?.phone
  if (!phone) return ElMessage.warning('未获取到当前手机号')
  pwdSending.value = true
  const res = await auth.sendCode(phone, 'change_pwd')
  pwdSending.value = false
  if (!res.ok) return ElMessage.error(res.msg || '发送失败')
  ElMessage.success('验证码已发送')
  startTimer(pwdCounter)
}

async function submitPwd() {
  const { oldPassword, newPassword, confirm, code } = pwdForm.value
  if (!oldPassword) return ElMessage.warning('请输入旧密码')
  if (!/^[A-Za-z0-9]{6,20}$/.test(newPassword)) return ElMessage.warning('新密码为 6-20 位字母或数字')
  if (newPassword !== confirm) return ElMessage.warning('两次输入的新密码不一致')
  if (!/^\d{6}$/.test(code)) return ElMessage.warning('请输入 6 位验证码')
  pwdSaving.value = true
  const r = await safe(changePassword({
    oldPassword,
    newPassword,
    code
  }), {})
  pwdSaving.value = false
  if (r.code === 0) {
    ElMessage.success('密码修改成功')
    pwdForm.value = { oldPassword: '', newPassword: '', confirm: '', code: '' }
  } else {
    ElMessage.error(r.message || '修改失败')
  }
}

function go(path: string) {
  router.push(path)
}

onMounted(load)
</script>

<style scoped>
.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.code-row .el-input {
  flex: 1;
}
.code-row .el-button {
  white-space: nowrap;
}
.tip {
  color: var(--sub);
  font-size: 12px;
  margin-top: 4px;
}
</style>
