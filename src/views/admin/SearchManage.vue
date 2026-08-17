<template>
  <div class="page-max">
    <el-tabs v-model="tab">
      <el-tab-pane label="搜索日志" name="logs">
        <el-card shadow="never">
          <el-table :data="logs" v-loading="loading" empty-text="暂无搜索日志">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="keyword" label="搜索词" min-width="160" />
            <el-table-column prop="userName" label="用户" width="120" />
            <el-table-column prop="resultCount" label="结果数" width="100" />
            <el-table-column prop="createTime" label="搜索时间" width="180" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="热门搜索" name="hot">
        <el-card shadow="never">
          <el-table :data="hotKeywords" v-loading="loading" empty-text="暂无数据">
            <el-table-column prop="keyword" label="关键词" min-width="200" />
            <el-table-column prop="count" label="搜索次数" width="120" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="索引管理" name="index">
        <el-card shadow="never">
          <div class="index-section">
            <p>重建搜索索引将重新索引所有房源数据，操作可能需要几分钟。</p>
            <el-button type="primary" @click="rebuild" :loading="rebuilding">重建索引</el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { getSearchLogs, getHotKeywords, rebuildIndex, type SearchLog, type HotKeyword } from '@/api/search'

const tab = ref('logs')
const loading = ref(false)
const rebuilding = ref(false)
const logs = ref<SearchLog[]>([])
const hotKeywords = ref<HotKeyword[]>([])

async function loadLogs() {
  loading.value = true
  const r = await safe(getSearchLogs(), { list: [], total: 0 })
  logs.value = r.data?.list ?? []
  loading.value = false
}

async function loadHot() {
  loading.value = true
  const r = await safe(getHotKeywords(), { list: [], total: 0 })
  hotKeywords.value = r.data?.list ?? []
  loading.value = false
}

async function rebuild() {
  rebuilding.value = true
  const r = await safe(rebuildIndex(), {})
  rebuilding.value = false
  if (okRes(r)) ElMessage.success('索引重建完成')
  else ElMessage.error(msgOf(r))
}

watch(tab, (v) => {
  if (v === 'logs') loadLogs()
  else if (v === 'hot') loadHot()
})

onMounted(loadLogs)
</script>

<style scoped>
.index-section { padding: 20px 0; text-align: center; }
.index-section p { margin-bottom: 16px; color: var(--el-text-color-secondary); }
</style>
