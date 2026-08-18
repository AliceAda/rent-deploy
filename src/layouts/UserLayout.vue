<template>
  <div class="user-layout">
    <!-- 顶部导航 -->
    <header class="topbar">
      <div class="top-inner">
        <router-link to="/home" class="logo">
          <span class="mark">租</span>
          <span class="wordmark serif">安居易租</span>
        </router-link>
        <el-popover
          v-model:visible="showCity"
          placement="bottom-start"
          trigger="click"
          :width="620"
          popper-class="region-pop"
          @show="onPopShow"
        >
          <div class="region-picker">
            <div class="col">
              <div class="col-title">省份</div>
              <div
                v-for="p in provinceList"
                :key="p.id ?? p.name"
                class="opt"
                :class="{ on: p.name === store.province }"
                @click="onProvince(p)"
              >{{ p.name }}</div>
              <div v-if="provinceLoading && !provinceList.length" class="col-empty">加载中…</div>
              <div v-if="!provinceLoading && !provinceList.length" class="col-empty">暂无数据</div>
            </div>
            <div class="col">
              <div class="col-title">城市</div>
              <div
                v-for="c in cityList"
                :key="c.id ?? c.name"
                class="opt"
                :class="{ on: c.name === store.city }"
                @click="onCity(c)"
              >{{ c.name }}</div>
              <div v-if="cityLoading && !cityList.length" class="col-empty">加载中…</div>
              <div v-if="!selProvince && !cityLoading" class="col-empty">请先选择省份</div>
              <div v-if="selProvince && !cityLoading && !cityList.length" class="col-empty">暂无数据</div>
            </div>
            <div class="col">
              <div class="col-title">区域</div>
              <div
                v-for="d in districtList"
                :key="d.id ?? d.name"
                class="opt"
                :class="{ on: d.name === store.district }"
                @click="onDistrict(d)"
              >{{ d.name }}</div>
              <div v-if="districtLoading && !districtList.length" class="col-empty">加载中…</div>
              <div v-if="!selCity && !districtLoading" class="col-empty">请先选择城市</div>
              <div v-if="selCity && !districtLoading && !districtList.length" class="col-empty">暂无数据</div>
            </div>
          </div>
          <template #reference>
            <div class="city">
              📍 {{ store.cityShort }}<span v-if="store.district" class="sub"> · {{ store.district }}</span>
              <span class="caret">▾</span>
            </div>
          </template>
        </el-popover>
        <el-autocomplete
          v-model="keyword"
          :fetch-suggestions="querySuggest"
          placeholder="输入小区 / 商圈 / 地铁站找房"
          class="search"
          clearable
          @select="onPick"
          @keyup.enter="onSearch"
        >
          <template #append>
            <el-button @click="onSearch">搜索</el-button>
          </template>
        </el-autocomplete>
        <button class="theme-btn" :title="theme === 'dark' ? '切换浅色' : '切换深色'" @click="toggle">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
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
      <router-link to="/map" custom v-slot="{ navigate, isActive }">
        <button :class="{ on: isActive }" @click="navigate">🗺️<span>地图</span></button>
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
import { safe, toList } from '@/api/http'
import { getRegions } from '@/api/house'
import { getSuggest } from '@/api/search'
import { regions as mockRegions } from '@/mock/data'
import { useTheme } from '@/composables/useTheme'

// 级联节点：有 id 时逐级查库（/house/region?parentId=），无 id / 查库失败时用 children（本地 mock 回退）
interface RegionNode {
  id?: number
  name: string
  children?: RegionNode[]
}

const store = useAppStore()
const auth = useAuthStore()
const router = useRouter()
const { theme, toggle } = useTheme()
const keyword = ref('')
const showCity = ref(false)

const provinceList = ref<RegionNode[]>([])
const cityList = ref<RegionNode[]>([])
const districtList = ref<RegionNode[]>([])
const provinceLoading = ref(false)
const cityLoading = ref(false)
const districtLoading = ref(false)
// 本地选中态（与 store 定位保持一致，弹层内高亮用）
const selProvince = ref<RegionNode | null>({ name: store.province })
const selCity = ref<RegionNode | null>({ name: store.city })
const selDistrict = ref<RegionNode | null>(store.district ? { name: store.district } : null)

// 后端返回归一化为 { id, name } 列表（兼容数组 / { list, total } 两种形态）
function mapRows(data: unknown): RegionNode[] {
  const { list } = toList<Record<string, unknown>>(data)
  return (list as Record<string, unknown>[])
    .map((r) => ({ id: typeof r?.id === 'number' ? (r.id as number) : undefined, name: String(r?.name ?? '') }))
    .filter((r) => r.name)
}
// 数据库未就绪时的本地回退：按名称取省 / 市下一级
function mockChildrenOf(provinceName: string, cityName?: string): RegionNode[] {
  const p = mockRegions.find((r) => r.name === provinceName)
  if (!p) return []
  if (!cityName) return (p.children ?? []) as RegionNode[]
  const c = p.children?.find((x) => x.name === cityName)
  return (c?.children ?? []) as RegionNode[]
}

