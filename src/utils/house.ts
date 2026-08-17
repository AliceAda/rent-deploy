import type { HouseItem } from '@/api/house'
import type { House } from '@/mock/data'

/**
 * 后端 HouseItem → 租客端浏览视图 House 的适配。
 * 后端尚未返回的展示字段（facilities/tags）给空默认值；地图坐标用 id 确定性生成，
 * 保证同一房源每次打开打点位置稳定。接真后端后如返回 lng/lat，替换 x/y 即可。
 */
export function toBrowseHouse(h: HouseItem): House {
  return {
    ...h,
    facilities: [],
    tags: [],
    x: ((h.id * 37) % 80) + 10,
    y: ((h.id * 53) % 70) + 10
  }
}
