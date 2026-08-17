<template>
  <div class="page-max">
    <el-tabs v-model="tab" @tab-change="onTabChange">
      <el-tab-pane label="黑名单管理" name="blacklist">
        <el-alert v-if="blacklistError" type="warning" :title="'加载失败：' + blacklistError" show-icon :closable="false" style="margin-bottom: 12px" />
        <el-table :data="blacklist" v-loading="loading" empty-text="暂无黑名单">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="userName" label="用户名" min-width="120" />
          <el-table-column prop="reason" label="拉黑原因" min-width="200" />
          <el-table-column prop="createTime" label="时间" width="180" />
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
        <el-alert v-if="rulesError" type="warning" :title="'加载失败：' + rulesError" show-icon :closable="false" style="margin-bottom: 12px" />
        <el-table :data="rules" v-loading="rulesLoading" empty-text="暂无规则">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@/composables/useTable'
import { getBlacklist, getRiskRules, getUserRiskRecord, type BlacklistItem, type RiskRule, type RiskRecord } from '@/api/risk'

const tab = ref('blacklist')
const searchUserId = ref('')

const { list: blacklist, loading, error: blacklistError, reload: reloadBlacklist, total: blackTotal, page: blackPage, size: blackSize, setPage: blackSetPage, setSize: blackSetSize } =
  useTable<BlacklistItem>(({ page, size }) => getBlacklist(page, size), { pageSize: 10 })
const { list: rules, loading: rulesLoading, error: rulesError, reload: reloadRules } =
  useTable<RiskRule>(() => getRiskRules())
const { list: records, loading: recordsLoading, error: recordsError, reload: reloadRecords } =
  useTable<RiskRecord>(() => getUserRiskRecord(Number(searchUserId.value)), { immediate: false })

function searchRecords() {
  if (!searchUserId.value) return ElMessage.warning('请输入用户ID')
  reloadRecords()
}

function onTabChange(name: string | number) {
  if (name === 'rules') reloadRules()
  if (name === 'blacklist') reloadBlacklist()
}
</script>
