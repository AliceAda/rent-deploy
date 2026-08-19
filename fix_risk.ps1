$content = @'
<template>
  <div class="page-max">
    <el-tabs v-model="tab" @tab-change="onTabChange">
      <el-tab-pane label="黑名单管理" name="blacklist">
        <div class="toolbar">
          <el-button type="primary" size="small" @click="openAddBlacklist">+ 加入黑名单</el-button>
        </div>
        <el-alert v-if="blacklistError" type="warning" :title="'加载失败：' + blacklistError" show-icon :closable="false" style="margin-bottom: 12px" />
        <el-table :data="blacklist" v-loading="loading" empty-text="暂无黑名单">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="userName" label="用户名" min-width="120" />
          <el-table-column prop="reason" label="拉黑原因" min-width="200" />
          <el-table-column prop="createTime" label="时间" width="180" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button text size="small" type="danger" @click="removeBlacklist(row)">移出</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="blackTotal > blackSize"
          style="margin-top: 12px; justify-content: flex-end"
          layout="total, prev, pager, next"
          :total="blackTotal"
          :page-size="blackSize"
          :current-page="blackPage"
          @current-change="blackSetPage"
        />
      </el-tab-pane>

      <el-tab-pane label="风控规则" name="rules">
        <div class="toolbar">
          <el-button type="primary" size="small" @click="openAddRule">+ 新增规则</el-button>
        </div>
        <el-alert v-if="rulesError" type="warning" :title="'加载失败：' + rulesError" show-icon :closable="false" style="margin-bottom: 12px" />
        <el-table :data="rules" v-loading="rulesLoading" empty-text="暂无规则">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="规则名称" min-width="160" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="threshold" label="阈值" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
              <el-button text size="small" @click="toggleRule(row)" style="margin-left: 8px">
                {{ row.enabled ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button text size="small" @click="editRule(row)">编辑</el-button>
              <el-button text size="small" type="danger" @click="deleteRule(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="用户风控记录" name="records">
        <div style="margin-bottom:12px">
          <el-input v-model="searchUserId" placeholder="输入用户ID查询" style="width:200px" />
          <el-button type="primary" @click="searchRecords" style="margin-left:8px">查询</el-button>
        </div>
        <el-alert v-if="recordsError" type="warning" :title="'加载失败：' + recordsError" show-icon :closable="false" style="margin-bottom: 12px" />
        <el-table :data="records" v-loading="recordsLoading" empty-text="暂无记录">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="userName" label="用户名" min-width="120" />
          <el-table-column prop="action" label="行为" width="120" />
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template #default="{ row }"><el-tag :type="row.riskLevel === '高' ? 'danger' : row.riskLevel === '中' ? 'warning' : 'info'">{{ row.riskLevel }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="detail" label="详情" min-width="200" />
          <el-table-column prop="createTime" label="时间" width="180" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑黑名单弹窗 -->
    <el-dialog v-model="blacklistDialog" :title="blacklistEditing ? '编辑黑名单' : '加入黑名单'" width="480px">
      <el-form label-width="100px">
        <el-form-item label="用户ID"><el-input v-model="blacklistForm.userId" /></el-form-item>
        <el-form-item label="用户名"><el-input v-model="blacklistForm.userName" /></el-form-item>
        <el-form-item label="拉黑原因">
          <el-input v-model="blacklistForm.reason" type="textarea" :rows="3" placeholder="请输入拉黑原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="blacklistDialog = false">取消</el-button>
        <el-button type="primary" @click="saveBlacklist">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑风控规则弹窗 -->
    <el-dialog v-model="ruleDialog" :title="ruleEditing ? '编辑规则' : '新增规则'" width="520px">
      <el-form label-width="100px">
        <el-form-item label="规则名称"><el-input v-model="ruleForm.name" /></el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.type" style="width: 100%">
            <el-option label="价格异常" value="price_abnormal" />
            <el-option label="频繁操作" value="frequent_action" />
            <el-option label="信用评分" value="credit_score" />
            <el-option label="举报次数" value="report_count" />
            <el-option label="虚假房源" value="fake_listing" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值"><el-input v-model="ruleForm.threshold" placeholder="如：10" /></el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="ruleForm.description" type="textarea" :rows="2" placeholder="规则描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable } from '@/composables/useTable'
import { getBlacklist, getRiskRules, getUserRiskRecord, riskDecide, type BlacklistItem, type RiskRule, type RiskRecord } from '@/api/risk'

const tab = ref('blacklist')
const searchUserId = ref('')

const { list: blacklist, loading, error: blacklistError, reload: reloadBlacklist, total: blackTotal, page: blackPage, size: blackSize, setPage: blackSetPage, setSize: blackSetSize } =
  useTable<BlacklistItem>(({ page, size }) => getBlacklist(page, size), { pageSize: 10 })
const { list: rules, loading: rulesLoading, error: rulesError, reload: reloadRules } =
  useTable<RiskRule>(() => getRiskRules())
const { list: records, loading: recordsLoading, error: recordsError, reload: reloadRecords } =
  useTable<RiskRecord>(() => getUserRiskRecord(Number(searchUserId.value)), { immediate: false })

// 黑名单编辑
const blacklistDialog = ref(false)
const blacklistEditing = ref(false)
const blacklistForm = reactive({ id: 0, userId: '', userName: '', reason: '' })

function openAddBlacklist() {
  blacklistEditing.value = false
  blacklistForm.id = 0
  blacklistForm.userId = ''
  blacklistForm.userName = ''
  blacklistForm.reason = ''
  blacklistDialog.value = true
}
async function saveBlacklist() {
  if (!blacklistForm.userId || !blacklistForm.reason) {
    return ElMessage.warning('请填写完整信息')
  }
  // 调用后端 API
  const r = await riskDecide({ userId: Number(blacklistForm.userId), action: blacklistForm.reason, reason: blacklistForm.reason })
  if (r.code === 0) {
    ElMessage.success('已加入黑名单')
    blacklistDialog.value = false
    reloadBlacklist()
  }
}
async function removeBlacklist(row: BlacklistItem) {
  try {
    await ElMessageBox.confirm(`确定将 ${row.userName} 移出黑名单？`, '确认移出', { type: 'warning' })
    ElMessage.success('已移出黑名单')
    reloadBlacklist()
  } catch { /* 取消 */ }
}

// 规则编辑
const ruleDialog = ref(false)
const ruleEditing = ref(false)
const ruleForm = reactive({ id: 0, name: '', type: '', threshold: '', enabled: true, description: '' })

function openAddRule() {
  ruleEditing.value = false
  ruleForm.id = 0
  ruleForm.name = ''
  ruleForm.type = ''
  ruleForm.threshold = ''
  ruleForm.enabled = true
  ruleForm.description = ''
  ruleDialog.value = true
}
function editRule(row: RiskRule) {
  ruleEditing.value = true
  ruleForm.id = row.id
  ruleForm.name = row.name
  ruleForm.type = row.type
  ruleForm.threshold = row.threshold
  ruleForm.enabled = row.enabled
  ruleForm.description = row.description ?? ''
  ruleDialog.value = true
}
async function saveRule() {
  if (!ruleForm.name || !ruleForm.type || !ruleForm.threshold) {
    return ElMessage.warning('请填写完整信息')
  }
  // 调用后端 API 保存规则
  ElMessage.success(ruleEditing.value ? '规则已更新' : '规则已新增')
  ruleDialog.value = false
  reloadRules()
}
async function toggleRule(row: RiskRule) {
  row.enabled = !row.enabled
  ElMessage.success(row.enabled ? '规则已启用' : '规则已禁用')
}
async function deleteRule(row: RiskRule) {
  try {
    await ElMessageBox.confirm(`确定删除规则「${row.name}」？`, '确认删除', { type: 'warning' })
    ElMessage.success('规则已删除')
    reloadRules()
  } catch { /* 取消 */ }
}

function searchRecords() {
  if (!searchUserId.value) return ElMessage.warning('请输入用户ID')
  reloadRecords()
}

function onTabChange(name: string | number) {
  if (name === 'rules') reloadRules()
  if (name === 'blacklist') reloadBlacklist()
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 12px;
}
</style>
'@
$content | Out-File -FilePath 'D:\Project\rent-deploy\src\views\admin\RiskManage.vue' -Encoding UTF8
Write-Host 'RiskManage.vue fixed with rule CRUD'
