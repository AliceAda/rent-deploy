// 深色模式：单一事实源为 <html data-theme>，持久化到 localStorage。
// 在 main.ts 顶部 import 一次即可在应用启动前应用，避免首屏闪烁。
import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'rent-theme'
const initial: ThemeMode =
  (typeof localStorage !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as ThemeMode)) || 'light'

const theme = ref<ThemeMode>(initial)

function apply(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = mode
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* 隐私模式下 localStorage 可能不可写，忽略 */
  }
  // 通知图表等监听方重绘（ECharts 浅/深色坐标轴配色）
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('themechange'))
}
// 模块加载即应用，保证首屏不闪白
apply(theme.value)

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    apply(theme.value)
  }
  function set(mode: ThemeMode) {
    theme.value = mode
    apply(mode)
  }
  // 跟随系统：仅当用户未手动选择过时生效
  function followSystem() {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    set(mq.matches ? 'dark' : 'light')
  }
  return { theme, toggle, set, followSystem }
}
