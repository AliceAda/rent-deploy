import { safe } from '@/api/http'
import { getHouseDetail, type HouseItem } from '@/api/house'
import { useAppStore } from '@/store'
import type { House } from '@/mock/data'

/**
 * 后端 HouseItem → 租客端浏览视图 House 的适配。
 * - facilities/tags 优先用后端真实聚合字段；后端未返回时兜底为空（不覆盖已有数据）。
 * - 地图坐标优先用后端返回（x/y），缺省时按 id 确定性生成，保证同一房源打点稳定。
 *   接真后端后如返回 lng/lat，替换 x/y 即可。
 */
export function toBrowseHouse(h: HouseItem): House {
  const base = h as Partial<House>
  return {
    ...h,
    facilities: base.facilities ?? [],
    tags: base.tags ?? [],
    x: base.x ?? ((h.id * 37) % 80) + 10,
    y: base.y ?? ((h.id * 53) % 70) + 10
  }
}

/**
 * 房源解析：详情 / 签约页共用，与列表页保持同一数据策略。
 * API-first（GET /house/{id}）+ store 回退：后端就绪用真实数据，
 * 未就绪回退本地演示房源，避免「列表是 API 数据、详情却是 store 旧数据」的漏斗断点。
 */
export async function resolveHouse(id: number): Promise<House | null> {
  if (!id) return null
  const r = await safe(getHouseDetail(id), null)
  if (r.code === 0 && r.data) return toBrowseHouse(r.data)
  return useAppStore().houses.find((h) => h.id === id) ?? null
}
