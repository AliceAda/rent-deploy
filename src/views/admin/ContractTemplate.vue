<template>
  <div class="page-max">
    <el-card shadow="never">
      <div class="head">
        <h3>合同模板管理</h3>
        <el-button type="primary" @click="showAdd = true">新增模板</el-button>
      </div>
      <el-table :data="list" v-loading="loading" empty-text="暂无模板">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="模板名称" min-width="160" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === '启用' ? 'success' : 'info'">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button text size="small" @click="edit(row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="remove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAdd" :title="editing ? '编辑模板' : '新增模板'" width="600px">
      <el-form label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="整租合同" value="整租" />
            <el-option label="合租合同" value="合租" />
            <el-option label="公寓合同" value="公寓" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="8" placeholder="合同模板内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'
import {
  getContractTemplates, updateContractTemplate, deleteContractTemplate,
  type ContractTemplate
} from '@/api/contract'
import { post } from '@/api/http'

const list = ref<ContractTemplate[]>([])
const loading = ref(false)
const showAdd = ref(false)
const editing = ref(false)
const form = ref<Partial<ContractTemplate>>({})

async function load() {
  loading.value = true
  const r = await safe(getContractTemplates(), { list: [], total: 0 })
  list.value = r.data?.list ?? []
  loading.value = false
}

function edit(row: ContractTemplate) {
  editing.value = true
  form.value = { ...row }
  showAdd.value = true
}

async function submit() {
  const r = editing.value
    ? await safe(updateContractTemplate(form.value.id!, form.value), {})
    : await safe(post('/contract/template', form.value), {})
  if (okRes(r)) { ElMessage.success('操作成功'); showAdd.value = false; editing.value = false; form.value = {}; load() }
  else ElMessage.error(msgOf(r))
}

async function remove(id: number) {
  await ElMessageBox.confirm('确认删除此模板？', '提示', { type: 'warning' })
  const r = await safe(deleteContractTemplate(id), {})
  if (okRes(r)) { ElMessage.success('已删除'); load() }
  else ElMessage.error(msgOf(r))
}

onMounted(load)
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
</style>
