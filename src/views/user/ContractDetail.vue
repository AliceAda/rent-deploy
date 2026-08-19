<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="`合同 #${contractId}`" style="margin-bottom: 16px" />

    <div v-loading="loading">
      <el-card v-if="contract" shadow="never" class="mb16">
        <div class="status-bar">
          <div>
            <el-tag :type="statusType(contract.status)" size="large">{{ contract.status }}</el-tag>
            <span class="contract-no">{{ contract.contractNo }}</span>
          </div>
          <div class="actions">
            <el-button v-if="contract" @click="showDoc = true">📄 合同正文</el-button>
            <el-button v-if="['生效中','已生效'].includes(contract.status)" @click="showRenew = true">续租</el-button>
            <el-button v-if="['生效中','已生效'].includes(contract.status)" type="danger" plain @click="terminate">终止合同</el-button>
          </div>
        </div>
      </el-card>

      <el-row :gutter="16" v-if="contract">
        <el-col :span="14">
          <el-card shadow="never" class="mb16">
            <template #header><span>合同信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="房源">{{ contract.houseTitle || `房源#${contract.houseId}` }}</el-descriptions-item>
              <el-descriptions-item label="合同编号">{{ contract.contractNo }}</el-descriptions-item>
              <el-descriptions-item label="租客">{{ contract.tenantName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="房东">{{ contract.landlordName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ contract.startDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ contract.endDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="月租金额">¥{{ contract.rentAmount || '-' }}</el-descriptions-item>
              <el-descriptions-item label="押金金额">¥{{ contract.depositAmount || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签署时间">{{ contract.signedAt }}</el-descriptions-item>
              <el-descriptions-item label="终止时间">{{ contract.terminatedAt || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="mb16">
            <template #header><span>合同附件</span></template>
            <el-table :data="attachments" empty-text="暂无附件" size="small">
              <el-table-column prop="name" label="文件名" min-width="180" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="createTime" label="上传时间" width="180" />
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button size="small" text type="primary" @click="download(row.url)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="10">
          <el-card shadow="never">
            <template #header><span>签约记录</span></template>
            <el-timeline v-if="signLogs.length">
              <el-timeline-item
                v-for="log in signLogs"
                :key="log.id"
                :timestamp="log.createTime"
                type="primary"
              >
                <div class="log-item">
                  <span class="log-action">{{ log.action }}</span>
                  <span class="log-operator">操作人：{{ log.operator }}</span>
                  <span v-if="log.remark" class="log-remark">{{ log.remark }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无记录" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 合同正文（档案式排版，可打印） -->
    <el-dialog v-model="showDoc" fullscreen class="doc-dialog" :show-close="false">
      <div class="doc-scroll">
        <div id="contract-print" class="print-area">
          <div class="doc-title serif">房屋租赁合同</div>
          <div class="doc-no mono">合同编号：{{ contract?.contractNo }}</div>
          <div class="doc-meta">
            <div class="row"><span>出租方（甲方）</span><b>{{ contract?.landlordName || '—' }}</b></div>
            <div class="row"><span>承租方（乙方）</span><b>{{ contract?.tenantName || '—' }}</b></div>
            <div class="row"><span>租赁房屋</span><b>{{ contract?.houseTitle || `房源#${contract?.houseId}` }}</b></div>
            <div class="row"><span>租赁期限</span><b>{{ contract?.startDate }} 至 {{ contract?.endDate }}</b></div>
            <div class="row"><span>月租金</span><b>¥{{ contract?.rentAmount }} 元/月</b></div>
            <div class="row"><span>押金</span><b>¥{{ contract?.depositAmount }} 元</b></div>
          </div>
          <div class="doc-clauses">
            <h4>第一条 租赁房屋</h4>
            <p>甲方将上述房屋出租给乙方使用，乙方应按本合同约定用途使用房屋，不得擅自改变房屋用途。</p>
            <h4>第二条 租金与支付</h4>
            <p>乙方应按约定周期向甲方支付租金，逾期未付的，甲方有权按日万分之五收取滞纳金；连续逾期超过 15 日的，甲方有权解除合同。</p>
            <h4>第三条 押金</h4>
            <p>押金于签约时支付，合同期满且乙方无违约、无欠费、房屋及设施无损坏的，甲方应在退租后 7 个工作日内无息退还。</p>
            <h4>第四条 房屋维护</h4>
            <p>房屋及附属设施的自然损耗由甲方负责维修；因乙方使用不当造成的损坏，维修费用由乙方承担。</p>
            <h4>第五条 转租与转让</h4>
            <p>未经甲方书面同意，乙方不得擅自转租、转借房屋；经平台审核同意的转租，应重新签订租赁合同。</p>
            <h4>第六条 合同解除</h4>
            <p>任何一方提前解除合同的，应提前 30 日书面通知对方，并按合同约定承担违约责任。平台将依据双方提交的退租申请进行押金结算。</p>
            <h4>第七条 平台服务</h4>
            <p>平台提供电子合同存证、租金支付与资金监管服务，交易双方通过平台进行的支付受平台资金保障规则保护。</p>
            <h4>第八条 争议解决</h4>
            <p>因本合同引起的争议，双方应协商解决；协商不成的，可向房屋所在地人民法院提起诉讼。</p>
          </div>
          <div class="doc-sign">
            <div class="sign-item"><span>甲方（出租方）：</span><b>{{ contract?.landlordName || '—' }}</b></div>
            <div class="sign-item"><span>乙方（承租方）：</span><b>{{ contract?.tenantName || '—' }}</b></div>
            <div class="sign-item"><span>签署时间：</span><b>{{ contract?.signedAt }}</b></div>
            <div class="sign-seal">本合同经电子签章生效，与纸质合同具有同等法律效力</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDoc = false">关闭</el-button>
        <el-button type="primary" @click="doPrint">🖨 下载 / 打印</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRenew" title="合同续租" width="400px">
      <el-form label-width="80px">
        <el-form-item label="续租至">
          <el-date-picker v-model="renewDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRenew = false">取消</el-button>
        <el-button type="primary" @click="doRenew">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import {
  getContractDetail, getContractAttachments, getContractSignLog,
  renewContract, terminateContract,
  type ContractDetail, type ContractAttachment, type SignLog
} from '@/api/contract'
import { statusTag } from '@/utils/status'

const route = useRoute()
const contractId = Number(route.params.id)
const contract = ref<ContractDetail | null>(null)
const attachments = ref<ContractAttachment[]>([])
const signLogs = ref<SignLog[]>([])
const loading = ref(false)
const showRenew = ref(false)
const renewDate = ref('')
const showDoc = ref(false)

// 打印 / 另存为 PDF：触发浏览器打印对话框（仅输出合同正文）
function doPrint() {
  window.print()
}

function statusType(s: string) {
  return statusTag('contract', s)
}

async function load() {
  loading.value = true
  const [r1, r2, r3] = await Promise.all([
    safe(getContractDetail(contractId), {} as ContractDetail),
    safe(getContractAttachments(contractId), { list: [], total: 0 }),
    safe(getContractSignLog(contractId), { list: [], total: 0 })
  ])
  contract.value = r1.data
  attachments.value = r2.data?.list ?? []
  signLogs.value = r3.data?.list ?? []
  loading.value = false
}

function download(url: string) {
  window.open(url, '_blank')
}

async function doRenew() {
  if (!renewDate.value) return ElMessage.warning('请选择日期')
  const r = await safe(renewContract({ contractId, endDate: renewDate.value }), {})
  if (r.code === 0) { ElMessage.success('续租成功'); showRenew.value = false; load() }
  else ElMessage.error(r.message || '操作失败')
}

async function terminate() {
  const { value } = await ElMessageBox.prompt('请输入终止原因', '终止合同', { type: 'warning' })
  const r = await safe(terminateContract(contractId, value), {})
  if (r.code === 0) { ElMessage.success('已终止'); load() }
  else ElMessage.error(r.message || '操作失败')
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.status-bar { display: flex; justify-content: space-between; align-items: center; }
.contract-no { margin-left: 12px; color: var(--el-text-color-secondary); font-size: 13px; }
.actions { display: flex; gap: 8px; }
.log-item { display: flex; flex-direction: column; }
.log-action { font-weight: 600; }
.log-operator { font-size: 12px; color: var(--el-text-color-secondary); }
.log-remark { font-size: 12px; color: var(--el-text-color-secondary); }
</style>

<style>
/* 合同正文：白纸档案排版，打印时仅输出合同区域 */
.doc-scroll {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px;
}
.print-area {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 36px 44px;
  color: #1f2329;
  line-height: 1.8;
  font-size: 14px;
}
.doc-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.3em;
  margin: 0 0 6px;
}
.doc-no {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-bottom: 22px;
}
.doc-meta {
  border: 1px solid #e2e6ec;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 18px;
}
.doc-meta .row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
}
.doc-meta .row span {
  color: #666;
}
.doc-clauses h4 {
  margin: 16px 0 6px;
  font-size: 14px;
  color: #1f2329;
}
.doc-clauses p {
  margin: 0;
  color: #444;
  text-align: justify;
}
.doc-sign {
  margin-top: 30px;
  border-top: 1px dashed #d8dde4;
  padding-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-size: 13px;
}
.sign-item span {
  color: #666;
}
.sign-seal {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 14px;
}
@media print {
  body * {
    visibility: hidden;
  }
  #contract-print,
  #contract-print * {
    visibility: visible;
  }
  #contract-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none;
    box-shadow: none;
  }
}
</style>
