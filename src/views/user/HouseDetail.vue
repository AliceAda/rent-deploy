<template>
  <div class="page-max" v-if="house">
    <el-row :gutter="20">
      <el-col :md="17">
        <!-- 画廊 -->
        <div class="gallery">
          <div v-for="i in 4" :key="i" class="g" :class="{ big: i === 1 }" :style="{ background: grads[house.id % 4] }">
            {{ i === 1 ? '主图' : '图' + i }}
          </div>
        </div>

        <el-card shadow="never" class="info">
          <div class="price-row">
            <span class="price">¥{{ house.price }} <small>/月 · {{ house.depositType }}</small></span>
            <el-tag :type="house.status === '可租' ? 'success' : 'info'">{{ house.status }}</el-tag>
          </div>
          <el-descriptions :column="3" border class="kv">
            <el-descriptions-item label="户型">{{ house.layout }}</el-descriptions-item>
            <el-descriptions-item label="面积">{{ house.area }}㎡</el-descriptions-item>
            <el-descriptions-item label="朝向">{{ house.orientation }}</el-descriptions-item>
            <el-descriptions-item label="楼层">{{ house.floor }}</el-descriptions-item>
            <el-descriptions-item label="装修">{{ house.decoration }}</el-descriptions-item>
            <el-descriptions-item label="区域">{{ house.district }}</el-descriptions-item>
          </el-descriptions>
          <div class="tags">
            <el-tag v-for="t in house.tags" :key="t" type="primary" effect="light">{{ t }}</el-tag>
          </div>
          <p class="desc text-sub">{{ house.description }}</p>

          <div class="landlord">
            <div class="av">{{ house.landlordId }}</div>
            <div>
              <div><b>{{ house.source === '经纪人代发' ? '经纪人' : '房东' }}</b> <el-tag size="small" type="success" effect="plain">✓ 实名认证</el-tag></div>
              <small class="text-sub">{{ house.source }} · 响应快</small>
            </div>
            <el-button style="margin-left: auto" type="primary" plain>💬 在线咨询</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :md="7">
        <el-card shadow="never">
          <h4>位置与周边</h4>
          <div class="map-ph">📍 地图占位 · 周边地铁 / 商超 / 医院配套</div>
        </el-card>
        <el-card shadow="never" class="fee">
          <h4>费用说明</h4>
          <p class="text-sub">押金：<b>{{ house.depositType }}</b></p>
          <p class="text-sub">物业 / 取暖：面议</p>
          <p class="text-sub">中介费：平台撮合 <b>半月租金</b>（首单立减券可用）</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 价格历史 / 房间信息 / 看房日程 -->
    <el-card shadow="never" class="extra">
      <el-tabs v-model="extraTab">
        <el-tab-pane label="价格历史" name="price">
          <ul v-if="priceHistory.length" class="simple-list">
            <li v-for="(p, i) in priceHistory" :key="i">
              <span class="text-sub">{{ p.date }}</span>
              <b class="price-text">¥{{ p.price }}/月</b>
            </li>
          </ul>
          <el-empty v-else description="暂无价格历史" :image-size="60" />
        </el-tab-pane>
        <el-tab-pane label="房间信息" name="rooms">
          <el-table :data="rooms" empty-text="暂无房间信息" size="small">
            <el-table-column prop="name" label="房间" min-width="120" />
            <el-table-column prop="area" label="面积(㎡)" width="100" />
            <el-table-column prop="orientation" label="朝向" width="100" />
            <el-table-column prop="price" label="价格(元/月)" width="120" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="看房日程" name="schedule">
          <ul v-if="schedule.length" class="simple-list">
            <li v-for="s in schedule" :key="s.id">
              <span class="text-sub">{{ s.date }} · {{ s.timeSlot }}</span>
              <el-tag size="small">{{ s.status }}</el-tag>
            </li>
          </ul>
          <el-empty v-else description="暂无看房日程" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 底部常驻 CTA -->
    <div class="cta">
      <el-button size="large" :type="store.isCollected(house.id) ? 'warning' : 'default'" @click="store.toggleCollect(house.id)">
        {{ store.isCollected(house.id) ? '♥ 已收藏' : '♡ 收藏' }}
      </el-button>
      <el-button size="large" @click="goBooking">📅 预约看房</el-button>
      <el-button size="large" type="primary" @click="goSign">✍️ 在线签约</el-button>
      <el-button size="large" type="danger" plain @click="reportVisible = true">🚩 举报</el-button>
    </div>

    <!-- 预约看房弹窗：需登录 → 选时间/备注 → 提交成功 -->
    <el-dialog v-model="bookingVisible" title="预约看房" width="440px">
      <el-form label-width="72px">
        <el-form-item label="房源"><span>{{ house?.title }}</span></el-form-item>
        <el-form-item label="期望时间">
          <el-date-picker v-model="bookingForm.time" type="datetime" placeholder="选择看房时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bookingForm.remark" type="textarea" :rows="2" placeholder="如：想看采光、周边配套" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bookingVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBooking">提交预约</el-button>
      </template>
    </el-dialog>

    <!-- 举报弹窗 -->
    <el-dialog v-model="reportVisible" title="举报房源" width="440px">
      <el-form label-width="72px">
        <el-form-item label="房源"><span>{{ house?.title }}</span></el-form-item>
        <el-form-item label="举报原因">
          <el-input v-model="reportReason" type="textarea" :rows="3" placeholder="请说明举报原因，如虚假房源、违规信息等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReport">提交举报</el-button>
      </template>
    </el-dialog>
  </div>
  <el-empty v-else description="房源不存在" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store'
