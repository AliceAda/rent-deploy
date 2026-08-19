<template>
  <el-container class="layout">
    <!-- 侧边菜单 -->
    <el-aside width="210px" class="aside">
      <div class="logo">
        <span class="dot"></span>
        安居易租 · 房东中心
      </div>
      <el-menu :default-active="activeMenu" router class="menu">
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon v-if="item.icon"><component :is="ICONS[item.icon]" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
        <el-sub-menu v-for="g in menuGroups" :key="g.group" :index="g.group">
          <template #title>
            <el-icon v-if="g.icon"><component :is="ICONS[g.icon]" /></el-icon>
            <span>{{ g.group }}</span>
          </template>
          <el-menu-item v-for="c in g.children" :key="c.path" :index="c.path">
            {{ c.title }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主体 -->
    <el-container>
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/landlord/dashboard' }">房东中心</el-breadcrumb-item>
          <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <router-link to="/home" class="goto">前往找房</router-link>
          <el-input
            placeholder="搜索房源"
            :prefix-icon="Search"
            size="small"
            class="gsearch"
          />
          <el-badge :value="pending" class="bell"><el-icon><Bell /></el-icon></el-badge>
          <el-dropdown @command="onCmd">
            <span class="user">
              <el-avatar :size="28">{{ auth.user?.name?.[0] || '房' }}</el-avatar>
              {{ auth.user?.name || '未登录' }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view v-slot="{ Component }">
          <keep-alive :max="3">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Bell } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useLandlordStore } from '@/store/landlord'

// 图标注册表
const ICONS: Record<string, any> = {
  Odometer: () => import('@element-plus/icons-vue').then(m => m.Odometer),
  House: () => import('@element-plus/icons-vue').then(m => m.House),
  Plus: () => import('@element-plus/icons-vue').then(m => m.Plus),
  Calendar: () => import('@element-plus/icons-vue').then(m => m.Calendar),
  Tickets: () => import('@element-plus/icons-vue').then(m => m.Tickets),
  Document: () => import('@element-plus/icons-vue').then(m => m.Document),
  Service: () => import('@element-plus/icons-vue').then(m => m.Service),
  Money: () => import('@element-plus/icons-vue').then(m => m.Money),
  Wallet: () => import('@element-plus/icons-vue').then(m => m.Wallet),
  UserFilled: () => import('@element-plus/icons-vue').then(m => m.UserFilled),
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const landlord = useLandlordStore()

const activeMenu = computed(() => route.path)
const title = computed(() => (route.meta.title as string) || '工作台')
const pending = computed(() => landlord.pendingBookings)

interface MenuItem { path: string; title: string; icon?: string }
interface MenuGroup { group: string; icon?: string; children: MenuItem[] }

// 从路由表派生菜单
const menuItems = computed<MenuItem[]>(() => {
  const parent = router.options.routes.find(r => r.path === '/landlord')
  const children = parent?.children?.filter((c: any) => c.meta?.title && !c.meta?.hidden) ?? []
  return children
    .filter((c: any) => !c.meta?.menu?.group)
    .map((c: any) => ({
      path: `/landlord/${c.path}`.replace(/\/+/g, '/'),
      title: c.meta?.title,
      icon: c.meta?.menu?.icon
    }))
})

const menuGroups = computed<MenuGroup[]>(() => {
  const parent = router.options.routes.find(r => r.path === '/landlord')
  const children = parent?.children?.filter((c: any) => c.meta?.title && !c.meta?.hidden) ?? []
  const groupMap = new Map<string, MenuGroup>()
  
  for (const c of children) {
    const group = c.meta?.menu?.group
    if (!group) continue
    let g = groupMap.get(group)
    if (!g) {
      g = { group, icon: c.meta?.menu?.icon, children: [] }
      groupMap.set(group, g)
    }
    g.children.push({
      path: `/landlord/${c.path}`.replace(/\/+/g, '/'),
      title: c.meta?.title
    })
  }
  return Array.from(groupMap.values())
})

function onCmd(cmd: string) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background: #001529;
  color: #fff;
  overflow: auto;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  font-weight: 700;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo .dot {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--orange), #ff9a5c);
  display: grid;
  place-items: center;
  font-size: 13px;
}
.menu {
  background: transparent;
  border-right: none;
}
.menu :deep(.el-menu-item) {
  color: #c5cad3;
}
.menu :deep(.el-menu-item.is-active) {
  background: var(--orange);
  color: #fff;
}
.menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.menu :deep(.el-sub-menu__title) {
  color: #c5cad3;
}
.menu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--line);
  padding: 0 20px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.gsearch {
  width: 200px;
}
.goto {
  color: var(--orange);
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
}
.goto:hover {
  text-decoration: underline;
}
.bell {
  font-size: 18px;
  cursor: pointer;
  color: var(--ink);
}
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--ink);
}
</style>
