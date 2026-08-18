<template>
  <div class="page-max">
    <!-- 页头 -->
    <div class="head">
      <div>
        <p class="eyebrow">RENT MARKET · {{ store.cityShort }}在架房源洞察</p>
        <h1 class="serif">租金行情</h1>
        <p class="sub">基于在架房源的均价、走势与户型结构，帮你快速判断「租在哪更划算」。</p>
      </div>
      <el-select v-model="district" placeholder="全部区域" style="width: 180px" @change="renderAll">
        <el-option label="全部区域" value="" />
        <el-option v-for="d in districts" :key="d" :label="d" :value="d" />
      </el-select>
    </div>

    <!-- 统计卡 -->
    <el-row :gutter="14" class="stats">
      <el-col v-for="s in statCards" :key="s.label" :xs="12" :sm="6">
        <div class="stat">
          <div class="label">{{ s.label }}</div>
          <div class="val" :class="{ up: s.up, down: s.down }">{{ s.value }}</div>
          <div class="hint" v-if="s.hint">{{ s.hint }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 走势 + 户型 -->
    <el-row :gutter="14">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="blk">
          <div class="sec-head">
            <span class="bar"></span>
            <h2 class="serif">近 3 月均价走势</h2>
            <span class="eyebrow">演示估算</span>
          </div>
          <div ref="trendEl" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="blk">
          <div class="sec-head"><span class="bar"></span><h2 class="serif">户型分布</h2></div>
          <div ref="pieEl" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 区域排行 -->
    <el-card shadow="never" class="blk">
      <div class="sec-head"><span class="bar"></span><h2 class="serif">各区域均价排行</h2></div>
      <div ref="barEl" class="chart chart-tall"></div>
    </el-card>

    <!-- 高性价比推荐 -->
    <div class="sec-head">
      <span class="bar"></span>
      <h2 class="serif">高性价比推荐</h2>
      <span class="eyebrow">单位面积租金最低优先</span>
    </div>
    <el-row :gutter="16">
      <el-col v-for="h in valueHouses" :key="h.id" :xs="24" :sm="12" :md="6">
        <HouseCard :house="h" @open="openDetail" @fav="store.toggleCollect(h.id)" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store'
import { useTheme } from '@/composables/useTheme'
import HouseCard from '@/components/HouseCard.vue'
import type { House } from '@/mock/data'
import { init, use } from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, PieChart, LineChart, TooltipComponent, GridComponent, LegendComponent, TitleComponent, CanvasRenderer])

const store = useAppStore()
const router = useRouter()
const route = useRoute()
const { theme } = useTheme()

const district = ref('')

const houses = computed<House[]>(() => store.publicHouses)
const districts = computed(() => Array.from(new Set(houses.value.map((h) => h.district))))

const filtered = computed<House[]>(() =>
  district.value ? houses.value.filter((h) => h.district === district.value) : houses.value
)

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

// 近 3 月均价：每套房源按与详情页一致的种子规律 [price-200, price, price] 估算
const months = ['2026-06', '2026-07', '2026-08']
const trendSeries = computed<number[]>(() =>
  months.map((m, i) => {
    const vals = filtered.value.map((h) => (i === 0 ? h.price - 200 : h.price))
    return Math.round(avg(vals))
  })
)
const momChange = computed(() => {
  const t = trendSeries.value
  if (t.length < 2 || !t[t.length - 2]) return 0
  return Math.round(((t[t.length - 1] - t[t.length - 2]) / t[t.length - 2]) * 100)
})

const statCards = computed(() => [
  { label: '在架房源', value: filtered.value.length + ' 套', up: false, down: false },
  { label: '均价', value: '¥' + Math.round(avg(filtered.value.map((h) => h.price))) + '/月', up: false, down: false },
  { label: '中位价', value: '¥' + median(filtered.value.map((h) => h.price)) + '/月', up: false, down: false },
  {
    label: '环比上月',
    value: (momChange.value >= 0 ? '+' : '') + momChange.value + '%',
    hint: momChange.value >= 0 ? '近月微涨' : '近月回落',
    up: momChange.value >= 0,
    down: momChange.value < 0
  }
])

