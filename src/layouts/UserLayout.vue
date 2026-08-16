<template>
  <div class="user-layout">
    <!-- 顶部导航 -->
    <header class="topbar">
      <div class="top-inner">
        <router-link to="/home" class="logo"><span class="dot">租</span>安居易租</router-link>
        <div class="city">📍 {{ store.city }} <span class="caret">▾</span></div>
        <el-input
          v-model="keyword"
          placeholder="输入小区 / 商圈 / 地铁站找房"
          class="search"
          @keyup.enter="onSearch"
        >
          <template #append>
            <el-button @click="onSearch">搜索</el-button>
          </template>
        </el-input>
        <nav class="nav-tabs">
          <router-link to="/home" custom v-slot="{ navigate, isActive }">
            <button :class="{ active: isActive }" @click="navigate">首页</button>
          </router-link>
          <router-link to="/list" custom v-slot="{ navigate, isActive }">
            <button :class="{ active: isActive }" @click="navigate">找房</button>
          </router-link>
          <router-link to="/mine" custom v-slot="{ navigate, isActive }">
            <button :class="{ active: isActive }" @click="navigate">我的</button>
          </router-link>
        </nav>
        <div class="login">
          <template v-if="auth.isLoggedIn">
            <el-dropdown @command="onUserCmd">
              <span class="user-chip">
                <el-avatar :size="26">{{ auth.user?.name[0] }}</el-avatar>
                <span class="uname">{{ auth.user?.name }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" custom v-slot="{ navigate }">
              <el-button text type="primary" @click="navigate">登录</el-button>
            </router-link>
            <router-link to="/register" custom v-slot="{ navigate }">
              <el-button type="primary" @click="navigate">注册</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 内容 -->
    <main>
      <router-view v-slot="{ Component }">
        <keep-alive :max="5">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <!-- 移动端底部 Tab -->
    <nav class="mtab">
      <router-link to="/home" custom v-slot="{ navigate, isActive }">
        <button :class="{ on: isActive }" @click="navigate">🏠<span>首页</span></button>
      </router-link>
      <router-link to="/list" custom v-slot="{ navigate, isActive }">
        <button :class="{ on: isActive }" @click="navigate">🔍<span>找房</span></button>
      </router-link>
      <router-link to="/mine" custom v-slot="{ navigate, isActive }">
        <button :class="{ on: isActive }" @click="navigate">👤<span>我的</span></button>
      </router-link>
      <button @click="goLandlord">🏠<span>房东</span></button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const store = useAppStore()
const auth = useAuthStore()
const router = useRouter()
const keyword = ref('')

function onSearch() {
  const q = keyword.value.trim()
  if (q) router.push({ path: '/list', query: { q } })
  else router.push('/list')
}
function goLandlord() {
  if (auth.isLoggedIn && auth.user?.role === 'landlord') router.push('/landlord/dashboard')
  else router.push({ path: '/login', query: { role: 'landlord' } })
}
function onUserCmd(cmd: string) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid var(--line);
}
.top-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 20px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 18px;
  color: var(--brand);
}
.logo .dot {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--brand), #5a86ff);
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 13px;
}
.city {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--sub);
  font-weight: 600;
  cursor: pointer;
}
.city .caret {
  font-size: 10px;
}
.search {
  flex: 1;
  max-width: 520px;
}
.nav-tabs {
  display: flex;
  gap: 6px;
}
.nav-tabs button {
  background: transparent;
  color: var(--sub);
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.nav-tabs button.active {
  background: var(--brand-s);
  color: var(--brand);
}
.login {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--ink);
  font-weight: 600;
}
.user-chip .uname {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mtab {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid var(--line);
  z-index: 60;
  grid-template-columns: repeat(4, 1fr);
}
.mtab button {
  background: transparent;
  padding: 10px 0;
  color: var(--sub);
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: none;
  cursor: pointer;
}
.mtab button.on {
  color: var(--brand);
}
@media (max-width: 980px) {
  .nav-tabs,
  .login {
    display: none;
  }
  .mtab {
    display: grid;
  }
  main {
    padding-bottom: 70px;
  }
}
</style>
