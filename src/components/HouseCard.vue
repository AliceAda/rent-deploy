<template>
  <div class="card" @click="$emit('open', house.id)">
    <div class="img" :style="{ background: grads[house.id % 4] }">
      {{ house.district }} · {{ house.layout }}
      <span class="badge">{{ house.rentType }}</span>
      <span class="fav" @click.stop="$emit('fav', house.id)">
        {{ store.isCollected(house.id) ? '♥' : '♡' }}
      </span>
    </div>
    <div class="body">
      <div class="price">¥{{ house.price }} <span>/月</span></div>
      <div class="ttl">{{ house.title }}</div>
      <div class="meta">{{ house.area }}㎡ · {{ house.orientation }} · {{ house.decoration }} · {{ house.district }}</div>
      <div class="tags">
        <el-tag v-for="t in house.tags" :key="t" size="small" type="primary" effect="light">{{ t }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store'
import type { House } from '@/mock/data'

defineProps<{ house: House }>()
defineEmits<{ (e: 'open', id: number): void; (e: 'fav', id: number): void }>()

const store = useAppStore()
const grads = [
  'linear-gradient(135deg,#2F6FED,#5a86ff)',
  'linear-gradient(135deg,#FF7D3C,#ff9a6b)',
  'linear-gradient(135deg,#1aa86a,#5fd6a0)',
  'linear-gradient(135deg,#7a5af0,#a98bff)'
]
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.06);
  cursor: pointer;
  transition: 0.18s;
  margin-bottom: 14px;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(16, 24, 40, 0.1);
}
.img {
  height: 150px;
  position: relative;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
}
.fav {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: var(--orange);
}
.body {
  padding: 12px 14px;
}
.price {
  color: var(--orange);
  font-weight: 800;
  font-size: 18px;
}
.price span {
  font-size: 12px;
  color: var(--sub);
  font-weight: 400;
}
.ttl {
  font-weight: 600;
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meta {
  color: var(--sub);
  font-size: 12px;
}
.tags {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
