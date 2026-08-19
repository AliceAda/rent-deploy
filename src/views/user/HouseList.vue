<template>
  <div class="page-max">
    <el-row :gutter="18">
      <!-- 筛选侧栏 -->
      <el-col :xs="24" :sm="8" :md="6">
        <el-card class="filters" shadow="never">
          <el-form label-position="top">
            <el-form-item label="租赁方式">
              <el-radio-group v-model="f.rent">
                <el-radio-button label="全部" value="全部" />
                <el-radio-button label="整租" value="整租" />
                <el-radio-button label="合租" value="合租" />
                <el-radio-button label="公寓" value="公寓" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="户型">
              <el-select v-model="f.type" placeholder="不限" style="width: 100%">
                <el-option label="不限" value="all" />
                <el-option label="1室" value="1室" />
                <el-option label="2室" value="2室" />
                <el-option label="3室" value="3室" />
              </el-select>
            </el-form-item>
            <el-form-item label="朝向">
              <el-select v-model="f.ori" placeholder="不限" style="width: 100%">
                <el-option label="不限" value="all" />
                <el-option label="南" value="南" />
                <el-option label="北" value="北" />
                <el-option label="东" value="东" />
                <el-option label="西" value="西" />
              </el-select>
            </el-form-item>
            <el-form-item label="月租金上限：{{ f.price >= PRICE_MAX ? '不限' : f.price + '元' }}">
              <el-slider v-model="f.price" :min="PRICE_MIN" :max="PRICE_MAX" :step="500" />
            </el-form-item>
            <el-form-item label="配套">
              <el-checkbox-group v-model="f.fac">
                <el-checkbox label="电梯" value="电梯" />
                <el-checkbox label="燃气" value="燃气" />
                <el-checkbox label="宠物" value="宠物" />
                <el-checkbox label="车位" value="车位" />
              </el-checkbox-group>
            </el-form-item>
            <el-button type="primary" plain style="width: 100%" @click="reset">重置筛选</el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 主内容 -->
      <el-col :xs="24" :sm="16" :md="18">
        <DemoBanner v-if="isDemo" title="当前为演示房源数据（接口未就绪）" />
        <div class="list-head">
          <div class="count mono">
            <span class="bar"></span>
            共 {{ filtered.length }} 套
            <span class="loc">· {{ store.cityShort }}{{ store.district ? ' · ' + store.district : '' }}</span>
          </div>
          <div class="right">
            <el-button v-if="compareCount" size="small" type="warning" plain class="cmp-entry" @click="goCompare">
              ⚖ 对比（{{ compareCount }}）
            </el-button>
            <el-radio-group v-model="sort" size="small">
              <el-radio-button label="综合" value="default" />
              <el-radio-button label="价格↑" value="priceAsc" />
              <el-radio-button label="价格↓" value="priceDesc" />
              <el-radio-button label="面积↓" value="areaDesc" />
            </el-radio-group>
            <el-switch
              v-model="mapMode"
              inline-prompt
              active-text="地图"
              inactive-text="列表"
              style="margin-left: 12px"
              @change="onMapToggle"
            />
          </div>
        </div>

        <!-- 列表视图 -->
        <template v-if="!mapMode">
          <div v-if="loading" class="sk-grid">
            <AppSkeleton v-for="n in 6" :key="n" :rows="3" :avatar="true" />
          </div>
          <el-row v-else :gutter="14">
            <el-col v-for="h in filtered" :key="h.id" :xs="24" :sm="12" :md="8">
              <HouseCard :house="h" @open="openDetail" @fav="toggleCollect(h.id)" />
            </el-col>
            <el-col v-if="!filtered.length" :span="24">
              <el-empty description="没有符合条件的房源，试试放宽筛选" />
            </el-col>
          </el-row>
        </template>

        <!-- 地图找房视图：复用 HouseMap（mock 路网 + 区域聚合，可一键接入高德/百度 JS API） -->
        <HouseMap v-show="mapMode" class="map-wrap" :houses="filtered" v-model="active" @open="openDetail" :height="520" />
      </el-col>
    </el-row>

    <!-- 移动端筛选抽屉 -->
    <el-button class="filter-fab" type="primary" circle aria-label="打开筛选" @click="showFilter = true">⚙</el-button>
    <el-drawer v-model="showFilter" title="筛选" direction="btt" size="72%">
      <el-form label-position="top">
        <el-form-item label="租赁方式">
          <el-radio-group v-model="f.rent">
            <el-radio-button label="全部" value="全部" />
            <el-radio-button label="整租" value="整租" />
            <el-radio-button label="合租" value="合租" />
            <el-radio-button label="公寓" value="公寓" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="户型">
          <el-select v-model="f.type" placeholder="不限" style="width: 100%">
            <el-option label="不限" value="all" />
            <el-option label="1室" value="1室" />
            <el-option label="2室" value="2室" />
            <el-option label="3室" value="3室" />
          </el-select>
        </el-form-item>
        <el-form-item label="朝向">
          <el-select v-model="f.ori" placeholder="不限" style="width: 100%">
            <el-option label="不限" value="all" />
            <el-option label="南" value="南" />
            <el-option label="北" value="北" />
            <el-option label="东" value="东" />
            <el-option label="西" value="西" />
          </el-select>
        </el-form-item>
        <el-form-item label="月租金上限：{{ f.price >= 15000 ? '不限' : f.price + '元' }}">
          <el-slider v-model="f.price" :min="1500" :max="15000" :step="500" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="showFilter = false">查看结果</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import HouseCard from '@/components/HouseCard.vue'
