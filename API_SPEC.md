# 安居易租 API 接口规范

## 一、通用规范

### 1.1 基础信息
- **Base URL**: `https://api.rent.com/v1`
- **认证方式**: Bearer Token (JWT)
- **字符编码**: UTF-8
- **数据格式**: JSON

### 1.2 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0=成功, 其他=错误码 |
| message | string | 提示信息 |
| data | any | 业务数据 |

### 1.3 错误码
| code | 说明 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 二、认证模块 `/auth`

### 2.1 发送短信验证码
```
POST /auth/sms/send
```

**请求体:**
```json
{
  "phone": "13800138000",
  "biz": "register"
}
```

**响应:**
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 2.2 用户登录
```
POST /auth/login
```

**请求体:**
```json
{
  "phone": "13800138000",
  "pwd": "password123",
  "code": "123456"
}
```

**响应:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "dG9rZW4...",
    "user": {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "role": "tenant",
      "avatar": "https://cdn.example.com/avatar.jpg"
    }
  }
}
```

### 2.3 用户注册
```
POST /auth/register
```

**请求体:**
```json
{
  "phone": "13800138000",
  "pwd": "password123",
  "code": "123456",
  "name": "张三"
}
```

### 2.4 获取当前用户信息
```
GET /user/me
Authorization: Bearer {token}
```

---

## 三、房源模块 `/house`

### 3.1 房源列表
```
GET /house
```

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页条数，默认20 |
| district | string | 否 | 区域 |
| rentType | string | 否 | 出租方式：整租/合租/公寓 |
| layout | string | 否 | 户型 |
| minPrice | number | 否 | 最低租金 |
| maxPrice | number | 否 | 最高租金 |
| keyword | string | 否 | 搜索关键词 |

**响应:**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "望京西园精装两居",
        "district": "朝阳区",
        "layout": "2室1厅",
        "area": 85,
        "price": 6500,
        "rentType": "整租",
        "orientation": "南向",
        "floor": "中楼层/18层",
        "status": "可租",
        "views": 1234,
        "collectCount": 56,
        "images": ["https://cdn.example.com/1.jpg"],
        "landlordName": "李四"
      }
    ],
    "total": 100
  }
}
```

### 3.2 房源详情
```
GET /house/{id}
```

### 3.3 房源评价列表
```
GET /house/{houseId}/review
```

### 3.4 提交评价
```
POST /house/{houseId}/review
```

**请求体:**
```json
{
  "score": 5,
  "content": "非常好的房源"
}
```

---

## 四、订单模块 `/order`

### 4.1 我的订单
```
GET /order/my
```

### 4.2 创建订单
```
POST /order
```

**请求体:**
```json
{
  "houseId": 1,
  "rentType": "整租",
  "amount": 13000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### 4.3 订单支付
```
POST /order/{orderId}/pay
```

**响应:**
```json
{
  "code": 0,
  "data": {
    "payUrl": "https://pay.example.com/xxx",
    "orderId": "ORD20240101001"
  }
}
```

### 4.4 取消订单
```
POST /order/{id}/cancel
```

### 4.5 确认入住
```
POST /order/{id}/checkin
```

---

## 五、合同模块 `/contract`

### 5.1 我的合同
```
GET /contract/my
```

### 5.2 合同详情
```
GET /contract/{id}
```

### 5.3 电子签约
```
POST /contract/sign
```

**请求体:**
```json
{
  "orderId": 1,
  "templateId": 1,
  "signType": "face",
  "tenantInfo": {
    "name": "张三",
    "phone": "13800138000",
    "idcard": "110101199001011234"
  }
}
```

**响应:**
```json
{
  "code": 0,
  "data": {
    "contractId": 1,
    "contractNo": "HT20240101001",
    "signUrl": "https://cdn.example.com/contract.pdf",
    "certInfo": {
      "certNo": "CA-20240101001",
      "issuer": "北京数字认证股份有限公司",
      "validFrom": "2024-01-01",
      "validTo": "2025-01-01",
      "hash": "0x1234567890abcdef"
    }
  }
}
```

---

## 六、财务模块 `/pay`

### 6.1 支付记录
```
GET /pay/records
```

### 6.2 退款列表
```
GET /pay/refund
```

### 6.3 申请退款
```
POST /pay/refund
```

**请求体:**
```json
{
  "orderId": 1,
  "amount": 6500,
  "reason": "个人原因退租"
}
```

### 6.4 提现申请
```
POST /pay/withdraw
```

**请求体:**
```json
{
  "amount": 5000,
  "bankCard": "6222021234567890",
  "bankName": "工商银行"
}
```

---

## 七、预约模块 `/booking`

### 7.1 我的预约
```
GET /booking/my
```

### 7.2 创建预约
```
POST /booking
```

**请求体:**
```json
{
  "houseId": 1,
  "time": "2024-01-15 14:00",
  "remark": "下午看房"
}
```

### 7.3 房东确认预约
```
POST /landlord/booking/{id}/confirm
```

### 7.4 房东拒绝预约
```
POST /landlord/booking/{id}/reject
```

**请求体:**
```json
{
  "reason": "时间冲突"
}
```

---

## 八、管理后台 `/admin`

### 8.1 房源管理
```
GET /admin/houses
POST /admin/houses
PUT /admin/houses/{id}
DELETE /admin/houses/{id}
POST /admin/houses/{id}/audit
```

### 8.2 用户管理
```
GET /admin/users
PUT /admin/users/{id}/toggle-status
```

### 8.3 经纪人管理
```
GET /admin/agents
POST /admin/agents
PUT /admin/agents/{id}
DELETE /admin/agents/{id}
```

### 8.4 合同管理
```
GET /admin/contracts
POST /admin/contracts/{id}/remind
POST /admin/contracts/{id}/cancel
```

### 8.5 财务管理
```
GET /admin/finances
POST /admin/finances/{id}/withdraw
POST /admin/finances/{id}/dispute
```

### 8.6 工单管理
```
GET /admin/tickets
POST /admin/tickets/{id}/assign
POST /admin/tickets/{id}/transfer
POST /admin/tickets/{id}/visit
POST /admin/tickets/{id}/close
```

### 8.7 风控管理
```
GET /admin/risk/blacklist
POST /admin/risk/blacklist
GET /admin/risk/rules
POST /admin/risk/rules
PUT /admin/risk/rules/{id}
DELETE /admin/risk/rules/{id}
POST /admin/risk/decide
```

### 8.8 统计数据
```
GET /admin/statistics/today
GET /admin/statistics/gmv?dim=month
GET /admin/statistics/stock
POST /admin/statistics/export
```

### 8.9 系统设置
```
GET /admin/system/roles
POST /admin/system/roles
PUT /admin/system/roles/{id}
DELETE /admin/system/roles/{id}

