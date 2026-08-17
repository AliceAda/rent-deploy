import { describe, it, expect, vi } from 'vitest'
import { useDataSource } from '@/composables/useDataSource'

describe('useDataSource', () => {
  it('成功时写入真实数据并标记非演示', async () => {
    const fetch = vi.fn().mockResolvedValue({ code: 0, data: [1, 2] })
    const ds = useDataSource<number[]>(fetch, [9])
    expect(ds.isDemo.value).toBe(true)
    expect(ds.loading.value).toBe(true)
    await ds.load()
    expect(ds.data.value).toEqual([1, 2])
    expect(ds.isDemo.value).toBe(false)
    expect(ds.loading.value).toBe(false)
    expect(ds.error.value).toBe('')
  })

  it('业务失败（code!==0）时回退 fallback 并标记演示', async () => {
    const fetch = vi.fn().mockResolvedValue({ code: -1, message: '接口未实现' })
    const ds = useDataSource<number[]>(fetch, [9])
    await ds.load()
    expect(ds.data.value).toEqual([9])
    expect(ds.isDemo.value).toBe(true)
    expect(ds.error.value).toBe('接口未实现')
  })

  it('网络异常同样回退', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('net down'))
    const ds = useDataSource<number[]>(fetch, [9])
    await ds.load()
    expect(ds.data.value).toEqual([9])
    expect(ds.isDemo.value).toBe(true)
    expect(ds.error.value).not.toBe('')
  })

  it('load 期间 loading 状态正确切换', async () => {
    let resolve!: (v: { code: number; data: number[] }) => void
    const fetch = vi.fn().mockImplementation(() => new Promise((r) => (resolve = r)))
    const ds = useDataSource<number[]>(fetch, [9])
    const p = ds.load()
    expect(ds.loading.value).toBe(true)
    resolve({ code: 0, data: [1] })
    await p
    expect(ds.loading.value).toBe(false)
    expect(ds.data.value).toEqual([1])
  })
})
