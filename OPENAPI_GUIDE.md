# OpenAPI 3.0 接口规范

## 一、文件说明

- **文件名**: `openapi.json`
- **格式**: OpenAPI 3.0.3
- **接口数量**: 50+ 个
- **模型数量**: 30+ 个

---

## 二、导入 ApiFox

### 方法1：直接导入（推荐）
1. 打开 ApiFox
2. 点击右上角「+」新建项目
3. 选择「导入」→「从文件导入」
4. 选择 `openapi.json` 文件
5. 确认导入

### 方法2：复制粘贴
1. 打开 ApiFox
2. 点击「导入」→「从 OpenAPI 导入」
3. 复制 `openapi.json` 内容粘贴
4. 点击「导入」

### 方法3：在线导入
```bash
# 使用 curl 导入（如果有 ApiFox CLI）
apes import openapi.json
```

---

## 三、项目配置

### 基础信息
- **项目名称**: 安居易租 API
- **基础 URL**: `https://api.rent.com/v1`
- **API 版本**: v1
- **认证方式**: Bearer Token (JWT)

### 环境变量
```json
{
  "base_url": "https://api.rent.com/v1",
  "token": "your_jwt_token_here"
}
```

---

## 四、接口模块

### 4.1 认证模块 `/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/sms/send | 发送短信验证码 |
| POST | /auth/login | 用户登录 |
| POST | /auth/register | 用户注册 |
| GET | /user/me | 获取当前用户信息 |

### 4.2 房源模块 `/house`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /house | 房源列表（支持筛选） |
| GET | /house/{id} | 房源详情 |
| GET | /house/{houseId}/review | 评价列表 |
| POST | /house/{houseId}/review | 提交评价 |

### 4.3 订单模块 `/order`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /order/my | 我的订单列表 |
| POST | /order | 创建订单 |
| POST | /order/{orderId}/pay | 订单支付 |
| POST | /order/{id}/cancel | 取消订单 |
| POST | /order/{id}/checkin | 确认入住 |

### 4.4 合同模块 `/contract`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /contract/my | 我的合同列表 |
| GET | /contract/{id} | 合同详情 |
| POST | /contract/sign | 电子签约 |
| POST | /contract/{id}/renew | 续租 |
| POST | /contract/{id}/terminate | 终止合同 |

### 4.5 预约模块 `/booking`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /booking/my | 我的预约列表 |
| POST | /booking | 创建预约 |
| POST | /landlord/booking/{id}/confirm | 确认预约 |
| POST | /landlord/booking/{id}/reject | 拒绝预约 |

### 4.6 房东中心 `/landlord`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /landlord/profile | 房东资料 |
| PUT | /landlord/profile | 更新资料 |
| GET | /landlord/bills | 账单列表 |
| POST | /landlord/bills/generate | 生成账单 |
| GET | /landlord/contracts | 合同列表 |
| GET | /landlord/workorders | 工单列表 |
| GET | /landlord/withdraws | 提现记录 |
| POST | /landlord/withdraw | 提现申请 |
| GET | /landlord/stats | 统计信息 |

### 4.7 管理后台 `/admin`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/houses | 房源列表 |
| GET | /admin/users | 用户列表 |
| GET | /admin/agents | 经纪人列表 |
| POST | /admin/agents | 创建经纪人 |
| GET | /admin/buildings | 楼栋列表 |
| POST | /admin/buildings | 创建楼栋 |
| GET | /admin/regions | 区域列表 |
| GET | /admin/metros | 地铁站点列表 |
| GET | /admin/pois | 兴趣点列表 |
| GET | /admin/facilities | 设施列表 |
| GET | /admin/tags | 标签列表 |
| GET | /admin/activities | 活动列表 |
| GET | /admin/invoices | 发票列表 |
| GET | /admin/reconciliations | 对账列表 |
| GET | /admin/taxes | 税务列表 |
| GET | /admin/statistics/today | 今日统计 |
| GET | /admin/statistics/gmv | GMV统计 |
| GET | /admin/statistics/stock | 房源分布 |

### 4.8 用户中心 `/user`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /user/address | 地址列表 |
| POST | /user/address | 新增地址 |
| PUT | /user/address/{id} | 更新地址 |
| POST | /user/address/{id}/default | 设为默认 |
| DELETE | /user/address/{id} | 删除地址 |
| GET | /user/collect | 收藏列表 |
| POST | /user/collect | 添加收藏 |
| DELETE | /user/collect/{houseId} | 取消收藏 |
| GET | /user/points | 积分信息 |
| GET | /user/coupon | 优惠券列表 |
| GET | /user/credit | 信用分 |
| GET | /user/invites | 邀请记录 |
| GET | /user/checkins | 入住记录 |
| GET | /user/deposits | 押金记录 |
| GET | /user/bills | 账单列表 |
| GET | /user/payments | 支付记录 |
| GET | /user/refunds | 退款记录 |
| POST | /user/invoice | 发票申请 |
| GET | /user/invoices | 发票列表 |

