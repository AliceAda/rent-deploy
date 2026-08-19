<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>账号注销</h3>

      <!-- 未申请：展示注销说明 + 申请表单 -->
      <template v-if="status === 'none'">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="注销后，您的账号将无法登录，所有数据将被清空或冻结，请谨慎操作。"
          style="margin-bottom: 18px"
        />
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="cancel-form">
          <el-form-item label="注销原因" prop="reason">
            <el-radio-group v-model="form.reason">
              <el-radio label="不再需要该账号">不再需要该账号</el-radio>
              <el-radio label="信息泄露，担心隐私">信息泄露，担心隐私</el-radio>
              <el-radio label="平台体验不佳">平台体验不佳</el-radio>
              <el-radio label="其他原因">其他原因</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" :loading="loading" @click="onApply">申请注销账号</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 审核中 / 已驳回 / 已注销 -->
      <template v-else>
        <el-result v-if="status === 'cancelled'" icon="success" title="账号已注销" sub-title="感谢您的使用，期待再次相遇。" />
        <template v-else>
          <el-alert
            v-if="status === 'pending'"
            type="info"
            :closable="false"
            show-icon
            title="注销申请审核中，审核通过后账号将被注销，此期间可撤销申请。"
            style="margin-bottom: 18px"
          />
          <el-alert
            v-else-if="status === 'rejected'"
            type="error"
            :closable="false"
            show-icon
            title="注销申请未通过"
            description="您可重新提交注销申请，或联系客服了解详情。"
            style="margin-bottom: 18px"
          />
          <p class="text-sub">
            申请时间：{{ info.applyTime || '-' }}
            <span v-if="info.cancelAt"> · 注销时间：{{ info.cancelAt }}</span>
          </p>
          <el-button v-if="status !== 'cancelled'" type="primary" plain @click="onRevoke">撤销注销申请</el-button>
        </template>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { safe } from '@/api/http'
import {
  getAccountCancelStatus,
  applyAccountCancel,
  cancelAccountCancel,
  type AccountCancelStatus
} from '@/api/user'

const formRef = ref<FormInstance>()
const form = ref({ reason: '不再需要该账号' })
const rules: FormRules = {
  reason: [{ required: true, message: '请选择注销原因', trigger: 'change' }]
}
const info = ref<AccountCancelStatus>({} as AccountCancelStatus)
const status = ref('none')
const loading = ref(false)

async function load() {
  const r = await safe(getAccountCancelStatus(), { status: 'none' } as AccountCancelStatus)
  info.value = r.data ?? ({} as AccountCancelStatus)
  status.value = r.data?.status || 'none'
}
async function onApply() {
  await formRef.value?.validate()
  await ElMessageBox.confirm('确定申请注销当前账号？此操作不可轻易撤回。', '确认注销', {
    type: 'warning'
  })
  loading.value = true
  const r = await safe(applyAccountCancel({ reason: form.value.reason }), {})
  loading.value = false
  if (r.code === 0) {
    ElMessage.success('已提交注销申请')
    load()
  } else {
    ElMessage.error(r.message || '提交失败')
  }
}
async function onRevoke() {
  await ElMessageBox.confirm('确定撤销注销申请？', '提示', { type: 'info' })
  const r = await safe(cancelAccountCancel(), {})
  if (r.code === 0) {
    ElMessage.success('已撤销注销申请')
    load()
  } else {
    ElMessage.error(r.message || '操作失败')
  }
}
onMounted(load)
</script>

<style scoped>
.cancel-form {
  max-width: 520px;
}
.text-sub {
  color: var(--sub);
  margin-bottom: 14px;
}
</style>