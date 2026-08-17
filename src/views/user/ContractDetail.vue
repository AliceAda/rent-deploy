<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="`合同 #${contractId}`" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="contract" shadow="never" class="mb16">
        <div class="status-bar">
          <div>
            <el-tag :type="statusType(contract.status)" size="large">{{ contract.status }}</el-tag>
            <span class="contract-no">{{ contract.contractNo }}</span>
          </div>
          <div class="actions">
            <el-button v-if="['生效中','已生效'].includes(contract.status)" @click="showRenew = true">续租</el-button>
            <el-button v-if="['生效中','已生效'].includes(contract.status)" type="danger" plain @click="terminate">终止合同</el-button>
          </div>
        </div>
      </el-card>

      <el-row :gutter="16" v-if="contract">
        <el-col :span="14">
          <el-card shadow="never" class="mb16">
            <template #header><span>合同信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="房源">{{ contract.houseTitle || `房源#${contract.houseId}` }}</el-descriptions-item>
              <el-descriptions-item label="合同编号">{{ contract.contractNo }}</el-descriptions-item>
              <el-descriptions-item label="租客">{{ contract.tenantName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="房东">{{ contract.landlordName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ contract.startDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ contract.endDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="月租金额">¥{{ contract.rentAmount || '-' }}</el-descriptions-item>
              <el-descriptions-item label="押金金额">¥{{ contract.depositAmount || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签署时间">{{ contract.signedAt }}</el-descriptions-item>
              <el-descriptions-item label="终止时间">{{ contract.terminatedAt || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="mb16">
            <template #header><span>合同附件</span></template>
            <el-table :data="attachments" empty-text="暂无附件" size="small">
              <el-table-column prop="name" label="文件名" min-width="180" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="createTime" label="上传时间" width="180" />
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="download(row.url)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card shadow="never">
            <template #header><span>签约记录</span></template>
            <el-timeline v-if="signLogs.length">
              <el-timeline-item
                v-for="log in signLogs"
                :key="log.id"
                :timestamp="log.createTime"
                type="primary"
              >
                <div class="log-item">
                  <span class="log-action">{{ log.action }}</span>
                  <span class="log-operator">操作人：{{ log.operator }}</span>
                  <span v-if="log.remark" class="log-remark">{{ log.remark }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无记录" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showRenew" title="合同续租" width="400px">
      <el-form label-width="80px">
        <el-form-item label="续租至">
          <el-date-picker v-model="renewDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRenew = false">取消</el-button>
        <el-button type="primary" @click="doRenew">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import {
  getContractDetail, getContractAttachments, getContractSignLog,
  renewContract, terminateContract,
  type ContractDetail, type ContractAttachment, type SignLog
} from '@/api/contract'

const route = useRoute()
const contractId = Number(route.params.id)
const contract = ref<ContractDetail | null>(null)
const attachments = ref<ContractAttachment[]>([])
const signLogs = ref<SignLog[]>([])
const loading = ref(false)
const showRenew = ref(false)
const renewDate = ref('')

function statusType(s: string) {
  if (['已生效','生效中','已完成'].includes(s)) return 'success'
  if (['待签署','待确认'].includes(s)) return 'warning'
  if (['已终止','已过期'].includes(s)) return 'info'
  return ''
}

async function load() {
  loading.value = true
  const [r1, r2, r3] = await Promise.all([
    safe(getContractDetail(contractId), {} as ContractDetail),
    safe(getContractAttachments(contractId), { list: [], total: 0 }),
    safe(getContractSignLog(contractId), { list: [], total: 0 })
  ])
  contract.value = r1.data
  attachments.value = r2.data?.list ?? []
  signLogs.value = r3.data?.list ?? []
  loading.value = false
}

function download(url: string) {
  window.open(url, '_blank')
}

async function doRenew() {
  if (!renewDate.value) return ElMessage.warning('请选择日期')
  const r = await safe(renewContract({ contractId, endDate: renewDate.value }), {})
  if (r.code === 0) { ElMessage.success('续租成功'); showRenew.value = false; load() }
  else ElMessage.error(r.message || '操作失败')
}

async function terminate() {
  const { value } = await ElMessageBox.prompt('请输入终止原因', '终止合同', { type: 'warning' })
  const r = await safe(terminateContract(contractId, value), {})
  if (r.code === 0) { ElMessage.success('已终止'); load() }
  else ElMessage.error(r.message || '操作失败')
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.contract-no { margin-left: 12px; color: var(--el-text-color-secondary); font-size: 13px; }
.actions { display: flex; gap: 8px; }
.log-item { display: flex; flex-direction: column; }
.log-action { font-weight: 600; }
.log-operator { font-size: 12px; color: var(--el-text-color-secondary); }
.log-remark { font-size: 12px; color: var(--el-text-color-secondary); }
</style>
