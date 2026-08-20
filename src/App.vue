<template>
  <router-view />
  <!-- 全局聊天窗口组件 -->
  <ChatWidget />
</template>

<script setup lang="ts">
import ChatWidget from '@/components/ChatWidget.vue'
</script>
