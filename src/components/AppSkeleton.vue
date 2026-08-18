<template>
  <div class="sk" :class="{ block }">
    <div v-if="avatar" class="sk-avatar"></div>
    <div class="sk-lines">
      <div v-for="n in rows" :key="n" class="sk-line" :style="{ width: lineWidth(n) }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    rows?: number
    avatar?: boolean
    block?: boolean
  }>(),
  { rows: 3, avatar: false, block: false }
)

// 首行短、末行短，模拟真实文案排布
function lineWidth(n: number) {
  const total = props.rows
  if (n === 1) return '58%'
  if (n === total) return '42%'
  return '92%'
}
</script>

<style scoped>
.sk {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}
.sk.block {
  display: block;
}
.sk-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--line);
  flex-shrink: 0;
}
.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  justify-content: center;
}
.sk-line {
  height: 12px;
  border-radius: 6px;
  background: var(--line);
}
.sk-avatar,
.sk-line {
  animation: sk-pulse 1.2s ease-in-out infinite;
}
@keyframes sk-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sk-avatar,
  .sk-line {
    animation: none;
  }
}
</style>
