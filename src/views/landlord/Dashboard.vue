<template>
  <div class="page-max">
    <h3>工作台</h3>
    <p class="sub">房东经营概览，随时掌握房源与收益动态</p>

    <DemoBanner
      v-if="isDemo"
      title="当前为演示数据（工作台接口未就绪）"
      description="各项指标已回退到本地演示数据，接入后端后自动切换为真实数据。"
    />

    <el-row :gutter="14" class="stats" v-loading="loading">
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num">{{ totalHouses }}</div>
          <div class="lab">房源总数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num ok">{{ rentableCount }}</div>
          <div class="lab">在租 / 可租</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num warn">{{ pendingBookings }}</div>
          <div class="lab">待确认预约</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num price">¥{{ receivable.toLocaleString() }}</div>
          <div class="lab">本月应收</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="14" style="margin-top: 14px">
      <el-col :md="14">
        <el-card shadow="never" class="card">
          <div class="card-h"><b>最新看房预约</b><router-link to="/landlord/bookings" class="more">全部 →</router-link></div>
          <el-table :data="recentBookings" size="small">
            <el-table-column prop="houseTitle" label="房源" min-width="120" />
            <el-table-column prop="tenant" label="租客" width="80" />
            <el-table-column prop="time" label="时间" width="140" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="statusTag('booking', row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :md="10">
        <el-card shadow="never" class="card quick">
          <div class="card-h"><b>快捷操作</b></div>
          <router-link to="/landlord/publish">
            <el-button type="primary" size="large" class="qbtn">+ 发布新房源</el-button>
          </router-link>
          <router-link to="/landlord/my-houses">
            <el-button size="large" class="qbtn">管理我的房源（{{ totalHouses }}）</el-button>
          </router-link>
          <router-link to="/landlord/bills">
            <el-button size="large" class="qbtn">查看租金账单</el-button>
          </router-link>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLandlordStore } from '@/store/landlord'
import { landlordBills } from '@/mock/data'
import { getLandlordHouses } from '@/api/house'
import { getLandlordBookings, type BookingItem } from '@/api/booking'
import { getLandlordBills, type BillItem } from '@/api/bill'
import { useDataSource } from '@/composables/useDataSource'
import { statusTag } from '@/utils/status'
import DemoBanner from '@/components/DemoBanner.vue'

const landlord = useLandlordStore()

// API-first + mock 回退：接口就绪用真实数据，未就绪回退本地演示数据并标记 isDemo
const houses = useDataSource(
  () => getLandlordHouses(),
  { list: landlord.myHouses, total: landlord.myHouses.length }
)
const bookings = useDataSource(
  () => getLandlordBookings(),
  {
    list: landlord.bookings.map((b) => ({
      id: b.id,
      houseId: b.houseId,
      houseTitle: b.houseTitle,
      status: b.status,
      appointmentTime: b.time,
      createTime: b.time,
      remark: b.remark,
      userName: b.tenant
    })),
    total: landlord.bookings.length
  }
)
const bills = useDataSource(
  () => getLandlordBills(),
  {
    list: landlordBills.map((b) => ({
      id: b.id,
      houseId: 0,
      title: b.houseTitle,
      type: '租金',
      amount: b.amount,
      paid: b.paid,
      status: b.status
    })),
    total: landlordBills.length
  }
)

const loading = computed(() => houses.loading.value || bookings.loading.value || bills.loading.value)
const isDemo = computed(() => houses.isDemo.value || bookings.isDemo.value || bills.isDemo.value)

// useDataSource 不会自动加载，挂载时显式触发（接口就绪后即切真实数据）
onMounted(() => {
  houses.load()
  bookings.load()
  bills.load()
})

const totalHouses = computed(() => houses.data.value.list.length)
const rentableCount = computed(() => houses.data.value.list.filter((h) => h.status === '可租').length)
const pendingBookings = computed(() => bookings.data.value.list.filter((b) => b.status === '待确认').length)
const receivable = computed(() =>
  bills.data.value.list.filter((b) => b.status !== '已收').reduce((s, b) => s + ((b.amount ?? 0) - (b.paid ?? 0)), 0)
)
const recentBookings = computed(() =>
  bookings.data.value.list.slice(0, 4).map((b: BookingItem) => ({
    houseTitle: b.houseTitle ?? '',
    tenant: b.userName ?? '',
    time: b.appointmentTime,
    status: b.status
  }))
)
</script>

<style scoped>
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.stat {
  text-align: center;
  border-radius: 12px;
}
.stat .num {
  font-size: 26px;
  font-weight: 800;
  color: var(--brand);
}
.stat .num.ok {
  color: var(--ok);
}
.stat .num.warn {
  color: var(--warn);
}
.stat .num.price {
  color: var(--orange);
  font-size: 22px;
}
.stat .lab {
  color: var(--sub);
  margin-top: 4px;
}
.card {
  border-radius: 12px;
}
.card-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.more {
  color: var(--brand);
  font-size: 13px;
}
.quick .qbtn {
  width: 100%;
  margin-bottom: 12px;
}
</style>
