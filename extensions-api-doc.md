-- =============================================
-- 扩展功能模块 - 16张表的完整接口文档
-- =============================================

## 一、运营活动模块 (activity)

### 接口列表
```
GET    /admin/activities          - 活动列表
POST   /admin/activities          - 创建活动
PUT    /admin/activities/{id}     - 更新活动
DELETE /admin/activities/{id}     - 删除活动
POST   /admin/activities/{id}/toggle - 启用/禁用
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(120) | 活动名称 |
| type | enum | 活动类型：new_user/invite/rent/festival |
| banner | varchar(255) | 活动海报 |
| start_time | datetime | 开始时间 |
| end_time | datetime | 结束时间 |
| status | enum | 状态：not_started/active/ended |
| config | json | 活动配置 |
| created_at | datetime | 创建时间 |

---

## 二、广告管理模块 (ad_material, ad_slot)

### 接口列表
```
GET    /admin/ad-slots            - 广告位列表
POST   /admin/ad-slots            - 创建广告位
PUT    /admin/ad-slots/{id}       - 更新广告位
DELETE /admin/ad-slots/{id}       - 删除广告位

GET    /admin/ad-materials        - 广告素材列表
POST   /admin/ad-materials        - 创建广告素材
PUT    /admin/ad-materials/{id}   - 更新广告素材
DELETE /admin/ad-materials/{id}   - 删除广告素材
```

### 数据表字段

**ad_slot 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(80) | 广告位名称 |
| code | varchar(50) | 广告位编码 |
| width | int | 宽度 |
| height | int | 高度 |
| position | varchar(50) | 位置 |
| status | tinyint | 状态 |
| created_at | datetime | 创建时间 |

**ad_material 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| slot_id | int | 广告位ID |
| title | varchar(120) | 标题 |
| image | varchar(255) | 图片 |
| url | varchar(255) | 跳转链接 |
| start_time | datetime | 开始时间 |
| end_time | datetime | 结束时间 |
| status | enum | 状态 |
| sort | int | 排序 |
| created_at | datetime | 创建时间 |

---

## 三、纠纷管理模块 (dispute)

### 接口列表
```
GET    /admin/disputes            - 纠纷列表
GET    /admin/disputes/{id}       - 纠纷详情
POST   /admin/disputes/{id}/investigate - 处理纠纷
POST   /admin/disputes/{id}/close   - 关闭纠纷
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| dispute_no | varchar(30) | 纠纷编号 |
| order_id | int | 订单ID |
| complainant_id | int | 投诉人ID |
| respondent_id | int | 被投诉人ID |
| type | enum | 类型：quality/service/fee/contract |
| title | varchar(100) | 标题 |
| description | text | 描述 |
| evidence | json | 证据 |
| status | enum | 状态：pending/investigating/resolved/withdrawn/closed |
| result | text | 处理结果 |
| created_at | datetime | 创建时间 |
| resolved_at | datetime | 解决时间 |

---

## 四、发票管理模块 (invoice)

### 接口列表
```
GET    /admin/invoices            - 发票列表
POST   /admin/invoices            - 创建发票
PUT    /admin/invoices/{id}       - 更新发票
DELETE /admin/invoices/{id}       - 删除发票
POST   /admin/invoices/{id}/mail  - 邮寄发票
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| invoice_no | varchar(30) | 发票编号 |
| user_id | int | 用户ID |
| title | varchar(100) | 发票抬头 |
| tax_no | varchar(50) | 税号 |
| amount | decimal(10,2) | 金额 |
| type | enum | 类型：electronic/paper |
| status | enum | 状态 |
| mail_address | varchar(200) | 邮寄地址 |
| mail_contact | varchar(50) | 收件人 |
| mail_phone | varchar(20) | 联系电话 |
| created_at | datetime | 创建时间 |
| issued_at | datetime | 开具时间 |
| mailed_at | datetime | 邮寄时间 |

---

## 五、财务对账模块 (reconciliation)

### 接口列表
```
GET    /admin/reconciliations     - 对账列表
POST   /admin/reconciliations/{id}/reconcile - 执行对账
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| batch_no | varchar(30) | 批次号 |
| date | date | 对账日期 |
| total_amount | decimal(10,2) | 总金额 |
| platform_fee | decimal(10,2) | 平台佣金 |
| landlord_amount | decimal(10,2) | 房东金额 |
| agent_amount | decimal(10,2) | 经纪人金额 |
| status | enum | 状态 |
| created_at | datetime | 创建时间 |
| completed_at | datetime | 完成时间 |

---

## 六、税务管理模块 (tax_record)

### 接口列表
```
GET    /admin/taxes               - 税务记录列表
POST   /admin/taxes/{id}/declare  - 申报税务
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| tax_no | varchar(30) | 税务编号 |
| amount | decimal(10,2) | 金额 |
| tax_rate | decimal(5,2) | 税率 |
| tax_amount | decimal(10,2) | 税额 |
| status | enum | 状态 |
| created_at | datetime | 创建时间 |
| declared_at | datetime | 申报时间 |
| paid_at | datetime | 缴纳时间 |

---

## 七、退租管理模块 (termination)

### 接口列表
```
GET    /admin/terminations        - 退租列表
POST   /admin/terminations/{id}/process - 处理退租
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| contract_id | int | 合同ID |
| house_id | int | 房源ID |
| tenant_id | int | 租客ID |
| reason | varchar(255) | 退租原因 |
| type | enum | 类型：normal/breach/negotiation |
| status | enum | 状态 |
| refund_amount | decimal(10,2) | 退款金额 |
| penalty_amount | decimal(10,2) | 违约金 |
| created_at | datetime | 创建时间 |
| completed_at | datetime | 完成时间 |

