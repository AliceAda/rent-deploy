# 数据库与前端对接分析报告

## 一、总体结论

**数据库表结构基本完整**，覆盖了前端所有核心业务场景。但存在以下需要关注的问题：

---

## 二、表结构对照表

### ✅ 完全匹配（数据库有，前端使用）

| 数据库表 | 前端对应功能 | 状态 |
|---------|-------------|------|
| `user` | 用户登录、个人资料 | ✅ 匹配 |
| `house` | 房源列表、详情 | ✅ 匹配 |
| `house_image` | 房源图片 | ✅ 匹配 |
| `lease_order` | 订单管理 | ✅ 匹配 |
| `contract` | 合同管理 | ✅ 匹配 |
| `contract_template` | 合同模板 | ✅ 匹配 |
| `booking` | 看房预约 | ✅ 匹配 |
| `payment` | 支付记录 | ✅ 匹配 |
| `withdraw` | 提现申请 | ✅ 匹配 |
| `review` | 房源评价 | ✅ 匹配 |
| `user_collect` | 我的收藏 | ✅ 匹配 |
| `user_address` | 地址管理 | ✅ 匹配 |
| `user_session` | 登录会话 | ✅ 匹配 |
| `message` | 消息中心 | ✅ 匹配 |
| `repair_order` | 报修工单 | ✅ 匹配 |
| `ticket` | 工单管理 | ✅ 匹配 |
| `sys_dict_type` | 数据字典 | ✅ 匹配 |
| `sys_config` | 系统配置 | ✅ 匹配 |
| `role` | 角色管理 | ✅ 匹配 |
| `permission` | 权限管理 | ✅ 匹配 |
| `operate_log` | 操作日志 | ✅ 匹配 |

### ⚠️ 部分匹配（字段需要映射）

| 数据库表 | 前端对应功能 | 差异说明 |
|---------|-------------|---------|
| `agent_broker` | 经纪人管理 | 前端使用 `getAdminAgents()`，需确认字段映射 |
| `house_price_history` | 价格历史 | 前端 `HouseDetail.vue` 使用 |
| `house_schedule` | 房源日程 | 前端预约功能使用 |
| `finance_settlement` | 财务结算 | 前端财务管理使用 |
| `risk_rule` | 风控规则 | 前端风控管理使用 |
| `blacklist` | 黑名单 | 前端风控管理使用 |
| `refund` | 退款记录 | 前端退款管理使用 |
| `content` | 内容管理 | 前端公告管理使用 |
| `realname_auth` | 实名认证 | 前端实名认证使用 |
| `user_points` | 积分余额 | 前端积分功能使用 |
| `coupon` | 优惠券 | 前端优惠券使用 |
| `user_coupon` | 用户优惠券 | 前端优惠券使用 |

### ❌ 数据库有但前端未使用

| 数据库表 | 说明 | 建议 |
|---------|------|------|
| `activity` | 运营活动 | 前端无对应页面 |
| `ad_material` / `ad_slot` | 广告管理 | 前端无对应页面 |
| `building` | 楼栋信息 | 前端无直接使用 |
| `commission` / `commission_rule` | 佣金管理 | 前端无对应页面 |
| `dispute` | 纠纷管理 | 前端无对应页面 |
| `invoice` / `invoice_title` | 发票管理 | 前端无对应页面 |
| `reconciliation` | 对账管理 | 前端无对应页面 |
| `tax_record` | 税务记录 | 前端无对应页面 |
| `termination` | 退租管理 | 前端无对应页面 |
| `sublease` | 转租管理 | 前端无对应页面 |
| `lease_renewal` | 续租管理 | 前端无对应页面 |
| `fee_bill` | 费用账单 | 房东账单功能 |
| `landlord_bill` | 房东账单 | 房东账单功能 |
| `hot_search` | 热搜词 | 前端搜索功能 |
| `search_log` | 搜索日志 | 前端搜索管理 |
| `points_log` | 积分日志 | 前端积分功能 |
| `credit_log` | 信用日志 | 前端信用功能 |
| `scheduled_job` | 定时任务 | 后端使用 |
| `notify_channel` | 通知渠道 | 前端通知设置 |
| `house_facility` | 房源设施 | 前端房源详情 |
| `house_poi_rel` | 房源周边 | 前端地图找房 |
| `house_metro_rel` | 地铁关联 | 前端地图找房 |
| `house_tag` | 房源标签 | 前端房源筛选 |
| `house_source` | 房源来源 | 前端房源管理 |
| `house_view_history` | 看房历史 | 前端看房记录 |
| `contract_attachment` | 合同附件 | 前端合同详情 |
| `contract_sign_log` | 签约日志 | 前端合同详情 |
| `contract_status_log` | 合同状态日志 | 前端合同详情 |
| `ticket_attachment` | 工单附件 | 前端工单详情 |
| `ticket_log` | 工单日志 | 前端工单详情 |
| `deposit_record` | 押金记录 | 前端财务功能 |
| `data_export_request` | 数据导出请求 | 前端导出功能 |
| `user_event` | 用户行为事件 | 前端埋点统计 |
| `user_unique_registry` | 全局唯一注册表 | 后端使用 |
| `credit_third_auth` | 第三方认证 | 后端使用 |
| `payment_callback` | 支付回调 | 后端使用 |
| `lease_order_status_log` | 订单状态日志 | 后端使用 |
| `house_audit_log` | 房源审核日志 | 后端使用 |
| `sms_code` | 短信验证码 | 后端使用 |
| `agency_store` | 门店信息 | 前端经纪人管理 |
| `department` | 部门信息 | 后台管理 |
| `employee` | 员工信息 | 后台管理 |
| `region` | 地区信息 | 前端地区选择 |
| `metro_station` | 地铁站点 | 前端地图找房 |
| `poi` | 兴趣点 | 前端地图找房 |
| `facility` | 设施信息 | 前端房源筛选 |
| `tag` | 标签信息 | 前端房源筛选 |
| `content_audit` | 内容审核 | 后端使用 |
| `risk_event` | 风险事件 | 后端使用 |
| `house_report` | 房源举报 | 前端举报管理 |
| `checkin_record` | 入住记录 | 后端使用 |
| `user_notify_setting` | 用户通知设置 | 前端通知设置 |

