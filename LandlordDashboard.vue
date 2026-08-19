<template>
  <div class="page-max">
    <el-row :gutter="16">
      <!-- 左侧：统计卡片 -->
      <el-col :span="18">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon" style="background: #409EFF">🏠</div>
              <div class="stat-value">{{ stats.totalHouses || 0 }}</div>
              <div class="stat-label">我的房源</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon" style="background: #67C23A">📝</div>
              <div class="stat-value">{{ stats.totalContracts || 0 }}</div>
              <div class="stat-label">有效合同</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon" style="background: #E6A23C">💰</div>
              <div class="stat-value">¥{{ (stats.totalIncome || 0).toLocaleString() }}</div>
              <div class="stat-label">累计收入</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-icon" style="background: #F56C6C">⏰</div>
              <div class="stat-value">{{ stats.expiringContracts || 0 }}</div>
              <div class="stat-label">即将到期</div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 合同到期提醒 -->
        <el-card shadow="never" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>合同到期提醒</span>
              <el-button type="primary" size="small" @click="$router.push('/landlord/contracts')">查看全部</el-button>
            </div>
          </template>
          <el-timeline v-if="expiringContracts.length > 0">
            <el-timeline-item
              v-for="item in expiringContracts"
              :key="item.id"
              :timestamp="`${item.endDate} 到期`"
              :type="getExpiryType(item.endDate)"
            >
              <el-card shadow="never" class="contract-card">
                <div class="contract-info">
                  <div class="contract-title">{{ item.houseTitle }}</div>
                  <div class="contract-detail">租客：{{ item.tenantName }} | 月租：¥{{ item.monthlyRent }}</div>
                </div>
                <el-button size="small" @click="handleRenew(item)">续租</el-button>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无即将到期的合同" />
        </el-card>

        <!-- 智能调价建议 -->
        <el-card shadow="never" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>智能调价建议</span>
              <el-tag size="small" type="info">基于市场行情</el-tag>
            </div>
          </template>
          <el-table :data="priceSuggestions" stripe>
            <el-table-column prop="houseTitle" label="房源" min-width="200" />
            <el-table-column prop="currentPrice" label="当前租金" width="120">
              <template #default="{ row }">¥{{ row.currentPrice }}/月</template>
            </el-table-column>
            <el-table-column prop="suggestedPrice" label="建议租金" width="120">
              <template #default="{ row }">
                <span :class="row.trend === 'up' ? 'price-up' : 'price-down'">
                  ¥{{ row.suggestedPrice }}/月
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势" width="100">
              <template #default="{ row }">
                <el-tag :type="row.trend === 'up' ? 'success' : 'warning'" size="small">
                  {{ row.trend === 'up' ? '↑ 上涨' : '↓ 下跌' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="建议原因" min-width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="adjustPrice(row)">调价</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：快捷操作 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <span>快捷操作</span>
          </template>
          <el-space direction="vertical" style="width: 100%">
            <el-button type="primary" style="width: 100%" @click="$router.push('/landlord/publish')">
              ➕ 发布房源
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/landlord/my-houses')">
              🏠 我的房源
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/landlord/bookings')">
              📅 看房预约
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/landlord/orders')">
              📋 订单管理
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/landlord/bills')">
              💳 账单管理
            </el-button>
            <el-button style="width: 100%" @click="$router.push('/landlord/withdraw')">
              💰 提现管理
            </el-button>
          </el-space>
        </el-card>

        <el-card shadow="never" style="margin-top: 16px">
          <template #header>
            <span>待处理事项</span>
          </template>
          <el-space direction="vertical" style="width: 100%">
            <el-tag type="warning" closable @close="handleClear('booking')">
              📅 {{ stats.pendingBookings || 0 }} 个看房预约待确认
            </el-tag>
            <el-tag type="danger" closable @close="handleClear('repair')">
              🔧 {{ stats.pendingRepairs || 0 }} 个报修工单待处理
            </el-tag>
            <el-tag type="success" closable @close="handleClear('withdraw')">
              💰 {{ stats.pendingWithdraw || 0 }} 笔提现待审核
            </el-tag>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getLandlordStats, type LandlordStats } from '@/api/landlord'

const router = useRouter()
const stats = ref<LandlordStats>({
  totalHouses: 0,
  totalContracts: 0,
  totalOrders: 0,
  totalIncome: 0,
  pendingWithdraw: 0,
  expiringContracts: 0,
  pendingRepairs: 0
})

const expiringContracts = ref([
  { id: 1, houseTitle: '望京西园精装两居', tenantName: '张三', monthlyRent: 6500, endDate: '2024-09-15' },
  { id: 2, houseTitle: '朝阳公园附近一居室', tenantName: '李四', monthlyRent: 5800, endDate: '2024-09-20' }
])

const priceSuggestions = ref([
  { houseTitle: '望京西园精装两居', currentPrice: 6500, suggestedPrice: 6800, trend: 'up', reason: '周边租金上涨 5%' },
  { houseTitle: '朝阳公园附近一居室', currentPrice: 5800, suggestedPrice: 5500, trend: 'down', reason: '同小区成交均价下降' }
])

function getExpiryType(date: string): 'primary' | 'warning' | 'danger' {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 7) return 'danger'
  if (days <= 30) return 'warning'
  return 'primary'
}

function handleRenew(contract: any) {
  router.push(`/landlord/contracts/${contract.id}/renew`)
}

function adjustPrice(row: any) {
  ElMessage.info(`调整房源价格：${row.houseTitle}`)
  router.push('/landlord/houses')
}

function handleClear(type: string) {
  if (type === 'booking') stats.value.pendingBookings = 0
  if (type === 'repair') stats.value.pendingRepairs = 0
  if (type === 'withdraw') stats.value.pendingWithdraw = 0
  ElMessage.success('已处理')
}

async function loadStats() {
  try {
    const res = await getLandlordStats()
    if (res.code === 0) {
      stats.value = res.data
    }
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
}

onMounted(loadStats)
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contract-card {
  margin-bottom: 0 !important;
}

.contract-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contract-title {
  font-weight: 500;
  color: #303133;
}

.contract-detail {
  font-size: 12px;
  color: #909399;
}

.price-up {
  color: #67C23A;
  font-weight: 600;
}

.price-down {
  color: #F56C6C;
  font-weight: 600;
}
</style>
