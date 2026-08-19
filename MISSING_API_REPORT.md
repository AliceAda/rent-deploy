# 缺失接口补充与字段命名统一报告

## 一、新增接口文件

### 1. 房东端接口 (`src/api/landlord.ts`)

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /landlord/profile` | 获取 | 房东资料 |
| `PUT /landlord/profile` | 更新 | 更新房东资料 |
| `GET /landlord/bills` | 列表 | 账单列表 |
| `GET /landlord/bills/{id}` | 详情 | 账单详情 |
| `POST /landlord/bills/generate` | 生成 | 生成月度账单 |
| `GET /landlord/contracts` | 列表 | 合同列表 |
| `GET /landlord/contracts/{id}` | 详情 | 合同详情 |
| `GET /landlord/workorders` | 列表 | 工单列表 |
| `GET /landlord/workorders/{id}` | 详情 | 工单详情 |
| `GET /landlord/withdraws` | 列表 | 提现记录 |
| `POST /landlord/withdraw` | 申请 | 提现申请 |
| `GET /landlord/stats` | 统计 | 房东统计 |

### 2. 管理后台扩展接口 (`src/api/admin-extensions.ts`)

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET/POST/PUT/DELETE /admin/buildings` | CRUD | 楼栋管理 |
| `GET/POST/PUT/DELETE /admin/regions` | CRUD | 区域管理 |
| `GET/POST/PUT/DELETE /admin/metros` | CRUD | 地铁站点管理 |
| `GET/POST/PUT/DELETE /admin/pois` | CRUD | 兴趣点管理 |
| `GET/POST/PUT/DELETE /admin/facilities` | CRUD | 设施管理 |
| `GET/POST/PUT/DELETE /admin/tags` | CRUD | 标签管理 |
| `GET/POST/PUT/DELETE /admin/activities` | CRUD | 活动管理 |
| `GET/POST/PUT/DELETE /admin/invoices` | CRUD | 发票管理 |
| `GET /admin/reconciliations` | 列表 | 对账管理 |
| `POST /admin/reconciliations/{id}/reconcile` | 操作 | 执行对账 |
| `GET /admin/taxes` | 列表 | 税务管理 |
| `POST /admin/taxes/{id}/declare` | 操作 | 申报税务 |

### 3. 用户端扩展接口 (`src/api/user-extensions.ts`)

| 接口 | 方法 | 说明 |
|------|------|------|
| `GET /user/invites` | 列表 | 邀请记录 |
| `GET /user/invite/code` | 获取 | 邀请码 |
| `GET /user/checkins` | 列表 | 入住记录 |
| `GET /user/deposits` | 列表 | 押金记录 |
| `GET /user/bills` | 列表 | 账单列表 |
| `GET /user/payments` | 列表 | 支付记录 |
| `GET /user/refunds` | 列表 | 退款记录 |
| `GET /user/credit` | 获取 | 信用分 |
| `POST /user/invoice` | 申请 | 发票申请 |
| `GET /user/invoices` | 列表 | 发票记录 |

---

## 二、字段命名统一方案

### 2.1 统一规则

| 场景 | 规则 | 示例 |
|------|------|------|
| 数据库字段 | snake_case | `created_at`, `house_id` |
| 后端 API 返回 | snake_case | `created_at`, `house_id` |
| 前端代码使用 | camelCase | `createdAt`, `houseId` |
| 前端发送请求 | camelCase | `{ createdAt: '...' }` |
| 请求参数转换 | 自动转换 | 后端接收 `created_at` |

### 2.2 转换工具 (`src/utils/field-mapping.ts`)

```typescript
// 对象转换
toCamelCaseObject({ created_at: '2024-01-01' })
// 结果: { createdAt: '2024-01-01' }

// 数组转换
toCamelCaseArray([{ created_at: '...' }, ...])

// 分页响应转换
parsePaginatedResponse({ list: [...], total: 100, page: 1, size: 10 })

// 字段映射表
FIELD_MAPPING = {
  'user_id': 'userId',
  'house_id': 'houseId',
  'created_at': 'createdAt',
  // ...
}
```

### 2.3 HTTP 拦截器 (`src/utils/http-with-transform.ts`)

