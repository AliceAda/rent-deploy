$content = @'
<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>写评价</h3>
      <el-form :model="sel" label-width="90px" style="max-width: 520px">
        <el-form-item label="选择房源">
          <el-select v-model="sel.houseId" filterable placeholder="从我的订单/合同中选，或手动输入" @change="loadReviews">
            <el-option v-for="o in houseOptions" :key="o.houseId" :label="'#' + o.houseId + ' ' + o.title" :value="o.houseId" />
          </el-select>
        </el-form-item>
        <el-form-item label="或输入ID">
          <el-input v-model="manual" placeholder="房源 ID" @keyup.enter="useManual" />
          <el-button size="small" style="margin-left: 8px" @click="useManual">确定</el-button>
        </el-form-item>
      </el-form>

      <template v-if="sel.houseId !== ''">
        <el-divider />
        <div class="avg">综合评分：<el-rate :model-value="avg" disabled /> <b>{{ avg }}</b></div>
        <h4>已有评价</h4>
        <div v-for="r in reviews" :key="r.id" class="rev">
          <div class="rh">
            <b>{{ r.user }}</b>
            <el-rate :model-value="r.score" disabled />
            <span class="time">{{ r.createTime }}</span>
          </div>
          <div class="rc">{{ r.content }}</div>
        </div>
        <el-empty v-if="!reviews.length" description="暂无评价，来抢沙发" />

        <el-divider />
        <h4>我要评价</h4>
        <el-form :model="form" label-width="90px" style="max-width: 520px">
          <el-form-item label="评分"><el-rate v-model="form.score" /></el-form-item>
          <el-form-item label="内容">
            <el-input v-model="form.content" type="textarea" :rows="3" placeholder="说说你的真实体验" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submit">提交评价</el-button>
          </el-form-item>
        </el-form>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getHouseReviews, submitReview, type ReviewItem } from '@/api/house'
import { useUserCenterStore } from '@/store/userCenter'

const center = useUserCenterStore()
const sel = ref<{ houseId: number | '' }>({ houseId: '' })
const manual = ref('')
const reviews = ref<ReviewItem[]>([])
const avg = ref(0)
const form = ref({ score: 5, content: '' })

const houseOptions = computed(() => {
  const map = new Map<number, string>()
  center.orders.forEach((o) => o.houseId && map.set(o.houseId, o.title))
  center.contracts.forEach((c) => c.houseId && map.set(c.houseId, '房源 #' + c.houseId))
  return Array.from(map.entries()).map(([houseId, title]) => ({ houseId, title }))
})

async function loadReviews() {
  if (sel.value.houseId === '') return
  const r = await safe(getHouseReviews(sel.value.houseId), { list: [], total: 0, avgScore: 0 })
  reviews.value = r.data?.list ?? []
  avg.value = r.data?.avgScore ?? 0
}
function useManual() {
  const id = Number(manual.value)
  if (id) {
    sel.value.houseId = id
    loadReviews()
  }
}
async function submit() {
  if (sel.value.houseId === '') return ElMessage.warning('请先选择房源')
  if (!form.value.content) return ElMessage.warning('请填写评价内容')
  const payload = { score: form.value.score, content: form.value.content }
  const r = await safe(submitReview(sel.value.houseId as number, payload), {})
  if (r.code === 0) {
    ElMessage.success('评价已提交')
    form.value = { score: 5, content: '' }
    loadReviews()
  } else {
    ElMessage.error(r.message || '提交失败')
  }
}
onMounted(() => center.loadAll())
</script>

<style scoped>
.avg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.rev {
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.rev .rh {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rev .time {
  color: var(--sub);
  font-size: 12px;
}
.rev .rc {
  color: var(--sub);
  margin-top: 4px;
}
</style>
'@
$content | Out-File -FilePath 'D:\Project\rent-deploy\src\views\user\Review.vue' -Encoding UTF8
Write-Host 'Review.vue fixed'
