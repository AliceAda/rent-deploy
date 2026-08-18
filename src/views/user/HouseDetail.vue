<template>
  <div class="page-max">
    <AppSkeleton v-if="houseLoading" :rows="8" block />
    <template v-else-if="house">
    <el-row :gutter="20">
      <el-col :md="17">
        <!-- 画廊：房源插画图 + VR 入口（点击放大灯箱） -->
        <div class="gallery">
          <div
            v-for="(sc, i) in GALLERY_SCENES"
            :key="i"
            class="g"
            :class="{ big: i === 0 }"
            :style="{ backgroundImage: houseImg(house.id, sc) }"
            @click="openLightbox(i)"
          >
            <span class="g-label mono">{{ SCENE_NAMES[sc] }}</span>
            <button v-if="i === 0" class="vr-btn" @click.stop="openVR">
              <span class="vr-icon">◉</span> VR 看房
            </button>
          </div>
        </div>

        <el-card shadow="never" class="info">
          <div class="price-row">
            <span class="price mono">¥{{ house.price }} <small>/月 · {{ house.depositType }}</small></span>
            <el-tag :type="house.status === '可租' ? 'success' : 'info'">{{ house.status }}</el-tag>
            <span v-if="house.grade >= 4.6" class="verified">
              <span class="seal sm">已验</span>
              <span class="verified-text">平台实地核验</span>
            </span>
          </div>
          <div class="kv">
            <div class="cell"><span class="k">户型</span><b>{{ house.layout }}</b></div>
            <div class="cell"><span class="k">面积</span><b>{{ house.area }}㎡</b></div>
            <div class="cell"><span class="k">朝向</span><b>{{ house.orientation }}</b></div>
            <div class="cell"><span class="k">楼层</span><b>{{ house.floor }}</b></div>
            <div class="cell"><span class="k">装修</span><b>{{ house.decoration }}</b></div>
            <div class="cell"><span class="k">区域</span><b>{{ house.district }}</b></div>
          </div>
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
          <div class="poi-list">
            <div v-for="p in poi" :key="p.id" class="poi">
              <span class="poi-ico">{{ POI_ICON[p.type] }}</span>
              <div class="poi-main">
                <div class="poi-name">{{ p.name }}</div>
                <div class="poi-dist mono">{{ p.distance }}</div>
              </div>
            </div>
          </div>
          <HouseMap v-if="house" :houses="[house]" :height="200" :show-tip="false" @open="openDetail" />
        </el-card>
        <el-card shadow="never" class="fee">
          <h4>费用试算</h4>
          <div class="calc-row">
            <span class="k">租期</span>
            <el-radio-group v-model="calcTerm" size="small">
              <el-radio-button :value="1">1 月</el-radio-button>
              <el-radio-button :value="3">3 月</el-radio-button>
              <el-radio-button :value="6">半年</el-radio-button>
              <el-radio-button :value="12">一年</el-radio-button>
            </el-radio-group>
          </div>
          <div class="calc-lines">
            <div class="calc-line"><span>押金（{{ house.depositType }}）</span><b class="mono">¥{{ deposit }}</b></div>
            <div class="calc-line"><span>租金 × {{ calcTerm }} 个月</span><b class="mono">¥{{ rentTotal }}</b></div>
            <div class="calc-line"><span>平台服务费（半月租金）</span><b class="mono">¥{{ serviceFee }}</b></div>
            <div class="calc-line total"><span>合计</span><b class="mono price">¥{{ calcTotal }}</b></div>
          </div>
          <p class="note text-sub">* 试算仅供参考，实际以合同为准；首单可用优惠券立减</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 价格历史 / 房间信息 / 看房日程 -->
    <el-card shadow="never" class="extra">
      <el-tabs v-model="extraTab">
        <el-tab-pane label="价格历史" name="price">
          <RentTrendChart v-if="priceHistory.length" :data="priceHistory" />
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
      <el-button size="large" plain @click="openChat">💬 在线咨询</el-button>
      <el-button size="large" :type="store.isCollected(house.id) ? 'warning' : 'default'" @click="toggleCollect(house.id)">
        {{ store.isCollected(house.id) ? '♥ 已收藏' : '♡ 收藏' }}
      </el-button>
      <el-button size="large" plain @click="openShare">🔗 分享</el-button>
      <el-button size="large" @click="goBooking">📅 预约看房</el-button>
      <el-button size="large" type="primary" @click="goSign">✍️ 在线签约</el-button>
      <el-button size="large" type="danger" plain @click="reportVisible = true">🚩 举报</el-button>
    </div>

    <!-- 为你推荐：同区域 / 同价位（市面详情页标配） -->
    <el-card v-if="recommend.length" shadow="never" class="recommend">
      <div class="sec-head">
        <span class="bar"></span>
        <h3 class="serif">为你推荐</h3>
        <span class="eyebrow">SIMILAR · 同区域同价位房源</span>
      </div>
      <el-row :gutter="16">
        <el-col v-for="h in recommend" :key="h.id" :xs="12" :sm="8" :md="6">
          <HouseCard :house="h" @open="openDetail" @fav="toggleCollect(h.id)" />
        </el-col>
      </el-row>
    </el-card>

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

    <!-- 分享弹层 -->
    <el-dialog v-model="shareVisible" title="分享房源" width="360px" align-center>
      <div v-if="house" class="share-card">
        <div class="share-img" :style="{ backgroundImage: houseImg(house.id, 'living') }"></div>
        <div class="share-body">
          <div class="share-title serif">{{ house.title }}</div>
          <div class="share-meta mono">{{ house.district }} · {{ house.layout }} · {{ house.area }}㎡</div>
          <div class="share-price mono">¥{{ house.price }}<i>/月</i></div>
          <div class="share-qr">
            <div class="qr-ph"></div>
            <span>扫一扫 查看房源</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="copyShare">📋 复制链接</el-button>
        <el-button type="primary" plain @click="shareVisible = false">完成</el-button>
      </template>
    </el-dialog>

    <!-- 图片灯箱：点击画廊放大，左右切换 -->
    <div v-if="lightbox !== null" class="lightbox" @click.self="lightbox = null">
      <div class="lb-stage">
        <div
          class="lb-img"
          :style="{ backgroundImage: houseImg(house!.id, GALLERY_SCENES[lightbox]) }"
        >
          <span class="lb-label mono">{{ SCENE_NAMES[GALLERY_SCENES[lightbox]] }} · {{ lightbox + 1 }} / {{ GALLERY_SCENES.length }}</span>
        </div>
        <button class="lb-nav prev" @click="lbPrev">‹</button>
        <button class="lb-nav next" @click="lbNext">›</button>
        <button class="lb-close" @click="lightbox = null">✕</button>
      </div>
    </div>

    <!-- VR 看房（拖拽全景） -->
    <div v-if="vrVisible" class="vr-overlay">
      <div
        class="vr-stage"
        @pointerdown="vrStart"
        @pointermove="vrMove"
        @pointerup="vrEnd"
        @pointerleave="vrEnd"
      >
        <div class="vr-scene" :style="{ backgroundImage: houseImg(house!.id, vrScene), transform: 'perspective(1100px) rotateY(' + vrAngle + 'deg)' }">
          <div class="vr-hint">⟷ 按住拖动旋转 · {{ SCENE_NAMES[vrScene] }}</div>
        </div>
      </div>
      <div class="vr-bar">
        <el-button v-for="sc in VR_SCENES" :key="sc" size="small" :type="vrScene === sc ? 'primary' : 'default'" @click="vrScene = sc">
          {{ SCENE_NAMES[sc] }}
        </el-button>
        <el-button size="small" :type="vrAuto ? 'warning' : 'default'" @click="vrAuto = !vrAuto">
          {{ vrAuto ? '⏸ 暂停旋转' : '▶ 自动旋转' }}
        </el-button>
        <el-button size="small" @click="vrVisible = false">✕ 退出</el-button>
      </div>
    </div>
    </template>
    <el-empty v-else description="房源不存在" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store'
