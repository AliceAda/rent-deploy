import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { safe, okRes, msgOf } from '@/api/http'

export interface FormErrors {
  [key: string]: string
}

export interface UseFormOptions {
  initialData?: Record<string, any>
  validators?: Record<string, (value: any) => string | null>
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useForm<T = any>(opts: UseFormOptions = {}) {
  const { initialData = {}, validators = {}, onSuccess, onError } = opts

  const form = reactive({ ...initialData } as T)
  const errors = reactive({} as FormErrors)
  const submitting = ref(false)
  const error = ref('')

  function setField(name: string, value: any) {
    ;(form as any)[name] = value
    if (errors[name]) {
      delete errors[name]
    }
  }

  function validate(): boolean {
    let valid = true
    Object.keys(validators).forEach((key) => {
      const validator = validators[key]
      if (validator) {
        const errMsg = validator((form as any)[key])
        if (errMsg) {
          errors[key] = errMsg
          valid = false
        } else {
          delete errors[key]
        }
      }
    })
    return valid
  }

  async function submit(
    submitFn: (data: T) => Promise<any>
  ): Promise<boolean> {
    if (!validate()) {
      ElMessage.warning('Please fix the form errors')
      return false
    }

    submitting.value = true
    try {
      const res = await submitFn(form)
      if (okRes(res)) {
        ElMessage.success('Saved successfully')
        onSuccess?.(form)
        return true
      } else {
        const msg = msgOf(res)
        error.value = msg
        onError?.(msg)
        ElMessage.error(msg)
        return false
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      error.value = msg
      onError?.(msg)
      ElMessage.error(msg)
      return false
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.keys(form).forEach((key) => {
      ;(form as any)[key] = (initialData as any)[key]
    })
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })
    error.value = ''
  }

  return { form, errors, submitting, error, setField, validate, submit, reset }
}