---

## 三、问题与建议

### 🔴 高风险问题

#### 1. 经纪人表名不匹配
- **数据库**: `agent_broker`
- **前端API**: `/admin/agents`
- **建议**: 后端API需映射到 `agent_broker` 表

#### 2. 订单表名不匹配
- **数据库**: `lease_order`
- **前端API**: `/order`
- **建议**: 后端API需映射到 `lease_order` 表

#### 3. 合同状态枚举差异
- **数据库**: `草稿,待签订,生效中,已到期,续租中,退租中,已解除`
- **前端代码**: `草稿,生效中,已到期,已终止,已取消`
- **建议**: 统一状态枚举值

### 🟡 中风险问题

#### 1. 字段命名不一致
- 数据库使用 `created_at`，前端期望 `createdAt`
- 建议：后端API统一使用驼峰命名

#### 2. 枚举值编码问题
- 数据库SQL文件存在乱码（如 `待审�?`）
- 建议：确认数据库实际存储的枚举值

### 🟢 低风险问题

#### 1. 部分表前端未使用
- 如 `activity`、`ad_material` 等
- 建议：确认是否需要前端页面

#### 2. 缺少索引
- 部分表缺少组合索引
- 建议：根据查询场景补充索引

---

## 四、API接口与数据库字段映射

### 4.1 房源接口 `/house`

| 前端字段 | 数据库字段 | 类型 | 说明 |
|---------|-----------|------|------|
| id | id | int | 主键 |
| title | title | varchar | 标题 |
| district | district | varchar | 区域 |
| layout | layout | varchar | 户型 |
| area | area | decimal | 面积 |
| price | price | decimal | 价格 |
| rentType | rent_type | enum | 出租方式 |
| orientation | orientation | varchar | 朝向 |
| floor | floor | varchar | 楼层 |
| status | status | enum | 状态 |
| views | views | int | 浏览量 |
| collectCount | - | int | 收藏数（需关联查询） |
| images | house_image.url | varchar | 图片（需关联查询） |

### 4.2 订单接口 `/order`

| 前端字段 | 数据库字段 | 类型 | 说明 |
|---------|-----------|------|------|
| id | id | int | 主键 |
| orderNo | order_no | varchar | 订单号 |
| houseId | house_id | int | 房源ID |
| houseTitle | house_title | varchar | 房源标题 |
| userId | tenant_id | int | 租客ID |
| userName | tenant_name | varchar | 租客姓名 |
| amount | amount | decimal | 金额 |
| status | status | enum | 状态 |
| createdAt | created_at | datetime | 创建时间 |

### 4.3 合同接口 `/contract`

| 前端字段 | 数据库字段 | 类型 | 说明 |
|---------|-----------|------|------|
| id | id | int | 主键 |
| contractNo | contract_no | varchar | 合同号 |
| houseId | house_id | int | 房源ID |
| houseTitle | house_title | varchar | 房源标题 |
| tenantId | tenant_id | int | 租客ID |
| tenantName | tenant_name | varchar | 租客姓名 |
| term | term_months | int | 租期（月） |
| startDate | start_date | date | 开始日期 |
| endDate | end_date | date | 结束日期 |
| amount | monthly_rent | decimal | 月租金 |
| deposit | deposit | decimal | 押金 |
| status | status | enum | 状态 |
| createdAt | created_at | datetime | 创建时间 |

---

## 五、数据库优化建议

### 5.1 索引优化

```sql
-- 房源表
ALTER TABLE `house` ADD INDEX `idx_status_price` (`status`, `price`);
ALTER TABLE `house` ADD INDEX `idx_district_type` (`district`, `rent_type`);

-- 订单表
ALTER TABLE `lease_order` ADD INDEX `idx_tenant_status` (`tenant_id`, `status`);
ALTER TABLE `lease_order` ADD INDEX `idx_landlord_status` (`landlord_id`, `status`);

-- 合同表
ALTER TABLE `contract` ADD INDEX `idx_tenant_status` (`tenant_id`, `status`);
ALTER TABLE `contract` ADD INDEX `idx_end_date` (`end_date`);
```

### 5.2 视图建议

```sql
-- 房源详情视图
CREATE VIEW `v_house_detail` AS
SELECT 
  h.*,
  COUNT(DISTINCT hi.id) AS image_count,
  COUNT(DISTINCT uc.id) AS collect_count,
  AVG(r.score) AS avg_score
FROM `house` h
LEFT JOIN `house_image` hi ON h.id = hi.house_id
LEFT JOIN `user_collect` uc ON h.id = uc.house_id
LEFT JOIN `review` r ON h.id = r.house_id
GROUP BY h.id;
```

---

## 六、后续行动

1. **立即处理**
   - [ ] 统一数据库枚举值编码
   - [ ] 确认经纪人表字段映射
   - [ ] 统一合同状态枚举

2. **短期优化**
   - [ ] 补充缺失索引
   - [ ] 创建常用视图
   - [ ] 统一字段命名规范

3. **长期规划**
   - [ ] 评估未使用表的必要性
   - [ ] 优化表结构设计
   - [ ] 建立数据字典文档

---

**分析时间**: 2026-08-19 07:00
**分析工具**: AgnesCode AI Assistant
