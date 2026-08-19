<template>
  <div ref="el" class="chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import type { PriceHistory } from '@/api/house'

const props = defineProps<{ data: PriceHistory[] }>()
const el = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let ro: ResizeObserver | null = null

function axisColor() {
  return document.documentElement.dataset.theme === 'dark' ? '#9aa6b6' : '#94a3b8'
}
function splitColor() {
  return document.documentElement.dataset.theme === 'dark' ? '#27323f' : '#eef1f5'
}

function render() {
  if (!el.value || !props.data.length) return
  if (!chart) chart = echarts.init(el.value)
  const ac = axisColor()
  const sc = splitColor()
  chart.setOption(
    {
      grid: { left: 52, right: 16, top: 22, bottom: 28 },
      tooltip: { trigger: 'axis', valueFormatter: (v: number) => '¥' + v + '/月' },
      xAxis: {
        type: 'category',
        data: props.data.map((d) => d.date),
        axisLabel: { color: ac, fontSize: 10 },
        axisLine: { lineStyle: { color: sc } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: ac, fontSize: 10, formatter: (v: number) => '¥' + v },
        splitLine: { lineStyle: { color: sc } }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: props.data.map((d) => d.price),
          itemStyle: { color: '#10B0A0' },
          areaStyle: { color: 'rgba(47,111,237,0.12)' },
          lineStyle: { width: 2 }
        }
      ]
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
  () => props.data,
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
  height: 200px;
  width: 100%;
}
</style>
