import { describe, it, expect, vi, afterEach } from 'vitest'
import { toList, safe } from '@/api/http'

describe('toList', () => {
  it('兼容数组形态', () => {
    expect(toList([1, 2, 3])).toEqual({ list: [1, 2, 3], total: 3 })
  })

  it('兼容 { list, total } 形态', () => {
    expect(toList({ list: ['a'], total: 99 })).toEqual({ list: ['a'], total: 99 })
  })

  it('异常形态归零', () => {
    expect(toList(null)).toEqual({ list: [], total: 0 })
    expect(toList(undefined)).toEqual({ list: [], total: 0 })
    expect(toList({ list: null })).toEqual({ list: [], total: 0 })
    expect(toList({})).toEqual({ list: [], total: 0 })
  })
})

describe('safe', () => {
  afterEach(() => vi.restoreAllMocks())

  it('成功时原样返回', async () => {
    const res = await safe(Promise.resolve({ code: 0, data: { ok: 1 } }), null)
    expect(res.code).toBe(0)
    expect(res.data).toEqual({ ok: 1 })
  })

  it('失败时回退默认值并上报 warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const res = await safe(Promise.reject(new Error('boom')), { fallback: 1 })
    expect(res.code).toBe(-1)
    expect(res.data).toEqual({ fallback: 1 })
    expect(warn).toHaveBeenCalled()
  })
})
