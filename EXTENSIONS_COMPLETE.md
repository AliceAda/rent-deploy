# 扩展功能模块 - 完整开发文档

## 一、模块概览

| 序号 | 模块名称 | 页面文件 | 接口数 | 状态 |
|------|----------|----------|--------|------|
| 1 | 运营活动 | AdminActivities.vue | 5 | ✅ |
| 2 | 广告管理 | AdminAds.vue | 8 | ✅ |
| 3 | 纠纷管理 | AdminDisputes.vue | 4 | ✅ |
| 4 | 发票管理 | AdminInvoices.vue | 5 | ✅ |
| 5 | 财务对账 | AdminReconciliation.vue | 2 | ✅ |
| 6 | 税务管理 | AdminTaxes.vue | 2 | ✅ |
| 7 | 退租管理 | AdminTerminations.vue | 2 | ✅ |
| 8 | 转租管理 | AdminSubleases.vue | 3 | ✅ |
| 9 | 续租管理 | AdminRenewals.vue | 3 | ✅ |
| 10 | 入住记录 | AdminCheckins.vue | 2 | ✅ |
| 11 | 押金管理 | AdminDeposits.vue | 2 | ✅ |
| 12 | 审核日志 | AdminAuditLogs.vue | 1 | ✅ |
| 13 | 状态日志 | AdminStatusLogs.vue | 1 | ✅ |
| 14 | 信用日志 | AdminCreditLogs.vue | 1 | ✅ |
| 15 | 邀请记录 | AdminInvites.vue | 2 | ✅ |
| 16 | 租期配置 | AdminRentPeriods.vue | 4 | ✅ |
| **合计** | | | **43** | |

---

## 二、路由配置

```typescript
// src/router/index.ts
import { extensionRoutes } from '@/views/admin/extensions'

// 添加到 admin 路由组
{
  path: 'admin',
  component: AdminLayout,
  children: [
    // ... 现有路由
    ...extensionRoutes
  ]
}
```

---

## 三、菜单配置

在 `SystemManage.vue` 或菜单配置表中添加：

```
系统管理
├── 房源管理
├── 订单管理
├── 合同管理
├── 财务管理
│   ├── 财务对账
│   └── 税务管理
├── 运营中心
│   ├── 活动管理
│   ├── 广告管理
│   └── 租期配置
├── 客诉管理
│   └── 纠纷管理
├── 发票管理
├── 退租转租
│   ├── 退租管理
│   ├── 转租管理
│   └── 续租管理
├── 入住管理
│   ├── 入住记录
│   └── 押金管理
└── 日志中心
    ├── 审核日志
    ├── 状态日志
    └── 信用日志
    └── 邀请记录
```

---

## 四、核心功能说明

### 1. 运营活动管理 (AdminActivities.vue)

**功能点**：
- 活动列表展示（名称、类型、时间、状态）
- 新增/编辑活动
- 启用/禁用活动
- 删除活动

**API**：
- `GET /admin/activities` - 活动列表
- `POST /admin/activities` - 创建活动
- `PUT /admin/activities/{id}` - 更新活动
- `DELETE /admin/activities/{id}` - 删除活动
- `POST /admin/activities/{id}/toggle` - 启用/禁用

---

### 2. 广告管理 (AdminAds.vue)

**功能点**：
- 广告位列表（名称、编码、位置、尺寸）
- 新增/编辑/删除广告位
- 广告素材管理（图片、链接、状态）
- 素材上下架

**API**：
- `GET /admin/ad-slots` - 广告位列表
- `POST /admin/ad-slots` - 创建广告位
- `PUT /admin/ad-slots/{id}` - 更新广告位
- `DELETE /admin/ad-slots/{id}` - 删除广告位
- `GET /admin/ad-materials` - 素材列表
- `POST /admin/ad-materials` - 创建素材
- `PUT /admin/ad-materials/{id}` - 更新素材
- `DELETE /admin/ad-materials/{id}` - 删除素材

---

### 3. 纠纷管理 (AdminDisputes.vue)

**功能点**：
- 纠纷列表（编号、类型、投诉人、被投诉人、状态）
- 纠纷详情查看（描述、证据、处理结果）
- 处理纠纷（调解、判定）
- 关闭纠纷

**API**：
- `GET /admin/disputes` - 纠纷列表
- `GET /admin/disputes/{id}` - 纠纷详情
- `POST /admin/disputes/{id}/investigate` - 处理纠纷
- `POST /admin/disputes/{id}/close` - 关闭纠纷

---

### 4. 发票管理 (AdminInvoices.vue)

**功能点**：
- 发票列表（编号、申请人、抬头、金额、状态）
- 申请发票（电子/纸质）
- 邮寄发票（纸质发票）
- 查看详情

**API**：
- `GET /admin/invoices` - 发票列表
- `POST /admin/invoices` - 申请发票
- `PUT /admin/invoices/{id}` - 更新发票
- `DELETE /admin/invoices/{id}` - 删除发票
- `POST /admin/invoices/{id}/mail` - 邮寄发票

