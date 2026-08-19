# 安居易租前端项目

Vue 3 + TypeScript + Element Plus 租房管理平台前端代码

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite 5
- **图表库**: ECharts 5

## 项目结构

```
rent-deploy/
├── src/                    # 源代码目录
│   ├── api/               # API 接口模块
│   ├── views/             # 页面组件
│   │   ├── admin/         # 管理后台页面
│   │   ├── landlord/      # 房东中心页面
│   │   ├── user/          # 租客端页面
│   │   └── auth/          # 认证页面
│   ├── components/        # 公共组件
│   ├── composables/       # 组合式函数
│   ├── layouts/           # 布局组件
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── router/            # 路由配置
│   └── types/             # 类型定义
├── public/                # 静态资源
├── apifox/                # ApiFox 接口文档
├── docs/                  # 项目文档
├── openapi.json           # OpenAPI 3.0 规范
├── frontend-doc.html      # 前端开发文档
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
└── tsconfig.json          # TypeScript 配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能模块

### 租客端
- 房源浏览、搜索、筛选
- 在线预订、支付
- 电子合同签署
- 订单管理
- 个人中心

### 房东端
- 房源管理
- 预约管理
- 合同管理
- 账单管理
- 数据统计

### 管理后台
- 用户管理
- 房源管理
- 订单管理
- 财务管理
- 系统配置
- 数据统计

## API 接口

项目包含 232 个 API 接口，涵盖：
- 认证模块 (4)
- 用户模块 (10)
- 房源模块 (12)
- 订单模块 (8)
- 合同模块 (8)
- 支付模块 (6)
- 预约模块 (6)
- 管理后台 (35+)
- 扩展功能 (43)

## 数据库

项目使用 MySQL 数据库，包含 102 张表：
- 用户表
- 房源表
- 订单表
- 合同表
- 支付表
- 工单表
- 系统配置表
- ...

## 部署

### Docker 部署

```bash
docker build -t anju-rent-frontend .
docker run -d -p 80:80 anju-rent-frontend
```

### Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/rent-deploy/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend-server:8080;
    }
}
```

## 开发规范

- 使用 TypeScript 严格模式
- Vue 组件使用 Composition API
- API 接口统一使用 axios 封装
- 状态管理使用 Pinia
- 路由懒加载
- 组件按需引入

## 许可证

MIT License
