<template>
  <div class="page-max">
    <el-card shadow="never">
      <h3>支付记录</h3>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="list" v-loading="loading" empty-text="暂无支付记录">
        <el-table-column prop="orderNo" label="订单号" min-width="160" />
        <el-table-column prop="amount" label="金额" width="110" align="right">
          <template #default="{ row }"><b class="amount">¥{{ row.amount }}</b></template>
        </el-table-column>
        <el-table-column prop="channel" label="支付渠道" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '成功' ? 'success' : row.status === '失败' ? 'danger' : 'warning'">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="支付时间" width="180" />
        <el-table-column label="操作" width="110">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '成功' && row.amount > 0"
              size="small"
              text
              type="primary"
              @click="openInvoice(row)"
            >开发票</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="total > size"
        style="margin-top: 12px; justify-content: flex-end"
        layout="total, prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="setPage"
      />
    </el-card>

    <!-- 发票申请弹窗 -->
    <el-dialog v-model="invoiceVisible" title="申请电子发票" width="420px">
      <el-form label-width="76px">
        <el-form-item label="订单"><span class="mono">{{ invoiceTarget?.orderNo }}</span></el-form-item>
        <el-form-item label="金额"><b class="amount">¥{{ invoiceTarget?.amount }}</b></el-form-item>
        <el-form-item label="发票抬头" required>
          <el-input v-model="invoiceForm.title" placeholder="个人 / 企业名称" />
        </el-form-item>
        <el-form-item label="税号">
          <el-input v-model="invoiceForm.taxNo" placeholder="企业请填写统一社会信用代码" />
        </el-form-item>
        <el-form-item label="接收邮箱" required>
          <el-input v-model="invoiceForm.email" placeholder="电子发票将发送至该邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="invoiceVisible = false">取消</el-button>
        <el-button type="primary" :loading="invoiceLoading" @click="submitInvoice">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@/composables/useTable'
import { getMyPayRecords, type PayRecord } from '@/api/pay'

const { list, loading, error, reload, total, page, size, setPage, setSize } =
  useTable<PayRecord>(({ page, size }) => getMyPayRecords(page, size), { pageSize: 10 })

// 发票申请（演示：模拟提交成功，真实项目接发票服务）
const invoiceVisible = ref(false)
const invoiceLoading = ref(false)
const invoiceTarget = ref<PayRecord | null>(null)
const invoiceForm = reactive({ title: '', taxNo: '', email: '' })

function openInvoice(row: PayRecord) {
  invoiceTarget.value = row
  invoiceForm.title = ''
  invoiceForm.taxNo = ''
  invoiceForm.email = ''
  invoiceVisible.value = true
}

async function submitInvoice() {
  if (!invoiceForm.title.trim()) return ElMessage.warning('请填写发票抬头')
  if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(invoiceForm.email.trim())) return ElMessage.warning('邮箱格式不正确')
  invoiceLoading.value = true
  await new Promise((r) => setTimeout(r, 600))
  invoiceLoading.value = false
  invoiceVisible.value = false
  ElMessage.success(`发票申请已提交，电子发票将发送至 ${invoiceForm.email.trim()}`)
}
</script>

<style scoped>
.amount { color: #f56c6c; font-size: 15px; }
</style>
