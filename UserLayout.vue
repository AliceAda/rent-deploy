<template>
  <div class="page-max">
    <!-- 顶部导航栏 -->
    <el-affix :offset="0">
      <header class="topbar">
        <div class="brand serif">租好房</div>
        <nav class="nav">
          <router-link to="/home">首页</router-link>
          <router-link to="/list">找房</router-link>
          <router-link to="/map">地图找房</router-link>
          <router-link to="/market">租金行情</router-link>
        </nav>
        <div class="right">
          <!-- 通知铃铛 -->
          <div class="bell" @click="toggleDropdown">
            <span class="bell-icon">🔔</span>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </div>
          <!-- 用户菜单 -->
          <el-dropdown>
            <span class="user-menu">
              <img v-if="auth.user?.avatar" :src="auth.user.avatar" class="avatar" />
              <span v-else class="avatar">{{ auth.user?.name?.[0] }}</span>
              <span>{{ auth.user?.name || '未登录' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/mine')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/messages')">消息中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
    </el-affix>

    <!-- 通知下拉面板 -->
    <transition name="slide-down">
      <div v-if="showDropdown" class="notif-dropdown" @click.stop>
        <div class="notif-header">
          <span>通知中心</span>
          <el-button text size="small" @click="markAllRead">全部已读</el-button>
        </div>
        <div class="notif-list" ref="notifListRef">
          <div v-for="n in notifications" :key="n.id" class="notif-item" :class="{ read: n.read }" @click="markRead(n)">
            <span class="notif-icon">{{ n.icon }}</span>
            <div class="notif-body">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-content">{{ n.content }}</div>
              <div class="notif-time">{{ formatTime(n.createdAt) }}</div>
            </div>
            <el-tag v-if="!n.read" type="danger" size="small" round>新</el-tag>
          </div>
          <el-empty v-if="!notifications.length" description="暂无通知" :image-size="60" />
        </div>
        <div class="notif-footer" v-if="notifications.length">
          <el-button text size="small" @click="loadNotifications">加载更多</el-button>
        </div>
      </div>
    </transition>

    <!-- 主内容区 -->
    <main class="main">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useUserCenterStore } from '@/store/userCenter'
import { getMessages } from '@/api/message'

const router = useRouter()
const auth = useAuthStore()
const center = useUserCenterStore()

const showDropdown = ref(false)
const notifListRef = ref<HTMLElement>()

// 通知列表
const notifications = ref<Array<{
  id: number
  icon: string
  title: string
  content: string
  read: boolean
  createdAt: string
  type: 'booking' | 'contract' | 'payment' | 'system'
}>>([])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// 加载通知
async function loadNotifications() {
  const r = await getMessages()
  if (r.code === 0 && r.data?.list) {
    notifications.value = r.data.list.map((m: any) => ({
      id: m.id,
      icon: m.type === 'booking' ? '📅' : m.type === 'contract' ? '📝' : m.type === 'payment' ? '💰' : '🔔',
      title: m.title || '系统通知',
      content: m.content || '',
      read: m.read,
      createdAt: m.createdAt,
      type: m.type
    }))
  }
}

// 切换下拉框
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value && !notifications.value.length) {
    loadNotifications()
  }
}

// 标记已读
async function markRead(item: typeof notifications.value[0]) {
  if (!item.read) {
    item.read = true
    // TODO: 调用 API 更新状态
  }
  showDropdown.value = false
}

// 全部已读
async function markAllRead() {
  notifications.value.forEach(n => n.read = true)
  // TODO: 调用 API 批量更新
}

// 格式化时间
function formatTime(time: string) {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

// 退出登录
function handleLogout() {
  auth.logout()
  router.push('/login')
}

// 点击外部关闭下拉框
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.bell') && !target.closest('.notif-dropdown')) {
    showDropdown.value = false
  }
}

// 定时刷新（轮询）
let pollTimer: ReturnType<typeof setInterval> | null = null
function startPolling() {
  pollTimer = setInterval(async () => {
    // 检查是否有新通知
    const r = await getMessages()
    if (r.code === 0 && r.data?.list) {
      const currentIds = new Set(notifications.value.map(n => n.id))
      for (const m of r.data.list) {
        if (!currentIds.has(m.id)) {
          // 有新通知，显示提示
          const newNotif = {
            id: m.id,
            icon: m.type === 'booking' ? '📅' : m.type === 'contract' ? '📝' : m.type === 'payment' ? '💰' : '🔔',
            title: m.title || '系统通知',
            content: m.content || '',
            read: false,
            createdAt: m.createdAt,
            type: m.type
          }
          notifications.value.unshift(newNotif)
          // 桌面通知
          if (Notification.permission === 'granted') {
            new Notification(newNotif.title, { body: newNotif.content })
          }
        }
      }
    }
  }, 30000) // 每30秒轮询一次
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadNotifications()
  startPolling()
  // 请求通知权限
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--line);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  z-index: 100;
}
.brand {
  font-size: 22px;
  font-weight: 800;
  color: var(--brand);
  margin-right: 48px;
}
.nav {
  display: flex;
  gap: 32px;
  flex: 1;
}
.nav a {
  text-decoration: none;
  color: var(--ink);
  font-size: 15px;
  font-weight: 500;
  padding: 20px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.nav a:hover, .nav a.router-link-active {
  color: var(--brand);
  border-bottom-color: var(--brand);
}
.right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.bell {
  position: relative;
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.bell:hover {
  background: var(--bg);
}
.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  background: #f56c6c;
  color: #fff;
  font-size: 11px;
  border-radius: 9px;
  padding: 0 4px;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-menu:hover {
  background: var(--bg);
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(135deg, var(--brand), #2DD4BF);
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}
.main {
  min-height: calc(100vh - 64px);
  padding: 24px;
  background: var(--bg);
}

/* 通知下拉 */
.notif-dropdown {
  position: fixed;
  top: 64px;
  right: 24px;
  width: 360px;
  max-height: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  z-index: 200;
  overflow: hidden;
}
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--line);
  font-weight: 600;
}
.notif-list {
  max-height: 360px;
  overflow-y: auto;
}
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--line);
}
.notif-item:hover {
  background: var(--bg);
}
.notif-item.read {
  opacity: 0.6;
}
.notif-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--ink);
}
.notif-content {
  font-size: 13px;
  color: var(--sub);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notif-time {
  font-size: 11px;
  color: var(--sub);
  margin-top: 4px;
}
.notif-footer {
  padding: 12px;
  border-top: 1px solid var(--line);
  text-align: center;
}

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
