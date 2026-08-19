# 数据库与前端对接修复报告

## 一、已完成修复

### 1. 统一数据库枚举值编码 ✅
- **文件**: `fix_enum.sql`
- **说明**: 修复了 25 张表的枚举值编码问题
- **执行方式**: 
  ```bash
  mysql -u root -p anju_rent < fix_enum.sql
  ```

### 2. 确认经纪人表字段映射 ✅
- **数据库表**: `agent_broker` + `agent_store`
- **前端文件**: `AgentManage.vue`
- **API 文件**: `src/api/agents.ts`
- **字段映射**:
  | 数据库 | 前端 | 说明 |
  |--------|------|------|
  | id | id | 主键 |
  | name | name | 姓名 |
  | phone | phone | 手机 |
  | store_id | storeId | 门店ID |
  | level | level | 等级 |
  | cert_no | certNo | 执业证书号 |
  | status | status | 状态 (1=正常, 0=冻结) |
  | created_at | createdAt | 创建时间 |

### 3. 统一合同状态枚举 ✅
- **文件**: `src/utils/contract-status.ts`
- **数据库枚举**: `草稿,待签订,生效中,已到期,续租中,退租中,已解除`
- **前端统一**: 映射为 `draft, pending_sign, active, expired, renewing, terminating, terminated`
- **工具函数**:
  - `mapContractStatus()` - 状态映射
  - `getContractStatusConfig()` - 获取配置
  - `getContractStatusLabel()` - 获取标签
  - `getContractStatusType()` - 获取类型

---

## 二、新增文件

```
src/
├── api/
│   └── agents.ts          ← 经纪人 API 接口
├── utils/
│   ├── status-mapping.ts  ← 统一状态映射配置
│   └── contract-status.ts ← 合同状态映射
└── fix_enum.sql           ← 枚举值修复 SQL
```

---

## 三、状态映射对照表

### 3.1 合同状态
| 数据库 | 前端 | Tag 类型 |
|--------|------|----------|
| 草稿 | draft | info |
| 待签订 | pending_sign | warning |
| 生效中 | active | success |
| 已到期 | expired | info |
| 续租中 | renewing | primary |
| 退租中 | terminating | warning |
| 已解除 | terminated | danger |

### 3.2 订单状态
| 数据库 | 前端 | Tag 类型 |
|--------|------|----------|
| 待支付 | pending_pay | warning |
| 已支付 | paid | success |
| 已取消 | cancelled | info |
| 已完成 | completed | success |

### 3.3 经纪人等级
| 等级 | Tag 类型 |
|------|----------|
| 见习 | info |
| 初级 | - |
| 中级 | warning |
| 高级 | success |
| 金牌 | danger |

---

## 四、后续行动

### 短期优化（1周内）
- [ ] 在所有使用状态的页面引入 `status-mapping.ts`
- [ ] 统一错误提示文案
- [ ] 添加单元测试

### 长期规划（1月内）
- [ ] 建立数据字典文档
- [ ] 优化表结构索引
- [ ] 评估未使用表的必要性

---

**修复时间**: 2026-08-19 07:15
**修复人员**: AgnesCode AI Assistant
