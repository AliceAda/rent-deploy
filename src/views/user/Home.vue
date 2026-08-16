<template>
  <div class="page-max">
    <!-- Hero -->
    <section class="hero">
      <h1>在{{ store.city }}，找到你的下一处家</h1>
      <p>真实房源 · 在线签约 · 租金透明，三步完成找房到入住</p>
      <el-input v-model="kw" placeholder="想租哪？试试「望京」「10号线」" class="hero-search" @keyup.enter="goList">
        <template #append><el-button type="warning" @click="goList">找房</el-button></template>
      </el-input>
      <div class="cats">
        <el-button round @click="quick('整租')">🏠 整租</el-button>
        <el-button round @click="quick('合租')">🚪 合租</el-button>
        <el-button round @click="quick('公寓')">🏢 公寓</el-button>
        <el-button round @click="goList">🗺️ 地图找房</el-button>
        <el-button round @click="goList">🔥 毕业季特惠</el-button>
      </div>
    </section>

    <h2 class="sec-title">精选房源 <small class="text-sub">运营位 · 按综合权重排序</small></h2>
    <el-row :gutter="16">
      <el-col v-for="h in featured" :key="h.id" :xs="24" :sm="12" :md="6">
        <HouseCard :house="h" @open="openDetail" @fav="store.toggleCollect(h.id)" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import HouseCard from '@/components/HouseCard.vue'

const store = useAppStore()
const router = useRouter()
const kw = ref('')
const featured = computed(() => store.publicHouses.slice(0, 4))

function openDetail(id: number) {
  router.push('/detail/' + id)
}
function goList() {
  if (kw.value.trim()) router.push({ path: '/list', query: { q: kw.value.trim() } })
  else router.push('/list')
}
function quick(rent: string) {
  const query: Record<string, string> = { rent }
  const q = kw.value.trim()
  if (q) query.q = q
  router.push({ path: '/list', query })
}
</script>

<style scoped>
.hero {
  background: linear-gradient(120deg, #2F6FED, #5a86ff);
  border-radius: 20px;
  padding: 34px 32px;
  color: #fff;
  margin-bottom: 26px;
}
.hero h1 {
  font-size: 26px;
  margin: 0 0 6px;
}
.hero p {
  opacity: 0.9;
  margin: 0 0 18px;
}
.hero-search {
  max-width: 640px;
}
.cats {
  margin-top: 22px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.cats :deep(.el-button) {
  background: rgba(255, 255, 255, 0.16);
  border-color: transparent;
  color: #fff;
  backdrop-filter: blur(4px);
}
.cats :deep(.el-button):hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}
.sec-title {
  font-size: 18px;
  font-weight: 700;
  margin: 6px 0 14px;
}
</style>
