$content = @'
<template>
  <div>
    <el-card shadow="never" class="bar">
      <el-date-picker v-model="range" type="monthrange" range-separator="~" start-placeholder="开始月" end-placeholder="结束月" @change="onFilter" />
      <el-select v-model="dim" placeholder="维度" style="width: 140px; margin-left: 12px" @change="onFilter">
        <el-option label="按城市" value="city" />
        <el-option label="按门店" value="store" />
        <el-option label="按经纪人" value="agent" />
      </el-select>
      <el-button type="primary" plain style="margin-left: 12px" :loading="submitting" @click="exportReport">导出报表</el-button>
    </el-card>

    <el-row :gutter="14">
      <el-col :span="12">
        <el-card shadow="never" title="GMV 趋势">
          <div ref="gmvEl" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" title="房源去化">
          <div ref="stockEl" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- CSV 导出 -->
    <el-card shadow="never" class="mt14">
      <div class="sec-head">
        <span class="bar"></span>
        <h3 class="serif">导出数据</h3>
      </div>
      <el-space>
        <el-button type="primary" plain @click="downloadCsv('gmv')">下载 GMV 数据 CSV</el-button>
        <el-button type="primary" plain @click="downloadCsv('stock')">下载房源分布 CSV</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import { getGmvStat, getStockStat, exportStat } from '@/api/admin'
import { init, use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, PieChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const range = ref('')
const dim = ref('city')
const loading = ref(false)
const submitting = ref(false)
const gmvEl = ref<HTMLElement>()
const stockEl = ref<HTMLElement>()
let charts: ReturnType<typeof init>[] = []

// 存储图表数据以便导出
const gmvData = ref<{ labels: string[]; data: number[] }>({ labels: [], data: [] })
const stockData = ref<any[]>([])

async function renderCharts() {
  loading.value = true
  const gmvRes = await safe(getGmvStat(dim.value), { labels: [], data: [] })
  const stockRes = await safe(getStockStat(), [])

  gmvData.value = gmvRes.data ?? { labels: [], data: [] }
  stockData.value = stockRes.data ?? []

  if (gmvEl.value) {
    const c = init(gmvEl.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: gmvRes.data.labels },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: gmvRes.data.data, itemStyle: { color: '#10B0A0' }, name: 'GMV(万)' }]
    })
    charts.push(c)
  }
  if (stockEl.value) {
    const c = init(stockEl.value)
    c.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{ type: 'pie', radius: ['40%', '65%'], data: stockRes.data, label: { formatter: '{b}\n{d}%' } }]
    })
    charts.push(c)
  }
  loading.value = false
}

function onFilter() {
  charts.forEach((c) => c.dispose())
  charts = []
  renderCharts()
}

async function exportReport() {
  try {
    await ElMessageBox.confirm('确认导出当前统计报表？', '导出报表', { type: 'info', confirmButtonText: '确认导出' })
    submitting.value = true
    const res = await safe(exportStat({ dim: dim.value, range: range.value }), {})
    if (okRes(res)) ElMessage.success('报表已导出')
    submitting.value = false
  } catch { /* 取消 */ }
}

// 下载 CSV
function downloadCsv(type: 'gmv' | 'stock') {
  let csv = ''
  let filename = ''
  if (type === 'gmv') {
    csv = '月份,GMV(万)\n' + gmvData.value.labels.map((l, i) => `${l},${gmvData.value.data[i]}`).join('\n')
    filename = `GMV_${dim.value}.csv`
  } else {
    csv = '区域,数量\n' + stockData.value.map((s: any) => `${s.name},${s.value}`).join('\n')
    filename = `房源分布.csv`
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(() => renderCharts())
onBeforeUnmount(() => charts.forEach((c) => c.dispose()))
</script>

<style scoped>
.bar { margin-bottom: 14px; }
.chart { height: 300px; }
.mt14 { margin-top: 14px; }
</style>
'@
$content | Out-File -FilePath 'D:\Project\rent-deploy\src\views\admin\Statistics.vue' -Encoding UTF8
Write-Host 'Statistics.vue fixed with CSV export'
