<template>
  <div class="page-max">
    <el-page-header @back="$router.back()" :content="isEdit ? '编辑房源' : '房源详情'" style="margin-bottom: 16px" />

    <el-row :gutter="16" v-loading="loading">
      <el-col :span="16">
        <el-card shadow="never" class="mb16">
          <template #header>
            <div class="card-head">
              <span>房源信息</span>
              <div>
                <el-button v-if="!editing" type="primary" @click="editing = true">编辑</el-button>
                <template v-else>
                  <el-button @click="editing = false; load()">取消</el-button>
                  <el-button type="primary" @click="save">保存</el-button>
                </template>
              </div>
            </div>
          </template>
          <el-form :model="form" label-width="100px" :disabled="!editing">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="房源标题"><el-input v-model="form.title" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="租金"><el-input-number v-model="form.price" :min="0" /> 元/月</el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市"><el-input v-model="form.city" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区域"><el-input v-model="form.district" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="小区"><el-input v-model="form.community" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出租方式"><el-input v-model="form.rentType" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="户型"><el-input v-model="form.layout" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="面积"><el-input-number v-model="form.area" :min="0" /> ㎡</el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="楼层"><el-input v-model="form.floor" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="朝向"><el-input v-model="form.orientation" /></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="装修"><el-input v-model="form.decoration" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="押付方式"><el-input v-model="form.depositType" /></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="押金"><el-input-number v-model="form.depositAmount" :min="0" /></el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="详细地址"><el-input v-model="form.addressDetail" /></el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <el-card shadow="never" class="mb16">
          <template #header><span>房间管理</span></template>
          <el-table :data="rooms" size="small" empty-text="暂无房间">
            <el-table-column prop="name" label="房间名" min-width="120" />
            <el-table-column prop="area" label="面积(㎡)" width="100" />
            <el-table-column prop="price" label="价格(元)" width="100" />
            <el-table-column prop="orientation" label="朝向" width="80" />
            <el-table-column prop="status" label="状态" width="80" />
          </el-table>
          <el-button style="margin-top:12px" size="small" @click="showRoom = true">新增房间</el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" class="mb16">
          <template #header><span>房源状态</span></template>
          <el-form label-width="80px">
            <el-form-item label="当前状态">
              <el-tag :type="houseStatusType(form.status)">{{ form.status }}</el-tag>
            </el-form-item>
            <el-form-item label="修改状态">
              <el-select v-model="newStatus" placeholder="选择状态" style="width:100%">
                <el-option label="可租" value="可租" />
                <el-option label="已租" value="已租" />
                <el-option label="已下架" value="已下架" />
              </el-select>
            </el-form-item>
            <el-button type="primary" size="small" @click="updateStatus">更新状态</el-button>
          </el-form>
        </el-card>

        <el-card shadow="never" class="mb16">
          <template #header><span>统计数据</span></template>
          <div v-if="stats" class="stats-grid">
            <div class="stat"><div class="num">{{ stats.views }}</div><div class="label">浏览量</div></div>
            <div class="stat"><div class="num">{{ stats.collects }}</div><div class="label">收藏量</div></div>
            <div class="stat"><div class="num">{{ stats.orders }}</div><div class="label">订单数</div></div>
            <div class="stat"><div class="num">{{ stats.inquiries }}</div><div class="label">咨询数</div></div>
          </div>
        </el-card>

        <el-card shadow="never">
          <template #header><span>图片管理</span></template>
          <div class="img-list">
            <div v-for="img in images" :key="img.id" class="img-item">
              <img :src="img.url" />
            </div>
          </div>
          <el-button style="margin-top:12px" size="small" @click="showImage = true">上传图片</el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showRoom" title="新增房间" width="400px">
      <el-form label-width="80px">
        <el-form-item label="房间名"><el-input v-model="roomForm.name" /></el-form-item>
        <el-form-item label="面积"><el-input-number v-model="roomForm.area" :min="0" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="roomForm.price" :min="0" /></el-form-item>
        <el-form-item label="朝向"><el-input v-model="roomForm.orientation" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRoom = false">取消</el-button>
        <el-button type="primary" @click="addRoom">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showImage" title="上传图片" width="400px">
      <el-form label-width="80px">
        <el-form-item label="图片URL"><el-input v-model="imgForm.url" placeholder="输入图片URL" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="imgForm.type" style="width:100%">
            <el-option label="封面" value="cover" />
            <el-option label="室内" value="indoor" />
            <el-option label="户型图" value="layout" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showImage = false">取消</el-button>
        <el-button type="primary" @click="addImage">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import {
  getHouseDetail, updateHouse, getHouseRooms, addHouseRoom,
  getHouseImages, addHouseImage, getLandlordHouseStats,
  getLandlordHouseStatus, updateLandlordHouseStatus,
  type HouseItem, type HouseRoom, type HouseImage, type LandlordHouseStats
} from '@/api/house'

