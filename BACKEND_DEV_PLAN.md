# 安居易租 - 后端开发计划

## 📋 项目概览

| 项目 | 值 |
|------|-----|
| 项目名称 | 安居易租 (Anju Rent) |
| 技术栈 | Spring Boot 3 + Spring Cloud + MySQL |
| 数据库 | MySQL 8.0 (单库 anju_rent) |
| 接口数量 | 93 个 |
| 数据模型 | 30+ 个 |
| 预估工期 | 6-8 周 |
| 团队规模 | 2-3 人 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (前端)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Gateway (网关层)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  JWT 鉴权   │  │  限流熔断   │  │  路由转发   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer (服务层)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Auth     │ │ House    │ │ Order    │ │ Contract │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ User     │ │ Finance  │ │ Admin    │ │ Work     │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Order    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MySQL (anju_rent)                       │  │
│  │  user | house | order | contract | payment | ...    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 开发阶段规划

### 第一阶段：基础设施（第 1 周）

#### Day 1-2: 项目初始化
- [ ] 创建 Spring Boot 3 项目
- [ ] 配置 Maven/Gradle 依赖
- [ ] 配置 application.yml
- [ ] 配置数据库连接
- [ ] 配置日志 (Logback)
- [ ] 配置全局异常处理

#### Day 3-4: 数据库配置
- [ ] 执行数据库迁移脚本
- [ ] 创建 MyBatis-Plus 实体类
- [ ] 创建 Mapper 接口
- [ ] 配置事务管理

#### Day 5-7: 通用组件
- [ ] 统一响应封装 (ApiResponse)
- [ ] 分页封装 (PageResult)
- [ ] JWT 工具类
- [ ] 日期工具类
- [ ] 加密工具类

---

### 第二阶段：认证模块（第 2 周）

#### 接口列表
| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 发送验证码 | POST | /auth/sms/send | 短信验证码 |
| 用户登录 | POST | /auth/login | 账号密码登录 |
| 用户注册 | POST | /auth/register | 新用户注册 |
| 获取用户信息 | GET | /user/me | 获取当前用户 |

#### 开发任务
- [ ] 创建 AuthController
- [ ] 创建 UserService
- [ ] 实现 JWT Token 生成/验证
- [ ] 实现短信验证码逻辑
- [ ] 实现登录/注册逻辑
- [ ] 单元测试

---

### 第三阶段：核心业务模块（第 3-4 周）

#### 3.1 房源模块 (House)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 房源列表 | GET | /house | 分页查询房源 |
| 房源详情 | GET | /house/{id} | 获取房源详情 |
| 评价列表 | GET | /house/{id}/review | 获取房源评价 |
| 提交评价 | POST | /house/{id}/review | 提交房源评价 |

#### 3.2 订单模块 (Order)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 我的订单 | GET | /order/my | 查询我的订单 |
| 创建订单 | POST | /order | 创建新订单 |
| 订单支付 | POST | /order/{orderId}/pay | 支付订单 |
| 取消订单 | POST | /order/{id}/cancel | 取消订单 |
| 确认入住 | POST | /order/{id}/checkin | 确认入住 |

#### 3.3 合同模块 (Contract)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 我的合同 | GET | /contract/my | 查询我的合同 |
| 合同详情 | GET | /contract/{id} | 获取合同详情 |
| 电子签约 | POST | /contract/sign | 在线签署合同 |

#### 3.4 预约模块 (Booking)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 我的预约 | GET | /booking/my | 查询预约列表 |
| 创建预约 | POST | /booking | 创建看房预约 |

#### 开发任务
- [ ] 创建各模块 Controller
- [ ] 实现 Service 层业务逻辑
- [ ] 实现 Mapper 层数据访问
- [ ] 添加接口权限控制
- [ ] 编写单元测试

---

### 第四阶段：房东中心（第 5 周）

#### 接口列表
| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取资料 | GET | /landlord/profile | 获取房东资料 |
| 更新资料 | PUT | /landlord/profile | 更新房东资料 |
| 账单列表 | GET | /landlord/bills | 查询账单列表 |
| 生成账单 | POST | /landlord/bills/generate | 生成月度账单 |
| 房东统计 | GET | /landlord/stats | 获取统计信息 |

