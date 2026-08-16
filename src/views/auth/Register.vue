<template>
  <div class="auth-wrap">
    <aside class="brand">
      <div class="brand-inner">
        <div class="logo"><span class="dot">租</span> 安居易租</div>
        <h1>加入安居易租</h1>
        <p>一次注册，租客 / 房东 / 经纪人多端通用</p>
        <ul class="points">
          <li>✓ 统一账号体系，登录各端无需重复注册</li>
          <li>✓ 实名认证 + 信用分，交易更安心</li>
          <li>✓ 平台撮合，房源曝光与成交双提升</li>
        </ul>
      </div>
    </aside>

    <main class="form-side">
      <div class="form-box">
        <h2>注册账号</h2>
        <p class="sub">手机验证码注册，注册成功自动登录</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
          <el-form-item label="我是" prop="role">
            <el-radio-group v-model="form.role" class="role-group">
              <el-radio label="tenant" border>租客</el-radio>
              <el-radio label="landlord" border>房东</el-radio>
              <el-radio label="agent" border>经纪人</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="昵称" prop="name">
            <el-input v-model="form.name" placeholder="请输入昵称" :prefix-icon="User" clearable />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="用于登录与接收通知" :prefix-icon="Iphone" clearable />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <div class="code-row">
              <el-input v-model="form.code" placeholder="6 位短信验证码" :prefix-icon="Message" maxlength="6" />
              <el-button :disabled="counter > 0 || sending" @click="sendCode">
                {{ counter > 0 ? counter + 's 后重发' : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="6-20 位字母或数字" :prefix-icon="Lock" />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirm">
            <el-input v-model="form.confirm" type="password" show-password placeholder="再次输入密码" :prefix-icon="Lock" @keyup.enter="onSubmit" />
          </el-form-item>

          <el-checkbox v-model="agree" class="agree">
            我已阅读并同意 <a class="link" @click.prevent="noop">《用户协议》</a> 与
            <a class="link" @click.prevent="noop">《隐私政策》</a>
          </el-checkbox>

          <el-button type="primary" size="large" class="submit" :loading="loading" @click="onSubmit">
            注册并登录
          </el-button>
        </el-form>

        <div class="has-account">
          已有账号？<a class="link" @click="toLogin">直接登录</a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Iphone, Lock, Message } from '@element-plus/icons-vue'
import { useAuthStore, type UserRole, ROLE_HOME } from '@/store/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const agree = ref(false)
const loading = ref(false)
const sending = ref(false)
const counter = ref(0)
let timer: number | undefined
const formRef = ref<FormInstance>()

const form = reactive({
  role: (route.query.role as UserRole) || ('tenant' as UserRole),
  name: '',
  phone: '',
  code: '',
  password: '',
  confirm: ''
})

const rules: FormRules = {
  role: [{ required: true, message: '请选择身份', trigger: 'change' }],
  name: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]{6,20}$/, message: '密码为 6-20 位字母或数字', trigger: 'blur' }
  ],
  confirm: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_r, value, cb) => {
        if (value !== form.password) cb(new Error('两次输入的密码不一致'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}

function noop() {
  /* 协议弹窗占位 */
}
function toLogin() {
  router.push({ path: '/login', query: { role: form.role } })
}

// 获取注册验证码：先校验手机号，再调用 store 下发（mock 回显演示码）
function sendCode() {
  formRef.value?.validateField('phone', (ok) => {
    if (!ok) return
    sending.value = true
    setTimeout(async () => {
      const res = await auth.sendCode(form.phone, 'register')
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
    if (!agree.value) {
      ElMessage.warning('请先阅读并同意用户协议')
      return
    }
    loading.value = true
    setTimeout(async () => {
      const res = await auth.register({
        name: form.name,
        phone: form.phone,
        code: form.code,
        password: form.password,
        role: form.role
      })
      loading.value = false
      if (!res.ok) {
        ElMessage.error(res.msg || '注册失败')
        return
      }
      ElMessage.success('注册成功，已自动登录')
      router.replace(ROLE_HOME[auth.user!.role])
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
  background: linear-gradient(135deg, var(--brand), #5a86ff);
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
.role-group :deep(.el-radio) {
  margin-right: 8px;
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
.agree {
  margin: 4px 0 16px;
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
