<template>
  <div class="house-map" :style="{ height: height + 'px' }">
    <!-- 真实地图（高德 JS API 2.0）：key 存在时自动启用 -->
    <div v-if="showReal" ref="amapEl" class="amap-host"></div>
    <span v-if="showReal" class="amap-badge">🗺️ 高德地图 · 真实坐标</span>

    <!-- 演示地图（mock）：无 key 时的占位，区域聚合 + 路网 -->
    <template v-else>
      <div class="map-bg"></div>

      <!-- 城市路网 -->
      <div v-for="(r, i) in ROAD_H" :key="'h' + i" class="road-h" :style="{ top: r.top + '%', height: r.w + 'px' }"></div>
      <div v-for="(r, i) in ROAD_V" :key="'v' + i" class="road-v" :style="{ left: r.left + '%', width: r.w + 'px' }"></div>

      <!-- 地铁线路与站点 -->
      <svg class="metro-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M6,88 L44,58 L82,14" stroke="#2F6FED" stroke-width="1.1" fill="none" stroke-dasharray="0.6 1.5" />
        <path d="M12,22 L50,60 L90,34" stroke="#FF7D3C" stroke-width="1.1" fill="none" stroke-dasharray="0.6 1.5" />
        <path d="M30,10 L58,44 L30,92" stroke="#1aa86a" stroke-width="1" fill="none" stroke-dasharray="0.6 1.5" opacity="0.8" />
      </svg>
      <span v-for="s in METRO_STOPS" :key="s.name" class="metro-stop" :style="{ left: s.x + '%', top: s.y + '%' }">
        <i></i>{{ s.name }}
      </span>

      <!-- 商圈 / 医院 / 公园 POI -->
      <span v-for="p in MAP_POIS" :key="p.name" class="poi-tag" :style="{ left: p.x + '%', top: p.y + '%' }">{{ p.ico }} {{ p.name }}</span>

      <!-- 区域聚合气泡（组内 >3 套收为聚合点） -->
      <button
        v-for="g in mapGroups"
        :key="g.district"
        class="agg"
        :class="{ zoom: activeZoom === g.district }"
        :style="{ left: g.x + '%', top: g.y + '%' }"
        @click.stop="activeZoom = activeZoom === g.district ? '' : g.district"
      >
        {{ g.district }}<b>{{ g.list.length }}套</b>
      </button>

      <!-- 房源 marker -->
      <button
        v-for="h in mapMarkers"
        :key="h.id"
        class="marker"
        :class="{ on: active === h.id }"
        :style="{ left: h.x + '%', top: h.y + '%' }"
        @click.stop="active = h.id"
      >
        ¥{{ h.price }}
      </button>

      <!-- 选中气泡 -->
      <div v-if="activeHouse" class="popup" :style="{ left: activeHouse.x + '%', top: activeHouse.y + '%' }">
        <div class="pt">{{ activeHouse.title }}</div>
        <div class="pp">¥{{ activeHouse.price }}/月 · {{ activeHouse.layout }}</div>
        <el-button size="small" type="primary" @click="emit('open', activeHouse.id)">查看详情</el-button>
      </div>

      <div v-if="showTip" class="map-tip text-sub">
        🗺️ 演示地图：区域聚合（>3 套收为聚合点，点击展开）。真实项目将 <code>provider</code> 切换为
        <code>amap</code>/<code>tencent</code> 即可接入高德 / 百度 JS API，房源随视野聚合打点、通勤联动。
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { House } from '@/mock/data'
import { hasAmapKey, loadAMap, toLngLat } from '@/utils/amap'

/**
 * 可复用地图组件。
 *  - 无 key：内置「mock」渲染器（CSS/SVG 路网 + 区域聚合），零成本演示。
 *  - 有 key（VITE_AMAP_KEY）：自动切换「amap」真实地图（高德 JS API 2.0），
 *    房源 marker 随视野聚合、点击看详情、与侧栏 active 双向联动。
 *  - 真实坐标优先：House 带 lng/lat 直接用；否则把 mock 的 x/y(0~100) 投影到北京 bbox 演示。
 */
const props = withDefaults(
  defineProps<{
    houses: House[]
    modelValue?: number | null
    height?: number
    showTip?: boolean
    provider?: 'auto' | 'mock' | 'amap' | 'tencent'
  }>(),
  { modelValue: null, height: 520, showTip: true, provider: 'auto' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | null): void
  (e: 'open', id: number): void
}>()

const active = computed<number | null>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// provider 解析：auto 时按 key 是否存在决定；显式 mock 永远演示；显式 amap/tencent 需有 key
const effective = computed<'mock' | 'amap'>(() => {
  if (props.provider === 'mock') return 'mock'
  if (props.provider === 'amap' || props.provider === 'tencent') return hasAmapKey() ? 'amap' : 'mock'
  return hasAmapKey() ? 'amap' : 'mock'
})
const loadError = ref(false)
const showReal = computed(() => effective.value === 'amap' && !loadError.value)

// ===== 演示地图（mock）逻辑 =====
const activeZoom = ref('')
const mapGroups = computed(() => {
  const groups = new Map<string, House[]>()
  for (const h of props.houses) {
    if (h.x == null || h.y == null) continue
    const arr = groups.get(h.district) ?? []
    arr.push(h)
    groups.set(h.district, arr)
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length > 3)
    .map(([district, list]) => ({
      district,
      list,
      x: Math.round(list.reduce((s, h) => s + (h.x ?? 0), 0) / list.length),
      y: Math.round(list.reduce((s, h) => s + (h.y ?? 0), 0) / list.length)
    }))
})
const mapMarkers = computed(() => {
  const agg = new Set(mapGroups.value.map((g) => g.district))
  return props.houses.filter(
    (h) => h.x != null && h.y != null && (!agg.has(h.district) || activeZoom.value === h.district)
  )
})
const activeHouse = computed<House | undefined>(() => props.houses.find((h) => h.id === active.value))

