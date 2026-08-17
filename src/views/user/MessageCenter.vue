<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="top">
        <h3>消息中心</h3>
        <el-button size="small" @click="readAll">全部已读</el-button>
      </div>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <div v-for="m in list" :key="m.messageId" class="msg" :class="{ unread: !m.read }" @click="open(m)">
        <div class="mt"><b>{{ m.title }}</b><span class="time">{{ m.createTime }}</span></div>
        <div class="mc">{{ m.content }}</div>
      </div>
      <el-empty v-if="!list.length" description="暂无消息" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getMyMessages, readMessage, readAllMessages, type MessageItem } from '@/api/message'

const { list, error } = useTable<MessageItem>(() => getMyMessages())

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
