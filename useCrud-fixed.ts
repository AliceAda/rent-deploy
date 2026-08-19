import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Ref } from 'vue'

export interface CrudOptions {
  createSuccessMsg?: string
  updateSuccessMsg?: string
  deleteConfirmMsg?: (item: any) => string
  deleteSuccessMsg?: string
  validateBefore?: (form: any) => boolean | Promise<boolean>
}

export function useCrud<T = any>(opts: CrudOptions = {}) {
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref('')

  const defaults: Required<CrudOptions> = {
    createSuccessMsg: '已新增',
    updateSuccessMsg: '已更新',
    deleteConfirmMsg: (item: any) => `确定删除「${item.name || item.id}」？`,
    deleteSuccessMsg: '已删除',
    validateBefore: () => true,
  }

  const mergedOpts = { ...defaults, ...opts }

  async function confirmDelete(
    item: T,
    deleteFn: (id: any) => Promise<any>
  ): Promise<boolean> {
    try {
      await ElMessageBox.confirm(mergedOpts.deleteConfirmMsg(item), '确认删除', {
        type: 'warning',
        confirmButtonText: '确定删除',
        confirmButtonClass: 'el-button--danger',
      })
    } catch {
      return false
    }

    submitting.value = true
    try {
      await deleteFn((item as any).id)
      ElMessage.success(mergedOpts.deleteSuccessMsg)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除失败'
      ElMessage.error(error.value)
      return false
    } finally {
      submitting.value = false
    }
  }

  async function save(
    form: any,
    saveFn: (data: any) => Promise<any>,
    onSuccess: () => void
  ): Promise<boolean> {
    const valid = await mergedOpts.validateBefore(form)
    if (!valid) return false

    submitting.value = true
    try {
      await saveFn(form)
      ElMessage.success(form.id ? mergedOpts.updateSuccessMsg : mergedOpts.createSuccessMsg)
      onSuccess()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
      ElMessage.error(error.value)
      return false
    } finally {
      submitting.value = false
    }
  }

  return { loading, submitting, error, confirmDelete, save }
}

export function useSearchState(initial: Record<string, any> = {}) {
  const search = reactive({ ...initial })
  const page = ref(1)
  const size = ref(10)
  const total = ref(0)

  function resetSearch() {
    Object.keys(search).forEach(k => {
      search[k] = initial[k] ?? ''
    })
    page.value = 1
  }

  return { search, page, size, total, resetSearch }
}
