<template>
  <div>
    <DemoBanner
      v-if="isDemo"
      title="当前为演示数据（工作台接口未就绪）"
      description="指标卡与图表已回退到本地演示数据，接入后端后自动切换为真实数据。"
    />

    <!-- 指标卡 -->
    <el-row :gutter="14" v-loading="loading">
      <el-col :span="6" v-for="c in cards" :key="c.k">
        <el-card shadow="hover" class="metric">
          <div class="mk">{{ c.k }}</div>
          <div class="mv">{{ c.v }}</div>
          <div class="mt text-sub">{{ c.t }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="14" style="margin-top: 14px">
      <el-col :span="16">
        <el-card shadow="never" title="成交趋势（近 12 月）">
          <div ref="trendEl" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" title="城市房源分布">
          <div ref="pieEl" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="14" style="margin-top: 14px">
      <el-col :span="12">
        <el-card shadow="never" title="转化漏斗（曝光→签约）">
          <div ref="funnelEl" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" title="待办事项">
          <el-timeline>
            <el-timeline-item type="warning" :timestamp="'今天'">12 套新房源待审核</el-timeline-item>
            <el-timeline-item type="danger" :timestamp="'今天'">3 笔退款需复核</el-timeline-item>
            <el-timeline-item type="primary" :timestamp="'昨天'">5 个工单待分派</el-timeline-item>
            <el-timeline-item :timestamp="'08-10'">1 例虚假房源预警</el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { init, use } from 'echarts/core'
import { LineChart, PieChart, FunnelChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { getDashboardToday, getGmvStat, getStockStat } from '@/api/admin'
import { dashboard } from '@/mock/data'
import { useDataSource } from '@/composables/useDataSource'
import DemoBanner from '@/components/DemoBanner.vue'

// 注册 ECharts 用到的模块（tree-shaking 按需加载）
use([LineChart, PieChart, FunnelChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

// API-first + mock 回退：接口就绪用真实数据，未就绪回退本地演示数据并标记 isDemo
const today = useDataSource(() => getDashboardToday(), { ...dashboard.today })
const gmv = useDataSource(() => getGmvStat('month'), { labels: MONTHS, data: dashboard.trend })
const stock = useDataSource(
  () => getStockStat(),
  dashboard.cityDist.map((d) => ({ name: d.name, value: d.value }))
)

const loading = computed(() => today.loading.value || gmv.loading.value || stock.loading.value)
const isDemo = computed(() => today.isDemo.value || gmv.isDemo.value || stock.isDemo.value)

const cards = computed(() => [
  { k: '今日新增房源', v: today.data.value.newHouse, t: '较昨日 +2' },
  { k: '今日新增订单', v: today.data.value.newOrder, t: '较昨日 +1' },
  { k: '今日成交', v: today.data.value.deal, t: 'GMV ¥3.2w' },
  { k: '待处理', v: today.data.value.todo, t: '审核/工单/退款' }
])

const trendEl = ref<HTMLElement>()
const pieEl = ref<HTMLElement>()
const funnelEl = ref<HTMLElement>()
let charts: ReturnType<typeof init>[] = []

function renderCharts() {
  if (trendEl.value) {
    const c = init(trendEl.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 24 },
      xAxis: { type: 'category', data: gmv.data.value.labels },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, data: gmv.data.value.data, areaStyle: { opacity: 0.15 }, itemStyle: { color: '#10B0A0' } }]
    })
    charts.push(c)
  }
  if (pieEl.value) {
    const c = init(pieEl.value)
    c.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          data: stock.data.value.map((d) => ({ name: d.name, value: d.value })),
          label: { formatter: '{b}\n{d}%' }
        }
      ]
    })
    charts.push(c)
  }
  if (funnelEl.value) {
    const c = init(funnelEl.value)
    const f = dashboard.funnel
    c.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}' },
      series: [
        {
          type: 'funnel',
          data: [
            { name: '曝光', value: f.expose },
            { name: '咨询', value: f.inquiry },
            { name: '带看', value: f.visit },
            { name: '签约', value: f.sign }
          ],
          label: { formatter: '{b} {c}' },
          color: ['#10B0A0', '#2DD4BF', '#FF7D3C', '#1aa86a']
        }
      ]
    })
    charts.push(c)
  }
}

onMounted(async () => {
  await Promise.all([today.load(), gmv.load(), stock.load()])
  renderCharts()
})

onBeforeUnmount(() => charts.forEach((c) => c.dispose()))
</script>

<style scoped>
.metric {
  text-align: center;
}
.mk {
  color: var(--sub);
  font-size: 13px;
}
.mv {
  font-size: 28px;
  font-weight: 800;
  color: var(--brand);
  margin: 4px 0;
}
.chart {
  height: 280px;
}
</style>