import { useAuthStore } from '@/store/auth'
import { safe } from '@/api/http'
import {
  getPriceHistory, getHouseRooms, getHouseSchedule,
  recordView, reportHouse,
  type PriceHistory, type HouseRoom, type ScheduleItem
} from '@/api/house'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
const house = computed(() => store.houses.find((h) => h.id === id.value))
const grads = [
  'linear-gradient(135deg,#2F6FED,#5a86ff)',
  'linear-gradient(135deg,#FF7D3C,#ff9a6b)',
  'linear-gradient(135deg,#1aa86a,#5fd6a0)',
  'linear-gradient(135deg,#7a5af0,#a98bff)'
]

function goSign() {
  router.push('/sign/' + id.value)
}

const bookingVisible = ref(false)
const bookingForm = ref({ time: '', remark: '' })
function goBooking() {
  if (!auth.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  bookingVisible.value = true
}
function submitBooking() {
  if (!house.value) return
  const h = house.value
  const nextId = Math.max(0, ...store.bookings.map((b) => b.id)) + 1
  store.addBooking({
    id: nextId,
    houseId: h.id,
    houseTitle: h.title,
    tenant: auth.user?.name || '我',
    phone: auth.user?.phone || '',
    time: String(bookingForm.value.time || '待定'),
    remark: bookingForm.value.remark || '—',
    status: '待确认'
  })
  bookingVisible.value = false
  bookingForm.value = { time: '', remark: '' }
  ElMessage.success('预约申请已提交，房东会尽快确认')
}

// 价格历史 / 房间信息 / 看房日程
const extraTab = ref('price')
const priceHistory = ref<PriceHistory[]>([])
const rooms = ref<HouseRoom[]>([])
const schedule = ref<ScheduleItem[]>([])

async function loadExtra() {
  const [p, r, s] = await Promise.all([
    safe(getPriceHistory(id.value), { list: [], total: 0 }),
    safe(getHouseRooms(id.value), { list: [], total: 0 }),
    safe(getHouseSchedule(id.value), { list: [], total: 0 })
  ])
  priceHistory.value = p.data?.list ?? []
  rooms.value = r.data?.list ?? []
  schedule.value = s.data?.list ?? []
}

// 举报
const reportVisible = ref(false)
const reportReason = ref('')
async function submitReport() {
  if (!reportReason.value.trim()) {
    ElMessage.warning('请输入举报原因')
    return
  }
  const r = await safe(reportHouse({ houseId: id.value, reason: reportReason.value }), {})
  if (r.code === 0) {
    ElMessage.success('举报已提交，平台会尽快处理')
    reportVisible.value = false
    reportReason.value = ''
  } else {
    ElMessage.error(r.message || '举报失败')
  }
}

onMounted(() => {
  if (id.value) {
    safe(recordView(id.value), {})
    loadExtra()
  }
})
</script>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 130px);
  gap: 8px;
  border-radius: 14px;
  overflow: hidden;
}
.g {
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.g.big {
  grid-row: span 2;
}
.info {
  margin-top: 16px;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.price {
  color: var(--orange);
  font-weight: 800;
  font-size: 26px;
}
.price small {
  font-size: 13px;
  color: var(--sub);
  font-weight: 400;
}
.kv {
  margin: 16px 0;
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.landlord {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg);
  border-radius: 12px;
  padding: 12px;
}
.landlord .av {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), #5a86ff);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.map-ph {
  border: 1px dashed var(--line);
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  color: var(--sub);
}
.fee {
  margin-top: 14px;
}
.extra {
  margin-top: 16px;
}
.simple-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.simple-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}
.simple-list li:last-child {
  border-bottom: none;
}
.price-text {
  color: var(--orange);
}
.cta {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  background: #fff;
  border-top: 1px solid var(--line);
  padding: 14px 20px;
  margin-top: 20px;
}
</style>
