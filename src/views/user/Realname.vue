<template>
  <div class="page-max">
    <el-card shadow="never" style="max-width: 560px">
      <h3>实名认证</h3>
      <el-alert
        v-if="info?.status === 'verified'"
        type="success"
        :closable="false"
        title="已认证"
        :description="(info.realName || '') + ' · ' + (info.idCardMask || '')"
      />
      <el-alert
        v-else-if="info?.status === 'pending'"
        type="warning"
        :closable="false"
        title="审核中"
        description="实名信息已提交，等待平台审核"
      />
      <el-form v-else label-width="90px" style="margin-top: 12px">
        <el-form-item label="真实姓名"><el-input v-model="rn.realName" placeholder="与身份证一致" /></el-form-item>
        <el-form-item label="身份证号"><el-input v-model="rn.idCard" placeholder="18 位身份证号" /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交认证</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getRealnameStatus, submitRealname, type RealnameStatus } from '@/api/user'

const info = ref<RealnameStatus | null>(null)
const rn = ref({ realName: '', idCard: '' })

async function load() {
  const r = await safe(getRealnameStatus(), { status: 'none' })
  info.value = r.data ?? null
}
async function submit() {
  if (!rn.value.realName || !rn.value.idCard) return ElMessage.warning('请填写完整')
  const r = await safe(submitRealname(rn.value), {})
  if (r.code === 0) {
    ElMessage.success('已提交，等待审核')
    load()
  } else {
    ElMessage.error(r.message || '提交失败')
  }
}
onMounted(load)
</script>
