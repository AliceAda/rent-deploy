<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="`订单 #${orderId}`" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="order" shadow="never" class="mb16">
        <div class="status-bar">
          <div>
            <el-tag :type="statusType(order.status)" size="large">{{ order.status }}</el-tag>
            <span class="order-no">{{ order.orderNo }}</span>
          </div>
          <div class="actions">
            <el-button v-if="order.status === '待支付'" type="primary" @click="pay">去支付</el-button>
            <el-button v-if="['待确认','待支付'].includes(order.status)" @click="cancelOrder">取消订单</el-button>
            <el-button v-if="['已确认','已支付'].includes(order.status)" type="success" @click="checkin">入住办理</el-button>
            <el-button v-if="['已确认','已支付'].includes(order.status)" @click="showRenew = true">续租</el-button>
            <el-button v-if="['已确认','已支付'].includes(order.status)" @click="showSublease = true">转租</el-button>
            <el-button v-if="['已确认','已支付'].includes(order.status)" type="danger" plain @click="terminate">终止合同</el-button>
          </div>
        </div>
      </el-card>

      <el-row :gutter="16" v-if="order">
        <el-col :span="14">
          <el-card shadow="never" class="mb16">
            <template #header><span>订单信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="房源">{{ order.title }}</el-descriptions-item>
              <el-descriptions-item label="租期类型">{{ order.rentType || '-' }}</el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ order.startDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ order.endDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="订单金额"><b class="price">¥{{ order.amount }}</b></el-descriptions-item>
              <el-descriptions-item label="下单时间">{{ order.createTime }}</el-descriptions-item>
              <el-descriptions-item label="支付时间">{{ order.payTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="入住时间">{{ order.checkinTime || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="mb16">
            <template #header><span>租客/房东信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="租客">{{ order.tenantName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="租客电话">{{ order.tenantPhone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="房东">{{ order.landlordName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ order.remark || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card shadow="never">
            <template #header><span>状态变更日志</span></template>
            <el-timeline v-if="logs.length">
              <el-timeline-item
                v-for="log in logs"
                :key="log.id"
                :timestamp="log.createTime"
                :type="log.toStatus === '已完成' ? 'success' : log.toStatus === '已取消' ? 'info' : 'primary'"
              >
                <div class="log-item">
                  <span class="log-status">{{ log.fromStatus }} → {{ log.toStatus }}</span>
                  <span class="log-operator">操作人：{{ log.operator }}</span>
                  <span v-if="log.remark" class="log-remark">{{ log.remark }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无日志" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 续租弹窗 -->
    <el-dialog v-model="showRenew" title="续租" width="400px">
      <el-form label-width="80px">
        <el-form-item label="续租至">
          <el-date-picker v-model="renewDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRenew = false">取消</el-button>
        <el-button type="primary" @click="doRenew">确认续租</el-button>
      </template>
    </el-dialog>

    <!-- 转租弹窗 -->
    <el-dialog v-model="showSublease" title="转租" width="400px">
      <el-form label-width="100px">
        <el-form-item label="转租人电话">
          <el-input v-model="subleasePhone" placeholder="输入转租人手机号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="subleaseRemark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSublease = false">取消</el-button>
        <el-button type="primary" @click="doSublease">确认转租</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import {
  getOrderDetail, payOrder, cancelOrder as cancelOrderApi, checkinOrder,
  renewOrder, subleaseOrder, terminateOrder, getOrderStatusLog,
  type OrderDetail, type StatusLog
} from '@/api/order'
import { statusTag } from '@/utils/status'

const route = useRoute()
const router = useRouter()
const orderId = Number(route.params.id)
const order = ref<OrderDetail | null>(null)
const logs = ref<StatusLog[]>([])
const loading = ref(false)

const showRenew = ref(false)
const renewDate = ref('')
const showSublease = ref(false)
const subleasePhone = ref('')
const subleaseRemark = ref('')

function statusType(s: string) {
  return statusTag('order', s)
}

async function load() {
  loading.value = true
  const [r1, r2] = await Promise.all([
    safe(getOrderDetail(orderId), {} as OrderDetail),
    safe(getOrderStatusLog(orderId), { list: [], total: 0 })
  ])
  order.value = r1.data
  logs.value = r2.data?.list ?? []
  loading.value = false
}

async function pay() {
  const r = await safe(payOrder(orderId), {})
  if (r.code === 0 && r.data?.payUrl) {
    window.open(r.data.payUrl, '_blank')
  } else if (r.code === 0) {
    ElMessage.success('支付成功')
    load()
  } else {
    ElMessage.error(r.message || '支付失败')
  }
}

async function cancelOrder() {
  await ElMessageBox.confirm('确认取消此订单？', '提示', { type: 'warning' })
  const r = await safe(cancelOrderApi(orderId), {})
  if (r.code === 0) { ElMessage.success('已取消'); load() }
  else ElMessage.error(r.message || '操作失败')
}

async function checkin() {
  await ElMessageBox.confirm('确认办理入住？', '提示', { type: 'info' })
  const r = await safe(checkinOrder(orderId), {})
  if (r.code === 0) { ElMessage.success('入住成功'); load() }
  else ElMessage.error(r.message || '操作失败')
}

async function doRenew() {
  if (!renewDate.value) return ElMessage.warning('请选择日期')
  const r = await safe(renewOrder(orderId, { endDate: renewDate.value }), {})
  if (r.code === 0) { ElMessage.success('续租成功'); showRenew.value = false; load() }
  else ElMessage.error(r.message || '操作失败')
}

async function doSublease() {
  if (!subleasePhone.value) return ElMessage.warning('请输入转租人电话')
  const r = await safe(subleaseOrder(orderId, { tenantPhone: subleasePhone.value, remark: subleaseRemark.value }), {})
  if (r.code === 0) { ElMessage.success('转租申请已提交'); showSublease.value = false; load() }
  else ElMessage.error(r.message || '操作失败')
}

async function terminate() {
  const { value } = await ElMessageBox.prompt('请输入终止原因', '终止合同', { type: 'warning' })
  const r = await safe(terminateOrder(orderId, value), {})
  if (r.code === 0) { ElMessage.success('已终止'); load() }
  else ElMessage.error(r.message || '操作失败')
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.order-no { margin-left: 12px; color: var(--el-text-color-secondary); font-size: 13px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.price { color: #f56c6c; font-size: 18px; }
.log-item { display: flex; flex-direction: column; }
.log-status { font-weight: 600; }
.log-operator { font-size: 12px; color: var(--el-text-color-secondary); }
.log-remark { font-size: 12px; color: var(--el-text-color-secondary); }
</style>
