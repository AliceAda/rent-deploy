<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>我的收藏</h3>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <div v-loading="loading">
        <div v-if="list.length" class="fav-grid">
          <div v-for="item in list" :key="item.id" class="fav-card" @click="goDetail(item.id)">
            <img v-if="item.coverImage" :src="item.coverImage" class="cover" />
            <div v-else class="cover placeholder">暂无图片</div>
            <div class="info">
              <div class="title">{{ item.title }}</div>
              <div class="meta">{{ item.city }} · {{ item.district }} · {{ item.layout }}</div>
              <div class="bottom">
                <span class="price">¥{{ item.price }}/月</span>
                <el-button type="danger" text size="small" @click.stop="remove(item.id)">取消收藏</el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无收藏" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getMyCollects, removeCollect, type HouseItem } from '@/api/house'

const router = useRouter()
const { list, loading, error } = useTable<HouseItem>(() => getMyCollects())

function goDetail(id: number) {
  router.push(`/detail/${id}`)
}

async function remove(id: number) {
  const r = await safe(removeCollect(id), {})
  if (r.code === 0) {
    ElMessage.success('已取消收藏')
    list.value = list.value.filter((i) => i.id !== id)
  } else {
    ElMessage.error(r.message || '操作失败')
  }
}
</script>

<style scoped>
.fav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.fav-card { border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s; }
.fav-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.cover { width: 100%; height: 140px; object-fit: cover; display: block; }
.cover.placeholder { display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: var(--el-text-color-placeholder); font-size: 13px; }
.info { padding: 10px 12px; }
.title { font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { font-size: 12px; color: var(--el-text-color-secondary); margin: 4px 0; }
.bottom { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-weight: 600; font-size: 14px; }
</style>