// 打开弹层：首拉全部一级省份（查库失败回退本地 mock），并恢复已选定位的级联列
async function onPopShow() {
  if (!provinceList.value.length) {
    provinceLoading.value = true
    const res = await safe(getRegions(), null)
    provinceLoading.value = false
    provinceList.value = res.code === 0 ? mapRows(res.data) : (mockRegions as unknown as RegionNode[])
  }
  if (selProvince.value && !cityList.value.length) await ensureCityList(selProvince.value)
  if (selCity.value && !districtList.value.length) await ensureDistrictList(selCity.value, selProvince.value?.name ?? '')
}

async function ensureCityList(province: RegionNode | null) {
  cityList.value = []
  if (!province) return
  // mock 自带 children 直接展示；否则按 id 查库，失败再回退 mock
  if (province.children?.length) {
    cityList.value = province.children as RegionNode[]
    return
  }
  cityLoading.value = true
  let rows: RegionNode[] = []
  if (province.id != null) {
    const res = await safe(getRegions(province.id), null)
    if (res.code === 0) rows = mapRows(res.data)
  }
  cityLoading.value = false
  if (!rows.length) rows = mockChildrenOf(province.name)
  cityList.value = rows
}

async function ensureDistrictList(city: RegionNode | null, provinceName: string) {
  districtList.value = []
  if (!city) return
  if (city.children?.length) {
    districtList.value = city.children as RegionNode[]
    return
  }
  districtLoading.value = true
  let rows: RegionNode[] = []
  if (city.id != null) {
    const res = await safe(getRegions(city.id), null)
    if (res.code === 0) rows = mapRows(res.data)
  }
  districtLoading.value = false
  if (!rows.length) rows = mockChildrenOf(provinceName, city.name)
  districtList.value = rows
}

async function onProvince(p: RegionNode) {
  selProvince.value = p
  selCity.value = null
  selDistrict.value = null
  await ensureCityList(p)
}
async function onCity(c: RegionNode) {
  selCity.value = c
  selDistrict.value = null
  store.setLocation(selProvince.value?.name ?? '', c.name, '')
  await ensureDistrictList(c, selProvince.value?.name ?? '')
}
// 选到区一级即生效：写入定位并跳转找房列表
function onDistrict(d: RegionNode) {
  selDistrict.value = d
  store.setLocation(selProvince.value?.name ?? '', selCity.value?.name ?? '', d.name)
  showCity.value = false
  router.push({ path: '/list', query: { city: store.cityShort, district: d.name } })
}

function onSearch() {
  const q = keyword.value.trim()
  if (q) router.push({ path: '/list', query: { q } })
  else router.push('/list')
}

// 搜索联想（/search/suggest）：输入时下拉建议，点选直达找房列表
async function querySuggest(q: string, cb: (list: unknown[]) => void) {
  if (!q.trim()) return cb([])
  const r = await safe(getSuggest(q.trim()), null)
  const rows = (r.code === 0 ? (r.data as { list?: { keyword: string }[] } | null)?.list : undefined) ?? []
  cb(rows.map((s) => ({ value: s.keyword })).slice(0, 8))
}
function onPick(item: { value: string }) {
  router.push({ path: '/list', query: { q: item.value } })
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
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
}
.logo .mark {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: var(--seal);
  color: var(--seal-ink);
  display: grid;
  place-items: center;
  font-family: var(--font-kai);
  font-size: 15px;
  transform: rotate(-3deg);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.55), 0 1px 3px rgba(226, 72, 61, 0.35);
}
.logo .wordmark {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.city {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--ink);
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 12px;
  background: var(--panel);
  transition: 0.15s;
}
.city .caret {
  font-size: 10px;
}
.city .sub {
  color: var(--brand);
}
.city:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.search {
  flex: 1;
  max-width: 520px;
}
.theme-btn {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--panel);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: 0.15s;
}
.theme-btn:hover {
  border-color: var(--brand);
  background: var(--brand-s);
}
.nav-tabs {
  display: flex;
  gap: 2px;
}
.nav-tabs button {
  background: transparent;
  color: var(--sub);
  padding: 8px 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: 0.15s;
}
.nav-tabs button:hover {
  color: var(--ink);
}
.nav-tabs button.active {
  color: var(--brand);
  border-bottom-color: var(--brand);
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
  grid-template-columns: repeat(5, 1fr);
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

<!-- el-popover 内容挂载在 body 下，样式需全局生效 -->
<style>
.region-picker {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.region-picker .col {
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px;
}
.region-picker .col-title {
  font-size: 12px;
  color: var(--sub);
  padding: 4px 8px;
}
.region-picker .opt {
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.region-picker .opt:hover {
  background: var(--brand-s);
  color: var(--brand);
}
.region-picker .opt.on {
  background: var(--brand);
  color: #fff;
  font-weight: 600;
}
.region-picker .col-empty {
  padding: 10px 8px;
  font-size: 12px;
  color: var(--sub);
}
</style>