GET /admin/system/admins
POST /admin/system/admins
PUT /admin/system/admins/{id}
POST /admin/system/admins/{id}/toggle-status

GET /admin/system/menus
GET /admin/system/dicts
GET /admin/system/logs
GET /admin/system/params
PUT /admin/system/params
```

---

## 九、消息模块 `/message`

### 9.1 我的消息
```
GET /message/my
```

### 9.2 标记已读
```
POST /message/{id}/read
POST /message/read-all
```

---

## 十、个人中心 `/user`

### 10.1 个人资料
```
GET /user/me
PUT /user/me
```

### 10.2 修改密码
```
POST /user/password/change
```

### 10.3 实名认证
```
GET /user/realname
POST /user/realname
```

### 10.4 地址管理
```
GET /user/address
POST /user/address
PUT /user/address/{id}
POST /user/address/{id}/default
DELETE /user/address/{id}
```

### 10.5 登录会话
```
GET /user/session
DELETE /user/session/{id}
```

### 10.6 积分优惠券
```
GET /user/points
GET /user/coupon
```

### 10.7 通知设置
```
GET /user/notify-setting
PUT /user/notify-setting
```

### 10.8 账号注销
```
GET /user/account-cancel
POST /user/account-cancel
```

---

## 十一、收藏模块 `/collect`

### 11.1 我的收藏
```
GET /user/collect
```

### 11.2 添加收藏
```
POST /user/collect
```

**请求体:**
```json
{
  "houseId": 1
}
```

### 11.3 取消收藏
```
DELETE /user/collect/{houseId}
```

---

## 十二、浏览历史 `/history`

### 12.1 浏览历史
```
GET /user/history
```

---

## 十三、报修投诉 `/workorder`

### 13.1 我的工单
```
GET /workorder/my
```

### 13.2 提交报修
```
POST /workorder/repair
```

**请求体:**
```json
{
  "houseId": 1,
  "type": "报修",
  "title": "漏水问题",
  "description": "卫生间漏水",
  "images": ["https://cdn.example.com/1.jpg"]
}
```

---

## 十四、搜索模块 `/search`

### 14.1 搜索房源
```
POST /search/house
GET /search/house
```

### 14.2 热搜词
```
GET /search/hot
```

### 14.3 搜索建议
```
GET /search/suggest?keyword=望京
```

### 14.4 重建索引
```
POST /search/index/rebuild
```

---

## 十五、存储模块 `/storage`

### 15.1 获取签名URL
```
GET /storage/presign
```

**查询参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filename | string | 是 | 文件名 |
| contentType | string | 是 | MIME类型 |
| dir | string | 否 | 目录 |

---

## 十六、数据字典

### 16.1 出租方式
- `整租` - 整套出租
- `合租` - 合租房间
- `公寓` - 公寓

### 16.2 房源状态
- `可租` - 可出租
- `已租` - 已出租
- `待审核` - 待审核
- `已下架` - 已下架
- `违规` - 违规

### 16.3 订单状态
- `待支付` - 待支付
- `已支付` - 已支付
- `已取消` - 已取消
- `已完成` - 已完成

### 16.4 合同状态
- `草稿` - 草稿
- `生效中` - 生效中
- `已到期` - 已到期
- `已终止` - 已终止
- `已取消` - 已取消

### 16.5 用户角色
- `tenant` - 租客
- `landlord` - 房东
- `agent` - 经纪人
- `admin` - 管理员

---

## 十七、分页参数

所有列表接口支持分页：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| size | number | 20 | 每页条数 |

**响应格式:**
```json
{
  "code": 0,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

**文档版本**: v1.0.0
**更新时间**: 2026-08-19
**维护者**: AgnesCode AI Assistant
