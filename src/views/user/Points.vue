<template>
  <div class="page-max">
    <el-tabs v-model="tab">
      <el-tab-pane label="积分概览" name="points">
        <el-card shadow="never" style="margin-bottom: 16px">
          <h3>我的积分</h3>
          <div class="pt">当前积分：<b>{{ info.points }}</b> · 等级：{{ info.level || '—' }}</div>
          <el-progress :percentage="Math.min(100, (info.points % 1000) / 10)" :format="() => info.points + ' / 1000'" style="margin-top: 10px" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="我的优惠券" name="coupons">
        <el-card shadow="never">
          <h3>我的优惠券</h3>
          <el-row :gutter="12">
            <el-col v-for="c in coupons" :key="c.id" :span="8" style="margin-bottom: 12px">
              <el-card shadow="never" class="cp" :class="{ used: c.status !== 'unused' }">
                <div class="amt">¥{{ c.amount }}</div>
                <div class="text-sub">满{{ c.threshold }}减{{ c.amount }}</div>
                <div class="text-sub">{{ c.status === 'unused' ? '未使用' : c.status === 'used' ? '已使用' : '已过期' }}</div>
              </el-card>
            </el-col>
          </el-row>
          <el-empty v-if="!coupons.length" description="暂无优惠券" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="积分明细" name="log">
        <el-card shadow="never">
          <h3>积分明细</h3>
          <el-table :data="logs" v-loading="logLoading" empty-text="暂无积分记录">
            <el-table-column prop="action" label="行为" min-width="160" />
            <el-table-column prop="amount" label="积分变动" width="120">
              <template #default="{ row }">
                <span :class="row.amount >= 0 ? 'plus' : 'minus'">{{ row.amount >= 0 ? '+' : '' }}{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" width="180" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { safe, get } from '@/api/http'
import { getMyPoints, getMyCoupons, type PointsInfo, type CouponItem } from '@/api/points'

interface PointsLog {
  action: string
  amount: number
  createTime: string
}

const tab = ref('points')
const info = ref<PointsInfo>({ points: 0, level: '' })
const coupons = ref<CouponItem[]>([])
const logs = ref<PointsLog[]>([])
const logLoading = ref(false)

async function load() {
  const p = await safe(getMyPoints(), { points: 0, level: '' })
  info.value = p.data ?? { points: 0, level: '' }
  const c = await safe(getMyCoupons(), { list: [], total: 0 })
  coupons.value = c.data?.list ?? []
}

async function loadLogs() {
  logLoading.value = true
  const r = await safe(get<{ list: PointsLog[]; total: number }>('/user/points/log'), { list: [], total: 0 })
  logs.value = r.data?.list ?? []
  logLoading.value = false
}

onMounted(() => {
  load()
  loadLogs()
})
</script>

<style scoped>
.pt {
  font-size: 15px;
}
.pt b {
  color: var(--brand);
  font-size: 22px;
}
.cp {
  text-align: center;
}
.cp.used {
  opacity: 0.5;
}
.cp .amt {
  font-size: 24px;
  font-weight: 700;
  color: var(--orange);
}
.text-sub {
  color: var(--sub);
}
.plus {
  color: #67c23a;
  font-weight: 600;
}
.minus {
  color: #f56c6c;
  font-weight: 600;
}
</style>
