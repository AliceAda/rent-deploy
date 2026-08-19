<template>
  <div class="page-max">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>发票管理</span>
          <el-space>
            <el-button type="primary" @click="openAdd">+ 申请发票</el-button>
          </el-space>
        </div>
      </template>

      <el-table :data="invoices" v-loading="loading" stripe>
        <el-table-column prop="invoiceNo" label="发票编号" width="180" />
        <el-table-column prop="userName" label="申请人" width="100" />
        <el-table-column prop="title" label="发票抬头" min-width="180" />
        <el-table-column prop="taxNo" label="税号" width="150" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type === 'electronic' ? '电子发票' : '纸质发票' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160" />
        <el-table-column prop="issuedAt" label="开具时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" size="small" type="primary" @click="mailInvoice(row)">邮寄</el-button>
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @change="loadData"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 申请发票弹窗 -->
    <el-dialog v-model="dialogVisible" title="申请发票" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="发票抬头">
          <el-input v-model="form.title" placeholder="请输入发票抬头" />
        </el-form-item>
        <el-form-item label="税号">
          <el-input v-model="form.taxNo" placeholder="请输入税号" />
        </el-form-item>
        <el-form-item label="发票类型">
          <el-radio-group v-model="form.type">
            <el-radio value="electronic">电子发票</el-radio>
            <el-radio value="paper">纸质发票</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type === 'paper'" label="邮寄地址">
          <el-input v-model="form.mailAddress" placeholder="请输入邮寄地址" />
        </el-form-item>
        <el-form-item v-if="form.type === 'paper'" label="收件人">
          <el-input v-model="form.mailContact" placeholder="请输入收件人" />
        </el-form-item>
        <el-form-item v-if="form.type === 'paper'" label="联系电话">
          <el-input v-model="form.mailPhone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="发票详情" width="500px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="发票编号">{{ currentInvoice?.invoiceNo }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentInvoice?.userName }}</el-descriptions-item>
        <el-descriptions-item label="发票抬头">{{ currentInvoice?.title }}</el-descriptions-item>
        <el-descriptions-item label="税号">{{ currentInvoice?.taxNo }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentInvoice?.amount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag>{{ currentInvoice?.type === 'electronic' ? '电子发票' : '纸质发票' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentInvoice?.status)">{{ statusMap[currentInvoice?.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentInvoice?.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="开具时间">{{ currentInvoice?.issuedAt || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="邮寄地址" v-if="currentInvoice?.mailAddress">{{ currentInvoice.mailAddress }}</el-descriptions-item>
        <el-descriptions-item label="收件人" v-if="currentInvoice?.mailContact">{{ currentInvoice.mailContact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话" v-if="currentInvoice?.mailPhone">{{ currentInvoice.mailPhone }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getInvoices, createInvoice, mailInvoice, type Invoice } from '@/api/extensions'

const loading = ref(false)
const submitting = ref(false)
const invoices = ref<Invoice[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentInvoice = ref<Invoice | null>(null)

const form = ref({
  title: '',
  taxNo: '',
  type: 'electronic' as 'electronic' | 'paper',
  mailAddress: '',
  mailContact: '',
  mailPhone: ''
})

const statusMap: Record<string, string> = {
  pending: '待开具',
  issued: '已开具',
  mailed: '已邮寄',
  voided: '已作废'
}

function statusType(status: string): '' | 'warning' | 'success' | 'info' {
  const types: Record<string, '' | 'warning' | 'success' | 'info'> = {
    pending: 'warning',
    issued: 'success',
    mailed: 'success',
    voided: 'info'
  }
  return types[status] || ''
}

async function loadData() {
  loading.value = true
  try {
    const res = await getInvoices({ page: page.value, size: size.value })
    if (res.code === 0) {
      invoices.value = res.data.list
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('加载发票列表失败')
  } finally {
    loading.value = false
  }
}

function openAdd() {
  form.value = { title: '', taxNo: '', type: 'electronic', mailAddress: '', mailContact: '', mailPhone: '' }
  dialogVisible.value = true
}

function viewDetail(row: Invoice) {
  currentInvoice.value = row
  detailVisible.value = true
}

async function handleSave() {
  if (!form.value.title) return ElMessage.warning('请填写发票抬头')
  submitting.value = true
  try {
    const res = await createInvoice(form.value)
    if (res.code === 0) {
      ElMessage.success('申请成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (e) {
    ElMessage.error('申请失败')
  } finally {
    submitting.value = false
  }
}

async function mailInvoice(row: Invoice) {
  ElMessage.info('邮寄功能开发中')
}

onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
