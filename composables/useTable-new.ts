import { ref, type Ref } from 'vue'
import { safe, okRes, msgOf, toList, type ApiResp } from '@/api/http'

export interface UseTableOptions<T = unknown> {
  /** 是否挂载即加载，默认 true */
  immediate?: boolean
  /** 默认每页条数，默认 10 */
  pageSize?: number
  /** 加载完成后的回调 */
  onSuccess?: (data: T[]) => void
  /** 加载失败的回调 */
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
 * 统一的列表加载组合式函数
 * 接管 loading / 错误 / 刷新 / 分页状态
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
    const res = await safe(fetcher({ page: page.value, size: size.value }), null)
    loading.value = false
    if (okRes(res)) {
      const { list: l, total: t } = toList<T>(res.data)
      list.value = l
      total.value = t
      opts.onSuccess?.(l)
    } else {
      list.value = []
      error.value = msgOf(res)
      opts.onError?.(error.value)
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
