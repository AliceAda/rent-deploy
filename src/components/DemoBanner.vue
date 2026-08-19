<template>
  <el-alert
    type="warning"
    show-icon
    :closable="false"
    class="demo-banner"
    :title="title"
    :description="description"
  />
</template>

<script setup lang="ts">
// 统一的「演示数据」警示条：后端接口未就绪时回退本地数据，来源透明
defineProps<{ title: string; description?: string }>()
</script>

<style scoped>
.demo-banner {
  margin-bottom: 14px;
}
</style>
