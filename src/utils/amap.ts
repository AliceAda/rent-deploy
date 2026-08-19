/**
 * 高德地图 JS API 2.0 动态加载器（零依赖，无需 npm install）。
 *
 * 为什么动态注入而不是 npm 包：
 *   - 沙箱 npm install 存在 safe-delete 批量回滚风险；
 *   - 高德官方推荐的前端用法就是 <script> 引入，动态注入等价且更可控。
 *
 * 关键约束（高德 2.0 强制）：
 *   - 必须在加载 maps 脚本【之前】设置 window._AMapSecurityConfig.securityJsCode
 *   - 否则会报「INVALID_USER_SCODE / 安全密钥不正确」
 */
let loaderPromise: Promise<any> | null = null

export function hasAmapKey(): boolean {
  return Boolean(import.meta.env.VITE_AMAP_KEY)
}

export function loadAMap(): Promise<any> {
  const w = window as unknown as {
    AMap?: any
    _AMapSecurityConfig?: { securityJsCode: string }
  }
  if (w.AMap) return Promise.resolve(w.AMap)
  if (loaderPromise) return loaderPromise

  const key = import.meta.env.VITE_AMAP_KEY
  const security = import.meta.env.VITE_AMAP_SECURITY_CODE
  if (!key) {
    return Promise.reject(new Error('[amap] 缺少 VITE_AMAP_KEY，请在 .env.local 配置'))
  }

  loaderPromise = new Promise((resolve, reject) => {
    // 2.0 必须在脚本 onload 之前声明安全密钥
    w._AMapSecurityConfig = { securityJsCode: security ?? '' }
    const s = document.createElement('script')
    s.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(
      key
    )}&plugin=AMap.MarkerCluster`
    s.async = true
    s.onerror = () =>
      reject(
        new Error(
          '[amap] 脚本加载失败：检查 Key / 安全密钥 / 控制台「域名白名单」是否包含当前 host'
        )
      )
    s.onload = () => {
      if (w.AMap) resolve(w.AMap)
      else reject(new Error('[amap] 脚本已加载但 AMap 命名空间未就绪'))
    }
    document.head.appendChild(s)
  })
  return loaderPromise
}

/**
 * 把 mock 的 0~100 百分比坐标投影到北京 bbox，作为真实地图的演示落点。
 * 真实项目应直接给房源 lng/lat，命中后优先使用。
 */
const BJ_BBOX = { lngMin: 116.1, lngMax: 116.72, latMin: 39.82, latMax: 40.08 }

export function toLngLat(h: { x?: number; y?: number; lng?: number; lat?: number }): [number, number] {
  if (typeof h.lng === 'number' && typeof h.lat === 'number') return [h.lng, h.lat]
  const x = h.x ?? 50
  const y = h.y ?? 50
  const lng = BJ_BBOX.lngMin + (x / 100) * (BJ_BBOX.lngMax - BJ_BBOX.lngMin)
  // y 越小越靠上（北），对应纬度越高
  const lat = BJ_BBOX.latMax - (y / 100) * (BJ_BBOX.latMax - BJ_BBOX.latMin)
  return [lng, lat]
}
