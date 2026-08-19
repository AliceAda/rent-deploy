<template>
  <router-view />
  <div v-if="isMock" class="demo-badge" title="当前为演示模式：全部接口由浏览器内存数据库模拟（MSW）。后端就绪后在 .env 设 VITE_USE_MOCK=0 并重新构建，即可切换到真实接口。">
    DEMO · 内存数据
  </div>
  <!-- 全局在线客服浮窗（市面租房网站标配） -->
  <ChatWidget />
</template>

<script setup lang="ts">
// 与 main.ts 同一开关：演示模式（MSW）启用时在角落常驻标记，提示数据来源
const isMock = import.meta.env.VITE_USE_MOCK !== '0'
import ChatWidget from '@/components/ChatWidget.vue'
</script>

<style scoped>
.demo-badge {
  position: fixed;
  left: 10px;
  bottom: 10px;
  z-index: 3000;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--sub);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 3px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  user-select: none;
  pointer-events: none;
}
</style>
