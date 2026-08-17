<template>
  <div class="page-max">
    <!-- Hero：城市住房档案登记面板 -->
    <section class="hero">
      <div class="hero-panel">
        <div class="hero-main">
          <p class="eyebrow">城市住房档案 · {{ store.cityShort }}</p>
          <h1 class="serif">在<em class="city">{{ store.cityShort }}</em>，<br />找到你的下一处家</h1>
          <p class="hero-sub">真实房源 · 在线签约 · 租金透明，三步完成找房到入住</p>
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
        </div>

        <!-- 今日精选档案卡：签名元素所在 -->
        <aside v-if="hero" class="ledger">
          <div class="ledger-head">
            <span class="eyebrow">今日精选 · NO.{{ String(hero.id).padStart(4, '0') }}</span>
            <span class="seal sm">已验</span>
          </div>
          <div class="ledger-title serif">{{ hero.title }}</div>
          <div class="ledger-rows">
            <div class="row">
              <span>区域</span>
              <b>{{ hero.city }} · {{ hero.district }}</b>
            </div>
            <div class="row">
              <span>户型</span>
              <b>{{ hero.layout }} · {{ hero.area }}㎡</b>
            </div>
            <div class="row">
              <span>租金</span>
              <b class="mono price-l">{{ hero.price.toLocaleString() }}<i> /月</i></b>
            </div>
            <div class="row">
              <span>验真</span>
              <b>平台已实地核验</b>
            </div>
          </div>
          <router-link to="/list" class="ledger-link">浏览全部房源 →</router-link>
        </aside>
      </div>
    </section>

    <DemoBanner v-if="isDemo" title="当前为演示房源数据（接口未就绪）" />

    <!-- 服务保障墙（市面平台首页标配信任区） -->
    <section class="promises">
      <div class="promise">
        <span class="p-ico">🛡️</span>
        <div><b>真实房源</b><small>假一赔三 · 实地核验</small></div>
      </div>
      <div class="promise">
        <span class="p-ico">💳</span>
        <div><b>资金托管</b><small>签约支付平台监管</small></div>
      </div>
      <div class="promise">
        <span class="p-ico">🏃</span>
        <div><b>免费带看</b><small>0 中介费 · 预约直达</small></div>
      </div>
      <div class="promise">
        <span class="p-ico">📞</span>
        <div><b>投诉直达</b><small>24h 响应 · 平台兜底</small></div>
      </div>
    </section>

    <!-- 精选房源 -->
    <div class="sec-head">
      <span class="bar"></span>
      <h2 class="serif">精选房源</h2>
      <span class="eyebrow">FEATURED · 运营位按综合权重排序</span>
    </div>
    <el-row :gutter="16" v-loading="loading">
      <el-col v-for="h in featured" :key="h.id" :xs="24" :sm="12" :md="6">
        <HouseCard :house="h" @open="openDetail" @fav="toggleCollect(h.id)" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import HouseCard from '@/components/HouseCard.vue'
import { getHouseList } from '@/api/house'
import { useDataSource } from '@/composables/useDataSource'
import { toBrowseHouse } from '@/utils/house'
import { toggleCollect } from '@/utils/collect'
import DemoBanner from '@/components/DemoBanner.vue'
import type { House } from '@/mock/data'

const store = useAppStore()
const router = useRouter()
const kw = ref('')

// API-first + mock 回退：接口就绪用真实房源，未就绪回退本地演示数据
// 注意：解构出顶层 ref（模板才能自动解包），用法与 useTable 一致
const { data: houses, isDemo, loading, load } = useDataSource<House[]>(
  async () => {
    const r = await getHouseList()
    return { code: r.code, data: (r.data?.list ?? []).map(toBrowseHouse) }
  },
  store.publicHouses
)
onMounted(() => load())

const featured = computed(() => houses.value.slice(0, 4))
const hero = computed(() => featured.value[0])

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
  margin-bottom: 26px;
}
/* 档案面板：第一版蓝色渐变横幅，白字 + 白底档案卡 */
.hero-panel {
  background: linear-gradient(120deg, #2f6fed, #5a86ff);
  border-radius: 20px;
  padding: 34px 32px;
  color: #fff;
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 28px;
  align-items: center;
}
.hero .eyebrow {
  color: rgba(255, 255, 255, 0.78);
}
.hero h1 {
  font-size: 38px;
  line-height: 1.25;
  margin: 8px 0 4px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
}
.hero h1 em {
  font-style: normal;
  color: var(--orange);
}
.hero-sub {
  color: rgba(255, 255, 255, 0.92);
  margin: 0 0 18px;
}
.hero-search {
  max-width: 640px;
}
.cats {
  margin-top: 18px;
  display: flex;
  gap: 10px;
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

/* 今日精选档案卡（浮于蓝底的白卡） */
.ledger {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  padding: 16px 18px;
}
.ledger-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ledger-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}
.ledger-rows {
  border-top: 1px solid var(--line);
}
.ledger-rows .row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 7px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
}
.ledger-rows .row span {
  color: var(--sub);
  font-size: 12px;
}
.ledger-rows .row b {
  font-weight: 600;
}
.price-l {
  color: var(--orange);
  font-weight: 700;
  font-size: 15px;
}
.price-l i {
  font-style: normal;
  font-size: 12px;
  color: var(--sub);
  font-weight: 400;
}
.ledger-link {
  display: block;
  margin-top: 12px;
  color: var(--brand);
  font-weight: 600;
  font-size: 13px;
}

/* 服务保障墙 */
.promises {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: -6px 0 22px;
}
.promise {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
}
.promise .p-ico {
  font-size: 22px;
}
.promise b {
  display: block;
  font-size: 14px;
}
.promise small {
  color: var(--sub);
  font-size: 11px;
}
@media (max-width: 900px) {
  .hero-panel {
    grid-template-columns: 1fr;
    padding: 24px 20px;
  }
  .hero h1 {
    font-size: 30px;
  }
  .promises {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
