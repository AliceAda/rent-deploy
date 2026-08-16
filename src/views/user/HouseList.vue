<template>
  <div class="page-max">
    <el-row :gutter="18">
      <!-- 筛选侧栏 -->
      <el-col :xs="24" :sm="8" :md="6">
        <el-card class="filters" shadow="never">
          <el-form label-position="top">
            <el-form-item label="租赁方式">
              <el-radio-group v-model="f.rent">
                <el-radio-button label="全部" value="全部" />
                <el-radio-button label="整租" value="整租" />
                <el-radio-button label="合租" value="合租" />
                <el-radio-button label="公寓" value="公寓" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="户型">
              <el-select v-model="f.type" placeholder="不限" style="width: 100%">
                <el-option label="不限" value="" />
                <el-option label="1室" value="1室" />
                <el-option label="2室" value="2室" />
                <el-option label="3室" value="3室" />
              </el-select>
            </el-form-item>
            <el-form-item label="朝向">
              <el-select v-model="f.ori" placeholder="不限" style="width: 100%">
                <el-option label="不限" value="" />
                <el-option label="南" value="南" />
                <el-option label="北" value="北" />
                <el-option label="东" value="东" />
                <el-option label="西" value="西" />
              </el-select>
            </el-form-item>
            <el-form-item label="月租金上限：{{ f.price >= 15000 ? '不限' : f.price + '元' }}">
              <el-slider v-model="f.price" :min="1500" :max="15000" :step="500" />
            </el-form-item>
            <el-form-item label="配套">
              <el-checkbox-group v-model="f.fac">
                <el-checkbox label="电梯" value="电梯" />
                <el-checkbox label="燃气" value="燃气" />
                <el-checkbox label="宠物" value="宠物" />
                <el-checkbox label="车位" value="车位" />
              </el-checkbox-group>
            </el-form-item>
            <el-button type="primary" plain style="width: 100%" @click="reset">重置筛选</el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 主内容 -->
      <el-col :xs="24" :sm="16" :md="18">
        <div class="list-head">
          <div class="count text-sub">共 {{ filtered.length }} 套房源</div>
          <div class="right">
            <el-radio-group v-model="sort" size="small">
              <el-radio-button label="综合" value="default" />
              <el-radio-button label="价格↑" value="priceAsc" />
              <el-radio-button label="价格↓" value="priceDesc" />
              <el-radio-button label="面积↓" value="areaDesc" />
            </el-radio-group>
            <el-switch
              v-model="mapMode"
              inline-prompt
              active-text="地图"
              inactive-text="列表"
              style="margin-left: 12px"
              @change="onMapToggle"
            />
          </div>
        </div>

        <!-- 列表视图 -->
        <el-row v-show="!mapMode" :gutter="14">
          <el-col v-for="h in filtered" :key="h.id" :xs="24" :sm="12" :md="8">
            <HouseCard :house="h" @open="openDetail" @fav="store.toggleCollect(h.id)" />
          </el-col>
          <el-col v-if="!filtered.length" :span="24">
            <el-empty description="没有符合条件的房源，试试放宽筛选" />
          </el-col>
        </el-row>

        <!-- 地图找房视图 -->
        <div v-show="mapMode" class="map-wrap">
          <div class="map" @click.self="active = null">
            <div class="map-grid"></div>
            <span v-for="d in districts" :key="d.name" class="district" :style="d.style">{{ d.name }}</span>
            <button
              v-for="h in filtered"
              :key="h.id"
              class="marker"
              :class="{ on: active === h.id }"
              :style="{ left: h.x + '%', top: h.y + '%' }"
              @click.stop="active = h.id"
            >
              ¥{{ h.price }}
            </button>
            <!-- 选中气泡 -->
            <div v-if="activeHouse" class="popup" :style="{ left: activeHouse.x + '%', top: activeHouse.y + '%' }">
              <div class="pt">{{ activeHouse.title }}</div>
              <div class="pp">¥{{ activeHouse.price }}/月 · {{ activeHouse.layout }}</div>
              <el-button size="small" type="primary" @click="openDetail(activeHouse.id)">查看详情</el-button>
            </div>
          </div>
          <div class="map-tip text-sub">🗺️ 模拟地图（坐标归一化）。真实项目替换为高德/百度 JS API，房源随视野聚合打点、周边配套联动。</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import HouseCard from '@/components/HouseCard.vue'