import HouseMap from '@/components/HouseMap.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import { getHouseList } from '@/api/house'
import { useDataSource } from '@/composables/useDataSource'
import { toBrowseHouse } from '@/utils/house'
import { toggleCollect } from '@/utils/collect'
import { getCompareIds, COMPARE_CHANGE } from '@/utils/compare'
import DemoBanner from '@/components/DemoBanner.vue'
import type { House } from '@/mock/data'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

// API-first + mock 回退：接口就绪用真实房源，未就绪回退本地演示数据
// 注意：解构出顶层 ref（模板才能自动解包），用法与 useTable 一致
const { data: houses, isDemo, loading, load } = useDataSource<House[]>(
  async () => {
    const r = await getHouseList(buildQuery())
    return { code: r.code, data: (r.data?.list ?? []).map(toBrowseHouse) }
  },
  store.publicHouses
)
const mapMode = ref(false)
const showFilter = ref(false)
const active = ref<number | null>(null)
const sort = ref('default')
const kw = ref('')

const PRICE_MAX = 15000
const PRICE_MIN = 1500

const TYPE_OPTS = ['all', '1室', '2室', '3室']
const ORI_OPTS = ['all', '南', '北', '东', '西']

const f = reactive({ rent: '全部', type: 'all', ori: 'all', price: PRICE_MAX, fac: [] as string[] })

// 把当前筛选 + 顶栏定位拼成后端查询参数（server-first：后端按这些条件过滤）
function buildQuery(): Record<string, string | number | undefined> {
  const q: Record<string, string | number | undefined> = {}
  if (f.rent !== '全部') q.rent = f.rent
  if (f.type !== 'all') q.type = f.type
  if (f.ori !== 'all') q.ori = f.ori
  if (f.price < PRICE_MAX) q.price = f.price
  if (f.fac.length) q.fac = f.fac.join(',')
  const k = kw.value.trim()
  if (k) q.q = k
  if (store.cityShort) q.city = store.cityShort
  if (store.district) q.district = store.district
  return q
}

// 列表状态以 URL query 为唯一事实源：筛选变化写回 URL，URL 变化读回筛选。
// 这样后退/前进/分享/直达都成立，也顺带消除 keep-alive 缓存旧筛选的问题。
function loadQuery() {
  // URL 为唯一事实源：先整体回默认，再按 URL 参数覆盖——缺失的参数即默认值，
  // 顺带消除 keep-alive 缓存旧筛选残留
  f.rent = '全部'
  f.type = 'all'
  f.ori = 'all'
  f.price = PRICE_MAX
  f.fac = []
  kw.value = ''
  sort.value = 'default'
  const q = route.query
  const kw2 = (q.q as string) || ''
  if (kw2) kw.value = kw2
  const r = (q.rent as string) || ''
  if (r && ['全部', '整租', '合租', '公寓'].includes(r)) f.rent = r
  const t = (q.type as string) || 'all'
  if (TYPE_OPTS.includes(t)) f.type = t
  const o = (q.ori as string) || 'all'
  if (ORI_OPTS.includes(o)) f.ori = o
  const price = Number(q.price)
  if (q.price && !Number.isNaN(price) && price >= PRICE_MIN && price <= PRICE_MAX) f.price = price
  const fac = ((q.fac as string) || '').split(',').filter(Boolean)
  f.fac = fac
  const s = (q.sort as string) || ''
  if (s && ['default', 'priceAsc', 'priceDesc', 'areaDesc'].includes(s)) sort.value = s
  const cityQ = (q.city as string) || ''
  const districtQ = (q.district as string) || ''
  if (cityQ || districtQ) syncLocation(cityQ || store.cityShort, districtQ)
}

