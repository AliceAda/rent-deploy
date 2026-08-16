<template>
  <div class="page-max">
    <h3>工作台</h3>
    <p class="sub">房东经营概览，随时掌握房源与收益动态</p>

    <el-row :gutter="14" class="stats">
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num">{{ landlord.myHouses.length }}</div>
          <div class="lab">房源总数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num ok">{{ landlord.rentableCount }}</div>
          <div class="lab">在租 / 可租</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat">
          <div class="num warn">{{ landlord.pendingBookings }}</div>
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
                <el-tag :type="row.status === '待确认' ? 'warning' : row.status === '已确认' ? 'success' : 'info'" size="small">
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
            <el-button size="large" class="qbtn">管理我的房源（{{ landlord.myHouses.length }}）</el-button>
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
import { computed } from 'vue'
import { useLandlordStore } from '@/store/landlord'
import { landlordBills } from '@/mock/data'

const landlord = useLandlordStore()
const recentBookings = computed(() => landlord.bookings.slice(0, 4))
const receivable = computed(() =>
  landlordBills.filter((b) => b.status !== '已收').reduce((s, b) => s + (b.amount - b.paid), 0)
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
