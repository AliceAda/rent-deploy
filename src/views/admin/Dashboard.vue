<template>
  <div>
    <!-- 指标卡 -->
    <el-row :gutter="14">
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
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { init, use } from 'echarts/core'
import { LineChart, PieChart, FunnelChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { dashboard } from '@/mock/data'

// 注册 ECharts 用到的模块（tree-shaking 按需加载）
use([LineChart, PieChart, FunnelChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const cards = [
  { k: '今日新增房源', v: dashboard.today.newHouse, t: '较昨日 +2' },
  { k: '今日新增订单', v: dashboard.today.newOrder, t: '较昨日 +1' },
  { k: '今日成交', v: dashboard.today.deal, t: 'GMV ¥3.2w' },
  { k: '待处理', v: dashboard.today.todo, t: '审核/工单/退款' }
]

const trendEl = ref<HTMLElement>()
const pieEl = ref<HTMLElement>()
const funnelEl = ref<HTMLElement>()
let charts: ReturnType<typeof init>[] = []

onMounted(() => {
  if (trendEl.value) {
    const c = init(trendEl.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 24 },
      xAxis: { type: 'category', data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, data: dashboard.trend, areaStyle: { opacity: 0.15 }, itemStyle: { color: '#2F6FED' } }]
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
          data: dashboard.cityDist.map((d) => ({ name: d.name, value: d.value })),
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
          color: ['#2F6FED', '#5a86ff', '#FF7D3C', '#1aa86a']
        }
      ]
    })
    charts.push(c)
  }
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
