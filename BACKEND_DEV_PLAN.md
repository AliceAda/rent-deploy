# 后端开发计划

## 一、项目概况

| 项目 | 内容 |
|------|------|
| 项目名称 | 安居易租后端 API |
| 技术栈 | Node.js + TypeScript + Express/NestJS + MySQL |
| 数据库 | MySQL 8.0 (102张表) |
| API 数量 | 93 个接口 |
| 预计工期 | 4-6 周 |

---

## 二、开发阶段规划

### 📌 第一阶段：基础设施（第1周）

#### Day 1-2：项目初始化
- [ ] 创建项目目录结构
- [ ] 初始化 TypeScript + Express/NestJS 项目
- [ ] 配置数据库连接（TypeORM/Prisma）
- [ ] 配置环境变量（.env）
- [ ] 配置日志系统
- [ ] 配置 CORS、全局异常处理

```bash
# 建议目录结构
backend/
├── src/
│   ├── modules/          # 业务模块
│   ├── common/           # 公共工具
│   ├── entities/         # 数据实体
│   ├── middleware/       # 中间件
│   └── app.ts
├── config/               # 配置文件
├── migrations/           # 数据库迁移
└── tests/               # 测试文件
```

#### Day 3-4：数据库迁移
- [ ] 执行 `add_foreign_keys.sql`
- [ ] 执行 `fix_enum.sql`
- [ ] 执行 `create_views.sql`
- [ ] 验证外键约束
- [ ] 验证视图创建

#### Day 5-7：基础模块开发
- [ ] 用户认证模块（auth）
  - POST /auth/sms/send
  - POST /auth/login
  - POST /auth/register
  - GET /user/me
- [ ] JWT Token 生成与验证
- [ ] 密码加密（bcrypt）
- [ ] 短信验证码存储（redis）

---

### 📌 第二阶段：核心业务（第2周）

#### Day 8-10：房源模块
- [ ] 房源 CRUD
  - GET /house（列表，支持筛选分页）
  - GET /house/{id}（详情）
  - POST /house（房东发布）
  - PUT /house/{id}（编辑）
  - DELETE /house/{id}（删除）
- [ ] 房源图片管理
  - POST /house/{id}/images（上传）
  - DELETE /house/{id}/images/{imgId}
- [ ] 房源评价
  - GET /house/{houseId}/review（评价列表）
  - POST /house/{houseId}/review（提交评价）
- [ ] 房源收藏
  - GET /user/collect（收藏列表）
  - POST /user/collect（添加）
  - DELETE /user/collect/{houseId}（取消）

#### Day 11-12：订单模块
- [ ] 订单 CRUD
  - GET /order/my（我的订单）
  - POST /order（创建订单）
  - GET /order/{id}（详情）
- [ ] 订单支付
  - POST /order/{orderId}/pay
  - 支付回调处理
  - 支付状态更新
- [ ] 订单操作
  - POST /order/{id}/cancel（取消）
  - POST /order/{id}/checkin（入住）

#### Day 13-14：合同模块
- [ ] 合同 CRUD
  - GET /contract/my（我的合同）
  - GET /contract/{id}（详情）
- [ ] 电子签约
  - POST /contract/sign
  - CA 证书生成
  - 签约日志记录
- [ ] 合同操作
  - POST /contract/{id}/renew（续租）
  - POST /contract/{id}/terminate（终止）

---

### 📌 第三阶段：扩展业务（第3周）

#### Day 15-17：房东中心
- [ ] 房东资料
  - GET /landlord/profile
  - PUT /landlord/profile
- [ ] 账单管理
  - GET /landlord/bills（账单列表）
  - POST /landlord/bills/generate（生成账单）
  - GET /landlord/bills/{id}（详情）
- [ ] 合同管理
  - GET /landlord/contracts（合同列表）
  - GET /landlord/contracts/{id}（详情）
- [ ] 工单管理
  - GET /landlord/workorders（工单列表）