// 把当前筛选写回 URL（仅在有变化时 replace，不新增历史记录）
async function pushToUrl() {
  // 仅当列表页自身处于活动态时才写 URL（keep-alive 缓存页在其他路由不干预）
  if (route.name !== 'list') return
  const clean: Record<string, string> = {}
  const q = kw.value.trim()
  if (q) clean.q = q
  if (f.rent !== '全部') clean.rent = f.rent
  if (f.type !== 'all') clean.type = f.type
  if (f.ori !== 'all') clean.ori = f.ori
  if (f.price < PRICE_MAX) clean.price = String(f.price)
  if (f.fac.length) clean.fac = f.fac.join(',')
  if (sort.value !== 'default') clean.sort = sort.value
  // 保留定位参数
  if (route.query.city) clean.city = String(route.query.city)
  if (route.query.district) clean.district = String(route.query.district)
  const qs = new URLSearchParams(clean).toString()
  const target = qs ? '/list?' + qs : '/list'
  if (route.fullPath !== target) await router.replace(target)
}

let pushTimer: ReturnType<typeof setTimeout> | null = null
function schedulePush() {
  if (route.name !== 'list') return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(pushToUrl, 250)
}

// 筛选 / 定位变化 → 防抖向后端重新拉取（server-first），client filtered 仅作排序与兜底
let reloadTimer: ReturnType<typeof setTimeout> | null = null
let suppressReload = true
function scheduleReload() {
  if (route.name !== 'list' || suppressReload) return
  if (reloadTimer) clearTimeout(reloadTimer)
  reloadTimer = setTimeout(() => load(), 280)
}
// 用户操作筛选 → 写回 URL + 重新拉取（loadQuery 只赋值不同值，天然避免回环）
watch(f, () => { schedulePush(); scheduleReload() }, { deep: true })
watch(kw, () => { schedulePush(); scheduleReload() })
watch(sort, () => { schedulePush(); scheduleReload() })
watch(
  () => [store.cityShort, store.district],
  () => { schedulePush(); scheduleReload() }
)
// 把 query 里的城市/区域反查回省→市→区，保持顶栏级联选中态一致
function syncLocation(cityShort: string, district?: string) {
  for (const p of store.regions) {
    for (const c of p.children ?? []) {
      if (c.name.replace(/[省市]$/, '') === cityShort) {
        store.setLocation(p.name, c.name, district ?? '')
        return
      }
    }
  }
}
onMounted(() => {
  loadQuery()
  load()
  window.addEventListener(COMPARE_CHANGE, syncCompareCount)
  // 首屏 loadQuery 对 f 的赋值会触发上面的 watch，待其 flush 后再放开筛选重建，避免挂载即重复拉取
  nextTick(() => { suppressReload = false })
})
onBeforeUnmount(() => window.removeEventListener(COMPARE_CHANGE, syncCompareCount))
// 仅当列表页活动时同步 URL 状态（keep-alive 缓存页不响应其他路由的 query 变化）
watch(() => route.query, () => {
  if (route.name === 'list') loadQuery()
})

// 对比篮入口（上限 3，跨页面保留）
const compareCount = ref(getCompareIds().length)
function syncCompareCount() {
  compareCount.value = getCompareIds().length
}
function goCompare() {
  router.push('/compare')
}

// 地图找房视图复用 HouseMap 组件（mock 路网 + 区域聚合，可一键接入高德/百度 JS API），
// 不再在此重复维护地图渲染逻辑。

// 先按顶栏定位（城市/区域）过滤，再做关键词与筛选条件过滤
const locationHouses = computed(() => {
  const c = store.cityShort
  const d = store.district
  return houses.value.filter((h) => (!c || h.city === c) && (!d || h.district === d))
})

