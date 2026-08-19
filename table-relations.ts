/**
 * 数据库关联关系文档
 * 描述各表之间的关联关系
 */

export interface TableRelation {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
  onDelete?: string
  onUpdate?: string
  description?: string
}

/**
 * 核心表关联关系
 */
export const CORE_RELATIONS: TableRelation[] = [
  // 用户关联
  { fromTable: 'user_address', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户地址' },
  { fromTable: 'user_collect', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户收藏' },
  { fromTable: 'user_session', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户会话' },
  { fromTable: 'user_points', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户积分' },
  { fromTable: 'user_coupon', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户优惠券' },
  { fromTable: 'user_notify_setting', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户通知设置' },
  { fromTable: 'realname_auth', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '实名认证' },
  { fromTable: 'blacklist', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '黑名单' },
  { fromTable: 'risk_event', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '风险事件' },
  { fromTable: 'points_log', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '积分日志' },
  { fromTable: 'credit_log', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '信用日志' },
  { fromTable: 'invoice', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '发票' },
  { fromTable: 'invoice_title', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '发票抬头' },
  { fromTable: 'account_ledger', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '账户流水' },
  { fromTable: 'search_log', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '搜索日志' },
  { fromTable: 'user_event', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户事件' },
  { fromTable: 'login_log', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '登录日志' },
  { fromTable: 'sms_code', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '短信验证码' },
  { fromTable: 'withdraw', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '提现' },
  { fromTable: 'refund', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '退款' },
  { fromTable: 'payment', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '支付' },
  { fromTable: 'operate_log', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '操作日志' },
  { fromTable: 'data_export_request', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '数据导出' },
  
  // 房源关联
  { fromTable: 'house', fromColumn: 'landlord_id', toTable: 'user', toColumn: 'id', description: '房源房东' },
  { fromTable: 'house', fromColumn: 'agent_id', toTable: 'agent_broker', toColumn: 'id', description: '房源经纪人' },
  { fromTable: 'house', fromColumn: 'building_id', toTable: 'building', toColumn: 'id', description: '房源楼栋' },
  { fromTable: 'house', fromColumn: 'region_id', toTable: 'region', toColumn: 'id', description: '房源区域' },
  { fromTable: 'house_image', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源图片' },
  { fromTable: 'house_room', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源房间' },
  { fromTable: 'house_facility', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源设施' },
  { fromTable: 'house_tag', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源标签' },
  { fromTable: 'house_metro_rel', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源地铁' },
  { fromTable: 'house_poi_rel', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源周边' },
  { fromTable: 'house_price_history', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源价格历史' },
  { fromTable: 'house_schedule', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源日程' },
  { fromTable: 'house_view_history', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源浏览历史' },
  { fromTable: 'house_report', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源举报' },
  { fromTable: 'house_audit_log', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房源审核日志' },
  
  // 订单关联
  { fromTable: 'lease_order', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '订单房源' },
  { fromTable: 'lease_order', fromColumn: 'tenant_id', toTable: 'user', toColumn: 'id', description: '订单租客' },
  { fromTable: 'lease_order', fromColumn: 'landlord_id', toTable: 'user', toColumn: 'id', description: '订单房东' },
  { fromTable: 'lease_order', fromColumn: 'agent_id', toTable: 'agent_broker', toColumn: 'id', description: '订单经纪人' },
  { fromTable: 'lease_order_status_log', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '订单状态日志' },
  
  // 合同关联
  { fromTable: 'contract', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '合同房源' },
  { fromTable: 'contract', fromColumn: 'tenant_id', toTable: 'user', toColumn: 'id', description: '合同租客' },
  { fromTable: 'contract', fromColumn: 'landlord_id', toTable: 'user', toColumn: 'id', description: '合同房东' },
  { fromTable: 'contract', fromColumn: 'agent_id', toTable: 'agent_broker', toColumn: 'id', description: '合同经纪人' },
  { fromTable: 'contract', fromColumn: 'template_id', toTable: 'contract_template', toColumn: 'id', description: '合同模板' },
  { fromTable: 'contract_attachment', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '合同附件' },
  { fromTable: 'contract_sign_log', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '合同签约日志' },
  { fromTable: 'contract_status_log', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '合同状态日志' },
  
  // 预约关联
  { fromTable: 'booking', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '预约房源' },
  { fromTable: 'booking', fromColumn: 'tenant_id', toTable: 'user', toColumn: 'id', description: '预约租客' },
  { fromTable: 'booking', fromColumn: 'landlord_id', toTable: 'user', toColumn: 'id', description: '预约房东' },
  
  // 财务关联
  { fromTable: 'payment', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '支付订单' },
  { fromTable: 'payment', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '支付用户' },
  { fromTable: 'refund', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '退款订单' },
  { fromTable: 'refund', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '退款用户' },
  { fromTable: 'withdraw', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '提现用户' },
  { fromTable: 'finance_settlement', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '结算订单' },
  { fromTable: 'finance_settlement', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '结算合同' },
  { fromTable: 'deposit_record', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '押金记录' },
  { fromTable: 'fee_bill', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '费用账单房源' },
  { fromTable: 'fee_bill', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '费用账单用户' },
  { fromTable: 'landlord_bill', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '房东账单房源' },
  { fromTable: 'landlord_bill', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '房东账单用户' },
  
  // 评价关联
  { fromTable: 'review', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '评价房源' },
  { fromTable: 'review', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '评价用户' },
  { fromTable: 'review', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '评价合同' },
  
  // 消息关联
  { fromTable: 'message', fromColumn: 'sender_id', toTable: 'user', toColumn: 'id', description: '消息发送者' },
  { fromTable: 'message', fromColumn: 'receiver_id', toTable: 'user', toColumn: 'id', description: '消息接收者' },
  { fromTable: 'message', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '消息房源' },
  
  // 工单关联
  { fromTable: 'repair_order', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '报修房源' },
  { fromTable: 'repair_order', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '报修用户' },
  { fromTable: 'repair_order', fromColumn: 'landlord_id', toTable: 'user', toColumn: 'id', description: '报修房东' },
  { fromTable: 'ticket', fromColumn: 'creator_id', toTable: 'user', toColumn: 'id', description: '工单创建者' },
  { fromTable: 'ticket', fromColumn: 'handler_id', toTable: 'user', toColumn: 'id', description: '工单处理者' },
  { fromTable: 'ticket_attachment', fromColumn: 'ticket_id', toTable: 'ticket', toColumn: 'id', description: '工单附件' },
  { fromTable: 'ticket_log', fromColumn: 'ticket_id', toTable: 'ticket', toColumn: 'id', description: '工单日志' },
  
  // 经纪人关联
  { fromTable: 'agent_broker', fromColumn: 'store_id', toTable: 'agent_store', toColumn: 'id', description: '经纪人门店' },
  { fromTable: 'agent_broker', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '经纪人账号' },
  { fromTable: 'agent_store', fromColumn: 'region_id', toTable: 'region', toColumn: 'id', description: '门店区域' },
  
  // 组织关联
  { fromTable: 'department', fromColumn: 'parent_id', toTable: 'department', toColumn: 'id', description: '部门层级' },
  { fromTable: 'employee', fromColumn: 'department_id', toTable: 'department', toColumn: 'id', description: '员工部门' },
  { fromTable: 'employee', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '员工账号' },
  
  // 权限关联
  { fromTable: 'role_permission', fromColumn: 'role_id', toTable: 'role', toColumn: 'id', description: '角色权限' },
  { fromTable: 'role_permission', fromColumn: 'permission_id', toTable: 'permission', toColumn: 'id', description: '角色权限' },
  { fromTable: 'user_role', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '用户角色' },
  { fromTable: 'user_role', fromColumn: 'role_id', toTable: 'role', toColumn: 'id', description: '用户角色' },
  
  // 字典关联
  { fromTable: 'sys_dict_item', fromColumn: 'type_id', toTable: 'sys_dict_type', toColumn: 'id', description: '字典项' },
  
  // 其他关联
  { fromTable: 'activity', fromColumn: 'type', toTable: 'sys_dict_type', toColumn: 'id', description: '活动类型' },
  { fromTable: 'ad_material', fromColumn: 'slot_id', toTable: 'ad_slot', toColumn: 'id', description: '广告素材' },
  { fromTable: 'content', fromColumn: 'creator_id', toTable: 'user', toColumn: 'id', description: '内容创建者' },
  { fromTable: 'content_audit', fromColumn: 'content_id', toTable: 'content', toColumn: 'id', description: '内容审核' },
  { fromTable: 'risk_rule', fromColumn: 'creator_id', toTable: 'user', toColumn: 'id', description: '规则创建者' },
  { fromTable: 'house_report', fromColumn: 'reporter_id', toTable: 'user', toColumn: 'id', description: '举报人' },
  { fromTable: 'checkin_record', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '入住记录' },
  { fromTable: 'sublease', fromColumn: 'house_id', toTable: 'house', toColumn: 'id', description: '转租房源' },
  { fromTable: 'sublease', fromColumn: 'user_id', toTable: 'user', toColumn: 'id', description: '转租用户' },
  { fromTable: 'termination', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '退租合同' },
  { fromTable: 'lease_renewal', fromColumn: 'contract_id', toTable: 'contract', toColumn: 'id', description: '续租合同' },
  { fromTable: 'dispute', fromColumn: 'order_id', toTable: 'lease_order', toColumn: 'id', description: '纠纷订单' },
  { fromTable: 'dispute', fromColumn: 'complainant_id', toTable: 'user', toColumn: 'id', description: '纠纷投诉人' },
  { fromTable: 'dispute', fromColumn: 'respondent_id', toTable: 'user', toColumn: 'id', description: '纠纷被投诉人' },
  { fromTable: 'scheduled_job', fromColumn: 'created_by', toTable: 'user', toColumn: 'id', description: '定时任务创建者' },
]

/**
 * 获取表的所有关联
 */
export function getTableRelations(tableName: string): TableRelation[] {
  return CORE_RELATIONS.filter(r => r.fromTable === tableName || r.toTable === tableName)
}

/**
 * 获取表的外键关联
 */
export function getTableForeignKeys(tableName: string): TableRelation[] {
  return CORE_RELATIONS.filter(r => r.fromTable === tableName)
}

/**
 * 获取引用该表的关联
 */
export function getTableReferences(tableName: string): TableRelation[] {
  return CORE_RELATIONS.filter(r => r.toTable === tableName)
}

/**
 * 核心业务表
 */
export const CORE_TABLES = [
  'user',
  'house',
  'house_image',
  'lease_order',
  'contract',
  'booking',
  'payment',
  'withdraw',
  'review',
  'message',
  'ticket',
  'repair_order',
  'agent_broker',
  'agent_store',
  'role',
  'permission',
  'content'
]

/**
 * 统计关联表
 */
export const STAT_TABLES = [
  'house_view_history',
  'search_log',
  'user_event',
  'operate_log',
  'login_log'
]

/**
 * 日志表
 */
export const LOG_TABLES = [
  'lease_order_status_log',
  'contract_status_log',
  'house_audit_log',
  'ticket_log',
  'contract_sign_log',
  'points_log',
  'credit_log'
]

/**
 * 扩展功能表
 */
export const EXT_TABLES = [
  'activity',
  'ad_material',
  'ad_slot',
  'invoice',
  'invoice_title',
  'reconciliation',
  'tax_record',
  'dispute',
  'checkin_record',
  'sublease',
  'termination',
  'lease_renewal',
  'scheduled_job'
]