- [ ] 提现管理
  - GET /landlord/withdraws（提现记录）
  - POST /landlord/withdraw（申请提现）
- [ ] 数据统计
  - GET /landlord/stats（统计信息）

#### Day 18-19：预约模块
- [ ] 预约 CRUD
  - GET /booking/my（我的预约）
  - POST /booking（创建预约）
  - GET /booking/{id}（详情）
- [ ] 房东操作
  - POST /landlord/booking/{id}/confirm（确认）
  - POST /landlord/booking/{id}/reject（拒绝）

#### Day 20-21：消息模块
- [ ] 消息管理
  - GET /message/my（消息列表）
  - POST /message/{id}/read（标记已读）
  - POST /message/read-all（全部已读）

---

### 📌 第四阶段：管理后台（第4周）

#### Day 22-24：用户与权限
- [ ] 用户管理
  - GET /admin/users（用户列表）
  - PUT /admin/users/{id}/toggle-status（状态切换）
- [ ] 角色权限
  - GET /admin/system/roles（角色列表）
  - POST /admin/system/roles（创建）
  - PUT /admin/system/roles/{id}（更新）
  - DELETE /admin/system/roles/{id}（删除）
- [ ] 管理员管理
  - GET /admin/system/admins（管理员列表）
  - POST /admin/system/admins（创建）
  - PUT /admin/system/admins/{id}（更新）

#### Day 25-26：经纪人管理
- [ ] 经纪人 CRUD
  - GET /admin/agents（列表）
  - POST /admin/agents（创建）
  - PUT /admin/agents/{id}（更新）
  - DELETE /admin/agents/{id}（删除）
- [ ] 门店管理
  - GET /admin/agent-stores（门店列表）
  - POST /admin/agent-stores（创建）
  - PUT /admin/agent-stores/{id}（更新）

#### Day 27-28：房源管理
- [ ] 房源审核
  - GET /admin/houses（列表）
  - POST /admin/houses/{id}/audit（审核）
  - POST /admin/houses/{id}/reject（拒绝）
- [ ] 楼栋管理
  - CRUD /admin/buildings
- [ ] 区域管理
  - CRUD /admin/regions
- [ ] 地铁站点
  - CRUD /admin/metros
- [ ] 兴趣点
  - CRUD /admin/pois
- [ ] 设施管理
  - CRUD /admin/facilities
- [ ] 标签管理
  - CRUD /admin/tags

---

### 📌 第五阶段：财务与风控（第5周）

#### Day 29-31：财务管理
- [ ] 订单管理
  - GET /admin/orders（订单列表）
  - POST /admin/orders/{id}/confirm（确认）
  - POST /admin/orders/{id}/refund（退款）
- [ ] 财务结算
  - GET /admin/finances（结算列表）
  - POST /admin/finances/{id}/withdraw（提现）
  - POST /admin/finances/{id}/dispute（争议）
- [ ] 退款管理
  - GET /admin/refunds（退款列表）
  - POST /admin/refunds/{id}/approve（批准）
  - POST /admin/refunds/{id}/reject（拒绝）
- [ ] 提现审核
  - GET /admin/withdraws（提现列表）
  - POST /admin/withdraws/{id}/approve（批准）
  - POST /admin/withdraws/{id}/reject（拒绝）

#### Day 32-33：风控管理
- [ ] 黑名单管理
  - GET /risk/blacklist（黑名单列表）
  - POST /risk/blacklist（添加）
  - DELETE /risk/blacklist/{id}（删除）
- [ ] 风控规则
  - GET /risk/rules（规则列表）
  - POST /risk/rules（创建）
  - PUT /risk/rules/{id}（更新）
  - DELETE /risk/rules/{id}（删除）
- [ ] 风险判定
  - POST /risk/decide（风险判定）

#### Day 34-35：统计报表
- [ ] 今日统计
  - GET /admin/statistics/today
