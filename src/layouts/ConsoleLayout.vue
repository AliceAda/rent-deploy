<template>
  <el-container class="admin" :class="{ 'is-landlord': isLandlord }">
    <!-- 侧边菜单（由路由表 meta.menu 派生，新增页面只需加一条路由） -->
    <el-aside width="210px" class="aside">
      <div class="logo">
        <span class="dot" :class="{ landlord: isLandlord }">租</span>
        安居易租 · {{ isLandlord ? '房东中心' : '后台' }}
      </div>
      <el-menu :default-active="activeMenu" router class="menu">
        <template v-for="item in menu.items" :key="item.path">
          <el-menu-item :index="item.path">
            <el-icon v-if="item.icon"><component :is="ICONS[item.icon]" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
        <el-sub-menu v-for="g in menu.groups" :key="g.group" :index="g.group">
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
          <el-breadcrumb-item :to="{ path: isLandlord ? '/landlord/dashboard' : '/admin/dashboard' }">
            {{ isLandlord ? '房东中心' : '后台' }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <router-link v-if="isLandlord" to="/home" class="goto">前往找房 →</router-link>
          <el-input
            :placeholder="isLandlord ? '搜索房源' : '全局搜索'"
            :prefix-icon="Search"
            size="small"
            class="gsearch"
          />
          <el-badge v-if="isLandlord" :value="pending" class="bell"><el-icon><Bell /></el-icon></el-badge>
          <el-dropdown @command="onCmd">
            <span class="user">
              <el-avatar :size="28">{{ auth.user?.name?.[0] || (isLandlord ? '东' : '管') }}</el-avatar>
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
import {
  DataLine, House, User, Tickets, Document, Money, Service, Notebook, TrendCharts,
  Setting, Search, Bell, WarnTriangleFilled, Message, Odometer, Plus, Calendar, Wallet, UserFilled
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useLandlordStore } from '@/store/landlord'

// 图标注册表：路由 meta.menu.icon 通过名称映射到组件
const ICONS: Record<string, typeof DataLine> = {
  DataLine, House, User, Tickets, Document, Money, Service, Notebook, TrendCharts,
  Setting, Search, Bell, WarnTriangleFilled, Message, Odometer, Plus, Calendar, Wallet, UserFilled
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const landlord = useLandlordStore()

const shell = computed<'admin' | 'landlord'>(() => (route.matched[0]?.meta.shell as 'admin' | 'landlord') ?? 'admin')
const isLandlord = computed(() => shell.value === 'landlord')
const activeMenu = computed(() => route.path)
const title = computed(() => (route.meta.title as string) || '工作台')
const pending = computed(() => landlord.pendingBookings)

interface ConsoleMenuEntry { path: string; title: string; icon?: string }
interface ConsoleMenuGroup { group: string; icon?: string; children: ConsoleMenuEntry[] }

// 从路由表派生菜单：meta.menu.group 分组，meta.hidden 的路由不出现在菜单
const menu = computed<{ items: ConsoleMenuEntry[]; groups: ConsoleMenuGroup[] }>(() => {
  const parent = router.options.routes.find((r) => r.meta?.shell === shell.value)
  const children = parent?.children?.filter((c) => c.meta?.title && !c.meta.hidden) ?? []
  const base = parent?.path ?? `/${shell.value}`
  const items: ConsoleMenuEntry[] = []
  const groups: ConsoleMenuGroup[] = []
  const groupMap = new Map<string, ConsoleMenuGroup>()

  for (const c of children) {
    const title = c.meta?.title ?? ''
    const icon = c.meta?.menu?.icon
    const path = `${base}/${c.path}`.replace(/\/+/g, '/')
    const group = c.meta?.menu?.group
    if (group) {
      let g = groupMap.get(group)
      if (!g) {
        g = { group, icon, children: [] }
        groupMap.set(group, g)
        groups.push(g)
      }
      g.children.push({ path, title })
    } else {
      items.push({ path, title, icon })
    }
  }
  return { items, groups }
})

function onCmd(cmd: string) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin {
  height: 100vh;
}
.aside {
  background: #001529;
  color: #fff;
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
  background: linear-gradient(135deg, var(--brand), #2DD4BF);
  display: grid;
  place-items: center;
  font-size: 13px;
}
.logo .dot.landlord {
  background: linear-gradient(135deg, var(--orange), #ff9a5c);
}
.menu {
  background: transparent;
  border-right: none;
}
.menu :deep(.el-menu-item) {
  color: #c5cad3;
}
.menu :deep(.el-menu-item.is-active) {
  background: var(--brand);
  color: #fff;
}
.is-landlord .menu :deep(.el-menu-item.is-active) {
  background: var(--orange);
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
}
.bell {
  font-size: 18px;
  cursor: pointer;
}
.user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--ink);
}
</style>
