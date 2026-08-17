<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>浏览历史</h3>
        <el-button type="danger" text @click="clearAll" :disabled="!list.length">清空历史</el-button>
      </div>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <div v-loading="loading">
        <div v-if="list.length" class="history-grid">
          <div v-for="item in list" :key="item.id" class="history-card" @click="goDetail(item.houseId)">
            <img v-if="item.coverImage" :src="item.coverImage" class="cover" />
            <div v-else class="cover placeholder">暂无图片</div>
            <div class="info">
              <div class="title">{{ item.title }}</div>
              <div class="meta">{{ item.city }} · {{ item.district }}</div>
              <div class="bottom">
                <span class="price">¥{{ item.price }}/月</span>
                <span class="time">{{ item.viewTime }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无浏览记录" />
      </div>
      <el-pagination
        v-if="total > size"
        style="margin-top: 12px; justify-content: flex-end"
        layout="total, prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="setPage"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable } from '@/composables/useTable'
import { getBrowseHistory, type BrowseHistoryItem } from '@/api/house'

const router = useRouter()
const { list, loading, error, reload, total, page, size, setPage, setSize } =
  useTable<BrowseHistoryItem>(({ page, size }) => getBrowseHistory(page, size), { pageSize: 10 })

function goDetail(id: number) {
  router.push(`/detail/${id}`)
}

async function clearAll() {
  await ElMessageBox.confirm('确认清空所有浏览历史？', '提示', { type: 'warning' })
  list.value = []
  ElMessage.success('已清空')
}
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.history-card { border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s; }
.history-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.cover { width: 100%; height: 140px; object-fit: cover; display: block; }
.cover.placeholder { display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: var(--el-text-color-placeholder); font-size: 13px; }
.info { padding: 10px 12px; }
.title { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { font-size: 12px; color: var(--el-text-color-secondary); margin: 4px 0; }
.bottom { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-weight: 600; font-size: 14px; }
.time { font-size: 11px; color: var(--el-text-color-placeholder); }
</style>
