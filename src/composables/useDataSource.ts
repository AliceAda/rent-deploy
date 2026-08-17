import { ref } from 'vue'
import { safe } from '@/api/http'

/**
 * API-first + 本地 mock 回退的数据源。
 *
 * 后端接口就绪时返回真实数据；未就绪（网络失败 / 接口未实现）时回退 fallback，
 * 并通过 `isDemo` 标记当前是否处于「演示数据」状态，页面据此展示「演示数据」角标。
 * 接真后端后无需改动页面，仅删除 fallback 参数即可。
 *
 * 注意：返回对象中的 ref 是嵌套在普通对象里的，模板不会自动解包，
 * 因此调用方必须解构出顶层 ref（与 useTable 用法一致）：
 *   const { data, isDemo, loading, load } = useDataSource(...)
 * 模板里用 `isDemo` / `loading`，脚本里用 `data.value`。
 *
 * @param fetch 请求函数（返回 safe 包装的 ApiResp）
 * @param fallback 后端不可用时的本地演示数据
 */
export function useDataSource<T>(
  fetch: () => Promise<{ code: number; data: T }>,
  fallback: T
) {
  const data = ref<T>(fallback)
  const isDemo = ref(true)
  const loading = ref(true)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    const res = await safe(fetch(), fallback)
    if (res.code === 0) {
      data.value = res.data
      isDemo.value = false
    } else {
      data.value = fallback
      isDemo.value = true
      error.value = res.message || '数据加载失败'
    }
    loading.value = false
    return data.value
  }

  return { data, isDemo, loading, error, load }
}
