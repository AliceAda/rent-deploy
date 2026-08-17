import { useAppStore } from '@/store'
import { useAuthStore } from '@/store/auth'
import { safe } from '@/api/http'
import { addCollect, removeCollect } from '@/api/collect'

/**
 * 收藏切换：本地 store 立即生效（演示模式），登录时同步调 /user/collect 尽力而为。
 * 后端未就绪时失败不回滚本地状态，保证原型可演示；后端就绪后自动落库。
 */
export async function toggleCollect(id: number) {
  const store = useAppStore()
  const auth = useAuthStore()
  const prev = store.isCollected(id)
  store.toggleCollect(id)
  if (!auth.isLoggedIn) return
  const r = await safe(prev ? removeCollect(id) : addCollect(id), {})
  // 失败保持本地状态（演示模式），不打断交互
  if (r.code !== 0) console.warn('[collect] sync failed, kept local state:', id)
}
