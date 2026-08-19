$content = @'
<template>
  <div class="page-max">
    <div class="toolbar">
      <h3>我的房源</h3>
      <div class="actions" v-if="selected.length">
        <span class="selected-count">已选 {{ selected.length }} 套</span>
        <el-button size="small" @click="batchDown">批量下架</el-button>
        <el-button size="small" type="danger" plain @click="batchDelete">批量删除</el-button>
        <el-button size="small" @click="batchExport">导出选中</el-button>
      </div>
      <router-link to="/landlord/publish" style="margin-left: auto">
        <el-button type="primary">+ 发布新房源</el-button>
      </router-link>
    </div>

    <el-card shadow="never" class="card">
      <div class="filters">
        <el-input v-model="kw" placeholder="搜索房源标题" :prefix-icon="Search" clearable class="kw" />
        <el-select v-model="statusFilter" placeholder="全部状态" clearable class="sf">
          <el-option label="可租" value="可租" />
          <el-option label="已租" value="已租" />
          <el-option label="待审核" value="待审核" />
          <el-option label="已下架" value="已下架" />
          <el-option label="违规" value="违规" />
        </el-select>
      </div>

      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" stripe v-loading="loading" @selection-change="handleSelection">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="房源标题" min-width="180" />
        <el-table-column prop="district" label="区域" width="90" />
        <el-table-column prop="layout" label="户型" width="90" />
        <el-table-column label="租金" width="100">
          <template #default="{ row }"><span class="price">¥{{ row.price }}</span>/月</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="70" />
        <el-table-column prop="collectCount" label="收藏" width="70" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="goDetail(row)">查看</el-button>
            <el-button
              v-if="row.status === '可租'"
              text
              type="warning"
              size="small"
              @click="toggleStatus(row, '已下架')"
            >下架</el-button>
            <el-button
              v-if="row.status === '已下架'"
              text
              type="primary"
              size="small"
              @click="toggleStatus(row, '可租')"
            >上架</el-button>
            <el-button text type="danger" size="small" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!list.length" description="没有符合条件的房源" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLandlordStore } from '@/store/landlord'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getLandlordHouses, deleteHouse, updateLandlordHouseStatus } from '@/api/house'
import type { House } from '@/mock/data'
import { statusTag } from '@/utils/status'

const landlord = useLandlordStore()
const router = useRouter()
const kw = ref('')
const statusFilter = ref('')
// API-first + store 回退：内存库里的「我的房源」（含新发布）实时可用
const { list: all, loading, error, reload } = useTable<House>(() => getLandlordHouses())

const selected = ref<House[]>([])

const list = computed(() =>
  all.value.filter(
    (h) =>
      (!kw.value || h.title.includes(kw.value)) &&
      (!statusFilter.value || h.status === statusFilter.value)
  )
)

function handleSelection(rows: House[]) {
  selected.value = rows
}

function statusType(s: string) {
  return statusTag('house', s)
}
function goDetail(row: House) {
  router.push('/detail/' + row.id)
}
async function remove(row: House) {
  try {
    await ElMessageBox.confirm('确认删除房源「' + row.title + '」？', '提示', { type: 'warning' })
  } catch {
    return
  }
  const r = await safe(deleteHouse(row.id), null)
  if (r.code !== 0) landlord.removeHouse(row.id) // 回退本地 store
  ElMessage.success('已删除')
  reload()
}
async function toggleStatus(row: House, status: string) {
  const r = await safe(updateLandlordHouseStatus(row.id, status), null)
  if (r.code !== 0) landlord.setStatus(row.id, status as House['status']) // 回退本地 store
  reload()
}

// 批量操作
function batchDown() {
  batchOperation('已下架')
}
function batchDelete() {
  ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 套房源？`, '确认删除', { type: 'warning' })
    .then(async () => {
      for (const row of selected.value) {
        const r = await safe(deleteHouse(row.id), null)
        if (r.code !== 0) landlord.removeHouse(row.id)
      }
      ElMessage.success('已删除')
      selected.value = []
      reload()
    })
    .catch(() => {})
}
function batchOperation(status: string) {
  ElMessageBox.confirm(`确定将选中的 ${selected.value.length} 套房源设为「${status}」？`, '确认操作', { type: 'info' })
    .then(async () => {
      for (const row of selected.value) {
        await safe(updateLandlordHouseStatus(row.id, status), null)
      }
      ElMessage.success('操作成功')
      selected.value = []
      reload()
    })
    .catch(() => {})
}
function batchExport() {
  const csvContent = selected.value.map(h =>
    `${h.id},${h.title},${h.district},${h.layout},${h.area},${h.price},${h.status}`
  ).join('\n')
  const blob = new Blob([`ID,标题,区域,户型,面积,租金,状态\n${csvContent}`], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '房源导出.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.toolbar h3 {
  margin: 0;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.selected-count {
  color: var(--sub);
  font-size: 13px;
}
.card {
  border-radius: 12px;
}
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}
.kw {
  width: 240px;
}
.price {
  color: var(--orange);
  font-weight: 700;
}
</style>
'@
$content | Out-File -FilePath 'D:\Project\rent-deploy\src\views\landlord\MyHouses.vue' -Encoding UTF8
Write-Host 'MyHouses.vue fixed with batch operations'
