<template>
  <div class="page-max">
    <el-card shadow="never" style="max-width: 560px">
      <h3>通知设置</h3>
      <el-form label-width="120px">
        <el-form-item label="短信通知">
          <el-switch v-model="form.sms" />
        </el-form-item>
        <el-form-item label="站内信通知">
          <el-switch v-model="form.site" />
        </el-form-item>
        <el-form-item label="预约提醒">
          <el-switch v-model="form.booking" />
        </el-form-item>
        <el-form-item label="账单提醒">
          <el-switch v-model="form.bill" />
        </el-form-item>
        <el-form-item label="营销活动">
          <el-switch v-model="form.market" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getNotifySetting, saveNotifySetting, type NotifySetting } from '@/api/notify'

const form = ref<NotifySetting>({ sms: true, site: true, booking: true, bill: true, market: false })

async function load() {
  const r = await safe(getNotifySetting(), form.value)
  form.value = r.data ?? form.value
}
async function save() {
  const r = await safe(saveNotifySetting(form.value), {})
  if (r.code === 0) ElMessage.success('已保存')
  else ElMessage.error(r.message || '保存失败')
}
onMounted(load)
</script>