const typeDist = computed(() => {
  const map: Record<string, number> = {}
  filtered.value.forEach((h) => (map[h.rentType] = (map[h.rentType] || 0) + 1))
  return Object.entries(map).map(([name, value]) => ({ name, value }))
})
const districtRanking = computed(() => {
  const map: Record<string, number[]> = {}
  houses.value.forEach((h) => (map[h.district] ||= []).push(h.price))
  return Object.entries(map)
    .map(([name, ps]) => ({ name, avg: Math.round(avg(ps)) }))
    .sort((a, b) => b.avg - a.avg)
})
const valueHouses = computed<House[]>(() =>
  [...filtered.value].sort((a, b) => a.price / a.area - b.price / b.area).slice(0, 4)
)

const trendEl = ref<HTMLElement>()
const pieEl = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
let charts: ReturnType<typeof init>[] = []

function renderAll() {
  charts.forEach((c) => c.dispose())
  charts = []
  const axis = theme.value === 'dark' ? '#9aa6b6' : '#5b6168'
  const split = theme.value === 'dark' ? '#27323f' : '#eceef1'

  if (trendEl.value) {
    const c = init(trendEl.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 52, right: 16, top: 20, bottom: 28 },
      xAxis: { type: 'category', data: months, axisLabel: { color: axis } },
      yAxis: {
        type: 'value',
        axisLabel: { color: axis, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : String(v)) },
        splitLine: { lineStyle: { color: split } }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: trendSeries.value,
          name: '均价',
          itemStyle: { color: '#10B0A0' },
          areaStyle: { color: 'rgba(47,111,237,0.12)' }
        }
      ]
    })
    charts.push(c)
  }
  if (pieEl.value) {
    const c = init(pieEl.value)
    c.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: axis } },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          data: typeDist.value,
          label: { formatter: '{b}\n{d}%' },
          color: ['#10B0A0', '#ff7d3c', '#16a34a', '#7c3aed']
        }
      ]
    })
    charts.push(c)
  }
  if (barEl.value) {
    const c = init(barEl.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 72, right: 24, top: 16, bottom: 28 },
      xAxis: {
        type: 'value',
        axisLabel: { color: axis, formatter: (v: number) => (v >= 1000 ? v / 1000 + 'k' : String(v)) },
        splitLine: { lineStyle: { color: split } }
      },
      yAxis: { type: 'category', data: districtRanking.value.map((d) => d.name).reverse(), axisLabel: { color: axis } },
      series: [{ type: 'bar', data: districtRanking.value.map((d) => d.avg).reverse(), itemStyle: { color: '#ff7d3c' }, name: '均价' }]
    })
    charts.push(c)
  }
}

function openDetail(id: number) {
  router.push('/detail/' + id)
}
function onResize() {
  charts.forEach((c) => c.resize())
}

onMounted(() => {
  if (route.query.district) district.value = String(route.query.district)
  renderAll()
  window.addEventListener('resize', onResize)
})
// 深色模式切换时按新配色重绘
watch(theme, renderAll)
onBeforeUnmount(() => {
  charts.forEach((c) => c.dispose())
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.head h1 {
  font-size: 34px;
  margin: 6px 0 4px;
  font-weight: 700;
}
.sub {
  color: var(--sub);
  margin: 0;
  font-size: 13px;
}
.stats {
  margin-bottom: 14px;
}
.stat {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.stat .label {
  font-size: 12px;
  color: var(--sub);
}
.stat .val {
  font-size: 22px;
  font-weight: 800;
  margin-top: 4px;
  font-family: var(--font-mono);
}
.stat .val.up {
  color: var(--seal);
}
.stat .val.down {
  color: var(--orange);
}
.stat .hint {
  font-size: 11px;
  color: var(--sub);
  margin-top: 2px;
}
.blk {
  margin-bottom: 14px;
}
.chart {
  height: 300px;
}
.chart-tall {
  height: 320px;
}
</style>
