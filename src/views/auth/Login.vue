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

        <!-- 第三方登录（市面标配） -->
        <div class="oauth">
          <div class="oauth-divider"><span>其他登录方式</span></div>
          <div class="oauth-icons">
            <button class="oauth-ico wechat" title="微信登录" @click="oauth('微信')">微</button>
            <button class="oauth-ico qq" title="QQ 登录" @click="oauth('QQ')">Q</button>
            <button class="oauth-ico weibo" title="微博登录" @click="oauth('微博')">博</button>
          </div>
        </div>

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

    <!-- 第三方扫码登录（演示：自动通过） -->
    <el-dialog v-model="oauthVisible" :title="oauthName + ' 扫码登录'" width="320px" align-center>
      <div class="qr-scan">
        <div class="qr-box">
          <div class="qr-svg"></div>
          <div class="qr-wait">
            <span class="spin"></span>
            等待扫码
          </div>
        </div>
        <p class="qr-tip">请使用{{ oauthName }} App 扫描二维码（演示环境自动通过，登录演示租客账号）</p>
      </div>
    </el-dialog>
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

// 第三方扫码登录（演示）：弹层等待 2.5s 后自动以演示租客身份登录
const oauthVisible = ref(false)
const oauthName = ref('')
function oauth(name: string) {
  oauthName.value = name
  oauthVisible.value = true
  setTimeout(async () => {
    if (!oauthVisible.value) return
    const res = await auth.login('13800000001', '123456', 'tenant')
    oauthVisible.value = false
    if (res.ok) {
      ElMessage.success(oauthName.value + '登录成功')
      const redirect = (route.query.redirect as string) || ROLE_HOME[auth.user!.role]
      router.replace(redirect)
    }
  }, 2600)
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
.oauth {
  margin-top: 20px;
}
.oauth-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--sub);
  font-size: 12px;
}
.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}
.oauth-icons {
  display: flex;
  justify-content: center;
  gap: 22px;
  margin-top: 14px;
}
.oauth-ico {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.15s;
}
.oauth-ico:hover {
  transform: scale(1.1);
}
.oauth-ico.wechat {
  background: #22b35e;
}
.oauth-ico.qq {
  background: #12b7f5;
}
.oauth-ico.weibo {
  background: #ff7d3c;
}
.qr-scan {
  text-align: center;
}
.qr-box {
  position: relative;
  width: 168px;
  height: 168px;
  margin: 0 auto;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
}
.qr-svg {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(#1f2329 2px, transparent 2px) 0 0/12px 12px,
    linear-gradient(90deg, #1f2329 2px, transparent 2px) 0 0/12px 12px;
  border-radius: 9px;
}
.qr-wait {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 10px;
  font-size: 13px;
  color: var(--ink);
}
.spin {
  width: 22px;
  height: 22px;
  border: 3px solid var(--line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.qr-tip {
  margin: 12px 0 0;
  color: var(--sub);
  font-size: 12px;
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
