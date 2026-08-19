import { createApp, type Directive } from 'vue'
import { safe, okRes, msgOf, type ApiResp } from './http'

/**
 * Global error handler mixin
 * Usage: import { useErrorHandler } from '@/utils/errorHandler'
 */
export function useErrorHandler() {
  function handleError(error: any, fallbackMsg = 'An error occurred') {
    const msg = error?.response?.data?.message 
      || error?.message 
      || fallbackMsg
    console.error('[Error]', msg, error)
    return msg
  }

  function handleApiError<T>(res: ApiResp<T>, fallbackMsg = 'Operation failed') {
    if (!okRes(res)) {
      const msg = msgOf(res)
      console.error('[API Error]', msg)
      return msg
    }
    return null
  }

  return { handleError, handleApiError }
}

/**
 * Error boundary component for Vue 3
 */
export const ErrorBoundary = {
  name: 'ErrorBoundary',
  props: {
    fallback: {
      type: String,
      default: 'Something went wrong'
    }
  },
  data() {
    return { hasError: false, error: null as Error | null }
  },
  errorCaptured(err: Error, instance: any, info: string) {
    this.hasError = true
    this.error = err
    console.error('[ErrorBoundary]', err, info)
    return false // prevent propagation
  },
  render() {
    if (this.hasError) {
      return this.$slots.fallback?.() || this.$createElement('div', this.fallback)
    }
    return this.$slots.default?.()
  }
}

/**
 * Global error toast directive
 */
export const vErrorToast: Directive<HTMLElement, Error> = {
  mounted(el, binding) {
    const errorMsg = binding.value?.message || 'An error occurred'
    // In a real app, you'd integrate with ElMessage
    console.error('[vErrorToast]', errorMsg)
  }
}
