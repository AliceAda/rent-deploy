<template>
  <div class="auth-wrap">
    <aside class="brand">
      <div class="brand-inner">
        <div class="logo"><span class="dot">租</span> 安居易租</div>
        <h1>找回登录密码</h1>
        <p>通过注册手机号 + 短信验证码，快速重置密码</p>
        <ul class="points">
          <li>✓ 手机号验证身份，安全无感</li>
          <li>✓ 验证码 60 秒有效，可一键重发</li>
          <li>✓ 重置后请使用新密码重新登录</li>
        </ul>
      </div>
    </aside>

    <main class="form-side">
      <div class="form-box">
        <h2>忘记密码</h2>
        <p class="sub">验证手机号后设置新密码</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入注册手机号" :prefix-icon="Iphone" clearable />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <div class="code-row">
              <el-input v-model="form.code" placeholder="6 位短信验证码" :prefix-icon="Message" maxlength="6" />
              <el-button :disabled="counter > 0 || sending" @click="sendCode">
                {{ counter > 0 ? counter + 's 后重发' : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="新密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="6-20 位字母或数字" :prefix-icon="Lock" />
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirm">
            <el-input v-model="form.confirm" type="password" show-password placeholder="再次输入新密码" :prefix-icon="Lock" @keyup.enter="onSubmit" />
          </el-form-item>

          <el-button type="primary" size="large" class="submit" :loading="loading" @click="onSubmit">
            重置密码
          </el-button>
        </el-form>

        <div class="has-account">
          想起密码了？<a class="link" @click="toLogin">返回登录</a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Iphone, Lock, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const sending = ref(false)
const counter = ref(0)
let timer: number | undefined
const formRef = ref<FormInstance>()

const form = reactive({
  phone: '',
  code: '',
  password: '',
  confirm: ''
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]{6,20}$/, message: '密码为 6-20 位字母或数字', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_r, value, cb) => {
        if (value !== form.password) cb(new Error('两次输入的新密码不一致'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}

function toLogin() {
  router.push('/login')
}

// 获取重置验证码：先校验手机号，再调用 store 下发（mock 回显演示码）
function sendCode() {
  formRef.value?.validateField('phone', (ok) => {
    if (!ok) return
    sending.value = true
    setTimeout(async () => {
      const res = await auth.sendCode(form.phone, 'reset')
      sending.value = false
      if (!res.ok) {
        ElMessage.error(res.msg || '发送失败')
        return
      }
      ElMessage.success('验证码已发送，请查收短信')
      counter.value = 60
      timer = window.setInterval(() => {
        counter.value--
        if (counter.value <= 0 && timer) {
          clearInterval(timer)
          timer = undefined
        }
      }, 1000)
    }, 400)
  })
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(async () => {
      const res = await auth.resetPassword({
        phone: form.phone,
        code: form.code,
        password: form.password
      })
      loading.value = false
      if (!res.ok) {
        ElMessage.error(res.msg || '重置失败')
        return
      }
      ElMessage.success('密码重置成功，请使用新密码登录')
      router.replace('/login')
    }, 400)
  })
}
</script>

<style scoped>
.auth-wrap {
  display: flex;
  min-height: 100vh;
}
.brand {
  flex: 1;
  background: linear-gradient(135deg, var(--brand), #2DD4BF);
  color: #fff;
  display: flex;
  align-items: center;
  padding: 60px;
}
.brand-inner {
  max-width: 380px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 40px;
}
.logo .dot {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #fff;
  color: var(--brand);
  display: grid;
  place-items: center;
  font-size: 15px;
}
.brand h1 {
  font-size: 32px;
  margin: 0 0 12px;
}
.brand p {
  opacity: 0.9;
  font-size: 15px;
}
.points {
  list-style: none;
  padding: 0;
  margin-top: 36px;
  line-height: 2.2;
  opacity: 0.95;
}
.form-side {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 30px;
  overflow: auto;
}
.form-box {
  width: 100%;
  max-width: 360px;
}
.form-box h2 {
  margin: 0 0 4px;
  font-size: 24px;
}
.form-box .sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.code-row {
  display: flex;
  gap: 10px;
}
.code-row .el-input {
  flex: 1;
}
.code-row .el-button {
  white-space: nowrap;
}
.link {
  color: var(--brand);
  cursor: pointer;
}
.submit {
  width: 100%;
}
.has-account {
  text-align: center;
  margin-top: 16px;
  color: var(--sub);
  font-size: 13px;
}
@media (max-width: 880px) {
  .brand {
    display: none;
  }
  .form-side {
    width: 100%;
  }
}
</style>