- [ ] GMV统计
  - GET /admin/statistics/gmv?dim=month
- [ ] 房源分布
  - GET /admin/statistics/stock
- [ ] 数据导出
  - POST /admin/statistics/export

---

### 📌 第六阶段：辅助功能（第6周）

#### Day 36-37：内容管理
- [ ] 公告管理
  - CRUD /admin/contents
- [ ] Banner 管理
  - CRUD /admin/banners
- [ ] 活动管理
  - CRUD /admin/activities

#### Day 38-39：搜索功能
- [ ] 搜索接口
  - POST /search/house
  - GET /search/house
- [ ] 热搜词
  - GET /search/hot
- [ ] 搜索建议
  - GET /search/suggest
- [ ] 搜索日志
  - GET /admin/search/logs
- [ ] 重建索引
  - POST /search/index/rebuild

#### Day 40-41：用户扩展功能
- [ ] 地址管理
  - CRUD /user/address
- [ ] 邀请记录
  - GET /user/invites
- [ ] 入住记录
  - GET /user/checkins
- [ ] 押金记录
  - GET /user/deposits
- [ ] 账单列表
  - GET /user/bills
- [ ] 支付记录
  - GET /user/payments
- [ ] 退款记录
  - GET /user/refunds
- [ ] 信用分
  - GET /user/credit
- [ ] 发票管理
  - POST /user/invoice
  - GET /user/invoices

#### Day 42-43：工单系统
- [ ] 工单管理
  - GET /workorder/my
  - POST /workorder/repair
  - GET /workorder/{id}
  - PUT /workorder/{id}
  - POST /workorder/{id}/cancel
- [ ] 工单分配
  - POST /admin/tickets/{id}/assign
- [ ] 工单转派
  - POST /admin/tickets/{id}/transfer
- [ ] 工单回访
  - POST /admin/tickets/{id}/visit
- [ ] 工单关闭
  - POST /admin/tickets/{id}/close

#### Day 44-45：存储与上传
- [ ] 文件上传
  - GET /storage/presign（获取签名）
- [ ] 图片处理
  - 图片压缩
  - 图片水印
  - 图片裁剪

---

### 📌 第七阶段：测试与部署（第6周末）

#### Day 46-47：接口测试
- [ ] Postman 接口测试
- [ ] 边界条件测试
- [ ] 异常场景测试
- [ ] 性能测试

#### Day 48-49：代码审查
- [ ] 代码规范检查
- [ ] 安全漏洞扫描
- [ ] 代码重构优化

#### Day 50-51：部署准备
- [ ] Docker 配置
- [ ] 生产环境配置
- [ ] 日志收集配置
- [ ] 监控告警配置

#### Day 52-53：联调测试
- [ ] 前端联调
- [ ] 数据库联调
- [ ] 第三方接口联调（支付、短信）

#### Day 54-55：文档完善
- [ ] API 文档更新
- [ ] 部署文档编写
- [ ] 运维手册编写

---

## 三、技术选型建议

### 3.1 后端框架
```
推荐：NestJS
- 开箱即用，结构清晰
- TypeScript 原生支持
- 模块化设计
- 依赖注入
- 易于测试
```

### 3.2 ORM 选择
```
推荐：Prisma
- 类型安全
- 迁移管理方便
- 自动生成类型
- 支持关联查询
```

### 3.3 缓存
```
推荐：Redis
- 短信验证码缓存
- Token 黑名单
- 热点数据缓存
- 会话存储
```

### 3.4 文件存储
```
推荐：MinIO / 阿里云 OSS
- 图片存储
- 合同 PDF
- 实名认证照片
```

### 3.5 消息队列
```
推荐：RabbitMQ / Redis Stream
- 订单状态变更通知
- 合同到期提醒
- 账单生成任务
```

---

## 四、关键接口实现要点