#### 开发任务
- [ ] 创建 LandlordController
- [ ] 实现账单生成逻辑
- [ ] 实现统计计算逻辑
- [ ] 添加数据权限校验

---

### 第五阶段：管理后台（第 6 周）

#### 接口列表
| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 房源列表 | GET | /admin/houses | 管理端房源列表 |
| 用户列表 | GET | /admin/users | 管理端用户列表 |
| 经纪人列表 | GET | /admin/agents | 经纪人列表 |
| 创建经纪人 | POST | /admin/agents | 新增经纪人 |
| 楼栋列表 | GET | /admin/buildings | 楼栋列表 |
| 创建楼栋 | POST | /admin/buildings | 新增楼栋 |
| 区域列表 | GET | /admin/regions | 区域列表 |
| 地铁站点 | GET | /admin/metros | 地铁站点列表 |
| 今日统计 | GET | /admin/statistics/today | 今日数据 |
| GMV统计 | GET | /admin/statistics/gmv | 交易额统计 |

#### 开发任务
- [ ] 创建 AdminController
- [ ] 实现管理员权限校验
- [ ] 实现统计数据查询
- [ ] 添加操作日志记录

---

### 第六阶段：辅助功能（第 7 周）

#### 接口列表
| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 地址列表 | GET | /user/address | 我的地址 |
| 新增地址 | POST | /user/address | 添加地址 |
| 收藏列表 | GET | /user/collect | 我的收藏 |
| 添加收藏 | POST | /user/collect | 收藏房源 |
| 积分查询 | GET | /user/points | 我的积分 |
| 信用分 | GET | /user/credit | 我的信用 |
| 工单列表 | GET | /workorder/my | 我的工单 |
| 提交报修 | POST | /workorder/repair | 提交报修 |
| 消息列表 | GET | /message/my | 我的消息 |
| 上传签名 | GET | /storage/presign | 获取上传URL |

#### 开发任务
- [ ] 实现各模块业务逻辑
- [ ] 集成 OSS 存储
- [ ] 实现消息推送

---

### 第七阶段：测试与部署（第 8 周）

#### 测试任务
- [ ] 接口测试 (Postman)
- [ ] 单元测试 (JUnit 5)
- [ ] 集成测试
- [ ] 性能测试

#### 部署任务
- [ ] Docker 镜像构建
- [ ] 部署脚本编写
- [ ] 生产环境配置
- [ ] 监控配置

---

## 📁 项目结构

```
rent-backend/
├── src/main/java/com/anju/rent/
│   ├── RentApplication.java          # 启动类
│   ├── common/                        # 通用组件
│   │   ├── ApiResponse.java          # 统一响应
│   │   ├── PageResult.java           # 分页结果
│   │   ├── BusinessException.java   # 业务异常
│   │   └── GlobalExceptionHandler.java # 全局异常处理
│   ├── config/                        # 配置类
│   │   ├── MybatisPlusConfig.java    # MyBatis-Plus 配置
│   │   ├── JwtConfig.java            # JWT 配置
│   │   ├── RedisConfig.java          # Redis 配置
│   │   └── WebMvcConfig.java         # Web MVC 配置
│   ├── controller/                    # 控制器
│   │   ├── AuthController.java       # 认证接口
│   │   ├── HouseController.java      # 房源接口
│   │   ├── OrderController.java      # 订单接口
│   │   ├── ContractController.java   # 合同接口
│   │   ├── BookingController.java    # 预约接口
│   │   ├── LandlordController.java   # 房东接口
│   │   ├── AdminController.java      # 管理后台接口
│   │   └── UserController.java       # 用户中心接口
│   ├── service/                       # 服务层
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   ├── HouseService.java
│   │   ├── OrderService.java
│   │   ├── ContractService.java
│   │   ├── BookingService.java
│   │   ├── FinanceService.java
│   │   └── AdminService.java
│   ├── mapper/                        # 数据访问层
│   │   ├── UserMapper.java
│   │   ├── HouseMapper.java
│   │   ├── OrderMapper.java
│   │   └── ...
│   ├── entity/                        # 实体类
│   │   ├── User.java
│   │   ├── House.java
│   │   ├── Order.java
│   │   └── ...
│   ├── dto/                           # 数据传输对象
│   │   ├── login/
│   │   ├── house/
│   │   ├── order/
│   │   └── ...
│   ├── vo/                            # 视图对象
│   │   ├── LoginResult.java
│   │   ├── HouseVO.java
│   │   └── ...
│   ├── util/                          # 工具类
│   │   ├── JwtUtil.java
│   │   ├── SmsUtil.java
│   │   └── DateUtil.java
│   └── security/                      # 安全相关
│       ├── JwtFilter.java
│       └── SecurityConfig.java
├── src/main/resources/
│   ├── application.yml               # 主配置
│   ├── application-dev.yml           # 开发环境
│   ├── application-prod.yml          # 生产环境
│   └── mapper/                       # MyBatis XML
│       ├── UserMapper.xml
│       ├── HouseMapper.xml
│       └── ...
├── pom.xml                            # Maven 配置
└── Dockerfile                         # Docker 配置
```

