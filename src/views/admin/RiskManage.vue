<template>
  <div class="page-max">
    <el-tabs v-model="tab">
      <el-tab-pane label="黑名单管理" name="blacklist">
        <el-table :data="blacklist" v-loading="loading" empty-text="暂无黑名单">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="userName" label="用户名" min-width="120" />
          <el-table-column prop="reason" label="拉黑原因" min-width="200" />
          <el-table-column prop="createTime" label="时间" width="180" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="风控规则" name="rules">
        <el-table :data="rules" v-loading="loading" empty-text="暂无规则">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="规则名称" min-width="160" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="threshold" label="阈值" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="用户风控记录" name="records">
        <div style="margin-bottom:12px">
          <el-input v-model="searchUserId" placeholder="输入用户ID查询" style="width:200px" />
          <el-button type="primary" @click="searchRecords" style="margin-left:8px">查询</el-button>
        </div>
        <el-table :data="records" v-loading="loading" empty-text="暂无记录">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { safe } from '@/api/http'
import { getBlacklist, getRiskRules, getUserRiskRecord, type BlacklistItem, type RiskRule, type RiskRecord } from '@/api/risk'

const tab = ref('blacklist')
const loading = ref(false)
const blacklist = ref<BlacklistItem[]>([])
const rules = ref<RiskRule[]>([])
const records = ref<RiskRecord[]>([])
const searchUserId = ref('')

async function loadBlacklist() {
  loading.value = true
  const r = await safe(getBlacklist(), { list: [], total: 0 })
  blacklist.value = r.data?.list ?? []
  loading.value = false
}

async function loadRules() {
  loading.value = true
  const r = await safe(getRiskRules(), { list: [], total: 0 })
  rules.value = r.data?.list ?? []
  loading.value = false
}

async function searchRecords() {
  if (!searchUserId.value) return ElMessage.warning('请输入用户ID')
  loading.value = true
  const r = await safe(getUserRiskRecord(Number(searchUserId.value)), { list: [], total: 0 })
  records.value = r.data?.list ?? []
  loading.value = false
}

onMounted(loadBlacklist)
</script>
