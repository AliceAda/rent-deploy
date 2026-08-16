<template>
  <el-container class="admin">
    <el-aside width="210px" class="aside">
      <div class="logo"><span class="dot">租</span> 安居易租 · 房东中心</div>
      <el-menu :default-active="activeMenu" router class="menu" @select="onSelect">
        <el-menu-item index="/landlord/dashboard"><el-icon><Odometer /></el-icon>工作台</el-menu-item>
        <el-menu-item index="/landlord/my-houses"><el-icon><House /></el-icon>我的房源</el-menu-item>
        <el-menu-item index="/landlord/publish"><el-icon><Plus /></el-icon>发布房源</el-menu-item>
        <el-menu-item index="/landlord/bookings"><el-icon><Calendar /></el-icon>看房预约</el-menu-item>
        <el-menu-item index="/landlord/orders"><el-icon><Tickets /></el-icon>订单合同</el-menu-item>
        <el-menu-item index="/landlord/bills"><el-icon><Money /></el-icon>账单</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/landlord/dashboard' }">房东中心</el-breadcrumb-item>
          <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="header-right">
          <router-link to="/home" class="goto">前往找房 →</router-link>
          <el-input placeholder="搜索房源" :prefix-icon="Search" size="small" class="gsearch" />
          <el-badge :value="pending" class="bell"><el-icon><Bell /></el-icon></el-badge>
          <el-dropdown @command="onCmd">
            <span class="user">
              <el-avatar :size="28">{{ auth.user?.name?.[0] || '东' }}</el-avatar>
              {{ auth.user?.name || '房东' }}
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
  Odometer,
  House,
  Plus,
  Calendar,
  Tickets,
  Money,
  Search,
  Bell
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { useLandlordStore } from '@/store/landlord'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const landlord = useLandlordStore()

const activeMenu = computed(() => route.path)
const title = computed(() => (route.meta.title as string) || '工作台')
const pending = computed(() => landlord.pendingBookings)

function onSelect() {
  /* router 模式自动跳转 */
}
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
.goto {
  color: var(--orange);
  font-weight: 600;
  font-size: 13px;
}
.gsearch {
  width: 180px;
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
