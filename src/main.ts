import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { Iphone, Lock, User, Search, Edit, Delete, Star, StarFilled, Plus, Bell, ChatDotSquare, Tickets, TrendCharts, Setting, InfoFilled, CircleCheck, CircleClose, WarningFilled, ArrowDown, ArrowUp, Menu, Close, HomeFilled, Money, Wallet, Document, Share, Upload } from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/auth'
import { setUnauthorizedHandler } from './api/http'
import './styles/index.css'

const app = createApp(App)

// 只注册实际用到的图标
const icons = { Iphone, Lock, User, Search, Edit, Delete, Star, StarFilled, Plus, Bell, ChatDotSquare, Tickets, TrendCharts, Setting, InfoFilled, CircleCheck, CircleClose, WarningFilled, ArrowDown, ArrowUp, Menu, Close, HomeFilled, Money, Wallet, Document, Share, Upload }
for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.use(createPinia())
// 挂载前恢复登录态（localStorage）
useAuthStore().init()
app.use(router)
app.use(ElementPlus)

// 任一接口返回 401 时统一登出并跳转登录页（保留来源地址）
setUnauthorizedHandler(() => {
  const auth = useAuthStore()
  if (auth.isLoggedIn) {
    const redirect = router.currentRoute.value.fullPath
    auth.logout()
    router.push({ path: '/login', query: redirect && redirect !== '/' ? { redirect } : {} })
  }
})

// 演示模式：后端未就绪时用 MSW 内存数据库实现整套 /api/* 契约（VITE_USE_MOCK=0 关闭后走真实后端）
async function enableMock() {
  if (import.meta.env.VITE_USE_MOCK === '0') return
  const { worker } = await import('./mock/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
  console.info('[mock] 演示模式已启用：全站数据来自内存数据库（后端就绪后设 VITE_USE_MOCK=0 切换真实接口）')
}

enableMock().then(() => app.mount('#app'))
