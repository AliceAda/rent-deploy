<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="top">
        <h3>地址管理</h3>
        <el-button type="primary" size="small" @click="openAdd">+ 新增地址</el-button>
      </div>
      <el-alert v-if="error" type="warning" :title="'加载失败：' + error" show-icon :closable="false" style="margin-bottom: 12px" />
      <el-card v-for="a in list" :key="a.id" shadow="never" class="addr">
        <div class="row">
          <div>
            <el-tag v-if="a.tag" size="small" effect="plain">{{ a.tag }}</el-tag>
            <b>{{ a.contactName }}</b> {{ maskPhone(a.phone) }}
            <el-tag v-if="a.isDefault" size="small" type="success">默认</el-tag>
          </div>
          <div class="ops">
            <el-button v-if="!a.isDefault" size="small" text @click="setDefault(a)">设为默认</el-button>
            <el-button size="small" text @click="openEdit(a)">编辑</el-button>
            <el-button size="small" text type="danger" @click="remove(a)">删除</el-button>
          </div>
        </div>
        <div class="text-sub">{{ a.detail }}（区域ID：{{ a.provinceId }}/{{ a.cityId }}/{{ a.districtId }}）</div>
      </el-card>
      <el-empty v-if="!list.length" description="暂无地址" />

      <el-dialog v-model="show" :title="editing ? '编辑地址' : '新增地址'" width="460px">
        <el-form :model="f" label-width="86px">
          <el-form-item label="联系人"><el-input v-model="f.contactName" placeholder="收货人姓名（DB: contact_name）" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="f.phone" placeholder="11 位手机号（DB: phone）" /></el-form-item>
          <el-form-item label="省 ID"><el-input v-model.number="f.provinceId" placeholder="province_id（int，关联 region 表）" /></el-form-item>
          <el-form-item label="市 ID"><el-input v-model.number="f.cityId" placeholder="city_id（int，关联 region 表）" /></el-form-item>
          <el-form-item label="区/县 ID"><el-input v-model.number="f.districtId" placeholder="district_id（int，关联 region 表）" /></el-form-item>
          <el-form-item label="标签">
            <el-select v-model="f.tag" placeholder="家 / 公司 / 其他" clearable>
              <el-option label="家" value="家" />
              <el-option label="公司" value="公司" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细地址"><el-input v-model="f.detail" type="textarea" :rows="2" placeholder="街道 / 门牌号（DB: detail）" /></el-form-item>
          <el-form-item label="默认"><el-switch v-model="f.isDefault" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="show = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe } from '@/api/http'
import { useTable } from '@/composables/useTable'
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  type AddressItem
} from '@/api/address'

const show = ref(false)
const editing = ref(false)
const f = ref<Partial<AddressItem> & { id?: number }>({ isDefault: false })
const { list, error, reload } = useTable<AddressItem>(() => getMyAddresses())

// 手机号脱敏：15012348279 → 150****8279
function maskPhone(p?: string) {
  if (!p) return ''
  return p.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function openAdd() {
  editing.value = false
  f.value = { isDefault: false }
  show.value = true
}
function openEdit(a: AddressItem) {
  editing.value = true
  f.value = { ...a }
  show.value = true
}
async function save() {
  const body = { ...f.value }
  const r = editing.value
    ? await safe(updateAddress(f.value.id!, body), {})
    : await safe(createAddress(body), {})
  if (r.code === 0) {
    ElMessage.success('已保存')
    show.value = false
    reload()
  } else {
    ElMessage.error(r.message || '保存失败')
  }
}
async function setDefault(a: AddressItem) {
  const r = await safe(setDefaultAddress(a.id), {})
  if (r.code === 0) reload()
  else ElMessage.error(r.message || '操作失败')
}
async function remove(a: AddressItem) {
  await ElMessageBox.confirm('确认删除该地址？', '提示', { type: 'warning' })
  const r = await safe(deleteAddress(a.id), {})
  if (r.code === 0) reload()
  else ElMessage.error(r.message || '删除失败')
}
</script>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.addr {
  margin-bottom: 10px;
}
.addr .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text-sub {
  color: var(--sub);
  margin-top: 4px;
}
</style>
