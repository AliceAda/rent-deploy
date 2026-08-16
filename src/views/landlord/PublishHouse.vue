<template>
  <div class="page-max narrow">
    <h3>发布房源</h3>
    <p class="sub">填写房源信息，提交后进入平台审核，审核通过即可上架</p>

    <el-card shadow="never" class="card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="16">
          <el-col :md="12">
            <el-form-item label="房源标题" prop="title">
              <el-input v-model="form.title" placeholder="如：望京 精装一居 近地铁" />
            </el-form-item>
          </el-col>
          <el-col :md="6">
            <el-form-item label="城市" prop="city">
              <el-select v-model="form.city"><el-option label="北京" value="北京" /></el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6">
            <el-form-item label="区域" prop="district">
              <el-input v-model="form.district" placeholder="如：朝阳区" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :md="8">
            <el-form-item label="租赁方式" prop="rentType">
              <el-radio-group v-model="form.rentType">
                <el-radio label="整租">整租</el-radio>
                <el-radio label="合租">合租</el-radio>
                <el-radio label="公寓">公寓</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :md="8">
            <el-form-item label="户型" prop="layout">
              <el-input v-model="form.layout" placeholder="如：1室1厅" />
            </el-form-item>
          </el-col>
          <el-col :md="8">
            <el-form-item label="面积" prop="area">
              <el-input v-model="form.area" type="number"><template #append>㎡</template></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :md="8">
            <el-form-item label="楼层" prop="floor">
              <el-input v-model="form.floor" placeholder="如：9/18" />
            </el-form-item>
          </el-col>
          <el-col :md="8">
            <el-form-item label="朝向" prop="orientation">
              <el-select v-model="form.orientation">
                <el-option v-for="o in ['东', '南', '西', '北', '南北']" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="8">
            <el-form-item label="装修" prop="decoration">
              <el-select v-model="form.decoration">
                <el-option label="精装" value="精装" />
                <el-option label="简装" value="简装" />
                <el-option label="毛坯" value="毛坯" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">价格与配套</el-divider>
        <el-row :gutter="16">
          <el-col :md="8">
            <el-form-item label="月租金" prop="price">
              <el-input v-model="form.price" type="number"><template #append>元/月</template></el-input>
            </el-form-item>
          </el-col>
          <el-col :md="8">
            <el-form-item label="押金方式" prop="depositType">
              <el-select v-model="form.depositType">
                <el-option label="押一付一" value="押一付一" />
                <el-option label="押一付三" value="押一付三" />
                <el-option label="押一付六" value="押一付六" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="8">
            <el-form-item label="房源图片">
              <el-upload action="#" :auto-upload="false" list-type="picture-card" :limit="6">
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="配套设施">
          <el-checkbox-group v-model="form.facilities">
            <el-checkbox v-for="f in facOptions" :key="f" :label="f" :value="f">{{ f }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="房源标签">
          <el-checkbox-group v-model="form.tags">
            <el-checkbox v-for="t in tagOptions" :key="t" :label="t" :value="t">{{ t }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="房源描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="描述小区环境、交通、周边配套等" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="onSubmit">提交审核</el-button>
          <el-button size="large" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useLandlordStore } from '@/store/landlord'
import { useAuthStore } from '@/store/auth'
import type { House } from '@/mock/data'

const landlord = useLandlordStore()
const auth = useAuthStore()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const facOptions = ['电梯', '燃气', '车位', '宠物', '暖气', '宽带']
const tagOptions = ['近地铁', '精装修', '可短租', '低价', '南北通透', '公寓', '管家服务', '可养宠']

const form = reactive({
  title: '',
  city: '北京',
  district: '',
  rentType: '整租' as House['rentType'],
  layout: '',
  area: '',
  floor: '',
  orientation: '南',
  decoration: '精装',
  price: '',
  depositType: '押一付三',
  facilities: [] as string[],
  tags: [] as string[],
  description: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入房源标题', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区域', trigger: 'blur' }],
  layout: [{ required: true, message: '请输入户型', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  price: [{ required: true, message: '请输入租金', trigger: 'blur' }],
  description: [{ required: true, message: '请输入房源描述', trigger: 'blur' }]
}

function reset() {
  formRef.value?.resetFields()
  form.facilities = []
  form.tags = []
}

function onSubmit() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      const id = Math.max(0, ...landlord.myHouses.map((h) => h.id)) + 1
      const house: House = {
        id,
        title: form.title,
        city: form.city,
        district: form.district,
        rentType: form.rentType,
        layout: form.layout,
        area: Number(form.area),
        floor: form.floor,
        orientation: form.orientation,
        decoration: form.decoration,
        price: Number(form.price),
        depositType: form.depositType,
        facilities: [...form.facilities],
        tags: [...form.tags],
        status: '待审核',
        views: 0,
        collectCount: 0,
        grade: 0,
        landlordId: auth.user?.id ?? 2,
        source: '房东自发布',
        description: form.description,
        x: 50,
        y: 50
      }
      landlord.addHouse(house)
      loading.value = false
      ElMessage.success('已提交，等待平台审核')
      router.push('/landlord/my-houses')
    }, 500)
  })
}
</script>

<style scoped>
.narrow {
  max-width: 860px;
}
.sub {
  color: var(--sub);
  margin: 0 0 16px;
}
.card {
  border-radius: 12px;
}
</style>
