// MSW worker 入口：main.ts 在 VITE_USE_MOCK 未关闭时动态加载并启动。
// 后端就绪后设置 VITE_USE_MOCK=0 重建，本文件与 handlers 即整体失效，零残留。
import { setupWorker } from 'msw/browser'
import { handlers, fallbackHandler } from './handlers'

export const worker = setupWorker(...handlers, fallbackHandler)
