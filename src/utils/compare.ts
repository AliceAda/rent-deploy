// ===== 房源对比篮（sessionStorage 持久化，上限 3 套，跨页面保留） =====
const KEY = 'ajy_compare'
export const COMPARE_MAX = 3

export const COMPARE_CHANGE = 'compare-change'

function read(): number[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    const arr = raw ? (JSON.parse(raw) as number[]) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'number') : []
  } catch {
    return []
  }
}

function write(ids: number[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* 忽略 */
  }
  window.dispatchEvent(new CustomEvent(COMPARE_CHANGE))
}

export function getCompareIds(): number[] {
  return read()
}

export function isCompare(id: number): boolean {
  return read().includes(id)
}

/** 返回操作结果：'added' | 'removed' | 'full'（超过上限拒绝并返回 false 语义） */
export function toggleCompare(id: number): 'added' | 'removed' | 'full' {
  const ids = read()
  const i = ids.indexOf(id)
  if (i >= 0) {
    ids.splice(i, 1)
    write(ids)
    return 'removed'
  }
  if (ids.length >= COMPARE_MAX) return 'full'
  ids.push(id)
  write(ids)
  return 'added'
}

export function clearCompare() {
  write([])
}
