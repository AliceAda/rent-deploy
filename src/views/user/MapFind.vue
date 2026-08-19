<template>
  <div class="mapfind">
    <!-- 顶部工具条：结果数 + 筛选 + 定位 -->
    <div class="mf-bar">
      <div class="mf-count mono">
        <span class="bar"></span>
        {{ filtered.length }} 套在地图中
        <span class="loc">· {{ store.cityShort }}{{ store.district ? ' · ' + store.district : '' }}</span>
      </div>

      <div class="mf-filters">
        <el-radio-group v-model="f.rent" size="small">
          <el-radio-button label="全部" value="全部" />
          <el-radio-button label="整租" value="整租" />
          <el-radio-button label="合租" value="合租" />
          <el-radio-button label="公寓" value="公寓" />
        </el-radio-group>
        <el-select v-model="f.type" placeholder="户型" size="small" style="width: 96px">
          <el-option label="不限" value="all" />
          <el-option label="1室" value="1室" />
          <el-option label="2室" value="2室" />
          <el-option label="3室" value="3室" />
        </el-select>
        <el-button size="small" :type="nearMe ? 'warning' : 'default'" @click="nearMe = !nearMe">
          📍 附近
        </el-button>
      </div>

      <el-button size="small" class="mf-filter-btn" @click="showFilter = true">⚙ 筛选</el-button>
    </div>

    <!-- 地图 + 侧栏 -->
    <div class="mf-body">
      <HouseMap class="mf-map" :houses="filtered" v-model="active" @open="openDetail" :height="mapHeight" />

      <div class="mf-list" ref="listRef" @scroll="onScroll">
        <div class="mf-spacer" :style="{ height: totalHeight + 'px' }">
          <div class="mf-window" :style="{ transform: 'translateY(' + padTop + 'px)' }">
            <div
              v-for="h in visible"
              :key="h.id"
              class="mf-item"
              :class="{ on: active === h.id }"
              @click="active = h.id"
            >
              <div class="mf-cover" :style="{ backgroundImage: houseCover(h.id) }"></div>
              <div class="mf-info">
                <div class="mf-title">{{ h.title }}</div>
                <div class="mf-meta">
                  {{ h.district }} · {{ h.layout }} · {{ h.area }}㎡
                </div>
                <div class="mf-price mono">¥{{ h.price }}<i>/月</i></div>
              </div>
              <el-button size="small" type="primary" plain @click.stop="openDetail(h.id)">详情</el-button>
            </div>
          </div>
        </div>
        <el-empty v-if="!filtered.length" description="该条件下暂无房源" :image-size="70" />
      </div>
    </div>

    <!-- 移动端筛选抽屉 -->
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
          <el-form-item label="月租金上限：{{ f.price >= PRICE_MAX ? '不限' : f.price + '元' }}">
            <el-slider v-model="f.price" :min="PRICE_MIN" :max="PRICE_MAX" :step="500" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="showFilter = false">查看结果</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import HouseMap from '@/components/HouseMap.vue'
import { getHouseList } from '@/api/house'
import { useDataSource } from '@/composables/useDataSource'
import { useVirtualList } from '@/composables/useVirtualList'
import { houseCover } from '@/utils/houseImg'
import type { House } from '@/mock/data'

const store = useAppStore()
const router = useRouter()

const PRICE_MAX = 15000
const PRICE_MIN = 1500

// 房源数据：API-first + mock 回退（与列表页同一策略）
const { data: houses, load } = useDataSource<House[]>(
  async () => {
    const r = await getHouseList(buildQuery())
    return { code: r.code, data: (r.data?.list ?? []) as House[] }
  },
  store.publicHouses
)

const f = reactive({ rent: '全部', type: 'all', price: PRICE_MAX })
const nearMe = ref(false)
const active = ref<number | null>(null)
const showFilter = ref(false)

