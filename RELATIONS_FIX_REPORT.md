# 数据库关联数据修复报告

## 一、已完成修复

### 1. 外键约束添加 ✅
- **文件**: `add_foreign_keys.sql`
- **数量**: 103 个外键约束
- **覆盖表**: 所有业务表

### 2. 关联视图创建 ✅
- **文件**: `create_views.sql`
- **数量**: 15 个视图
- **用途**: 简化关联查询

### 3. 关联关系文档 ✅
- **文件**: `src/utils/table-relations.ts`
- **内容**: 完整的表关联关系映射

### 4. 关联查询 API ✅
- **文件**: `src/api/relations.ts`
- **内容**: 关联数据查询接口定义

---

## 二、核心表关联关系

### 2.1 用户中心
```
user (用户表)
├── user_address (地址)
├── user_collect (收藏)
├── user_session (会话)
├── user_points (积分)
├── user_coupon (优惠券)
├── user_notify_setting (通知设置)
├── realname_auth (实名认证)
├── blacklist (黑名单)
└── risk_event (风险事件)
```

### 2.2 房源中心
```
house (房源表)
├── house_image (图片)
├── house_room (房间)
├── house_facility (设施)
├── house_tag (标签)
├── house_metro_rel (地铁)
├── house_poi_rel (周边)
├── house_price_history (价格历史)
├── house_schedule (日程)
├── house_view_history (浏览历史)
├── house_report (举报)
└── house_audit_log (审核日志)
```

### 2.3 订单中心
```
lease_order (订单表)
├── payment (支付)
├── refund (退款)
├── finance_settlement (财务结算)
├── deposit_record (押金记录)
├── lease_order_status_log (状态日志)
└── booking (预约)
```

### 2.4 合同中心
```
contract (合同表)
├── contract_attachment (附件)
├── contract_sign_log (签约日志)
├── contract_status_log (状态日志)
├── review (评价)
├── termination (退租)
└── lease_renewal (续租)
```

### 2.5 工单中心
```
ticket (工单表)
├── ticket_attachment (附件)
├── ticket_log (日志)
└── repair_order (报修)
```

### 2.6 财务中心
```
payment (支付表)
├── refund (退款)
├── withdraw (提现)
└── finance_settlement (结算)
```

### 2.7 组织中心
```
agent_broker (经纪人)
├── agent_store (门店)
└── employee (员工)

department (部门)
└── employee (员工)
```

### 2.8 权限中心
```
role (角色)
├── role_permission (角色权限)
└── user_role (用户角色)

permission (权限)
└── role_permission (角色权限)
```

---

## 三、视图说明

| 视图名 | 说明 |
|--------|------|
| `v_house_detail` | 房源详情（含图片数、收藏数、评分） |
| `v_order_detail` | 订单详情（含房源、用户信息） |
| `v_contract_detail` | 合同详情（含房源、用户信息） |
| `v_booking_detail` | 预约详情（含房源、用户信息） |
| `v_payment_detail` | 支付详情（含订单、用户信息） |
| `v_ticket_detail` | 工单详情（含创建者、处理者） |
| `v_finance_detail` | 财务详情（含订单、房源、用户） |
| `v_house_stats` | 房源统计（含各项计数） |
| `v_user_stats` | 用户统计（含合同、订单数） |
| `v_agent_stats` | 经纪人统计（含房源、订单数） |
| `v_landlord_stats` | 房东统计（含房源、订单数） |
| `v_order_status_log` | 订单状态日志 |
| `v_contract_status_log` | 合同状态日志 |
| `v_house_audit_log` | 房源审核日志 |
| `v_operate_log` | 操作日志 |

---

## 四、执行步骤

### 4.1 添加外键约束
```bash
mysql -u root -p anju_rent < add_foreign_keys.sql
```

### 4.2 创建视图
```bash
mysql -u root -p anju_rent < create_views.sql
```

### 4.3 验证关联
```sql
-- 查看外键约束
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'anju_rent' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 查看视图
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

---

## 五、关联查询示例

### 5.1 获取房源详情
```sql
SELECT * FROM v_house_detail WHERE id = 1;
```

### 5.2 获取订单详情
```sql
SELECT * FROM v_order_detail WHERE id = 1;
```

### 5.3 获取合同详情
```sql
SELECT * FROM v_contract_detail WHERE id = 1;
```

### 5.4 获取用户统计
```sql
SELECT * FROM v_user_stats WHERE id = 1;
```

---

## 六、后续优化建议

### 6.1 索引优化
```sql
-- 为常用关联字段添加索引
CREATE INDEX idx_house_landlord ON house(landlord_id);
CREATE INDEX idx_order_tenant ON lease_order(tenant_id);
CREATE INDEX idx_contract_tenant ON contract(tenant_id);
```

### 6.2 分区表
```sql
-- 为日志表添加分区
ALTER TABLE operate_log PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (...);
```

### 6.3 物化视图
```sql
-- 创建物化视图用于统计
CREATE MATERIALIZED VIEW mv_house_stats_daily AS
SELECT DATE(created_at) AS stat_date, COUNT(*) AS new_house_count
FROM house
GROUP BY DATE(created_at);
```

---

**修复时间**: 2026-08-19 07:30
**修复人员**: AgnesCode AI Assistant