import { useAuthStore } from '@/store/auth'
import { safe } from '@/api/http'
import {
  getHouseList, getPOIs, getPriceHistory, getHouseRooms, getHouseSchedule,
  recordView, reportHouse,
  type PriceHistory, type HouseRoom, type ScheduleItem
} from '@/api/house'
import { createBooking } from '@/api/booking'
import { resolveHouse, toBrowseHouse } from '@/utils/house'
import { houseImg, GALLERY_SCENES, SCENE_NAMES, type HouseScene } from '@/utils/houseImg'
import { toggleCollect } from '@/utils/collect'
import HouseCard from '@/components/HouseCard.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import RentTrendChart from '@/components/RentTrendChart.vue'
import HouseMap from '@/components/HouseMap.vue'
import type { House } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
// API-first + store 回退（与列表页同一数据策略，避免漏斗断点）
const house = ref<House | null>(null)
const houseLoading = ref(false)
async function loadHouse() {
  houseLoading.value = true
  house.value = await resolveHouse(id.value)
  houseLoading.value = false
  loadRecommend()
  loadPoi()
}
watch(() => route.params.id, loadHouse)

function openDetail(id: number) {
  router.push('/detail/' + id)
}

// ===== 周边配套（地铁 / 商超 / 医院 / 学校 / 公园） =====
interface PoiItem {
  id: number
  type: 'metro' | 'mall' | 'hospital' | 'school' | 'park'
  name: string
  distance: string
}
const POI_ICON: Record<PoiItem['type'], string> = {
  metro: '🚇',
  mall: '🛍️',
  hospital: '🏥',
  school: '🏫',
  park: '🌳'
}
const poi = ref<PoiItem[]>([])
async function loadPoi() {
  const r = await safe(getPOIs({ houseId: id.value }), null)
  poi.value = (r.code === 0 ? (r.data as { list?: PoiItem[] } | null)?.list : undefined) ?? []
}

