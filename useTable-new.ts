import { ref, type Ref } from 'vue'
import { safe, okRes, msgOf, toList, type ApiResp } from '@/api/http'
import type { PaginatedResult } from '@/types/common'

export interface UseTableOptions<T = unknown> {
  /** 是否挂载即加载，默认 true */
  immediate?: boolean
  /** 默认每页条数，默认 10 */
  pageSize?: number
  /** 加载成功回调 */
  onSuccess?: (data: T[]) => void
  /** 加载失败回调 */
  onError?: (error: string) => void
}

export interface UseTableReturn<T> {
  list: Ref<T[]>
  total: Ref<number>
  loading: Ref<boolean>
  error: Ref<string>
  page: Ref<number>
  size: Ref<number>
  reload: () => Promise<void>
  setPage: (p: number) => void
  setSize: (s: number) => void
}

/**
 * 统一列表数据加载组合式函数
 * 
 * @param fetcher 异步请求函数，接收分页参数，返回 ApiResp
 * @param opts 配置项
 * @returns 表格数据状态和方法
 * 
 * @example
 * const { list, loading, reload } = useTable(
 *   ({ page, size }) => getAdminUsers(page, size),
 *   { pageSize: 20 }
 * )
 */
export function useTable<T = unknown>(
  fetcher: (p: { page: number; size: number }) => Promise<ApiResp<unknown>>,
  opts: UseTableOptions<T> = {}
): UseTableReturn<T> {
  const list = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')
  const page = ref(1)
  const size = ref(opts.pageSize ?? 10)

  async function reload() {
    loading.value = true
    error.value = ''
    try {
      const res = await safe(fetcher({ page: page.value, size: size.value }), null)
      if (okRes(res)) {
        const { list: l, total: t } = toList<T>(res.data)
        list.value = l
        total.value = t
        opts.onSuccess?.(l)
      } else {
        error.value = msgOf(res)
        list.value = []
        opts.onError?.(error.value)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '网络异常'
      list.value = []
      opts.onError?.(error.value)
    } finally {
      loading.value = false
    }
  }

  function setPage(p: number) {
    if (p === page.value) return
    page.value = p
    reload()
  }

  function setSize(s: number) {
    if (s === size.value) return
    size.value = s
    page.value = 1
    reload()
  }

  if (opts.immediate !== false) reload()

  return { list, total, loading, error, page, size, reload, setPage, setSize }
}
