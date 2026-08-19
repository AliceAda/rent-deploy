/**
 * 统一的状态映射配置
 * 解决数据库枚举值与前端显示值的映射问题
 */

// ===== 房源状态 =====
export const HOUSE_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '可租': { label: '可租', type: 'success' },
  '已租': { label: '已租', type: 'info' },
  '待审核': { label: '待审核', type: 'warning' },
  '违规': { label: '违规', type: 'danger' },
  '已下架': { label: '已下架', type: 'info' }
}

// ===== 订单状态 =====
export const ORDER_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待支付': { label: '待支付', type: 'warning' },
  '已支付': { label: '已支付', type: 'success' },
  '已取消': { label: '已取消', type: 'info' },
  '已完成': { label: '已完成', type: 'success' }
}

// ===== 合同状态 =====
export const CONTRACT_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '草稿': { label: '草稿', type: 'info' },
  '待签订': { label: '待签订', type: 'warning' },
  '生效中': { label: '生效中', type: 'success' },
  '已到期': { label: '已到期', type: 'info' },
  '已终止': { label: '已终止', type: 'danger' }
}

// ===== 支付状态 =====
export const PAYMENT_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待支付': { label: '待支付', type: 'warning' },
  '已支付': { label: '已支付', type: 'success' },
  '已退款': { label: '已退款', type: 'info' },
  '退款中': { label: '退款中', type: 'warning' },
  '失败': { label: '失败', type: 'danger' }
}

// ===== 工单状态 =====
export const TICKET_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待受理': { label: '待受理', type: 'warning' },
  '处理中': { label: '处理中', type: 'primary' },
  '已完成': { label: '已完成', type: 'success' },
  '已关闭': { label: '已关闭', type: 'info' }
}

// ===== 预约状态 =====
export const BOOKING_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待确认': { label: '待确认', type: 'warning' },
  '已确认': { label: '已确认', type: 'success' },
  '已拒绝': { label: '已拒绝', type: 'danger' }
}

// ===== 用户状态 =====
export const USER_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '正常': { label: '正常', type: 'success' },
  '冻结': { label: '冻结', type: 'warning' },
  '封禁': { label: '封禁', type: 'danger' }
}

// ===== 提现状态 =====
export const WITHDRAW_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待审核': { label: '待审核', type: 'warning' },
  '已打款': { label: '已打款', type: 'success' },
  '已拒绝': { label: '已拒绝', type: 'danger' }
}

// ===== 经纪人状态 =====
export const AGENT_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '正常': { label: '正常', type: 'success' },
  '冻结': { label: '冻结', type: 'warning' }
}

// ===== 内容状态 =====
export const CONTENT_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '草稿': { label: '草稿', type: 'info' },
  '已发布': { label: '已发布', type: 'success' }
}

// ===== 实名认证状态 =====
export const REALNAME_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '未认证': { label: '未认证', type: 'info' },
  '待审核': { label: '待审核', type: 'warning' },
  '已认证': { label: '已认证', type: 'success' },
  '未通过': { label: '未通过', type: 'danger' }
}

// ===== 优惠券状态 =====
export const COUPON_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '未使用': { label: '未使用', type: 'info' },
  '已使用': { label: '已使用', type: 'success' },
  '已过期': { label: '已过期', type: 'danger' }
}

// ===== 退款状态 =====
export const REFUND_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待处理': { label: '待处理', type: 'warning' },
  '已处理': { label: '已处理', type: 'success' },
  '已拒绝': { label: '已拒绝', type: 'danger' }
}

// ===== 财务结算状态 =====
export const SETTLEMENT_STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  '待结算': { label: '待结算', type: 'warning' },
  '已结算': { label: '已结算', type: 'success' },
  '已提现': { label: '已提现', type: 'info' },
  '冻结': { label: '冻结', type: 'danger' }
}

// ===== 工具函数 =====
export function getStatusConfig(status: string, type: string = 'default') {
  const map: Record<string, Record<string, { label: string; type: any }>> = {
    house: HOUSE_STATUS,
    order: ORDER_STATUS,
    contract: CONTRACT_STATUS,
    payment: PAYMENT_STATUS,
    ticket: TICKET_STATUS,
    booking: BOOKING_STATUS,
    user: USER_STATUS,
    withdraw: WITHDRAW_STATUS,
    agent: AGENT_STATUS,
    content: CONTENT_STATUS,
    realname: REALNAME_STATUS,
    coupon: COUPON_STATUS,
    refund: REFUND_STATUS,
    settlement: SETTLEMENT_STATUS
  }
  return map[type]?.[status] || { label: status, type: 'info' }
}

export function getStatusLabel(status: string, type: string = 'default'): string {
  return getStatusConfig(status, type).label
}

export function getStatusType(status: string, type: string = 'default'): string {
  return getStatusConfig(status, type).type
}
