import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Ref } from 'vue'

/**
 * 通用 CRUD 操作 Composable
 * 
 * 封装常用的增删改查交互逻辑，减少重复代码
 */

export interface CrudOptions {
  /** 新增时的提示消息 */
  createSuccessMsg?: string
  /** 更新时的提示消息 */
  updateSuccessMsg?: string
  /** 删除时的确认提示文案 */
  deleteConfirmMsg?: (item: any) => string
  /** 删除成功提示文案 */
  deleteSuccessMsg?: string
  /** 操作前的校验函数 */
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

  /**
   * 通用删除确认 + 执行
   */
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

  /**
   * 通用保存（新增或更新）
   */
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

  return {
    loading,
    submitting,
    error,
    confirmDelete,
    save,
  }
}

/**
 * 通用搜索+分页状态管理
 */
export function useSearchState(initialSearch: Record<string, any> = {}) {
  const search = reactive({ ...initialSearch })
  const page = ref(1)
  const size = ref(10)
  const total = ref(0)

  function resetSearch() {
    Object.keys(search).forEach((k) => {
      search[k] = initialSearch[k] ?? ''
    })
    page.value = 1
  }

  function handlePageChange(newPage: number) {
    page.value = newPage
  }

  function handleSizeChange(newSize: number) {
    size.value = newSize
    page.value = 1
  }

  return {
    search,
    page,
    size,
    total,
    resetSearch,
    handlePageChange,
    handleSizeChange,
  }
}