```typescript
// 自动转换响应字段
getWithTransform('/api/houses')  // 自动将 snake_case 转为 camelCase

// 自动转换请求参数
postWithTransform('/api/houses', { houseTitle: 'xxx' })  // 自动转为 { house_title: 'xxx' }

// 分页列表自动转换
getListWithTransform('/api/houses', { page: 1, size: 20 })
```

---

## 三、完整接口对照表

### 3.1 核心业务接口

| 模块 | 数据库表 | 前端接口文件 | 接口数量 |
|------|---------|-------------|---------|
| 用户认证 | `user`, `sms_code` | `auth.ts` | 5 |
| 房源管理 | `house`, `house_image` | `house.ts` | 10 |
| 订单管理 | `lease_order` | `order.ts` | 8 |
| 合同管理 | `contract`, `contract_template` | `contract.ts` | 8 |
| 支付财务 | `payment`, `withdraw`, `refund` | `pay.ts` | 10 |
| 预约看房 | `booking` | `booking.ts` | 8 |
| 评价系统 | `review` | `house.ts` | 3 |
| 收藏系统 | `user_collect` | `collect.ts` | 3 |
| 地址管理 | `user_address` | `address.ts` | 5 |
| 消息系统 | `message` | `message.ts` | 3 |
| 工单报修 | `ticket`, `repair_order` | `workorder.ts` | 8 |
| 风控系统 | `blacklist`, `risk_rule` | `risk.ts` | 6 |
| 搜索系统 | `search_log`, `hot_search` | `search.ts` | 5 |
| 积分优惠券 | `user_points`, `coupon` | `points.ts` | 3 |
| 通知设置 | `user_notify_setting` | `notify.ts` | 2 |
| 会话管理 | `user_session` | `session.ts` | 5 |
| 实名认证 | `realname_auth` | `user.ts` | 4 |
| 账号注销 | `account_cancel` | `user.ts` | 2 |

### 3.2 新增扩展接口

| 模块 | 数据库表 | 新增接口文件 | 新增接口数 |
|------|---------|-------------|-----------|
| 房东中心 | `landlord_profile`, `landlord_bill` | `landlord.ts` | 12 |
| 楼栋管理 | `building` | `admin-extensions.ts` | 4 |
| 区域管理 | `region` | `admin-extensions.ts` | 4 |
| 地铁站点 | `metro_station` | `admin-extensions.ts` | 4 |
| 兴趣点 | `poi` | `admin-extensions.ts` | 4 |
| 设施管理 | `facility` | `admin-extensions.ts` | 4 |
| 标签管理 | `tag` | `admin-extensions.ts` | 4 |
| 活动管理 | `activity` | `admin-extensions.ts` | 5 |
| 发票管理 | `invoice` | `admin-extensions.ts` | 4 |
| 对账管理 | `reconciliation` | `admin-extensions.ts` | 2 |
| 税务管理 | `tax_record` | `admin-extensions.ts` | 2 |
| 邀请系统 | `invite_record` | `user-extensions.ts` | 2 |
| 入住记录 | `checkin_record` | `user-extensions.ts` | 1 |
| 押金记录 | `deposit_record` | `user-extensions.ts` | 1 |
| 租客账单 | `fee_bill` | `user-extensions.ts` | 1 |
| 支付记录 | `payment` | `user-extensions.ts` | 1 |
| 退款记录 | `refund` | `user-extensions.ts` | 1 |
| 信用分 | `credit_log` | `user-extensions.ts` | 1 |
| 发票申请 | `invoice` | `user-extensions.ts` | 2 |

---

## 四、字段映射对照表

### 4.1 用户表 (`user`)

| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `id` | `id` | number |
| `name` | `name` | string |
| `phone` | `phone` | string |
| `real_name` | `realName` | string |
| `id_card` | `idCard` | string |
| `id_card_front` | `idCardFront` | string |
| `id_card_back` | `idCardBack` | string |
| `email` | `email` | string |
| `gender` | `gender` | number |
| `avatar` | `avatar` | string |
| `role` | `role` | string |
| `cert_status` | `certStatus` | string |
| `account_status` | `accountStatus` | string |
| `credit_score` | `creditScore` | number |
| `reg_time` | `regTime` | string |
| `last_login` | `lastLogin` | string |
| `last_login_ip` | `lastLoginIp` | string |
| `created_at` | `createdAt` | string |
| `updated_at` | `updatedAt` | string |