---

## 🔧 技术选型

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Spring Boot | 3.x | 主框架 |
| ORM | MyBatis-Plus | 3.5.x | 数据访问 |
| 数据库 | MySQL | 8.0 | 关系数据库 |
| 缓存 | Redis | 7.x | 缓存/会话 |
| 认证 | JWT | jjwt 0.12 | Token 认证 |
| 工具 | Lombok | 1.18.x | 简化代码 |
| 验证 | Validation | Jakarta | 参数校验 |
| 文档 | SpringDoc | 2.x | API 文档 |
| 日志 | SLF4J + Logback | - | 日志管理 |

---

## 📊 依赖清单

```xml
<!-- Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- MyBatis-Plus -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.5</version>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Swagger/OpenAPI -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

---

## 🎯 接口优先级

### P0 - 核心业务（必须完成）
1. 认证模块 - 4 个接口
2. 房源模块 - 4 个接口
3. 订单模块 - 5 个接口
4. 合同模块 - 3 个接口

### P1 - 重要业务（优先完成）
5. 房东中心 - 5 个接口
6. 管理后台 - 10 个接口
7. 预约模块 - 2 个接口

### P2 - 辅助功能（后续完成）
8. 用户中心 - 8 个接口
9. 工单模块 - 2 个接口
10. 消息模块 - 1 个接口
11. 存储模块 - 1 个接口

---

## 📝 开发规范

### 1. 代码规范
- 使用 Alibaba Java 编码规范
- 统一命名规范
- 添加必要注释
- 使用 Lombok 简化代码

### 2. 接口规范
```json
{
  "code": 0,
  "message": "success",
  "data": {...}
}
```

### 3. 错误码规范
| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 4. 分页规范
```json
{
  "list": [...],
  "total": 100,
  "page": 1,
  "size": 20
}
```

---

## 🧪 测试计划

### 单元测试
- 服务层单元测试 (JUnit 5 + Mockito)
- 覆盖率目标: > 80%

### 接口测试
- 使用 Postman 进行接口测试
- 准备测试用例集

### 性能测试
- 使用 JMeter 进行压力测试
- 目标: 支持 1000 并发

---

## 🚀 部署方案

### Docker 部署
```dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 环境变量
```yaml
DATABASE_URL: mysql://user:pass@host:3306/anju_rent
REDIS_URL: redis://host:6379
JWT_SECRET: your-secret-key
SMS_API_KEY: your-sms-api-key
OSS_ACCESS_KEY: your-oss-key
```

---

## 📈 进度追踪

| 阶段 | 任务 | 工期 | 状态 |
|------|------|------|------|
| 1 | 基础设施 | 1 周 | ⏳ |
| 2 | 认证模块 | 1 周 | ⏳ |
| 3 | 核心业务 | 2 周 | ⏳ |
| 4 | 房东中心 | 1 周 | ⏳ |
| 5 | 管理后台 | 1 周 | ⏳ |
| 6 | 辅助功能 | 1 周 | ⏳ |
| 7 | 测试部署 | 1 周 | ⏳ |

**总工期: 8 周**

---

## 📞 联系方式

- 项目经理: [待填写]
- 前端负责人: AliceAda
- 后端负责人: [待填写]
- 测试负责人: [待填写]

---

**文档版本**: v1.0  
**更新日期**: 2026-08-19  
**生成工具**: AgnesCode AI
