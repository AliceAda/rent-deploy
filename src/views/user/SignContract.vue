<template>
  <div class="page-max" v-if="house">
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
            <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
          </el-table-column>
          <el-table-column prop="note" label="说明" />
        </el-table>
        <div class="total">合计首期应付：<b>¥{{ firstTotal.toLocaleString() }}</b>（含押金 + 首月租金）</div>
        <el-checkbox v-model="form.agree">我已阅读并同意《房屋租赁合同》及《租金支付协议》</el-checkbox>
      </div>

      <!-- Step 4 -->
      <div v-show="step === 3" class="step-body">
        <el-form label-width="100px">
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
        <el-button type="primary" @click="pay">确认签署并支付 ¥{{ firstTotal.toLocaleString() }}</el-button>
      </div>

      <!-- 成功 -->
      <el-result v-if="done" icon="success" title="签约成功" sub-title="合同已生成并存证，可前往「我的-合同」查看">
        <template #extra>
          <el-button type="primary" @click="goMine">查看我的合同</el-button>
        </template>
      </el-result>

      <!-- 操作 -->
      <div v-if="!done" class="actions">
        <el-button v-if="step > 0" @click="step--">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="next">下一步</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const house = computed(() => store.houses.find((h) => h.id === Number(route.params.id)))

const step = ref(0)
const done = ref(false)
const form = reactive({
  start: '',
  term: 12,
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

function next() {
  if (step.value === 1 && (!form.name || !form.phone || !form.idcard)) {
    return alert('请填写完整的租客信息')
  }
  if (step.value === 2 && !form.agree) {
    return alert('请先同意合同条款')
  }
  step.value++
}
function pay() {
  if (!house.value) return
  const h = house.value
  store.addContract({
    id: Date.now(),
    houseId: h.id,
    houseTitle: h.title,
    term: form.term,
    start: String(form.start || new Date().toISOString().slice(0, 10)),
    amount: firstTotal.value,
    status: '生效中',
    createdAt: new Date().toISOString()
  })
  done.value = true
}
function goMine() {
  router.push('/mine')
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
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
