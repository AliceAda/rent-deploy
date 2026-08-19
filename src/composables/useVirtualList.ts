// 轻量虚拟列表（窗口化）：仅渲染可视区 + overscan，支撑长列表（房源/工单/消息）不卡顿。
// 不依赖第三方库；调用方用固定高度容器 + @scroll 即可。
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface VirtualListOptions {
  itemHeight: number
  overscan?: number
  containerRef: Ref<HTMLElement | null>
}

export function useVirtualList<T>(source: () => T[], opts: VirtualListOptions) {
  const scrollTop = ref(0)
  const containerH = ref(0)
  const overscan = opts.overscan ?? 4
  let ro: ResizeObserver | null = null

  function onScroll(e: Event) {
    scrollTop.value = (e.target as HTMLElement).scrollTop
  }
  function measure() {
    if (opts.containerRef.value) containerH.value = opts.containerRef.value.clientHeight
  }

  const total = computed(() => source().length)
  const totalHeight = computed(() => total.value * opts.itemHeight)
  const startIndex = computed(() =>
    Math.max(0, Math.floor(scrollTop.value / opts.itemHeight) - overscan)
  )
  const visibleCount = computed(() =>
    Math.ceil((containerH.value || 600) / opts.itemHeight) + overscan * 2
  )
  const endIndex = computed(() => Math.min(total.value, startIndex.value + visibleCount.value))
  const padTop = computed(() => startIndex.value * opts.itemHeight)
  const visible = computed(() => source().slice(startIndex.value, endIndex.value))

  onMounted(() => {
    measure()
    if (opts.containerRef.value && 'ResizeObserver' in window) {
      ro = new ResizeObserver(measure)
      ro.observe(opts.containerRef.value)
    }
  })
  onBeforeUnmount(() => ro?.disconnect())

  return { scrollTop, onScroll, measure, totalHeight, padTop, visible, startIndex, endIndex }
}
