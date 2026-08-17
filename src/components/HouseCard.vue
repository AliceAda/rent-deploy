<template>
  <div class="card" @click="$emit('open', house.id)">
    <!-- 档案封面：房源插画图 + 门牌编号 + 朱砂印 -->
    <div class="cover" :style="{ backgroundImage: houseCover(props.house.id) }">
      <span class="no mono">NO.{{ String(house.id).padStart(4, '0') }}</span>
      <span class="fav" @click.stop="$emit('fav', house.id)">
        {{ store.isCollected(house.id) ? '♥' : '♡' }}
      </span>
      <span class="cmp" :class="{ on: compareOn }" @click.stop="onCompare">
        {{ compareOn ? '✓' : '＋' }}
      </span>
      <div class="cover-main">
        <div class="cover-dist serif">{{ house.district }}</div>
        <div class="cover-meta">{{ house.rentType }} · {{ house.layout }}</div>
      </div>
      <span v-if="house.grade >= 4.6" class="seal sm">已验</span>
    </div>
    <div class="body">
      <div class="ttl">{{ house.title }}</div>
      <div class="meta mono">{{ house.area }}㎡ · {{ house.orientation }} · {{ house.decoration }}</div>
      <div class="tags">
        <el-tag v-for="t in house.tags" :key="t" size="small" type="primary" effect="light">{{ t }}</el-tag>
      </div>
      <div class="price-row">
        <span class="price mono">¥{{ house.price }}<i>/月</i></span>
        <span class="views text-sub">{{ house.views }} 看过</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store'
import { houseCover } from '@/utils/houseImg'
import { isCompare, toggleCompare, COMPARE_CHANGE, COMPARE_MAX } from '@/utils/compare'
import type { House } from '@/mock/data'

const props = defineProps<{ house: House }>()
defineEmits<{ (e: 'open', id: number): void; (e: 'fav', id: number): void }>()

const store = useAppStore()

// 对比篮（上限 3，sessionStorage 持久化）
const compareOn = ref(isCompare(props.house.id))
function onCompare() {
  const r = toggleCompare(props.house.id)
  compareOn.value = isCompare(props.house.id)
  if (r === 'full') ElMessage.warning(`最多对比 ${COMPARE_MAX} 套房源`)
}
function syncCompare() {
  compareOn.value = isCompare(props.house.id)
}
onMounted(() => window.addEventListener(COMPARE_CHANGE, syncCompare))
onBeforeUnmount(() => window.removeEventListener(COMPARE_CHANGE, syncCompare))
</script>

<style scoped>
.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(28, 36, 48, 0.05);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  margin-bottom: 14px;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(28, 36, 48, 0.1);
  border-color: var(--brand);
}
/* 档案封面 */
.cover {
  height: 128px;
  position: relative;
  color: #fff;
  padding: 12px 14px;
  background-color: #dfe6ee;
  background-size: cover;
  background-position: center;
}
.no {
  position: absolute;
  top: 10px;
  left: 14px;
  color: #9aa3b2;
  font-size: 11px;
  letter-spacing: 0.12em;
}
.fav {
  position: absolute;
  top: 8px;
  right: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2329;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  cursor: pointer;
}
.cmp {
  position: absolute;
  top: 42px;
  right: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2329;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  cursor: pointer;
  font-weight: 700;
  border: 1px solid var(--line);
}
.cmp.on {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}
.cover-main {
  position: absolute;
  left: 14px;
  bottom: 12px;
}
.cover-dist {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}
.cover-meta {
  font-size: 12px;
  color: #9aa3b2;
  margin-top: 2px;
}
/* 朱砂印：仅高评分房源盖「已验」章 */
.cover .seal.sm {
  position: absolute;
  right: 14px;
  bottom: 12px;
}
.body {
  padding: 12px 14px 10px;
}
.ttl {
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}
.meta {
  color: var(--sub);
  font-size: 11px;
  margin-top: 3px;
  letter-spacing: 0.02em;
}
.tags {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 8px;
  border-top: 1px dashed var(--line);
  padding-top: 8px;
}
.price {
  color: var(--orange);
  font-weight: 700;
  font-size: 18px;
}
.price i {
  font-style: normal;
  font-size: 12px;
  color: var(--sub);
  font-weight: 400;
}
.views {
  font-size: 11px;
}
</style>
