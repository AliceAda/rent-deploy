<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>房东资料</span>
          <el-button type="primary" @click="handleEdit">编辑资料</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border v-loading="loading">
        <el-descriptions-item label="姓名">{{ profile.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ profile.phone }}</el-descriptions-item>
        <el-descriptions-item label="实名认证">{{ profile.realName ? '已认证' : '未认证' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ profile.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="银行卡号">{{ profile.bankCard || '未绑定' }}</el-descriptions-item>
        <el-descriptions-item label="开户银行">{{ profile.bankName || '未绑定' }}</el-descriptions-item>
        <el-descriptions-item label="信用等级">
          <el-rate :model-value="profile.rating || 5" disabled />
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ profile.createdAt }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-row :gutter="16">
        <el-col :span="8">
          <el-statistic title="出租房源" :value="profile.totalHouses || 0" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="成交订单" :value="profile.totalOrders || 0" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="入驻天数" :value="profile.joinDays || 0" />
        </el-col>
      </el-row>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑资料" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="form.bankCard" placeholder="用于提现" />
        </el-form-item>
        <el-form-item label="开户银行">
          <el-input v-model="form.bankName" placeholder="如：工商银行" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLandlordProfile, updateLandlordProfile, type LandlordProfile } from '@/api/landlord'

const loading = ref(false)
const profile = ref<LandlordProfile>({
  id: 0,
  name: '',
  phone: '',
  avatar: '',
  rating: 5,
  totalOrders: 0,
  totalHouses: 0,
  joinDays: 0
})

const dialogVisible = ref(false)
const submitting = ref(false)
const form = ref<Partial<LandlordProfile>>({})

async function loadProfile() {
  loading.value = true
  try {
    const res = await getLandlordProfile()
    if (res.code === 0) {
      profile.value = res.data
    }
  } catch (e) {
    ElMessage.error('加载资料失败')
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  form.value = { ...profile.value }
  dialogVisible.value = true
}

async function handleSave() {
  submitting.value = true
  try {
    const res = await updateLandlordProfile(form.value)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      loadProfile()
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