// 把当前筛选 + 顶栏定位拼成后端查询参数（server-first）
function buildQuery(): Record<string, string | number | undefined> {
  const q: Record<string, string | number | undefined> = {}
  if (f.rent !== '全部') q.rent = f.rent
  if (f.type !== 'all') q.type = f.type
  if (f.price < PRICE_MAX) q.price = f.price
  if (store.cityShort) q.city = store.cityShort
  if (store.district) q.district = store.district
  return q
}

// 筛选 / 定位变化 → 防抖向后端重新拉取（client filtered 仅作排序与兜底）
let reloadTimer: ReturnType<typeof setTimeout> | null = null
function scheduleReload() {
  if (reloadTimer) clearTimeout(reloadTimer)
  reloadTimer = setTimeout(() => load(), 280)
}
watch(f, scheduleReload, { deep: true })
watch(() => [store.cityShort, store.district], scheduleReload)

// 先按顶栏定位，再按筛选；nearMe 用一个伪定位点(50,50)做半径过滤（演示）
const MY_LOC = { x: 50, y: 50 }
const locationHouses = computed(() =>
  houses.value.filter((h) => (!store.cityShort || h.city === store.cityShort) && (!store.district || h.district === store.district))
)
const filtered = computed(() => {
  const arr = locationHouses.value.filter(
    (h) =>
      (f.rent === '全部' || h.rentType === f.rent) &&
      (f.type === 'all' || h.layout.startsWith(f.type)) &&
      (f.price >= 15000 || h.price <= f.price)
  )
  if (nearMe.value) {
    return arr
      .map((h) => ({ h, d: Math.hypot((h.x ?? 50) - MY_LOC.x, (h.y ?? 50) - MY_LOC.y) }))
      .filter((x) => x.d <= 38)
      .sort((a, b) => a.d - b.d)
      .map((x) => x.h)
  }
  return arr
})

function openDetail(id: number) {
  router.push('/detail/' + id)
}

// ===== 虚拟列表侧栏 =====
const listRef = ref<HTMLElement | null>(null)
const { onScroll, totalHeight, padTop, visible } = useVirtualList<House>(() => filtered.value, {
  itemHeight: 92,
  containerRef: listRef
})

// 移动端地图高度 + 布局切换
const isMobile = ref(false)
const mapHeight = computed(() => (isMobile.value ? 300 : 560))
function onResize() {
  isMobile.value = window.innerWidth <= 980
}
onMounted(() => {
  onResize()
  load()
})
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.mapfind {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: var(--bg);
}
.mf-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.mf-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink);
}
.mf-count .bar {
  width: 4px;
  height: 14px;
  background: var(--brand);
  border-radius: 2px;
}
.mf-count .loc {
  color: var(--brand);
}
.mf-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.mf-filter-btn {
  display: none;
}
.mf-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  min-height: 0;
}
.mf-map {
  min-height: 0;
}
.mf-list {
  border-left: 1px solid var(--line);
  overflow-y: auto;
  background: var(--panel);
  position: relative;
}
.mf-spacer {
  position: relative;
}
.mf-window {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
.mf-item {
  height: 92px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.mf-item.on {
  background: var(--brand-s);
}
.mf-cover {
  width: 68px;
  height: 68px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-color: #dfe6ee;
  flex-shrink: 0;
}
.mf-info {
  flex: 1;
  min-width: 0;
}
.mf-title {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mf-meta {
  color: var(--sub);
  font-size: 12px;
  margin: 3px 0;
}
.mf-price {
  color: var(--orange);
  font-weight: 700;
  font-size: 15px;
}
.mf-price i {
  font-style: normal;
  font-size: 11px;
  color: var(--sub);
  font-weight: 400;
}
@media (max-width: 980px) {
  .mapfind {
    height: calc(100vh - 56px);
  }
  .mf-filters {
    display: none;
  }
  .mf-filter-btn {
    display: inline-flex;
    margin-left: auto;
  }
  .mf-body {
    grid-template-columns: 1fr;
    grid-template-rows: 44vh 1fr;
  }
  .mf-map {
    border-bottom: 1px solid var(--line);
  }
  .mf-list {
    border-left: none;
  }
}
</style>