---

## 八、转租管理模块 (sublease)

### 接口列表
```
GET    /admin/subleases           - 转租列表
POST   /admin/subleases/{id}/approve - 批准转租
POST   /admin/subleases/{id}/reject  - 拒绝转租
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| contract_id | int | 合同ID |
| house_id | int | 房源ID |
| original_tenant_id | int | 原租客ID |
| new_tenant_id | int | 新租客ID |
| sublease_date | date | 转租日期 |
| status | enum | 状态 |
| created_at | datetime | 创建时间 |

---

## 九、续租管理模块 (lease_renewal)

### 接口列表
```
GET    /admin/renewals            - 续租列表
POST   /admin/renewals/{id}/approve - 批准续租
POST   /admin/renewals/{id}/reject  - 拒绝续租
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| contract_id | int | 合同ID |
| old_end_date | date | 原结束日期 |
| new_start_date | date | 新开始日期 |
| new_end_date | date | 新结束日期 |
| new_monthly_rent | decimal(10,2) | 新租金 |
| status | enum | 状态 |
| created_at | datetime | 创建时间 |

---

## 十、入住记录模块 (checkin_record)

### 接口列表
```
GET    /admin/checkins            - 入住记录列表
POST   /admin/checkins/{id}/checkout - 办理退住
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| order_id | int | 订单ID |
| house_id | int | 房源ID |
| checkin_date | date | 入住日期 |
| checkout_date | date | 退住日期 |
| deposit | decimal(10,2) | 押金 |
| status | enum | 状态 |
| created_at | datetime | 创建时间 |

---

## 十一、押金记录模块 (deposit_record)

### 接口列表
```
GET    /admin/deposits            - 押金记录列表
POST   /admin/deposits/{id}/settle - 结算押金
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| order_id | int | 订单ID |
| amount | decimal(10,2) | 金额 |
| type | enum | 类型：collect/return |
| status | enum | 状态 |
| reason | varchar(255) | 原因 |
| created_at | datetime | 创建时间 |
| settled_at | datetime | 结算时间 |

---

## 十二、房源审核日志模块 (house_audit_log)

### 接口列表
```
GET    /admin/house-audit-logs    - 审核日志列表
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| house_id | int | 房源ID |
| operator_id | int | 操作人ID |
| action | enum | 操作类型 |
| remark | varchar(255) | 备注 |
| created_at | datetime | 创建时间 |

---

## 十三、订单状态日志模块 (lease_order_status_log)

### 接口列表
```
GET    /admin/order-status-logs   - 状态日志列表
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| order_id | int | 订单ID |
| operator_id | int | 操作人ID |
| action | varchar(50) | 操作 |
| from_status | varchar(20) | 原状态 |
| to_status | varchar(20) | 新状态 |
| remark | varchar(255) | 备注 |
| created_at | datetime | 创建时间 |

---

## 十四、信用日志模块 (credit_log)

### 接口列表
```
GET    /admin/credit-logs         - 信用日志列表
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user_id | int | 用户ID |
| score_change | int | 分数变化 |
| current_score | int | 当前分数 |
| reason | varchar(255) | 原因 |
| type | enum | 类型：positive/negative |
| created_at | datetime | 创建时间 |

---

## 十五、邀请记录模块 (invite_record)

### 接口列表
```
GET    /admin/invite-records      - 邀请记录列表
GET    /user/invites              - 我的邀请记录
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| invite_code | varchar(20) | 邀请码 |
| inviter_id | int | 邀请人ID |
| invitee_id | int | 被邀请人ID |
| reward | decimal(10,2) | 奖励 |
| status | enum | 状态 |
| used_at | datetime | 使用时间 |
| created_at | datetime | 创建时间 |

---

## 十六、租期配置模块 (rent_period)

### 接口列表
```
GET    /admin/rent-periods        - 租期配置列表
POST   /admin/rent-periods        - 创建租期配置
PUT    /admin/rent-periods/{id}   - 更新租期配置
DELETE /admin/rent-periods/{id}   - 删除租期配置
```

### 数据表字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(50) | 配置名称 |
| months | int | 月数 |
| discount | decimal(5,2) | 折扣 |
| min_rent | decimal(10,2) | 最低租金 |
| max_rent | decimal(10,2) | 最高租金 |
| status | tinyint | 状态 |
| created_at | datetime | 创建时间 |

---

## 总结

| 模块 | 接口数 | 表数 | 说明 |
|------|--------|------|------|
| 运营活动 | 5 | 1 | 活动管理 |
| 广告管理 | 8 | 2 | 广告位+素材 |
| 纠纷管理 | 4 | 1 | 投诉纠纷 |
| 发票管理 | 5 | 1 | 发票开具 |
| 财务对账 | 2 | 1 | 账单对账 |
| 税务管理 | 2 | 1 | 税务申报 |
| 退租管理 | 2 | 1 | 退租处理 |
| 转租管理 | 3 | 1 | 转租审批 |
| 续租管理 | 3 | 1 | 续租审批 |
| 入住记录 | 2 | 1 | 入住管理 |
| 押金记录 | 2 | 1 | 押金结算 |
| 审核日志 | 1 | 1 | 房源审核 |
| 状态日志 | 1 | 1 | 订单状态 |
| 信用日志 | 1 | 1 | 信用变更 |
| 邀请记录 | 2 | 1 | 邀请关系 |
| 租期配置 | 4 | 1 | 租期规则 |
| **合计** | **43** | **16** | **扩展功能完整覆盖** |
