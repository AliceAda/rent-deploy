<template>
  <div class="page-max">
    <el-card shadow="never" style="margin-bottom: 16px">
      <h3>我的积分</h3>
      <div class="pt">当前积分：<b>{{ info.points }}</b> · 等级：{{ info.level || '—' }}</div>
      <el-progress :percentage="Math.min(100, (info.points % 1000) / 10)" :format="() => info.points + ' / 1000'" style="margin-top: 10px" />
    </el-card>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { safe } from '@/api/http'
import { getMyPoints, getMyCoupons, type PointsInfo, type CouponItem } from '@/api/points'

const info = ref<PointsInfo>({ points: 0, level: '' })
const coupons = ref<CouponItem[]>([])

async function load() {
  const p = await safe(getMyPoints(), { points: 0, level: '' })
  info.value = p.data ?? { points: 0, level: '' }
  const c = await safe(getMyCoupons(), { list: [], total: 0 })
  coupons.value = c.data?.list ?? []
}
onMounted(load)
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
</style>
