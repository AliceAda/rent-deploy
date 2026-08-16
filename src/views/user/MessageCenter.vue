<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="top">
        <h3>消息中心</h3>
        <el-button size="small" @click="readAll">全部已读</el-button>
      </div>
      <div v-for="m in list" :key="m.messageId" class="msg" :class="{ unread: !m.read }" @click="open(m)">
        <div class="mt"><b>{{ m.title }}</b><span class="time">{{ m.createTime }}</span></div>
        <div class="mc">{{ m.content }}</div>
      </div>
      <el-empty v-if="!list.length" description="暂无消息" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getMyMessages, readMessage, readAllMessages, type MessageItem } from '@/api/message'

const list = ref<MessageItem[]>([])

async function load() {
  const r = await safe(getMyMessages(), { list: [], total: 0 })
  list.value = r.data?.list ?? []
}
async function open(m: MessageItem) {
  if (m.read) return
  await safe(readMessage(m.messageId), {})
  m.read = true
}
async function readAll() {
  await safe(readAllMessages(), {})
  list.value.forEach((m) => (m.read = true))
  ElMessage.success('已标记全部已读')
}
onMounted(load)
</script>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.msg {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.msg.unread {
  background: #f5f8ff;
}
.msg .mt {
  display: flex;
  justify-content: space-between;
}
.msg .time {
  color: var(--sub);
  font-size: 12px;
}
.msg .mc {
  color: var(--sub);
  margin-top: 4px;
}
</style>