### 4.1 字段命名转换
```typescript
// 后端返回 snake_case，前端自动转换
// 或使用 class-transformer 自动转换
import { Transform } from 'class-transformer';

export class House {
  @Transform(({ value }) => value)
  house_id: number;
  
  @Transform(({ value }) => value)
  created_at: Date;
}
```

### 4.2 统一响应格式
```typescript
export class ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 统一响应拦截器
.pipe(map(res => ({
  code: 0,
  message: 'success',
  data: res
})))
```

### 4.3 分页查询
```typescript
export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}
```

### 4.4 状态枚举映射
```typescript
// 使用 enum 统一管理
export enum ContractStatus {
  DRAFT = '草稿',
  PENDING_SIGN = '待签订',
  ACTIVE = '生效中',
  EXPIRED = '已到期',
  TERMINATED = '已终止'
}
```

---

## 五、数据库索引优化

### 5.1 必建索引
```sql
-- 房源表
CREATE INDEX idx_house_status_price ON house(status, price);
CREATE INDEX idx_house_district_type ON house(district, rent_type);
CREATE INDEX idx_house_landlord ON house(landlord_id);

-- 订单表
CREATE INDEX idx_order_tenant_status ON lease_order(tenant_id, status);
CREATE INDEX idx_order_landlord_status ON lease_order(landlord_id, status);

-- 合同表
CREATE INDEX idx_contract_tenant_status ON contract(tenant_id, status);
CREATE INDEX idx_contract_end_date ON contract(end_date);

-- 支付表
CREATE INDEX idx_payment_order_status ON payment(order_id, status);
CREATE INDEX idx_payment_user ON payment(user_id);
```

---

## 六、安全建议

### 6.1 认证授权
- JWT Token 有效期：2小时
- Refresh Token 有效期：7天
- 密码加密：bcrypt（salt rounds = 10）
- 敏感信息脱敏：身份证、手机号

### 6.2 权限控制
- 角色权限：RBAC
- 数据权限：行级权限（房东只能看自己的数据）
- 接口权限：注解式权限控制

### 6.3 安全防护
- SQL 注入：参数化查询
- XSS 攻击：输入过滤
- CSRF：Token 验证
- 限流：接口频率限制

---

## 七、开发优先级矩阵

| 优先级 | 模块 | 接口数 | 工期 | 依赖 |
|--------|------|--------|------|------|
| P0 | 认证模块 | 4 | 2天 | 无 |
| P0 | 用户模块 | 10 | 3天 | 认证 |
| P0 | 房源模块 | 15 | 4天 | 用户 |
| P1 | 订单模块 | 8 | 3天 | 房源 |
| P1 | 合同模块 | 8 | 3天 | 订单 |
| P1 | 支付模块 | 8 | 3天 | 订单 |
| P2 | 房东中心 | 12 | 4天 | 合同、订单 |
| P2 | 管理后台 | 25 | 6天 | 用户、房源 |
| P2 | 财务模块 | 15 | 4天 | 订单、合同 |
| P3 | 扩展功能 | 20 | 5天 | 核心模块 |

---

## 八、交付物清单

### 8.1 代码交付
- [ ] 后端源代码（TypeScript）
- [ ] 数据库迁移脚本
- [ ] Docker 配置
- [ ] 环境变量模板

### 8.2 文档交付
- [ ] API 接口文档（OpenAPI）
- [ ] 数据库设计文档
- [ ] 部署文档
- [ ] 运维手册

### 8.3 测试交付
- [ ] 单元测试
- [ ] 接口测试用例
- [ ] 性能测试报告

---

## 九、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 接口变更 | 前后端联调困难 | 先定接口规范，再开发 |
| 数据库性能 | 查询慢 | 提前建索引，使用缓存 |
| 第三方依赖 | 支付/短信不稳定 | 准备 Mock 方案 |
| 安全漏洞 | 数据泄露 | 代码审查 + 安全扫描 |

---

**计划制定时间**: 2026-08-19
**预计总工期**: 7-8 周
**建议团队规模**: 2-3 人