// ===== 费用试算器（押金 + 月租×期数 + 半月服务费） =====
const calcTerm = ref(1)
const deposit = computed(() => (house.value ? house.value.price : 0))
const rentTotal = computed(() => (house.value ? house.value.price * calcTerm.value : 0))
const serviceFee = computed(() => (house.value ? Math.round(house.value.price / 2) : 0))
const calcTotal = computed(() => deposit.value + rentTotal.value + serviceFee.value)

// ===== 图片灯箱 =====
const lightbox = ref<number | null>(null)
function openLightbox(i: number) {
  lightbox.value = i
}
function lbPrev() {
  if (lightbox.value === null) return
  lightbox.value = (lightbox.value + GALLERY_SCENES.length - 1) % GALLERY_SCENES.length
}
function lbNext() {
  if (lightbox.value === null) return
  lightbox.value = (lightbox.value + 1) % GALLERY_SCENES.length
}
function onKey(e: KeyboardEvent) {
  if (lightbox.value === null) return
  if (e.key === 'ArrowLeft') lbPrev()
  else if (e.key === 'ArrowRight') lbNext()
  else if (e.key === 'Escape') lightbox.value = null
}

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
async function submitBooking() {
  if (!house.value) return
  const h = house.value
  const payload = { houseId: h.id, time: bookingForm.value.time || '', remark: bookingForm.value.remark || '' }
  const r = await safe(createBooking(payload), null)
  if (r.code !== 0) {
    // 回退：MSW/后端不可用时写入本地 store，演示仍可用
    const nextId = Math.max(0, ...store.bookings.map((b) => b.id)) + 1
    store.addBooking({
      id: nextId,
      houseId: h.id,
      houseTitle: h.title,
      tenant: auth.user?.name || '我',
      phone: auth.user?.phone || '',
      time: payload.time || '待定',
      remark: payload.remark || '—',
      status: '待确认'
    })
  }
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

// ===== 为你推荐（同区域 / 同价位，API-first + store 回退） =====
const recommend = ref<House[]>([])
async function loadRecommend() {
  const r = await safe(getHouseList(), null)
  const all = ((r.code === 0 ? r.data?.list : null) ?? store.publicHouses).map(toBrowseHouse)
  const cur = house.value
  recommend.value = all
    .filter((h) => h.id !== cur?.id)
    .map((h) => {
      let s = 0
      if (cur) {
        if (h.district === cur.district) s += 3
        const d = Math.abs(h.price - cur.price) / cur.price
        if (d < 0.15) s += 2
        else if (d < 0.3) s += 1
        if (h.rentType === cur.rentType) s += 1
      }
      return { h, s }
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.h)
}

// ===== 分享 =====
const shareVisible = ref(false)
function openShare() {
  shareVisible.value = true
}
async function copyShare() {
  const url = location.origin + location.pathname + '#/detail/' + id.value
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('房源链接已复制')
  } catch {
    ElMessage.success(url)
  }
}

// ===== VR 看房（拖拽全景，模拟市面 VR 看房） =====
const VR_SCENES: HouseScene[] = GALLERY_SCENES
const vrVisible = ref(false)
const vrScene = ref<HouseScene>('living')
const vrAngle = ref(0)
const vrAuto = ref(false)
let vrDragging = false
let vrLastX = 0
function openVR() {
  vrVisible.value = true
  vrScene.value = 'living'
  vrAngle.value = 0
  vrAuto.value = true
}
function vrStart(e: PointerEvent) {
  vrDragging = true
  vrLastX = e.clientX
  vrAuto.value = false
}
function vrMove(e: PointerEvent) {
  if (!vrDragging) return
  vrAngle.value += (e.clientX - vrLastX) * 0.5
  vrLastX = e.clientX
}
function vrEnd() {
  vrDragging = false
}
let vrTimer: ReturnType<typeof setInterval> | null = null
watch(vrAuto, (v) => {
  if (vrTimer) clearInterval(vrTimer)
  if (v) vrTimer = setInterval(() => (vrAngle.value += 0.6), 40)
})
onBeforeUnmount(() => {
  if (vrTimer) clearInterval(vrTimer)
})

// ===== 在线咨询：打开全局客服浮窗并携带房源上下文 =====
function openChat() {
  window.dispatchEvent(new CustomEvent('open-chat', { detail: { house: house.value } }))
}

onMounted(() => {
  if (id.value) {
    safe(recordView(id.value), {})
    loadExtra()
    loadHouse()
  }
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
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
  position: relative;
  display: grid;
  place-items: center;
  background-color: #dfe6ee;
  background-size: cover;
  background-position: center;
}
.g.big {
  grid-row: span 2;
}
.g-label {
  position: absolute;
  left: 10px;
  top: 10px;
  background: rgba(15, 23, 42, 0.45);
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: 20px;
  backdrop-filter: blur(2px);
}
.vr-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background 0.15s;
}
.vr-btn:hover {
  background: var(--brand);
  border-color: var(--brand);
}
.vr-icon {
  color: #7fd6a8;
  font-size: 12px;
}
.info {
  margin-top: 16px;
}
.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.price {
  color: var(--orange);
  font-weight: 700;
  font-size: 28px;
}
.price small {
  font-size: 13px;
  color: var(--sub);
  font-weight: 400;
}
.verified {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.verified-text {
  font-size: 12px;
  color: var(--sub);
}
/* 档案式键值格：发丝线网格，等宽标签 */
.kv {
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
}
.kv .cell {
  padding: 10px 14px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--panel);
}
.kv .cell:nth-child(3n) {
  border-right: none;
}
.kv .cell:nth-last-child(-n + 3) {
  border-bottom: none;
}
.kv .k {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--sub);
  letter-spacing: 0.1em;
  margin-bottom: 2px;
}
.kv b {
  font-weight: 600;
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
  background: linear-gradient(135deg, var(--ink), var(--brand));
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
.map-ph.sm {
  padding: 12px;
  font-size: 12px;
  margin-top: 10px;
}
.poi-list {
  display: flex;
  flex-direction: column;
}
.poi {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--line);
}
.poi:last-child {
  border-bottom: none;
}
.poi-ico {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--bg);
  display: grid;
  place-items: center;
  font-size: 16px;
  flex-shrink: 0;
}
.poi-name {
  font-size: 13px;
  font-weight: 600;
}
.poi-dist {
  font-size: 11px;
  color: var(--brand);
}
.fee {
  margin-top: 14px;
}
.calc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.calc-row .k {
  color: var(--sub);
  font-size: 13px;
  flex-shrink: 0;
}
.calc-lines {
  border-top: 1px dashed var(--line);
}
.calc-line {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px dashed var(--line);
  font-size: 13px;
  color: var(--ink);
}
.calc-line.total {
  border-bottom: none;
  font-weight: 700;
  font-size: 14px;
}
.calc-line .price {
  color: var(--orange);
  font-size: 17px;
}
.fee .note {
  margin: 8px 0 0;
  font-size: 11px;
}
/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(9, 13, 20, 0.92);
  display: grid;
  place-items: center;
}
.lb-stage {
  position: relative;
  width: min(960px, 92vw);
  height: min(620px, 82vh);
  border-radius: 12px;
  overflow: hidden;
}
.lb-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-color: #1a2332;
}
.lb-label {
  position: absolute;
  left: 14px;
  top: 14px;
  background: rgba(15, 23, 42, 0.55);
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(3px);
}
.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 26px;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
.lb-nav:hover {
  background: var(--brand);
}
.lb-nav.prev {
  left: 14px;
}
.lb-nav.next {
  right: 14px;
}
.lb-close {
  position: absolute;
  right: 14px;
  top: 14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 15px;
  cursor: pointer;
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
  flex-wrap: wrap;
  background: #fff;
  border-top: 1px solid var(--line);
  padding: 14px 20px;
  margin-top: 20px;
  z-index: 20;
}
.recommend {
  margin-top: 18px;
  border-radius: 14px;
}
.recommend :deep(.sec-head) {
  margin: 0 0 14px;
}
/* 分享卡 */
.share-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.share-img {
  height: 150px;
  background-size: cover;
  background-position: center;
  background-color: #dfe6ee;
}
.share-body {
  padding: 12px 14px;
}
.share-title {
  font-weight: 700;
  font-size: 15px;
}
.share-meta {
  color: var(--sub);
  font-size: 12px;
  margin: 4px 0;
}
.share-price {
  color: var(--orange);
  font-weight: 700;
  font-size: 18px;
}
.share-price i {
  font-style: normal;
  font-size: 12px;
  color: var(--sub);
  font-weight: 400;
}
.share-qr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: var(--sub);
  font-size: 12px;
}
.qr-ph {
  width: 56px;
  height: 56px;
  background:
    linear-gradient(#1f2329 2px, transparent 2px) 0 0/14px 14px,
    linear-gradient(90deg, #1f2329 2px, transparent 2px) 0 0/14px 14px,
    #fff;
  border: 1px solid var(--line);
  border-radius: 6px;
}
/* VR 看房 */
.vr-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: #0b0f16;
  display: flex;
  flex-direction: column;
}
.vr-stage {
  flex: 1;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}
.vr-stage:active {
  cursor: grabbing;
}
.vr-scene {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-color: #1a2332;
  transform-origin: center;
  transition: transform 0.05s linear;
}
.vr-hint {
  position: absolute;
  left: 50%;
  bottom: 72px;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  background: rgba(15, 23, 42, 0.5);
  padding: 4px 14px;
  border-radius: 20px;
  letter-spacing: 0.04em;
}
.vr-bar {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
