<template>
  <div>
    <el-card shadow="never">
      <el-tabs v-model="tab">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane :label="'待审核 (' + counts.pending + ')'" name="待审核" />
        <el-tab-pane label="已上架" name="可租" />
        <el-tab-pane label="已租" name="已租" />
        <el-tab-pane :label="'违规 (' + counts.violation + ')'" name="违规" />
      </el-tabs>

      <el-table :data="paged" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="房源" min-width="200">
          <template #default="{ row }">
            <b>{{ row.title }}</b><br /><small class="text-sub">{{ row.district }} · {{ row.layout }} · {{ row.area }}㎡</small>
          </template>
        </el-table-column>
        <el-table-column prop="rentType" label="方式" width="80" />
        <el-table-column label="租金" width="100">
          <template #default="{ row }"><span class="price">¥{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="110" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === '待审核'" size="small" type="primary" @click="openAudit(row)">审核</el-button>
          <el-button v-if="row.status === '待审核'" size="small" type="success" @click="doAudit(row, '可租')">通过</el-button>
            <el-button v-if="row.status === '待审核'" size="small" type="danger" @click="openReject(row)">驳回</el-button>
            <el-button v-if="row.status === '可租'" size="small" type="warning" @click="doAudit(row, '违规')">违规下架</el-button>
            <el-button v-if="row.status === '已下架' || row.status === '违规'" size="small" type="primary" @click="doAudit(row, '可租')">重新上架</el-button>
            <el-button size="small" plain @click="view(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && paged.length === 0" description="暂无数据" />

      <el-dialog v-model="detailVisible" title="房源详情" width="520px">
        <el-descriptions :column="1" border v-if="current">
          <el-descriptions-item label="标题">{{ current.title }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ current.district }}</el-descriptions-item>
          <el-descriptions-item label="户型/面积">{{ current.layout }} / {{ current.area }}㎡</el-descriptions-item>
          <el-descriptions-item label="租金">{{ current.price }}元/月 · {{ current.depositType }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ current.source }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ current.description }}</el-descriptions-item>
        </el-descriptions>
      </el-dialog>

      <el-dialog v-model="rejectVisible" title="驳回原因" width="400px">
        <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因…" />
        <template #footer>
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="danger" :loading="submitting" @click="doReject">确认驳回</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="auditDialogVisible" title="房源审核" width="420px">
        <el-form label-width="80px">
          <el-form-item label="审核结果">
            <el-radio-group v-model="auditForm.status">
              <el-radio value="已通过">通过</el-radio>
              <el-radio value="已驳回">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="auditForm.status === '已驳回'" label="驳回原因">
            <el-input v-model="auditForm.reason" type="textarea" :rows="3" placeholder="请输入驳回原因…" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitAudit">确认</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, post } from '@/api/http'
import { getAdminHouses, auditHouse, rejectHouse, type AdminHouse } from '@/api/admin'

const list = ref<AdminHouse[]>([])
const loading = ref(false)
const submitting = ref(false)
const tab = ref('all')
const detailVisible = ref(false)
const current = ref<AdminHouse | null>(null)
const rejectVisible = ref(false)
const rejectTarget = ref<AdminHouse | null>(null)
const rejectReason = ref('')

async function fetch() {
  loading.value = true
  const res = await safe(getAdminHouses(), [])
  if (okRes(res)) list.value = res.data
  loading.value = false
}

const counts = computed(() => ({
  pending: list.value.filter((h) => h.status === '待审核').length,
  violation: list.value.filter((h) => h.status === '违规').length
}))
const paged = computed(() => (tab.value === 'all' ? list.value : list.value.filter((h) => h.status === tab.value)))

function statusType(s: string) {
  return s === '可租' ? 'success' : s === '待审核' ? 'warning' : s === '违规' ? 'danger' : 'info'
}
async function doAudit(row: AdminHouse, to: string) {
  submitting.value = true
  const res = await safe(auditHouse(row.id, to), {})
  if (okRes(res)) {
    row.status = to
    ElMessage.success(to === '可租' ? '已审核通过' : '已操作成功')
  }
  submitting.value = false
}
function openReject(row: AdminHouse) {
  rejectTarget.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}
async function doReject() {
  if (!rejectTarget.value) return
  submitting.value = true
  const res = await safe(rejectHouse(rejectTarget.value.id, rejectReason.value), {})
  if (okRes(res)) {
    rejectTarget.value.status = '违规'
    ElMessage.warning('已驳回')
  }
  submitting.value = false
  rejectVisible.value = false
  rejectTarget.value = null
}

const auditDialogVisible = ref(false)
const auditTarget = ref<AdminHouse | null>(null)
const auditForm = reactive({ status: '已通过', reason: '' })

function openAudit(row: AdminHouse) {
  auditTarget.value = row
  auditForm.status = '已通过'
  auditForm.reason = ''
  auditDialogVisible.value = true
}
async function submitAudit() {
  if (!auditTarget.value) return
  if (auditForm.status === '已驳回' && !auditForm.reason) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  submitting.value = true
  const body = auditForm.status === '已驳回'
    ? { status: '已驳回', reason: auditForm.reason }
    : { status: '已通过' }
  const res = await safe(post('/admin/house/' + auditTarget.value.id + '/audit', body), {})
  if (okRes(res)) {
    auditTarget.value.status = auditForm.status === '已通过' ? '可租' : '违规'
    ElMessage.success(auditForm.status === '已通过' ? '审核通过' : '已驳回')
  }
  submitting.value = false
  auditDialogVisible.value = false
  auditTarget.value = null
}
function view(row: AdminHouse) {
  current.value = row
  detailVisible.value = true
}

onMounted(fetch)
</script>