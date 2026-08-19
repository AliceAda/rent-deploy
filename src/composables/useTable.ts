import { ref, type Ref } from 'vue'
import { safe, okRes, msgOf, toList, type ApiResp } from '@/api/http'

export interface UseTableOptions {
  /** 是否挂载即加载，默认 true */
  immediate?: boolean
  /** 默认每页条数，默认 10（仅对支持分页的接口有意义） */
  pageSize?: number
}

export interface UseTable<T> {
  list: Ref<T[]>
  total: Ref<number>
  loading: Ref<boolean>
  /** 加载失败时的错误文案，页面可据此区分「空数据」与「接口失败」 */
  error: Ref<string>
  page: Ref<number>
  size: Ref<number>
  reload: () => Promise<void>
  setPage: (p: number) => void
  setSize: (s: number) => void
}

/**
 * 统一的列表加载组合式函数：接管 loading / 错误 / 刷新 / 分页状态，
 * 替代各页面重复的 `ref + onMounted(load) + safe(...)` 样板代码。
 *
 * fetcher 接收 { page, size }（无分页接口可忽略），返回 ApiResp；
 * data 兼容「数组」与「{ list, total }」两种后端契约形态。
 */
export function useTable<T>(
  fetcher: (p: { page: number; size: number }) => Promise<ApiResp<unknown>>,
  opts: UseTableOptions = {}
): UseTable<T> {
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
    } else {
      list.value = []
      error.value = msgOf(res)
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
