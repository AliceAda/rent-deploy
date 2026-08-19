<template>
  <div class="page-max">
    <h3>租金账单</h3>
    <p class="sub">平台托管代收租金，按合同账期结算到你的账户</p>

    <el-row :gutter="14" class="sum">
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n price">¥{{ total.toLocaleString() }}</div>
          <div class="l">应收合计</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n ok">¥{{ paid.toLocaleString() }}</div>
          <div class="l">已收</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n warn">¥{{ due.toLocaleString() }}</div>
          <div class="l">待收</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="s">
          <div class="n danger">¥{{ overdue.toLocaleString() }}</div>
          <div class="l">逾期</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="card" style="margin-top: 14px">
      <template #header>
        <div class="card-head">
          <span>账单列表</span>
          <el-button type="primary" size="small" @click="openCreate">生成账单</el-button>
        </div>
      </template>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-table :data="bills" stripe v-loading="loading" empty-text="暂无账单">
        <el-table-column label="账期" width="110">
          <template #default="{ row }">{{ row.period || '-' }}</template>
        </el-table-column>
        <el-table-column label="房源" min-width="140">
          <template #default="{ row }">{{ row.houseTitle || `房源#${row.houseId}` }}</template>
        </el-table-column>
        <el-table-column prop="tenantName" label="租客" width="90" />
        <el-table-column label="应收" width="110">
          <template #default="{ row }"><span class="price">¥{{ row.amount.toLocaleString() }}</span></template>
        </el-table-column>
        <el-table-column label="实收" width="110">
          <template #default="{ row }">¥{{ (row.paid ?? 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag('bill', row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="detail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showCreate" title="生成账单" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="房源ID">
          <el-input-number v-model="form.houseId" :min="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="账单名称">
          <el-input v-model="form.title" placeholder="如：8月租金" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option label="租金" value="租金" />
            <el-option label="押金" value="押金" />
            <el-option label="水电气" value="水电气" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="账期">
          <el-input v-model="form.period" placeholder="如：2026-08" />
        </el-form-item>
        <el-form-item label="租客ID">
          <el-input-number v-model="form.tenantId" :min="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="doCreate">确认生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'
import { getLandlordBills, createLandlordBill, type BillItem } from '@/api/bill'
import { statusTag } from '@/utils/status'

const router = useRouter()
const submitting = ref(false)
const showCreate = ref(false)
const { list: bills, loading, error, reload } = useTable<BillItem>(() => getLandlordBills())

const form = reactive({
  houseId: 1,
  title: '',
  type: '租金',
  amount: 0,
  period: '',
  tenantId: undefined as number | undefined
})

const total = computed(() => bills.value.reduce((s, b) => s + b.amount, 0))
const paid = computed(() => bills.value.reduce((s, b) => s + (b.paid ?? 0), 0))
const due = computed(() => bills.value.filter((b) => b.status === '待收').reduce((s, b) => s + b.amount, 0))
const overdue = computed(() => bills.value.filter((b) => b.status === '逾期').reduce((s, b) => s + (b.amount - (b.paid ?? 0)), 0))

function openCreate() {
  form.houseId = 1
  form.title = ''
  form.type = '租金'
  form.amount = 0
  form.period = ''
  form.tenantId = undefined
  showCreate.value = true
}

async function doCreate() {
  if (!form.title || !form.period) {
    ElMessage.warning('请填写账单名称和账期')
    return
  }
  submitting.value = true
  const r = await safe(createLandlordBill({
    houseId: form.houseId,
    title: form.title,
    type: form.type,
    amount: form.amount,
    period: form.period,
    tenantId: form.tenantId
  }), {})
  submitting.value = false
  if (okRes(r)) {
    ElMessage.success('账单已生成')
    showCreate.value = false
    reload()
  } else {
    ElMessage.error(msgOf(r))
  }
}

function detail(row: BillItem) {
  router.push(`/landlord/bills/${row.id}`)
}
</script>

<style scoped>
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.s {
  text-align: center;
  border-radius: 12px;
}
.s .n {
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
}
.s .n.price {
  color: var(--orange);
}
.s .n.ok {
  color: var(--ok);
}
.s .n.warn {
  color: var(--warn);
}
.s .n.danger {
  color: #e2483d;
}
.s .l {
  color: var(--sub);
  margin-top: 4px;
}
.card {
  border-radius: 12px;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  color: var(--orange);
  font-weight: 700;
}
</style>
