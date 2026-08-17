// 中文业务状态 → el-tag type 的集中映射。
// 各页面不要再各自维护 statusType，统一从这里取：改配色一处生效。
export type StatusDomain =
  | 'house'
  | 'order'
  | 'contract'
  | 'bill'
  | 'withdraw'
  | 'refund'
  | 'booking'
  | 'workorder'

const TAG_MAP: Record<StatusDomain, Record<string, string>> = {
  house: { '可租': 'success', '待审核': 'warning', '已租': 'primary', '已下架': 'info', '违规': 'danger' },
  order: { '已支付': 'success', '已完成': 'success', '待确认': 'warning', '待支付': 'warning', '已取消': 'info' },
  contract: {
    '生效中': 'success', '已生效': 'success', '已完成': 'success', '已解约': 'danger',
    '待签署': 'warning', '待确认': 'warning', '续租中': 'warning', '退租中': 'warning',
    '已到期': 'info', '已终止': 'info', '已过期': 'info', '草稿': 'info'
  },
  bill: { '已支付': 'success', '已收': 'success', '待支付': 'warning', '待收': 'warning', '已逾期': 'danger', '逾期': 'danger' },
  withdraw: { '已通过': 'success', '已驳回': 'danger' },
  refund: { '已通过': 'success', '已驳回': 'danger' },
  booking: { '已确认': 'success', '已拒绝': 'danger', '已取消': 'info' },
  workorder: { '已完成': 'success', '已关闭': 'info', '已取消': 'info', '待处理': 'danger', '待分派': 'danger', '处理中': 'warning' }
}

// 未命中时的兜底：审批/账单类默认 warning，其余空
const FALLBACK: Record<StatusDomain, string> = {
  house: '', order: '', contract: '', bill: 'warning',
  withdraw: 'warning', refund: 'warning', booking: 'warning', workorder: ''
}

export function statusTag(domain: StatusDomain, value?: string): string {
  if (!value) return ''
  return TAG_MAP[domain][value] ?? FALLBACK[domain]
}