const route = useRoute()
const houseId = Number(route.params.id)
const loading = ref(false)
const editing = ref(false)
const isEdit = ref(true)

const form = ref<Partial<HouseItem>>({})
const rooms = ref<HouseRoom[]>([])
const images = ref<HouseImage[]>([])
const stats = ref<LandlordHouseStats | null>(null)
const newStatus = ref('')

const showRoom = ref(false)
const roomForm = ref<Partial<HouseRoom>>({})
const showImage = ref(false)
const imgForm = ref({ url: '', type: 'indoor' })

function houseStatusType(s?: string) {
  if (s === '可租') return 'success'
  if (s === '已租') return 'warning'
  if (s === '已下架') return 'info'
  return ''
}

async function load() {
  loading.value = true
  const [r1, r2, r3, r4, r5] = await Promise.all([
    safe(getHouseDetail(houseId), {} as HouseItem),
    safe(getHouseRooms(houseId), { list: [], total: 0 }),
    safe(getHouseImages(houseId), { list: [], total: 0 }),
    safe(getLandlordHouseStats(houseId), { views: 0, collects: 0, orders: 0, inquiries: 0 }),
    safe(getLandlordHouseStatus(houseId), { status: '' })
  ])
  form.value = r1.data
  rooms.value = r2.data?.list ?? []
  images.value = r3.data?.list ?? []
  stats.value = r4.data
  newStatus.value = r5.data?.status || form.value?.status || ''
  editing.value = false
  loading.value = false
}

async function save() {
  const r = await safe(updateHouse(houseId, form.value), {})
  if (okRes(r)) { ElMessage.success('保存成功'); editing.value = false }
  else ElMessage.error(msgOf(r))
}

async function updateStatus() {
  const r = await safe(updateLandlordHouseStatus(houseId, newStatus.value), {})
  if (okRes(r)) { ElMessage.success('状态已更新'); form.value.status = newStatus.value }
  else ElMessage.error(msgOf(r))
}

async function addRoom() {
  const r = await safe(addHouseRoom(houseId, roomForm.value), {})
  if (okRes(r)) { ElMessage.success('已添加'); showRoom.value = false; roomForm.value = {}; load() }
  else ElMessage.error(msgOf(r))
}

async function addImage() {
  if (!imgForm.value.url) return ElMessage.warning('请输入URL')
  const r = await safe(addHouseImage(houseId, imgForm.value), {})
  if (okRes(r)) { ElMessage.success('已添加'); showImage.value = false; imgForm.value = { url: '', type: 'indoor' }; load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.card-head { display: flex; justify-content: space-between; align-items: center; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat { text-align: center; padding: 12px; background: #f5f7fa; border-radius: 8px; }
.stat .num { font-size: 24px; font-weight: 700; color: var(--el-color-primary); }
.stat .label { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 4px; }
.img-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.img-item img { width: 100%; height: 80px; object-fit: cover; border-radius: 6px; }
</style>
