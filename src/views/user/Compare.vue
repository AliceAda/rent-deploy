<template>
  <div class="page-max">
    <div class="top">
      <div>
        <h3>房源对比</h3>
        <p class="sub">最多对比 3 套，从找房页 / 收藏页点击卡片右上角「＋」加入对比篮</p>
      </div>
      <el-button v-if="list.length" plain type="danger" @click="clearCompare()">清空对比</el-button>
    </div>

    <el-empty v-if="!loading && !list.length" description="对比篮还是空的">
      <router-link to="/list">
        <el-button type="primary">去找房，勾选 2-3 套对比</el-button>
      </router-link>
    </el-empty>

    <div v-if="list.length" v-loading="loading" class="cmp-wrap">
      <div class="cmp-table">
        <div class="row head">
          <div class="cell k">房源</div>
          <div class="cell" v-for="h in list" :key="h.id">
            <div class="c-cover" :style="{ backgroundImage: houseCover(h.id) }"></div>
            <div class="c-title">{{ h.title }}</div>
            <el-button size="small" text type="danger" @click="toggleCompare(h.id)">移除</el-button>
          </div>
        </div>
        <div class="row" v-for="k in ROWS" :key="k.key" :class="{ hl: k.key === 'price' }">
          <div class="cell k">{{ k.label }}</div>
          <div class="cell" v-for="h in list" :key="h.id">
            <template v-if="k.key === 'price'"><span class="price mono">¥{{ h.price }}</span>/月</template>
            <template v-else-if="k.key === 'facilities' || k.key === 'tags'">
              <span v-if="cellOf(h, k.key).length" class="chips">
                <el-tag v-for="x in cellOf(h, k.key)" :key="x" size="small" effect="plain">{{ x }}</el-tag>
              </span>
              <span v-else class="empty">—</span>
            </template>
            <template v-else>
              <span :class="{ empty: !cellOf(h, k.key) }">{{ cellOf(h, k.key) || '—' }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { resolveHouse } from '@/utils/house'
import { houseCover } from '@/utils/houseImg'
import { getCompareIds, toggleCompare, clearCompare, COMPARE_CHANGE } from '@/utils/compare'
import type { House } from '@/mock/data'

const ROWS: { key: string; label: string }[] = [
  { key: 'price', label: '月租金' },
  { key: 'district', label: '区域' },
  { key: 'layout', label: '户型' },
  { key: 'area', label: '面积' },
  { key: 'orientation', label: '朝向' },
  { key: 'floor', label: '楼层' },
  { key: 'decoration', label: '装修' },
  { key: 'rentType', label: '租法' },
  { key: 'depositType', label: '押金' },
  { key: 'facilities', label: '配套' },
  { key: 'tags', label: '标签' },
  { key: 'description', label: '描述' }
]

const list = ref<House[]>([])
const loading = ref(false)

function cellOf(h: House, key: string): string | string[] {
  const v = (h as unknown as Record<string, unknown>)[key]
  if (Array.isArray(v)) return v as string[]
  if (key === 'area') return (Number(v) || 0) + '㎡'
  return v == null || v === '' ? '' : String(v)
}

async function load() {
  const ids = getCompareIds()
  if (!ids.length) {
    list.value = []
    return
  }
  loading.value = true
  const rows = await Promise.all(ids.map((id) => resolveHouse(id)))
  list.value = rows.filter((x): x is House => !!x)
  loading.value = false
}

function onCompareChange() {
  load()
}

onMounted(() => {
  load()
  window.addEventListener(COMPARE_CHANGE, onCompareChange)
})
onBeforeUnmount(() => window.removeEventListener(COMPARE_CHANGE, onCompareChange))
</script>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;
}
.sub {
  color: var(--sub);
  margin: 0;
}
.cmp-wrap {
  overflow-x: auto;
}
.cmp-table {
  min-width: 720px;
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.row {
  display: grid;
  grid-template-columns: 96px repeat(var(--cols, 2), 1fr);
}
.row:not(.head) {
  border-top: 1px solid var(--line);
}
.row.hl {
  background: var(--brand-s);
}
.row.head {
  background: var(--panel);
}
.cell {
  padding: 10px 12px;
  border-left: 1px solid var(--line);
  font-size: 13px;
  word-break: break-word;
}
.cell:first-child {
  border-left: none;
}
.cell.k {
  color: var(--sub);
  font-size: 12px;
  background: var(--panel);
  font-weight: 600;
}
.c-cover {
  height: 84px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  background-color: #dfe6ee;
  margin-bottom: 6px;
}
.c-title {
  font-weight: 600;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
}
.price {
  color: var(--orange);
  font-weight: 700;
  font-size: 17px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.empty {
  color: var(--sub);
}
</style>
