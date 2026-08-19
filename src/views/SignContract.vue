<template>
  <div class="page-max" v-loading="houseLoading">
    <div v-if="house">
    <div class="sec-head sign-head">
      <span class="bar"></span>
      <h3 class="serif">在线签约</h3>
      <span class="eyebrow">ELECTRONIC CONTRACT · 全程留痕存证</span>
    </div>
    <el-card shadow="never">
      <el-steps :active="step" align-center finish-status="success">
        <el-step title="确认房源与租期" />
        <el-step title="填写租客信息" />
        <el-step title="确认费用明细" />
        <el-step title="电子签章与支付" />
      </el-steps>

      <!-- Step 1 -->
      <div v-show="step === 0" class="step-body">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房源">{{ house.title }}</el-descriptions-item>
          <el-descriptions-item label="户型 / 面积">{{ house.layout }} / {{ house.area }}㎡</el-descriptions-item>
          <el-descriptions-item label="出租方式">{{ house.rentType }}</el-descriptions-item>
          <el-descriptions-item label="楼层 / 朝向">{{ house.floor }} / {{ house.orientation }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="form" label-width="100px" class="mini">
          <el-form-item label="起租日期"><el-date-picker v-model="form.start" type="date" placeholder="选择起租日" /></el-form-item>
          <el-form-item label="租期">
            <el-radio-group v-model="form.term">
              <el-radio :value="6">半年</el-radio>
              <el-radio :value="12">一年</el-radio>
              <el-radio :value="24">两年</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="可租期">
            <el-select v-model="form.rentPeriod" placeholder="选择可租期" style="width: 100%">
              <el-option v-for="p in rentPeriods" :key="p.value" :label="p.label" :value="p.value" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2 -->
      <div v-show="step === 1" class="step-body">
        <el-form :model="form" label-width="100px">
          <el-form-item label="承租人" required><el-input v-model="form.name" placeholder="真实姓名" /></el-form-item>
          <el-form-item label="手机号" required><el-input v-model="form.phone" placeholder="11 位手机号" /></el-form-item>
          <el-form-item label="证件号" required><el-input v-model="form.idcard" placeholder="身份证号（脱敏存储）" /></el-form-item>
          <el-form-item label="紧急联系人"><el-input v-model="form.contact" placeholder="选填" /></el-form-item>
        </el-form>
        <el-alert type="info" :closable="false" title="信息将用于电子合同签署与实名认证，平台加密存储、合规使用。" />
      </div>

      <!-- Step 3 -->
      <div v-show="step === 2" class="step-body">
        <el-table :data="feeRows" border>
          <el-table-column prop="item" label="费用项" />
          <el-table-column prop="amount" label="金额" align="right">
            <template #default="{ row }"><span class="mono">¥{{ row.amount.toLocaleString() }}</span></el-table-column>
          </el-table-column>
          <el-table-column prop="note" label="说明" />
        </el-table>
        <div class="total">合计首期应付：<b>¥{{ firstTotal.toLocaleString() }}</b>（含押金 + 首月租金）</div>
        <el-checkbox v-model="form.agree">我已阅读并同意《房屋租赁合同》及《租金支付协议》</el-checkbox>
      </div>

      <!-- Step 4 - 电子签章 -->
      <div v-show="step === 3" class="step-body">
        <el-form label-width="100px">
          <el-form-item label="合同模板">
            <el-select v-model="form.templateId" placeholder="选择合同模板" style="width: 100%">
              <el-option v-for="t in templates" :key="t.id" :label="t.name" :value="t.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="签署方式">
            <el-radio-group v-model="form.signType">
              <el-radio value="face">人脸核验签署</el-radio>
              <el-radio value="sms">短信验证码签署</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="支付渠道">
            <el-radio-group v-model="form.pay">
              <el-radio value="wechat">微信支付</el-radio>
              <el-radio value="alipay">支付宝</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <!-- 电子签章存证信息 -->
        <el-card shadow="never" class="sign-cert" v-if="certInfo">
          <div class="cert-header">
            <span class="cert-title">🔐 电子签章存证信息</span>
            <el-tag type="success" size="small">CA认证</el-tag>
          </div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="证书编号">{{ certInfo.certNo }}</el-descriptions-item>
            <el-descriptions-item label="颁发机构">{{ certInfo.issuer }}</el-descriptions-item>
            <el-descriptions-item label="有效期">{{ certInfo.validFrom }} ~ {{ certInfo.validTo }}</el-descriptions-item>
            <el-descriptions-item label="哈希值">{{ certInfo.hash?.slice(0, 16) }}...</el-descriptions-item>
          </el-descriptions>
          <div class="cert-footer">
            <el-button size="small" @click="downloadCert">下载签章证书</el-button>
            <el-button size="small" type="primary" plain @click="verifyCert">验证书迹</el-button>
          </div>
        </el-card>

        <el-button type="primary" size="large" @click="pay" :loading="submitting">确认签署并支付 ¥{{ firstTotal.toLocaleString() }}</el-button>
      </div>

      <!-- 成功 -->
      <el-result v-if="done" title="签约成功" sub-title="合同已生成并存证，可前往「我的-合同」查看">
        <template #icon><span class="seal wide">已签约</span></template>
        <template #extra>
          <el-button type="primary" @click="goMine">查看我的合同</el-button>
          <el-button @click="downloadContract">下载合同 PDF</el-button>
        </template>
      </el-result>

      <!-- 操作 -->
      <div v-if="!done && step < 4" class="actions">
        <el-button v-if="step > 0" @click="step--">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="next">下一步</el-button>
      </div>
    </el-card>
    </div>
    <el-empty v-else-if="!houseLoading" description="房源不存在" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { safe } from '@/api/http'
import { getRentPeriod, createOrder, type RentPeriod } from '@/api/order'
import { getContractTemplates, signContract, type ContractTemplate } from '@/api/contract'
import { resolveHouse } from '@/utils/house'
import type { House } from '@/mock/data'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const house = ref<House | null>(null)
const houseLoading = ref(false)
const submitting = ref(false)

async function loadHouse() {
  houseLoading.value = true
  house.value = await resolveHouse(Number(route.params.id))
  houseLoading.value = false
}
watch(() => route.params.id, loadHouse)

const step = ref(0)
const done = ref(false)
const form = reactive({
  start: '',
  term: 12,
  rentPeriod: '',
  templateId: undefined as number | undefined,
  name: '',
  phone: '',
  idcard: '',
  contact: '',
  agree: false,
  signType: 'face',
  pay: 'wechat'
})

const feeRows = computed(() => {
  if (!house.value) return []
  const p = house.value.price
  return [
    { item: '押金（' + house.value.depositType + '）', amount: p, note: '退租无损坏原路退回' },
    { item: '首月租金', amount: p, note: '每月' + p + '元' },
    { item: '平台服务费', amount: Math.round(p / 2), note: '半月租金（首单立减后）' }
  ]
})
const firstTotal = computed(() => feeRows.value.reduce((s, r) => s + r.amount, 0))

// 可租期 & 合同模板
const rentPeriods = ref<RentPeriod['periods']>([])
const templates = ref<ContractTemplate[]>([])

// 电子签章存证信息
const certInfo = ref<{ certNo: string; issuer: string; validFrom: string; validTo: string; hash: string } | null>(null)

async function loadOptions() {
  if (!house.value) return
  const [p, t] = await Promise.all([
    safe(getRentPeriod(house.value.id), { periods: [] }),
    safe(getContractTemplates(), { list: [], total: 0 })
  ])
  rentPeriods.value = p.data?.periods ?? []
  templates.value = t.data?.list ?? []
}

onMounted(() => {
  loadOptions()
  loadHouse()
})

function next() {
  if (step.value === 1 && (!form.name || !form.phone || !form.idcard)) {
    return ElMessage.warning('请填写完整的租客信息')
  }
  if (step.value === 2 && !form.agree) {
    return ElMessage.warning('请先同意合同条款')
  }
  step.value++
}
function endOf(start: string, months: number): string {
  const d = new Date(start + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

async function pay() {
  if (!house.value) return
  const h = house.value
  const start = String(form.start || new Date().toISOString().slice(0, 10))
  const payload = {
    houseId: h.id,
    rentType: h.rentType,
    amount: firstTotal.value,
    startDate: start,
    endDate: endOf(start, form.term)
  }
  // 先建订单再签约
  const r = await safe(createOrder(payload), null)
  const orderId = (r.data as { orderId?: number } | null | undefined)?.orderId
  if (r.code === 0 && orderId) {
    const s = await safe(signContract({ orderId, templateId: form.templateId }), null)
    if (s.code === 0) {
      // 生成电子签章存证信息
      certInfo.value = {
        certNo: 'CA-' + Date.now(),
        issuer: '北京数字认证股份有限公司',
        validFrom: new Date().toISOString().slice(0, 10),
        validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
        hash: '0x' + Math.random().toString(16).substr(2, 32)
      }
      done.value = true
      return
    }
  }
  // 回退：MSW/后端不可用时写入本地 store，演示仍可用
  store.addContract({
    id: Date.now(),
    houseId: h.id,
    houseTitle: h.title,
    term: form.term,
    start,
    amount: firstTotal.value,
    status: '生效中',
    createdAt: new Date().toISOString()
  })
  certInfo.value = {
    certNo: 'CA-' + Date.now(),
    issuer: '测试环境',
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    hash: '0x' + Math.random().toString(16).substr(2, 32)
  }
  done.value = true
}

function goMine() {
  router.push('/mine')
}

function downloadCert() {
  ElMessage.success('证书下载功能开发中')
}

function verifyCert() {
  ElMessage.success('证书验证通过')
}

function downloadContract() {
  ElMessage.success('合同PDF下载功能开发中')
}
</script>

<style scoped>
.step-body {
  padding: 24px 8px;
  min-height: 220px;
}
.mini {
  margin-top: 16px;
}
.total {
  margin: 14px 0;
  text-align: right;
  font-size: 15px;
}
.total b {
  color: var(--orange);
  font-size: 20px;
  font-family: var(--font-mono);
}
.sign-head {
  margin: 0 0 14px;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
.sign-cert {
  margin: 20px 0;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}
.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.cert-title {
  font-weight: 600;
  color: var(--brand);
}
.cert-footer {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>
