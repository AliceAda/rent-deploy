<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>消息模板管理</h3>
        <el-button type="primary" @click="showSend = true">发送消息</el-button>
      </div>
      <el-tabs v-model="tab">
        <el-tab-pane label="消息模板" name="templates">
          <el-alert v-if="templatesError" type="warning" :title="'加载失败：' + templatesError" show-icon :closable="false" style="margin-bottom: 12px" />
          <el-table :data="templates" v-loading="templatesLoading" empty-text="暂无模板">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="模板名称" min-width="160" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="content" label="内容" min-width="240" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="通知渠道" name="channels">
          <el-alert v-if="channelsError" type="warning" :title="'加载失败：' + channelsError" show-icon :closable="false" style="margin-bottom: 12px" />
          <el-table :data="channels" v-loading="channelsLoading" empty-text="暂无渠道">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="渠道名称" min-width="160" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag></template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showSend" title="发送消息" width="500px">
      <el-form label-width="80px">
        <el-form-item label="接收人">
          <el-input v-model="sendForm.userId" placeholder="用户ID" />
        </el-form-item>
        <el-form-item label="模板">
          <el-select v-model="sendForm.templateId" placeholder="选择模板" style="width:100%">
            <el-option v-for="t in templates" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="sendForm.content" type="textarea" :rows="3" placeholder="消息内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSend = false">取消</el-button>
        <el-button type="primary" @click="send">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { get, post, safe, okRes, msgOf } from '@/api/http'
import { useTable } from '@/composables/useTable'

interface TemplateItem { id: number; name: string; type: string; content: string; status: string }
interface ChannelItem { id: number; name: string; type: string; enabled: boolean }

const tab = ref('templates')
const showSend = ref(false)
const sendForm = ref({ userId: '', templateId: '', content: '' })
const { list: templates, loading: templatesLoading, error: templatesError, reload: reloadTemplates } =
  useTable<TemplateItem>(() => get('/message/template'))
const { list: channels, loading: channelsLoading, error: channelsError, reload: reloadChannels } =
  useTable<ChannelItem>(() => get('/message/notify-channel'), { immediate: false })

async function send() {
  const r = await safe(post('/message/send', sendForm.value), {})
  if (okRes(r)) { ElMessage.success('发送成功'); showSend.value = false }
  else ElMessage.error(msgOf(r))
}

watch(tab, (v) => {
  if (v === 'templates') reloadTemplates()
  else if (v === 'channels') reloadChannels()
})
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
</style>