---

### 5. 财务对账 (AdminReconciliation.vue)

**功能点**：
- 对账批次列表
- 统计卡片（今日金额、佣金、房东、经纪人）
- 执行对账
- 查看详情

**API**：
- `GET /admin/reconciliations` - 对账列表
- `POST /admin/reconciliations/{id}/reconcile` - 执行对账

---

### 6. 税务管理 (AdminTaxes.vue)

**功能点**：
- 税务记录列表（编号、金额、税率、税额、状态）
- 申报税务
- 查看详情

**API**：
- `GET /admin/taxes` - 税务记录列表
- `POST /admin/taxes/{id}/declare` - 申报税务

---

### 7. 退租管理 (AdminTerminations.vue)

**功能点**：
- 退租列表（合同号、房源、租客、原因、类型、金额）
- 处理退租（批准/拒绝）
- 计算退款和违约金
- 查看详情

**API**：
- `GET /admin/terminations` - 退租列表
- `POST /admin/terminations/{id}/process` - 处理退租

---

### 8. 转租管理 (AdminSubleases.vue)

**功能点**：
- 转租申请列表（原租客、新租客、转租日期、状态）
- 批准转租
- 拒绝转租（填写原因）
- 查看详情

**API**：
- `GET /admin/subleases` - 转租列表
- `POST /admin/subleases/{id}/approve` - 批准转租
- `POST /admin/subleases/{id}/reject` - 拒绝转租

---

### 9. 续租管理 (AdminRenewals.vue)

**功能点**：
- 续租申请列表（原合同、新合同期限、新租金、状态）
- 批准续租
- 拒绝续租（填写原因）
- 查看详情

**API**：
- `GET /admin/renewals` - 续租列表
- `POST /admin/renewals/{id}/approve` - 批准续租
- `POST /admin/renewals/{id}/reject` - 拒绝续租

---

### 10. 入住记录 (AdminCheckins.vue)

**功能点**：
- 入住记录列表（订单号、房源、入住日期、退住日期、押金、状态）
- 办理退住
- 查看详情

**API**：
- `GET /admin/checkins` - 入住记录列表
- `POST /admin/checkins/{id}/checkout` - 办理退住

---

### 11. 押金管理 (AdminDeposits.vue)

**功能点**：
- 押金记录列表（订单号、金额、类型、状态、原因）
- 结算押金
- 查看详情

**API**：
- `GET /admin/deposits` - 押金记录列表
- `POST /admin/deposits/{id}/settle` - 结算押金

---

### 12. 审核日志 (AdminAuditLogs.vue)

**功能点**：
- 审核日志列表（房源、操作人、操作、备注、时间）
- 搜索功能

**API**：
- `GET /admin/house-audit-logs` - 审核日志列表

---

### 13. 状态日志 (AdminStatusLogs.vue)

**功能点**：
- 状态日志列表（订单号、操作人、操作、原状态、新状态、备注、时间）
- 搜索功能

**API**：
- `GET /admin/order-status-logs` - 状态日志列表

---

### 14. 信用日志 (AdminCreditLogs.vue)

**功能点**：
- 信用日志列表（用户、分数变化、当前分数、原因、类型、时间）
- 搜索功能

**API**：
- `GET /admin/credit-logs` - 信用日志列表

---

### 15. 邀请记录 (AdminInvites.vue)

**功能点**：
- 邀请记录列表（邀请码、邀请人、被邀请人、奖励、状态、时间）
- 筛选功能

**API**：
- `GET /admin/invite-records` - 邀请记录列表
- `GET /user/invites` - 我的邀请记录

---

### 16. 租期配置 (AdminRentPeriods.vue)

**功能点**：
- 租期配置列表（名称、月数、折扣、租金范围、状态）
- 新增配置
- 编辑配置
- 删除配置

**API**：
- `GET /admin/rent-periods` - 租期配置列表
- `POST /admin/rent-periods` - 创建配置
- `PUT /admin/rent-periods/{id}` - 更新配置
- `DELETE /admin/rent-periods/{id}` - 删除配置

---

## 五、开发完成清单

- [x] 16 个页面组件
- [x] 43 个 API 接口定义
- [x] TypeScript 类型定义
- [x] 路由配置
- [x] 菜单配置建议

---

## 六、后续工作

### 后端开发优先级

1. **高优先级**（核心业务）：
   - 运营活动管理
   - 纠纷管理
   - 发票管理
   - 财务对账
   - 退租/转租/续租管理

2. **中优先级**（运营支持）：
   - 广告管理
   - 税务管理
   - 入住/押金管理

3. **低优先级**（系统日志）：
   - 审核日志
   - 状态日志
   - 信用日志
   - 邀请记录
   - 租期配置

---

**所有扩展功能页面已开发完成，可以开始后端联调！** 🎉
