<template>
  <div class="compare-page">
    <el-page-header @back="$router.back()" content="房源对比" style="margin-bottom: 16px" />
    
    <el-row :gutter="16" v-if="houses.length">
      <el-col :xs="24" :sm="12" :md="8" v-for="(h, i) in houses" :key="h.id">
        <el-card shadow="never" class="house-card" :class="{ active: i === 0 }">
          <div class="cover" :style="{ backgroundImage: `url(${houseImg(h.id, 'living')})` }"></div>
          <div class="info">
            <h4 class="title">{{ h.title }}</h4>
            <p class="price">¥{{ h.price }}<i>/月</i></p>
            <div class="kv">
              <span>{{ h.layout }}</span>
              <span>{{ h.area }}㎡</span>
              <span>{{ h.orientation }}</span>
              <span>{{ h.district }}</span>
            </div>
          </div>
          <el-button 
            type="danger" 
            text 
            size="small"
            @click="remove(i)"
          >移除</el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比雷达图 -->
    <el-card v-if="houses.length >= 2" shadow="never" class="radar-card">
      <div class="sec-head">
        <span class="bar"></span>
        <h3 class="serif">综合对比</h3>
      </div>
      <div ref="radarEl" class="radar-chart"></div>
    </el-card>

    <!-- 导出按钮 -->
    <div class="footer-actions">
      <el-button type="primary" @click="exportComparison">📥 导出对比表</el-button>
      <el-button @click="clearAll">清空对比</el-button>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!houses.length" description="请先从房源列表中勾选需要对比的房源" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCompareIds, COMPARE_CHANGE } from '@/utils/compare'
import { useAppStore } from '@/store'
import { houseImg } from '@/utils/houseImg'
import { init, use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([RadarChart, TitleComponent, TooltipComponent, RadarComponent, CanvasRenderer])

const router = useRouter()
const store = useAppStore()
const radarEl = ref<HTMLElement>()
let radarChart: ReturnType<typeof init> | null = null

// 对比房源列表
const houses = ref<any[]>([])

function loadCompareHouses() {
  const ids = getCompareIds()
  houses.value = ids
    .map(id => store.publicHouses.find(h => h.id === id))
    .filter((h): h is any => !!h)
}

function remove(index: number) {
  const id = houses.value[index].id
  const ids = getCompareIds()
  const newIds = ids.filter(i => i !== id)
  store.$patch({ compareIds: newIds })
  loadCompareHouses()
}

function clearAll() {
  store.$patch({ compareIds: [] })
  houses.value = []
  if (radarChart) {
    radarChart.dispose()
    radarChart = null
  }
}

// 渲染雷达图
function renderRadar() {
  if (!radarEl.value || houses.value.length < 2) return
  
  if (radarChart) {
    radarChart.dispose()
    radarChart = null
  }
  
  radarChart = init(radarEl.value)
  
  // 计算各维度得分（1-5分）
  const indicators = [
    { name: '价格', max: 5 },
    { name: '面积', max: 5 },
    { name: '位置', max: 5 },
    { name: '配套', max: 5 },
    { name: '装修', max: 5 }
  ]
  
  const seriesData = houses.value.map(h => {
    const priceScore = Math.min(5, Math.max(1, 5 - (h.price / 3000)))
    const areaScore = Math.min(5, h.area / 20)
    return {
      value: [priceScore, areaScore, 3, 3, 3],
      name: h.title
    }
  })
  
  radarChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { data: houses.value.map(h => h.title), bottom: 0 },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4
    },
    series: [{
      type: 'radar',
      data: seriesData
    }]
  })
}

watch(houses, () => {
  if (houses.value.length >= 2) {
    renderRadar()
  } else if (radarChart) {
    radarChart.dispose()
    radarChart = null
  }
}, { immediate: true })

// 导出对比表
function exportComparison() {
  if (houses.value.length < 2) {
    return ElMessage.warning('至少需要选择2套房源进行对比')
  }
  
  const headers = ['ID', '标题', '区域', '户型', '面积(㎡)', '租金(元/月)', '朝向', '状态']
  const rows = houses.value.map(h => [
    h.id,
    h.title,
    h.district,
    h.layout,
    h.area,
    h.price,
    h.orientation,
    h.status
  ])
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `房源对比_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => {
  loadCompareHouses()
  window.addEventListener(COMPARE_CHANGE, loadCompareHouses)
})

onBeforeUnmount(() => {
  window.removeEventListener(COMPARE_CHANGE, loadCompareHouses)
  if (radarChart) radarChart.dispose()
})
</script>

<style scoped>
.compare-page {
  padding: 20px;
}
.house-card {
  margin-bottom: 16px;
}
.house-card .cover {
  height: 160px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  background-color: #f0f0f0;
}
.house-card .info {
  margin-top: 12px;
}
.house-card .title {
  margin: 0 0 8px;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.house-card .price {
  margin: 0 0 8px;
  color: var(--orange);
  font-size: 18px;
  font-weight: 700;
}
.house-card .price i {
  font-size: 12px;
  color: var(--sub);
  font-weight: 400;
}
.house-card .kv {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--sub);
}
.radar-card {
  margin-top: 20px;
}
.radar-chart {
  height: 400px;
}
.footer-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
</style>
