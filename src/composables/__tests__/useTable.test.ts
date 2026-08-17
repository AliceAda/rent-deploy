import { describe, it, expect, vi } from 'vitest'
import { useTable } from '@/composables/useTable'

describe('useTable', () => {
  it('加载成功写入 list/total', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0, data: { list: [1, 2], total: 2 } })
    const t = useTable<number>(fetcher, { immediate: false })
    await t.reload()
    expect(t.loading.value).toBe(false)
    expect(t.list.value).toEqual([1, 2])
    expect(t.total.value).toBe(2)
    expect(t.error.value).toBe('')
  })

  it('加载失败清空列表并暴露错误（区分空数据与接口失败）', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: -1, message: '接口未实现' })
    const t = useTable<number>(fetcher, { immediate: false })
    await t.reload()
    expect(t.list.value).toEqual([])
    expect(t.total.value).toBe(0)
    expect(t.error.value).toBe('接口未实现')
  })

  it('immediate 默认自动加载', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0, data: [1] })
    const t = useTable<number>(fetcher)
    await vi.waitFor(() => expect(t.list.value).toEqual([1]))
    expect(t.total.value).toBe(1)
  })

  it('兼容数组形态 data', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0, data: ['a', 'b', 'c'] })
    const t = useTable<string>(fetcher, { immediate: false })
    await t.reload()
    expect(t.list.value).toEqual(['a', 'b', 'c'])
    expect(t.total.value).toBe(3)
  })

  it('setPage 触发带页码的重载', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0, data: { list: [], total: 0 } })
    const t = useTable<number>(fetcher, { immediate: false })
    await t.reload()
    t.setPage(2)
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(fetcher).toHaveBeenLastCalledWith({ page: 2, size: 10 })
  })

  it('setSize 重置回第一页', async () => {
    const fetcher = vi.fn().mockResolvedValue({ code: 0, data: { list: [], total: 0 } })
    const t = useTable<number>(fetcher, { immediate: false })
    t.setPage(3)
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    t.setSize(20)
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(t.page.value).toBe(1)
    expect(fetcher).toHaveBeenLastCalledWith({ page: 1, size: 20 })
  })
})
