/**
 * 前端字段转换工具 - 统一处理 snake_case 和 camelCase
 */

/**
 * 将单个字段从 snake_case 转换为 camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 将对象的所有 key 从 snake_case 转换为 camelCase
 */
export function toCamelCaseObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCaseObject(item)) as unknown as T
  }
  
  const result = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key) as keyof T
      result[camelKey] = toCamelCaseObject(obj[key])
    }
  }
  return result
}

/**
 * 将数组中的所有对象的 key 从 snake_case 转换为 camelCase
 */
export function toCamelCaseArray<T extends Record<string, any>>(arr: T[]): T[] {
  return arr.map(item => toCamelCaseObject(item))
}

/**
 * 将单个字段从 camelCase 转换为 snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * 将对象的所有 key 从 camelCase 转换为 snake_case
 */
export function toSnakeCaseObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCaseObject(item)) as unknown as T
  }
  
  const result = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key) as keyof T
      result[snakeKey] = toSnakeCaseObject(obj[key])
    }
  }
  return result
}

/**
 * 分页响应类型（snake_case）
 */
export interface SnakePaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 分页响应类型（camelCase）
 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/**
 * 将分页响应从 snake_case 转换为 camelCase
 */
export function parsePaginatedResponse<T extends Record<string, any>>(
  response: SnakePaginatedResponse<T>
): PaginatedResponse<T> {
  return {
    list: toCamelCaseArray(response.list),
    total: response.total,
    page: response.page,
    size: response.size
  }
}

/**
 * 通用请求参数（支持分页和排序）
 */
export interface RequestParams {
  page?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

/**
 * 将请求参数从 camelCase 转换为 snake_case
 */
export function prepareRequestParams(params: RequestParams): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const snakeKey = toSnakeCase(key)
      result[snakeKey] = params[key]
    }
  }
  return result
}

/**
 * 常用字段映射表
 */
export const FIELD_MAPPING: Record<string, string> = {
  // 用户相关
  'user_id': 'userId',
  'real_name': 'realName',
  'id_card': 'idCard',
  'id_card_front': 'idCardFront',
  'id_card_back': 'idCardBack',
  'last_login': 'lastLogin',
  'last_login_ip': 'lastLoginIp',
  'reg_time': 'regTime',
  'cert_status': 'certStatus',
  'account_status': 'accountStatus',
  'credit_score': 'creditScore',
  
  // 房源相关
  'house_id': 'houseId',
  'landlord_id': 'landlordId',
  'agent_id': 'agentId',
  'building_id': 'buildingId',
  'region_id': 'regionId',
  'rent_type': 'rentType',
  'deposit_type': 'depositType',
  'deposit_amount': 'depositAmount',
  'collect_count': 'collectCount',
  'view_count': 'viewCount',
  
  // 订单相关
  'order_id': 'orderId',
  'order_no': 'orderNo',
  'tenant_id': 'tenantId',
  'tenant_name': 'tenantName',
  'start_date': 'startDate',
  'end_date': 'endDate',
  'term_months': 'termMonths',
  'monthly_rent': 'monthlyRent',
  'pay_frequency': 'payFrequency',
  
  // 合同相关
  'contract_id': 'contractId',
  'contract_no': 'contractNo',
  'signed_at': 'signedAt',
  'terminate_type': 'terminateType',
  'termination_reason': 'terminationReason',
  'terminated_at': 'terminatedAt',
  'renewal_count': 'renewalCount',
  
  // 支付相关
  'payment_id': 'paymentId',
  'payment_no': 'paymentNo',
  'trade_no': 'tradeNo',
  'biz_type': 'bizType',
  'paid_at': 'paidAt',
  
  // 时间相关
  'created_at': 'createdAt',
  'updated_at': 'updatedAt',
  'deleted_at': 'deletedAt',
  
  // 其他
  'house_title': 'houseTitle',
  'landlord_name': 'landlordName',
  'agent_name': 'agentName',
  'contact_name': 'contactName',
  'province_id': 'provinceId',
  'city_id': 'cityId',
  'district_id': 'districtId',
  'is_default': 'isDefault'
}

/**
 * 使用字段映射表转换对象
 */
export function mapFields<T extends Record<string, any>>(obj: T, mapping: Record<string, string> = FIELD_MAPPING): T {
  const result = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const mappedKey = mapping[key] || key
      result[mappedKey as keyof T] = obj[key]
    }
  }
  return result
}

/**
 * 批量转换数组
 */
export function mapFieldsArray<T extends Record<string, any>>(arr: T[], mapping: Record<string, string> = FIELD_MAPPING): T[] {
  return arr.map(item => mapFields(item, mapping))
}
