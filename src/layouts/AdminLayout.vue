<template>
  <el-container class="admin">
    <!-- 侧边菜单 -->
    <el-aside width="210px" class="aside">
      <div class="logo"><span class="dot">租</span> 安居易租 · 后台</div>
      <el-menu :default-active="activeMenu" router class="menu" @select="onSelect">
        <el-menu-item index="/admin/dashboard"><el-icon><DataLine /></el-icon>工作台</el-menu-item>
        <el-menu-item index="/admin/houses"><el-icon><House /></el-icon>房源管理</el-menu-item>
        <el-menu-item index="/admin/users"><el-icon><User /></el-icon>用户管理</el-menu-item>
        <el-menu-item index="/admin/trades"><el-icon><Tickets /></el-icon>交易管理</el-menu-item>
        <el-menu-item index="/admin/contracts"><el-icon><Document /></el-icon>合同管理</el-menu-item>
        <el-menu-item index="/admin/finance"><el-icon><Money /></el-icon>财务管理</el-menu-item>
        <el-menu-item index="/admin/tickets"><el-icon><Service /></el-icon>工单管理</el-menu-item>
        <el-menu-item index="/admin/content"><el-icon><Notebook /></el-icon>内容管理</el-menu-item>
        <el-menu-item index="/admin/statistics"><el-icon><TrendCharts /></el-icon>数据统计</el-menu-item>
        <el-menu-item index="/admin/system"><el-icon><Setting /></el-icon>系统管理</el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体 -->
    <el-container>
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">后台</el-breadcrumb-item>
          <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <el-input placeholder="全局搜索" :prefix-icon="Search" size="small" class="gsearch" />
          <el-badge :value="5" class="bell"><el-icon><Bell /></el-icon></el-badge>
          <el-dropdown @command="onAdminCmd">
            <span class="user">
              <el-avatar :size="28">{{ auth.user?.name?.[0] || '管' }}</el-avatar>
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
import { DataLine, House, User, Tickets, Document, Money, Service, Notebook, TrendCharts, Setting, Search, Bell } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const activeMenu = computed(() => route.path)
const title = computed(() => (route.meta.title as string) || '工作台')
function onSelect() {
  /* router 模式，el-menu router 自动跳转 */
}
function onAdminCmd(cmd: string) {
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
  background: linear-gradient(135deg, var(--brand), #5a86ff);
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
  background: var(--brand);
  color: #fff;
}
.menu :deep(.el-menu-item:hover) {
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
