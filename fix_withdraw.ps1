$content = @'
<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>提现审批</h3>
      <el-radio-group v-model="statusTab" size="small" @change="reload" style="margin-bottom:12px">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="待审核">待审核</el-radio-button>
        <el-radio-button value="已通过">已通过</el-radio-button>
        <el-radio-button value="已驳回">已驳回</el-radio-button>
      </el-radio-group>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无提现申请">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="amount" label="提现金额" width="120" align="right">
          <template #default="{ row }"><b class="amount">¥{{ row.amount }}</b></template>
        </el-table-column>
        <el-table-column prop="bankCard" label="收款账户" min-width="160" />
        <el-table-column prop="userName" label="申请人" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="statusType(row.status)">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === '待审核'">
              <el-button text size="small" type="success" @click="auditApprove(row)">通过</el-button>
              <el-button text size="small" type="danger" @click="auditReject(row)">驳回</el-button>
            </template>
            <el-button text size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核弹窗 -->
    <el-dialog v-model="auditDialog" :title="auditTarget ? '审核提现申请' : '查看详情'" width="500px">
      <el-descriptions :column="1" border v-if="auditTarget">
        <el-descriptions-item label="提现单号">{{ auditTarget.id }}</el-descriptions-item>
        <el-descriptions-item label="提现金额">¥{{ auditTarget.amount }}</el-descriptions-item>
        <el-descriptions-item label="收款账户">{{ auditTarget.bankCard }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ auditTarget.userName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ auditTarget.createTime }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="statusType(auditTarget.status)">{{ auditTarget.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 审核表单（仅待审核状态显示） -->
      <template v-if="auditTarget?.status === '待审核' && showAuditForm">
        <el-divider />
        <el-form label-width="80px">
          <el-form-item label="审核意见">
            <el-radio-group v-model="auditResult">
              <el-radio value="pass">通过</el-radio>
              <el-radio value="reject">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="auditRemark" type="textarea" :rows="3" placeholder="请输入审核备注（可选）" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="auditDialog = false; showAuditForm = false">关闭</el-button>
        <el-button v-if="showAuditForm" type="primary" :loading="submitting" @click="submitAudit">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getWithdrawList, approveWithdraw, rejectWithdraw, getWithdrawDetail, type WithdrawItem } from '@/api/pay'
import { statusTag } from '@/utils/status'

const statusTab = ref('all')
const { list, loading, error, reload } = useTable<WithdrawItem>(({ page, size }) =>
  getWithdrawList(statusTab.value === 'all' ? undefined : statusTab.value)
)

function statusType(s: string) {
  return statusTag('withdraw', s)
}

const auditDialog = ref(false)
const auditTarget = ref<WithdrawItem | null>(null)
const showAuditForm = ref(false)
const auditResult = ref<'pass' | 'reject'>('pass')
const auditRemark = ref('')
const submitting = ref(false)

async function auditApprove(row: WithdrawItem) {
  await ElMessageBox.confirm('确认通过此提现申请？', '提示', { type: 'success' })
  const r = await safe(approveWithdraw(row.id), {})
  if (okRes(r)) { ElMessage.success('已通过'); reload() }
  else ElMessage.error(msgOf(r))
}

async function auditReject(row: WithdrawItem) {
  const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回提现', { type: 'warning' })
  const r = await safe(rejectWithdraw(row.id, value), {})
  if (okRes(r)) { ElMessage.success('已驳回'); reload() }
  else ElMessage.error(msgOf(r))
}

function viewDetail(row: WithdrawItem) {
  auditTarget.value = row
  showAuditForm.value = false
  auditDialog.value = true
}

async function submitAudit() {
  if (!auditTarget.value) return
  submitting.value = true
  if (auditResult.value === 'pass') {
    const r = await safe(approveWithdraw(auditTarget.value.id), {})
    if (okRes(r)) {
      ElMessage.success('已通过')
      auditDialog.value = false
      reload()
    } else {
      ElMessage.error(msgOf(r))
    }
  } else {
    const r = await safe(rejectWithdraw(auditTarget.value.id, auditRemark.value), {})
    if (okRes(r)) {
      ElMessage.success('已驳回')
      auditDialog.value = false
      reload()
    } else {
      ElMessage.error(msgOf(r))
    }
  }
  submitting.value = false
}
</script>

<style scoped>
.amount { color: #f56c6c; font-size: 15px; }
</style>
'@
$content | Out-File -FilePath 'D:\Project\rent-deploy\src\views\admin\WithdrawManage.vue' -Encoding UTF8
Write-Host 'WithdrawManage.vue fixed with audit dialog'
