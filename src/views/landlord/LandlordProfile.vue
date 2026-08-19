<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>房东资料</h3>
      <el-form :model="form" label-width="100px" style="max-width:560px" v-loading="loading">
        <el-form-item label="真实姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="form.phone" disabled /></el-form-item>
        <el-form-item label="身份证号"><el-input v-model="form.idCard" placeholder="请输入身份证号" /></el-form-item>
        <el-form-item label="微信号"><el-input v-model="form.wechat" placeholder="选填" /></el-form-item>
        <el-form-item label="公司名称"><el-input v-model="form.company" placeholder="企业房东填写" /></el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.intro" type="textarea" :rows="3" placeholder="个人/公司简介" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save" :loading="submitting">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { get, put, safe, okRes, msgOf } from '@/api/http'

const loading = ref(false)
const submitting = ref(false)
const form = ref({
  name: '', phone: '', idCard: '', wechat: '', company: '', intro: ''
})

async function load() {
  loading.value = true
  const r = await safe(get<Record<string, any>>('/landlord/profile'), {})
  form.value = { ...form.value, ...(r.data || {}) }
  loading.value = false
}

async function save() {
  submitting.value = true
  const r = await safe(put('/landlord/profile', form.value), {})
  submitting.value = false
  if (okRes(r)) ElMessage.success('保存成功')
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>