import type { House } from '@/mock/data'

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const mapMode = ref(false)
const active = ref<number | null>(null)
const sort = ref('default')
const kw = ref('')

const f = reactive({ rent: '全部', type: '', ori: '', price: 15000, fac: [] as string[] })

// 接收来自首页 / 顶栏搜索的 query（关键词 q、租赁方式 rent），进入列表即预筛选
function loadQuery() {
  const q = (route.query.q as string) || ''
  const r = (route.query.rent as string) || ''
  if (q) kw.value = q
  if (r && ['全部', '整租', '合租', '公寓'].includes(r)) f.rent = r
}
onMounted(loadQuery)
watch(() => route.query, loadQuery)

const districts = [
  { name: '朝阳区', style: { left: '68%', top: '34%' } },
  { name: '昌平区', style: { left: '42%', top: '16%' } },
  { name: '海淀区', style: { left: '28%', top: '56%' } },
  { name: '大兴区', style: { left: '62%', top: '76%' } }
]

const filtered = computed(() => {
  const q = kw.value.trim().toLowerCase()
  let arr = store.publicHouses.filter(
    (h) =>
      (f.rent === '全部' || h.rentType === f.rent) &&
      (!f.type || h.layout.startsWith(f.type)) &&
      (!f.ori || h.orientation.includes(f.ori)) &&
      (f.price >= 15000 || h.price <= f.price) &&
      f.fac.every((x) => h.facilities.includes(x)) &&
      (!q || h.title.toLowerCase().includes(q) || h.district.toLowerCase().includes(q))
  )
  if (sort.value === 'priceAsc') arr = [...arr].sort((a, b) => a.price - b.price)
  if (sort.value === 'priceDesc') arr = [...arr].sort((a, b) => b.price - a.price)
  if (sort.value === 'areaDesc') arr = [...arr].sort((a, b) => b.area - a.area)
  return arr
})

const activeHouse = computed<House | undefined>(() => store.publicHouses.find((h) => h.id === active.value))

function reset() {
  f.rent = '全部'
  f.type = ''
  f.ori = ''
  f.price = 15000
  f.fac = []
}
function onMapToggle(v: boolean) {
  if (v) active.value = null
}
function openDetail(id: number) {
  router.push('/detail/' + id)
}
</script>

<style scoped>
.filters {
  position: sticky;
  top: 78px;
}
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.right {
  display: flex;
  align-items: center;
}
.map-wrap {
  border-radius: 14px;
  overflow: hidden;
}
.map {
  position: relative;
  height: 520px;
  background: linear-gradient(180deg, #eef4ff, #f6f9ff);
  border: 1px solid var(--line);
}
.map-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.6;
}
.district {
  position: absolute;
  transform: translate(-50%, -50%);
  color: #9aa6b8;
  font-weight: 700;
  font-size: 13px;
  pointer-events: none;
}
.marker {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--brand);
  color: #fff;
  border: 2px solid #fff;
  border-radius: 14px;
  padding: 3px 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(47, 111, 237, 0.4);
  z-index: 2;
}
.marker.on {
  background: var(--orange);
  z-index: 3;
}
.popup {
  position: absolute;
  transform: translate(-50%, calc(-100% - 14px));
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  width: 200px;
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.14);
  z-index: 5;
}
.popup .pt {
  font-weight: 600;
  font-size: 13px;
}
.popup .pp {
  color: var(--orange);
  font-weight: 700;
  margin: 4px 0 8px;
  font-size: 13px;
}
.map-tip {
  margin-top: 10px;
  font-size: 12px;
}
</style>
