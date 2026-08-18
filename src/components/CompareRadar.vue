<template>
  <div ref="el" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { House } from '@/mock/data'

const props = defineProps<{ houses: House[] }>()
const el = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let ro: ResizeObserver | null = null

const palette = ['#10B0A0', '#ff7d3c', '#1aa86a', '#7c3aed']
// 归一化维度：价格取「越低越优」反向分，其余取相对最大值占比
function build() {
  if (!props.houses.length) return null
  const maxPrice = Math.max(...props.houses.map((h) => h.price), 1)
  const maxArea = Math.max(...props.houses.map((h) => h.area), 1)
  const indicators = [
    { name: '价格(低优)', max: 100 },
    { name: '面积', max: 100 },
    { name: '评分', max: 5 },
    { name: '楼层', max: 30 },
    { name: '配套', max: 6 },
    { name: '收藏热度', max: 100 }
  ]
  const series = props.houses.map((h, i) => ({
    value: [
      Math.round((1 - h.price / maxPrice) * 100),
      Math.round((h.area / maxArea) * 100),
      h.grade ?? 0,
      Math.min(30, Number((h.floor || '1/1').split('/')[0]) || 1),
      h.facilities?.length ?? 0,
      Math.min(100, h.collectCount || 0)
    ],
    name: h.title,
    itemStyle: { color: palette[i % palette.length] },
    areaStyle: { opacity: 0.12 },
    lineStyle: { width: 2 }
  }))
  return { indicators, series }
}

function render() {
  if (!el.value) return
  const data = build()
  if (!data) return
  if (!chart) chart = echarts.init(el.value)
  const dark = document.documentElement.dataset.theme === 'dark'
  const label = dark ? '#9aa6b6' : '#64748b'
  const split = dark ? '#27323f' : '#eef1f5'
  const area = dark ? ['#15202e', '#0e141d'] : ['#fafbfc', '#fff']
  chart.setOption(
    {
      color: palette,
      legend: {
        data: props.houses.map((h) => h.title),
        bottom: 0,
        type: 'scroll',
        textStyle: { color: label, fontSize: 10 }
      },
      tooltip: {},
      radar: {
        indicator: data.indicators,
        radius: '64%',
        axisName: { color: label, fontSize: 10 },
        splitLine: { lineStyle: { color: split } },
        axisLine: { lineStyle: { color: split } },
        splitArea: { areaStyle: { color: area } }
      },
      series: [{ type: 'radar', data: data.series }]
    },
    true
  )
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  render()
  if (el.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(resize)
    ro.observe(el.value)
  }
  window.addEventListener('themechange', render)
})
watch(
  () => props.houses,
  render,
  { deep: true }
)
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('themechange', render)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart {
  height: 320px;
  width: 100%;
}
</style>