### 4.2 房源表 (`house`)

| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `id` | `id` | number |
| `title` | `title` | string |
| `building_id` | `buildingId` | number |
| `region_id` | `regionId` | number |
| `city` | `city` | string |
| `district` | `district` | string |
| `community` | `community` | string |
| `address_detail` | `addressDetail` | string |
| `rent_type` | `rentType` | string |
| `layout` | `layout` | string |
| `room_count` | `roomCount` | number |
| `hall_count` | `hallCount` | number |
| `toilet_count` | `toiletCount` | number |
| `area` | `area` | number |
| `floor` | `floor` | string |
| `orientation` | `orientation` | string |
| `decoration` | `decoration` | string |
| `price` | `price` | number |
| `deposit_type` | `depositType` | string |
| `deposit_amount` | `depositAmount` | number |
| `status` | `status` | string |
| `source` | `source` | string |
| `landlord_id` | `landlordId` | number |
| `agent_id` | `agentId` | number |
| `description` | `description` | string |
| `video_url` | `videoUrl` | string |
| `lng` | `lng` | number |
| `lat` | `lat` | number |
| `grade` | `grade` | number |
| `views` | `views` | number |
| `collect_count` | `collectCount` | number |
| `created_at` | `createdAt` | string |

### 4.3 订单表 (`lease_order`)

| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `id` | `id` | number |
| `order_no` | `orderNo` | string |
| `house_id` | `houseId` | number |
| `room_id` | `roomId` | number |
| `house_title` | `houseTitle` | string |
| `rent_type` | `rentType` | string |
| `tenant_id` | `tenantId` | number |
| `tenant_name` | `tenantName` | string |
| `landlord_id` | `landlordId` | number |
| `landlord_name` | `landlordName` | string |
| `agent_id` | `agentId` | number |
| `agent_name` | `agentName` | string |
| `amount` | `amount` | number |
| `status` | `status` | string |
| `created_at` | `createdAt` | string |

---

## 五、执行步骤

### 5.1 后端开发

```bash
# 1. 创建新接口文件
cd D:\Project\rent-deploy\src\api
touch landlord.ts admin-extensions.ts user-extensions.ts

# 2. 实现接口逻辑（后端）
# - 房东端接口
# - 管理后台扩展接口
# - 用户端扩展接口
```

### 5.2 前端开发

```bash
# 1. 导入新接口
import { getLandlordProfile } from '@/api/landlord'
import { getBuildings } from '@/api/admin-extensions'
import { getMyInvites } from '@/api/user-extensions'

# 2. 使用字段转换工具
import { toCamelCaseObject } from '@/utils/field-mapping'

# 3. 在组件中使用
const data = await getLandlordProfile()
const profile = toCamelCaseObject(data)
```

### 5.3 数据库迁移（如需）

```sql
-- 添加缺失的索引
ALTER TABLE `house` ADD INDEX `idx_status_price` (`status`, `price`);
ALTER TABLE `lease_order` ADD INDEX `idx_tenant_status` (`tenant_id`, `status`);
ALTER TABLE `contract` ADD INDEX `idx_end_date` (`end_date`);
```

---

## 六、后续优化建议

### 6.1 性能优化

1. **缓存策略**
   - 热点数据缓存（房源、用户信息）
   - 列表数据分页缓存
   - 字典数据本地缓存

2. **请求优化**
   - 接口合并请求
   - 防抖节流处理
   - 请求取消机制

### 6.2 安全加固

1. **权限控制**
   - 接口级权限校验
   - 数据级权限控制
   - 敏感操作二次验证

2. **数据安全**
   - 敏感信息脱敏
   - 接口参数校验
   - 防刷限流

### 6.3 监控告警

1. **接口监控**
   - 响应时间监控
   - 错误率监控
   - 流量监控

2. **数据库监控**
   - 慢查询监控
   - 连接数监控
   - 表空间监控

---

**报告生成时间**: 2026-08-19 07:40
**报告生成工具**: AgnesCode AI Assistant
