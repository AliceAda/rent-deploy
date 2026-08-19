/**
 * 合同状态统一映射
 * 解决数据库枚举值与前端显示值的差异
 */

// 数据库枚举值
export const DB_CONTRACT_STATUS = {
  '草稿': 'draft',
  '待签订': 'pending_sign',
  '生效中': 'active',
  '已到期': 'expired',
  '续租中': 'renewing',
  '退租中': 'terminating',
  '已解除': 'terminated'
} as const

// 前端显示值
export const FRONT_CONTRACT_STATUS = {
  'draft': { label: '草稿', type: 'info' as const },
  'pending_sign': { label: '待签订', type: 'warning' as const },
  'active': { label: '生效中', type: 'success' as const },
  'expired': { label: '已到期', type: 'info' as const },
  'renewing': { label: '续租中', type: 'primary' as const },
  'terminating': { label: '退租中', type: 'warning' as const },
  'terminated': { label: '已终止', type: 'danger' as const }
}

// 终止类型
export const TERMINATE_TYPE = {
  '正常退租': { label: '正常退租', type: 'success' as const },
  '违约退租': { label: '违约退租', type: 'danger' as const },
  '协商解约': { label: '协商解约', type: 'warning' as const }
}

/**
 * 将数据库状态转换为前端状态
 */
export function mapContractStatus(dbStatus: string): string {
  return DB_CONTRACT_STATUS[dbStatus as keyof typeof DB_CONTRACT_STATUS] || dbStatus
}

/**
 * 获取状态显示配置
 */
export function getContractStatusConfig(status: string) {
  const mapped = mapContractStatus(status)
  return FRONT_CONTRACT_STATUS[mapped] || { label: status, type: 'info' }
}

/**
 * 获取状态标签
 */
export function getContractStatusLabel(status: string): string {
  return getContractStatusConfig(status).label
}

/**
 * 获取状态类型
 */
export function getContractStatusType(status: string): string {
  return getContractStatusConfig(status).type
}