const filtered = computed(() => {
  const q = kw.value.trim().toLowerCase()
  let arr = locationHouses.value.filter(
    (h) =>
      (f.rent === '全部' || h.rentType === f.rent) &&
      (f.type === 'all' || h.layout.startsWith(f.type)) &&
      (f.ori === 'all' || h.orientation.includes(f.ori)) &&
      (f.price >= PRICE_MAX || h.price <= f.price) &&
      f.fac.every((x) => h.facilities.includes(x)) &&
      (!q || h.title.toLowerCase().includes(q) || h.district.toLowerCase().includes(q))
  )
  if (sort.value === 'priceAsc') arr = [...arr].sort((a, b) => a.price - b.price)
  if (sort.value === 'priceDesc') arr = [...arr].sort((a, b) => b.price - a.price)
  if (sort.value === 'areaDesc') arr = [...arr].sort((a, b) => b.area - a.area)
  return arr
})

function reset() {
  f.rent = '全部'
  f.type = 'all'
  f.ori = 'all'
  f.price = PRICE_MAX
  f.fac = []
  kw.value = ''
  sort.value = 'default'
  if (pushTimer) clearTimeout(pushTimer)
  pushToUrl()
}
function onMapToggle(v: boolean) {
  if (v) active.value = null
}
function openDetail(id: number) {
  router.push('/detail/' + id)
}
</script>

<style scoped>
.filters {
  position: sticky;
  top: 78px;
}
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  font-size: 13px;
}
.count .bar {
  width: 4px;
  height: 14px;
  background: var(--brand);
  border-radius: 2px;
}
.loc {
  color: var(--brand);
}
.filters :deep(.el-form-item__label) {
  font-size: 12px;
  color: var(--sub);
  font-weight: 600;
}
.right {
  display: flex;
  align-items: center;
}
.map {
  position: relative;
  height: 520px;
  background: linear-gradient(180deg, #eef4ff, #f6f9ff);
  border: 1px solid var(--line);
  overflow: hidden;
}
.map-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}
.road-h,
.road-v {
  position: absolute;
  background: rgba(148, 163, 184, 0.5);
  border-radius: 2px;
  pointer-events: none;
}
.road-h {
  left: 0;
  right: 0;
}
.road-v {
  top: 0;
  bottom: 0;
}
.metro-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.metro-stop {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 1px 6px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  pointer-events: none;
}
.metro-stop i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B0A0;
  border: 1.5px solid #fff;
  box-shadow: 0 0 0 1px #10B0A0;
}
.poi-tag {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 10px;
  padding: 1px 6px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
  pointer-events: none;
}
.agg {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--brand);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 18px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: baseline;
  gap: 6px;
  box-shadow: 0 3px 10px rgba(47, 111, 237, 0.45);
  z-index: 2;
}
.agg b {
  font-size: 11px;
  opacity: 0.9;
}
.agg.zoom {
  background: var(--orange);
  box-shadow: 0 3px 10px rgba(255, 125, 60, 0.5);
}
.agg:hover {
  transform: translate(-50%, -50%) scale(1.06);
}
.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--brand);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 14px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(47, 111, 237, 0.4);
  z-index: 2;
}
.marker.on {
  background: var(--orange);
  z-index: 3;
}
.popup {
  position: absolute;
  transform: translate(-50%, calc(-100% - 14px));
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  width: 200px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.14);
  z-index: 5;
}
.popup .pt {
  font-weight: 600;
  font-size: 13px;
}
.popup .pp {
  color: var(--orange);
  font-weight: 700;
  margin: 4px 0 8px;
  font-size: 13px;
}
.map-tip {
  margin-top: 10px;
  font-size: 12px;
}
/* 加载骨架网格 */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 4px 0;
}
/* 移动端筛选浮窗 */
.filter-fab {
  display: none;
}
@media (max-width: 980px) {
  .sk-grid {
    grid-template-columns: 1fr;
  }
  /* 移动端隐藏侧栏筛选，改用底部抽屉 */
  .filters {
    display: none;
  }
  .filter-fab {
    display: inline-flex;
    position: fixed;
    right: 16px;
    bottom: 84px;
    z-index: 70;
    width: 48px;
    height: 48px;
    box-shadow: 0 6px 18px rgba(47, 111, 237, 0.4);
  }
}
</style>