### 4.9 工单模块 `/workorder`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /workorder/my | 我的工单 |
| POST | /workorder/repair | 提交报修 |
| GET | /workorder/{id} | 工单详情 |
| PUT | /workorder/{id} | 更新工单 |
| POST | /workorder/{id}/cancel | 取消工单 |

### 4.10 消息模块 `/message`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /message/my | 我的消息 |
| POST | /message/{id}/read | 标记已读 |
| POST | /message/read-all | 全部已读 |

### 4.11 支付模块 `/pay`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /pay | 创建支付 |
| GET | /pay/methods | 支付方式列表 |
| POST | /pay/methods | 添加支付方式 |
| GET | /pay/records | 支付记录 |
| GET | /pay/order/{id} | 支付详情 |

### 4.12 风控模块 `/risk`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /risk/blacklist | 黑名单列表 |
| GET | /risk/rules | 风控规则 |
| POST | /risk/rules | 创建规则 |
| PUT | /risk/rules/{id} | 更新规则 |
| DELETE | /risk/rules/{id} | 删除规则 |
| POST | /risk/decide | 风险判定 |

### 4.13 搜索模块 `/search`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /search/house | 搜索房源 |
| GET | /search/house | 搜索房源（GET） |
| GET | /search/hot | 热搜词 |
| GET | /search/suggest | 搜索建议 |
| GET | /search/logs | 搜索日志 |
| POST | /search/index/rebuild | 重建索引 |

### 4.14 存储模块 `/storage`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /storage/presign | 获取上传签名 |

---

## 五、数据模型

### 5.1 通用模型
- `ApiResponse` - 通用响应格式
- `PaginatedResponse` - 分页响应

### 5.2 用户相关
- `User` - 用户信息
- `LoginData` - 登录数据
- `RegisterData` - 注册数据
- `LoginResult` - 登录结果
- `SmsSendData` - 短信发送数据

### 5.3 房源相关
- `HouseItem` - 房源信息
- `HouseList` - 房源列表
- `HouseImage` - 房源图片
- `HouseRoom` - 房源房间
- `ReviewItem` - 评价信息
- `ReviewSubmit` - 提交评价

### 5.4 订单相关
- `OrderItem` - 订单信息
- `OrderDetail` - 订单详情
- `CreateOrderData` - 创建订单数据
- `PayResult` - 支付结果
- `StatusLog` - 状态日志

### 5.5 合同相关
- `ContractItem` - 合同信息
- `ContractDetail` - 合同详情
- `SignContractData` - 签约数据
- `SignResult` - 签约结果
- `ContractTemplate` - 合同模板

### 5.6 房东相关
- `LandlordProfile` - 房东资料
- `LandlordStats` - 房东统计
- `LandlordBill` - 房东账单
- `GenerateBillData` - 生成账单数据

### 5.7 管理后台相关
- `AgentItem` - 经纪人信息
- `Building` - 楼栋信息
- `DashboardToday` - 今日统计
- `GmvData` - GMV数据
- `StockData` - 房源分布

### 5.8 用户中心相关
- `AddressItem` - 地址信息
- `PointsInfo` - 积分信息
- `CreditInfo` - 信用分信息
- `CouponItem` - 优惠券信息

### 5.9 工单相关
- `WorkOrderItem` - 工单信息
- `RepairSubmit` - 报修提交

---

## 六、状态码说明

### 6.1 业务状态码
| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 6.2 HTTP 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 七、认证方式

### 7.1 JWT Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7.2 Token 获取
```bash
# 登录获取 Token
curl -X POST https://api.rent.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "pwd": "password123"
  }'
```

---

## 八、使用示例

### 8.1 房源列表
```bash
curl -X GET "https://api.rent.com/v1/house?page=1&size=20&district=朝阳区" \
  -H "Authorization: Bearer {token}"
```

### 8.2 创建订单
```bash
curl -X POST "https://api.rent.com/v1/order" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "houseId": 1,
    "amount": 13000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### 8.3 电子签约
```bash
curl -X POST "https://api.rent.com/v1/contract/sign" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "templateId": 1,
    "signType": "face",
    "tenantInfo": {
      "name": "张三",
      "phone": "13800138000",
      "idcard": "110101199001011234"
    }
  }'
```

---

## 九、字段命名规范

### 9.1 后端返回格式
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 1,
    "house_id": 2,
    "created_at": "2024-01-01"
  }
}
```

### 9.2 前端使用格式（自动转换）
```typescript
{
  userId: 1,
  houseId: 2,
  createdAt: "2024-01-01"
}
```

---

## 十、导入后的操作

### 10.1 设置环境变量
1. 打开 ApiFox
2. 点击「环境」→「新建环境」
3. 添加变量：
   - `base_url`: `https://api.rent.com/v1`
   - `token`: 登录后的 JWT Token

### 10.2 测试接口
1. 选择接口
2. 填写请求参数
3. 点击「发送」
4. 查看响应结果

### 10.3 生成代码
1. 选择接口
2. 点击「生成代码」
3. 选择语言（JavaScript/Python/Go等）
4. 复制代码

---

**文档版本**: OpenAPI 3.0.3
**生成时间**: 2026-08-19 07:25
**生成工具**: AgnesCode AI Assistant
