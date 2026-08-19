<template>
  <el-card shadow="never">
    <div class="bar">
      <span class="text-sub" style="margin-right: 8px">独立页面：</span>
      <el-button size="small" plain @click="goDict">数据字典</el-button>
      <el-button size="small" plain @click="goConfig">系统配置</el-button>
    </div>
    <el-tabs v-model="tab">
      <el-tab-pane label="角色权限 (RBAC)" name="role" />
      <el-tab-pane label="管理员" name="admin" />
      <el-tab-pane label="菜单管理" name="menu" />
      <el-tab-pane label="数据字典" name="dict" />
      <el-tab-pane label="操作日志" name="log" />
      <el-tab-pane label="系统参数" name="param" />
    </el-tabs>

    <!-- RBAC -->
    <div v-if="tab === 'role'">
      <div class="bar"><el-button type="primary" @click="openRoleEdit(null)">+ 新增角色</el-button></div>
      <el-table :data="roles" border v-loading="loading">
        <el-table-column prop="name" label="角色" width="140" />
        <el-table-column label="权限范围" min-width="200">
          <template #default="{ row }">{{ row.perms?.join('、') }}</template>
        </el-table-column>
        <el-table-column prop="scope" label="数据范围" width="140" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" plain @click="openRoleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain :loading="submitting" @click="deleteRole(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && roles.length === 0" description="暂无角色" />
    </div>

    <!-- 管理员 -->
    <div v-else-if="tab === 'admin'">
      <div class="bar"><el-button type="primary" @click="openAdminEdit(null)">+ 新增管理员</el-button></div>
      <el-table :data="admins" border v-loading="loading">
        <el-table-column prop="user" label="账号" width="140" />
        <el-table-column prop="role" label="角色" width="140" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last" label="最近登录" width="160" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" plain @click="openAdminEdit(row)">编辑</el-button>
            <el-button :type="row.status === '启用' ? 'warning' : 'success'" size="small" plain :loading="submitting" @click="toggleAdmin(row)">{{ row.status === '启用' ? '禁用' : '启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && admins.length === 0" description="暂无管理员" />
    </div>

    <!-- 菜单管理 -->
    <div v-else-if="tab === 'menu'">
      <div class="bar"><el-button type="primary" @click="ElMessage.info('新增菜单')">+ 新增菜单</el-button></div>
      <el-table :data="menus" border v-loading="loading" row-key="id" :tree-props="{ children: 'children' }" default-expand-all>
        <el-table-column prop="name" label="菜单" min-width="180" />
        <el-table-column prop="path" label="路由" min-width="180" />
        <el-table-column prop="perm" label="权限标识" min-width="160" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" plain @click="ElMessage.info('编辑 ' + row.name)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && menus.length === 0" description="暂无菜单" />
    </div>

    <!-- 数据字典 -->
    <div v-else-if="tab === 'dict'">
      <div class="bar"><el-button type="primary" @click="ElMessage.info('新增字典项')">+ 新增</el-button></div>
      <el-table :data="dicts" border v-loading="loading">
        <el-table-column prop="type" label="字典类型" width="140" />
        <el-table-column prop="label" label="名称" width="140" />
        <el-table-column prop="value" label="值" width="120" />
        <el-table-column prop="remark" label="备注" min-width="160" />
      </el-table>
      <el-empty v-if="!loading && dicts.length === 0" description="暂无字典项" />
    </div>

    <!-- 操作日志 -->
    <div v-else-if="tab === 'log'">
      <el-table :data="logs" border v-loading="loading">
        <el-table-column prop="userId" label="管理员" width="120" />
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="action" label="操作" width="140" />
        <el-table-column prop="ip" label="IP" width="130" />
        <el-table-column prop="createdAt" label="时间" width="160" />
      </el-table>
      <el-empty v-if="!loading && logs.length === 0" description="暂无操作日志" />
    </div>

    <!-- 系统参数 -->
    <div v-else-if="tab === 'param'">
      <el-form label-width="160px" class="params" v-loading="loading">
        <el-form-item label="房源审核时效（小时）"><el-input-number :min="1" :max="72" v-model="params.auditHour" /></el-form-item>
        <el-form-item label="默认平台佣金比例（%）"><el-input-number :min="0" :max="30" v-model="params.feeRate" />
          <span class="text-sub" style="margin-left:8px">用于分账默认规则</span></el-form-item>
        <el-form-item label="允许发布最小图片数"><el-input-number :min="1" :max="9" v-model="params.minImg" /></el-form-item>
        <el-form-item><el-button type="primary" :loading="submitting" @click="saveParams">保存</el-button></el-form-item>
      </el-form>
    </div>

    <!-- 角色编辑弹窗 -->
    <el-dialog v-model="roleDialog" :title="roleEditing ? '编辑角色' : '新增角色'" width="480px">
      <el-form label-width="100px">
        <el-form-item label="角色名称"><el-input v-model="roleForm.name" /></el-form-item>
        <el-form-item label="数据范围"><el-select v-model="roleForm.scope" style="width: 100%">
          <el-option label="全平台" value="全平台" />
          <el-option label="按城市" value="按城市" />
          <el-option label="本人/门店" value="本人/门店" />
        </el-select></el-form-item>
        <el-form-item label="权限范围"><el-checkbox-group v-model="roleForm.perms">
          <el-checkbox label="全部" value="全部" />
          <el-checkbox label="房源" value="房源" />
          <el-checkbox label="订单" value="订单" />
          <el-checkbox label="内容" value="内容" />
          <el-checkbox label="房源审核" value="房源审核" />
          <el-checkbox label="实名审核" value="实名审核" />
          <el-checkbox label="工单" value="工单" />
          <el-checkbox label="咨询" value="咨询" />
          <el-checkbox label="财务" value="财务" />
          <el-checkbox label="分账" value="分账" />
          <el-checkbox label="房源维护" value="房源维护" />
          <el-checkbox label="带看" value="带看" />
          <el-checkbox label="客户" value="客户" />
        </el-checkbox-group></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 管理员编辑弹窗 -->
    <el-dialog v-model="adminDialog" :title="adminEditing ? '编辑管理员' : '新增管理员'" width="480px">
      <el-form label-width="100px">
        <el-form-item label="账号"><el-input v-model="adminForm.user" /></el-form-item>
        <el-form-item label="角色"><el-select v-model="adminForm.role" style="width: 100%">
          <el-option v-for="r in roles" :key="r.name" :label="r.name" :value="r.name" />
        </el-select></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveAdmin">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes } from '@/api/http'
import {
  getAdminRoles,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUser,
  getAdminMenus,
  getAdminDicts,
  getAdminLogs,
  getSysParams,
  saveSysParams,
  type RoleItem,
  type AdminUserItem,
  type MenuItem,
  type DictItem,
  type LogItem,
  type SysParam
} from '@/api/admin'

const router = useRouter()
const tab = ref('role')
const loading = ref(false)
const submitting = ref(false)

function goDict() {
  router.push('/admin/dict')
}
function goConfig() {
  router.push('/admin/config')
}

// 角色
const roles = ref<RoleItem[]>([])
const roleDialog = ref(false)
const roleEditing = ref<RoleItem | null>(null)
const roleForm = reactive({ name: '', scope: '全平台', perms: [] as string[] })

async function fetchRoles() {
  const res = await safe(getAdminRoles(), [])
  if (okRes(res)) roles.value = res.data
}

function openRoleEdit(row: RoleItem | null) {
  roleEditing.value = row
  roleForm.name = row?.name || ''
  roleForm.scope = row?.scope || '全平台'
  roleForm.perms = row ? [...(row.perms || [])] : []
  roleDialog.value = true
}
async function saveRole() {
  if (!roleForm.name) { ElMessage.warning('请输入角色名称'); return }
  submitting.value = true
  const payload = { name: roleForm.name, scope: roleForm.scope, perms: roleForm.perms }
  if (roleEditing.value) {
    const res = await safe(updateAdminRole(roleEditing.value.id!, payload), {})
    if (okRes(res)) { ElMessage.success('角色已更新'); await fetchRoles() }
  } else {
    const res = await safe(createAdminRole(payload), {})
    if (okRes(res)) { ElMessage.success('角色已新增'); await fetchRoles() }
  }
  submitting.value = false
  roleDialog.value = false
}
async function deleteRole(row: RoleItem) {
  try {
    await ElMessageBox.confirm(`确定删除角色「${row.name}」？`, '确认删除', { type: 'warning', confirmButtonText: '确定删除', confirmButtonClass: 'el-button--danger' })
    submitting.value = true
    const res = await safe(deleteAdminRole(row.id!), {})
    if (okRes(res)) { ElMessage.warning(`已删除角色「${row.name}」`); await fetchRoles() }
    submitting.value = false
  } catch { /* 取消 */ }
}

// 管理员
const admins = ref<AdminUserItem[]>([])
const adminDialog = ref(false)
const adminEditing = ref<AdminUserItem | null>(null)
const adminForm = reactive({ user: '', role: '' })

async function fetchAdmins() {
  const res = await safe(getAdminUsers(), [])
  if (okRes(res)) admins.value = res.data
}
async function openAdminEdit(row: AdminUserItem | null) {
  adminEditing.value = row
  adminForm.user = row?.user || ''
  adminForm.role = row?.role || ''
  adminDialog.value = true
}
async function saveAdmin() {
  if (!adminForm.user || !adminForm.role) { ElMessage.warning('请填写完整信息'); return }
  submitting.value = true
  const payload = { user: adminForm.user, role: adminForm.role }
  if (adminEditing.value) {
    const res = await safe(updateAdminUser(adminEditing.value.id!, payload), {})
    if (okRes(res)) { ElMessage.success('管理员已更新'); await fetchAdmins() }
  } else {
    const res = await safe(createAdminUser(payload), {})
    if (okRes(res)) { ElMessage.success('管理员已新增'); await fetchAdmins() }
  }
  submitting.value = false
  adminDialog.value = false
}
async function toggleAdmin(row: AdminUserItem) {
  const newStatus = row.status === '启用' ? '禁用' : '启用'
  submitting.value = true
  const res = await safe(toggleAdminUser(row.id!, newStatus), {})
  if (okRes(res)) { row.status = newStatus; ElMessage.success(`管理员「${row.user}」已${newStatus}`) }
  submitting.value = false
}

// 菜单
const menus = ref<MenuItem[]>([])
async function fetchMenus() {
  const res = await safe(getAdminMenus(), [])
  if (okRes(res)) menus.value = res.data
}

// 数据字典
const dicts = ref<DictItem[]>([])
async function fetchDicts() {
  const res = await safe(getAdminDicts(), [])
  if (okRes(res)) dicts.value = res.data
}

// 操作日志
const logs = ref<LogItem[]>([])
async function fetchLogs() {
  const res = await safe(getAdminLogs(), [])
  if (okRes(res)) logs.value = res.data
}

// 系统参数
const params = ref<SysParam>({ auditHour: 24, feeRate: 25, minImg: 3 })
async function fetchParams() {
  const res = await safe(getSysParams(), { auditHour: 24, feeRate: 25, minImg: 3 })
  if (okRes(res)) params.value = res.data
}
async function saveParams() {
  submitting.value = true
  const res = await safe(saveSysParams(params.value), {})
  if (okRes(res)) ElMessage.success(`参数已保存（审核时效 ${params.value.auditHour}h，佣金 ${params.value.feeRate}%，最小图片 ${params.value.minImg} 张）`)
  submitting.value = false
}

async function fetchAll() {
  loading.value = true
  await Promise.all([fetchRoles(), fetchAdmins(), fetchMenus(), fetchDicts(), fetchLogs(), fetchParams()])
  loading.value = false
}

onMounted(fetchAll)
</script>

<style scoped>
.bar { margin-bottom: 12px; }
.params { max-width: 560px; margin-top: 12px; }
</style>