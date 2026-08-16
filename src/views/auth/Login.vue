<template>
  <div class="auth-wrap">
    <!-- 左侧品牌区 -->
    <aside class="brand">
      <div class="brand-inner">
        <div class="logo"><span class="dot">租</span> 安居易租</div>
        <h1>让租房更简单</h1>
        <p>海量真房源 · 在线签约 · 资金托管 · 全程保障</p>
        <ul class="points">
          <li>✓ 房东直连，平台撮合双模式</li>
          <li>✓ 看房预约、电子合同、分账结算一站式</li>
          <li>✓ 多角色统一账号，一次注册多端登录</li>
        </ul>
      </div>
    </aside>

    <!-- 右侧登录表单 -->
    <main class="form-side">
      <div class="form-box">
        <h2>登录</h2>
        <p class="sub">选择登录身份，使用同一账号体系</p>

        <!-- 多身份入口：租客 / 房东 / 经纪人 / 管理员 -->
        <el-radio-group v-model="identity" class="ident">
          <el-radio-button label="tenant">租客</el-radio-button>
          <el-radio-button label="landlord">房东</el-radio-button>
          <el-radio-button label="agent">经纪人</el-radio-button>
          <el-radio-button label="admin">管理员</el-radio-button>
        </el-radio-group>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入注册手机号" :prefix-icon="Iphone" clearable />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="请输入密码"
              :prefix-icon="Lock"
              @keyup.enter="onSubmit"
            />
          </el-form-item>
          <div class="row">
            <el-checkbox v-model="remember">记住登录状态</el-checkbox>
            <a class="link" @click="toForgot">忘记密码？</a>
          </div>
          <div class="row alt">
            <a class="link" @click="toRegister">还没有账号？去注册</a>
          </div>
          <el-button type="primary" size="large" class="submit" :loading="loading" @click="onSubmit">
            登录
          </el-button>
        </el-form>

        <!-- 演示账号提示 -->
        <div class="demo">
          <div class="demo-t">演示账号（密码均为 123456）</div>
          <div class="demo-row">
            <span @click="fill('13800000001')">租客 13800000001</span>
            <span @click="fill('13800000002')">房东 13800000002</span>
          </div>
          <div class="demo-row">
            <span @click="fill('13800000003')">经纪人 13800000003</span>
            <span @click="fill('13800000004')">管理员 13800000004</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Iphone, Lock } from '@element-plus/icons-vue'
import { useAuthStore, type UserRole, ROLE_HOME } from '@/store/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// 身份：tenant 覆盖租客+房东（同一端），agent/agent/admin 走后台
const identity = ref<UserRole>((route.query.role as UserRole) || 'tenant')
const remember = ref(true)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  phone: '',
  password: ''
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 位', trigger: 'blur' }
  ]
}

function fill(phone: string) {
  form.phone = phone
}

function toRegister() {
  router.push({ path: '/register', query: { role: identity.value } })
}

function toForgot() {
  router.push('/forgot-password')
}

async function onSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 400))
    const res = await auth.login(form.phone, form.password, identity.value)
    if (!res.ok) {
      ElMessage.error(res.msg || '登录失败')
      return
    }
    ElMessage.success('登录成功，欢迎 ' + auth.user?.name)
    const redirect = (route.query.redirect as string) || ROLE_HOME[auth.user!.role]
    router.replace(redirect)
  } finally {
    loading.value = false
  }
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
  font-size: 34px;
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
  width: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 30px;
}
.form-box {
  width: 100%;
  max-width: 340px;
}
.form-box h2 {
  margin: 0 0 4px;
  font-size: 24px;
}
.form-box .sub {
  color: var(--sub);
  margin: 0 0 18px;
}
.ident {
  width: 100%;
  margin-bottom: 18px;
}
.ident :deep(.el-radio-button) {
  flex: 1;
}
.ident :deep(.el-radio-button__inner) {
  width: 100%;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 18px;
}
.row.alt {
  justify-content: flex-end;
  margin-top: -12px;
}
.link {
  color: var(--brand);
  cursor: pointer;
  font-size: 13px;
}
.submit {
  width: 100%;
}
.demo {
  margin-top: 22px;
  background: var(--bg);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 12px;
  color: var(--sub);
}
.demo-t {
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--ink);
}
.demo-row {
  display: flex;
  gap: 14px;
  margin-top: 4px;
}
.demo-row span {
  cursor: pointer;
  color: var(--brand);
}
.demo-row span:hover {
  text-decoration: underline;
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
