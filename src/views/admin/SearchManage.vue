<template>
  <div class="page-max">
    <el-tabs v-model="tab">
      <el-tab-pane label="搜索日志" name="logs">
        <el-card shadow="never">
          <el-alert v-if="logsError" type="warning" :title="'加载失败：' + logsError" show-icon :closable="false" style="margin-bottom: 12px" />
          <el-table :data="logs" v-loading="logsLoading" empty-text="暂无搜索日志">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="keyword" label="搜索词" min-width="160" />
            <el-table-column prop="userName" label="用户" width="120" />
            <el-table-column prop="resultCount" label="结果数" width="100" />
            <el-table-column prop="createTime" label="搜索时间" width="180" />
          </el-table>
          <el-pagination
            v-if="logsTotal > logsSize"
            style="margin-top: 12px; justify-content: flex-end"
            layout="total, prev, pager, next"
            :total="logsTotal"
            :page-size="logsSize"
            :current-page="logsPage"
            @current-change="logsSetPage"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="热门搜索" name="hot">
        <el-card shadow="never">
          <el-alert v-if="hotError" type="warning" :title="'加载失败：' + hotError" show-icon :closable="false" style="margin-bottom: 12px" />
          <el-table :data="hotKeywords" v-loading="hotLoading" empty-text="暂无数据">
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
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getSearchLogs, getHotKeywords, rebuildIndex, type SearchLog, type HotKeyword } from '@/api/search'

const tab = ref('logs')
const rebuilding = ref(false)
const { list: logs, loading: logsLoading, error: logsError, reload: reloadLogs, total: logsTotal, page: logsPage, size: logsSize, setPage: logsSetPage, setSize: logsSetSize } =
  useTable<SearchLog>(({ page, size }) => getSearchLogs(page, size), { pageSize: 10 })
const { list: hotKeywords, loading: hotLoading, error: hotError, reload: reloadHot } =
  useTable<HotKeyword>(() => getHotKeywords(), { immediate: false })

async function rebuild() {
  rebuilding.value = true
  const r = await safe(rebuildIndex(), {})
  rebuilding.value = false
  if (okRes(r)) ElMessage.success('索引重建完成')
  else ElMessage.error(msgOf(r))
}

watch(tab, (v) => {
  if (v === 'logs') reloadLogs()
  else if (v === 'hot') reloadHot()
})
</script>

<style scoped>
.index-section { padding: 20px 0; text-align: center; }
.index-section p { margin-bottom: 16px; color: var(--el-text-color-secondary); }
</style>