// ===== 真实地图（高德） =====
const amapEl = ref<HTMLElement | null>(null)
let AMap: any = null
let map: any = null
let info: any = null
let resizeObs: ResizeObserver | null = null
const markersById = new Map<number, any>()

const ROAD_H = [
  { top: 22, w: 3 },
  { top: 48, w: 5 },
  { top: 74, w: 3 },
  { top: 90, w: 2 }
]
const ROAD_V = [
  { left: 18, w: 2 },
  { left: 44, w: 5 },
  { left: 66, w: 3 },
  { left: 85, w: 2 }
]
const METRO_STOPS = [
  { name: '望京站', x: 44, y: 58 },
  { name: '国贸站', x: 82, y: 14 },
  { name: '回龙观', x: 12, y: 22 },
  { name: '中关村', x: 58, y: 44 }
]
const MAP_POIS = [
  { ico: '🏬', name: '商圈', x: 24, y: 38 },
  { ico: '☕', name: '咖啡', x: 74, y: 62 },
  { ico: '🏥', name: '医院', x: 38, y: 80 },
  { ico: '🌳', name: '公园', x: 88, y: 74 }
]

function markerContent(price: number): string {
  return `<div class="amap-marker">¥${price}</div>`
}

function openInfo(h: House, pos: [number, number]) {
  if (!AMap || !map) return
  const el = document.createElement('div')
  el.className = 'amap-popup'
  el.innerHTML = `<div class="pt">${h.title}</div><div class="pp">¥${h.price}/月 · ${h.layout}</div>`
  const btn = document.createElement('button')
  btn.className = 'el-button el-button--primary el-button--small'
  btn.textContent = '查看详情'
  btn.onclick = () => emit('open', h.id)
  el.appendChild(btn)
  if (!info) info = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -28) })
  info.setContent(el)
  info.open(map, pos)
}

function buildMarkers() {
  if (!AMap || !map) return
  const markers = props.houses
    .filter((h) => h.x != null || (h as any).lng != null)
    .map((h) => {
      const pos = toLngLat(h as any)
      const m = new AMap.Marker({
        position: pos,
        content: markerContent(h.price),
        anchor: 'center',
        extData: { id: h.id }
      })
      m.on('click', () => {
        active.value = h.id
        openInfo(h, pos)
      })
      markersById.set(h.id, m)
      return m
    })
  // 视野聚合：高德官方 MarkerCluster（脚本已带 plugin）
  if ((AMap as any).MarkerCluster) {
    new (AMap as any).MarkerCluster(map, markers, { gridSize: 60 })
  } else {
    map.add(markers)
  }
}

async function initReal() {
  if (!amapEl.value) return
  try {
    AMap = await loadAMap()
  } catch (e) {
    console.warn('[HouseMap] 高德地图加载失败，回退演示地图：', (e as Error).message)
    loadError.value = true
    return
  }
  const center = props.houses.length
    ? toLngLat(props.houses.find((h) => h.x != null || (h as any).lng != null) as any)
    : ([116.4, 39.92] as [number, number])
  map = new AMap.Map(amapEl.value, {
    zoom: 12,
    center,
    viewMode: '2D'
  })
  buildMarkers()
  // 容器尺寸变化时让地图自适应
  resizeObs = new ResizeObserver(() => map && (map as any).resize())
  resizeObs.observe(amapEl.value)
}

// 侧栏选中 → 地图平移 + 弹窗
watch(active, (id) => {
  if (!map || !AMap || id == null) return
  const h = props.houses.find((x) => x.id === id)
  if (!h) return
  const pos = toLngLat(h as any)
  ;(map as any).panTo(pos)
  openInfo(h, pos)
})

onMounted(() => {
  if (showReal.value) initReal()
})
onBeforeUnmount(() => {
  resizeObs?.disconnect()
  if (map && AMap) (map as any).destroy?.()
  map = null
  AMap = null
})
</script>

<style scoped>
.house-map {
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, #eef4ff, #f6f9ff);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}
.map-bg {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--line) 1px, transparent 1px),
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
  background: #2f6fed;
  border: 1.5px solid #fff;
  box-shadow: 0 0 0 1px #2f6fed;
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
  position: absolute;
  left: 10px;
  bottom: 10px;
  right: 10px;
  margin: 0;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 6px 10px;
}
.map-tip code {
  font-family: var(--font-mono);
  background: var(--brand-s);
  color: var(--brand);
  padding: 0 4px;
  border-radius: 4px;
}
</style>

<!-- 真实地图由高德注入 DOM，scoped 样式不生效，这里用全局样式 -->
<style>
.amap-host {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.amap-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  font-size: 11px;
  color: #1f2329;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 3px 9px;
  box-shadow: 0 1px 4px rgba(16, 24, 40, 0.12);
}
.amap-marker {
  background: #2f6fed;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 14px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(47, 111, 237, 0.4);
  white-space: nowrap;
  cursor: pointer;
  transform: translate(-50%, -50%);
}
.amap-popup {
  min-width: 170px;
}
.amap-popup .pt {
  font-weight: 600;
  font-size: 13px;
  color: #1f2329;
}
.amap-popup .pp {
  color: #ff7d3c;
  font-weight: 700;
  margin: 4px 0 8px;
  font-size: 13px;
}
</style>
