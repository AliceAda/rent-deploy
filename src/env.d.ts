/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  /** 高德地图 JS API 2.0 Key（Web端(JS API) 类型应用） */
  readonly VITE_AMAP_KEY?: string
  /** 高德 JS API 2.0 安全密钥 securityJsCode（与 key 成对，2.0 强制） */
  readonly VITE_AMAP_SECURITY_CODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
