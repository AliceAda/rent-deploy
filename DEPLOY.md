# 前端部署说明（rent-frontend）

当前状态：**mock 原型 + API 层并存**。租客端浏览（首页/找房/详情/收藏等）仍读浏览器内存 mock；
房东中心与后台页面已按 API 契约接入 `src/api` 层，请求 `/api/*`，后端未启动时页面优雅展示空数据
（并提示「网络错误」，可据此区分接口未就绪与真没有数据）。

后端（`rent-backend`）就绪后：把 `VITE_API_BASE_URL` 指向后端即可整体对接，无需改动页面组件。

## 本地运行

```bash
npm install
npm run dev        # 开发预览 http://localhost:5173（/api 代理到后端，可用 VITE_DEV_API_TARGET 覆盖）
npm run build      # 产出 dist/ 静态资源
npm run type-check # 类型检查（vue-tsc --noEmit）
```

## 静态托管 + API 反代（零依赖，Node 环境即可）

```bash
npm run build
PORT=8888 API_TARGET=http://127.0.0.1:8080 node serve.mjs
# 访问 http://localhost:8888，/api/* 自动反代到后端
```

## 方式一：Docker 容器部署（推荐，任意服务器/云平台通用）

```bash
docker build -t rent-frontend .
docker run -d -p 8080:80 --name rent-front rent-frontend
# 访问 http://<服务器IP>:8080
# 容器内 nginx 将 /api/* 反代到 127.0.0.1:8080，请确保后端网关同机同端口
```

## 方式二：Nginx 静态托管

```bash
npm run build
# 把 dist/ 目录整体丢到 nginx 站点根目录（如 /usr/share/nginx/html），参考根目录 nginx.conf
# nginx.conf 中 /api/ 反代目标（127.0.0.1:8080）需与后端实际端口一致
```

## 方式三：Vercel / Netlify / GitHub Pages 等静态平台

- 构建命令：`npm run build`
- 输出目录：`dist`
- 无需服务端，直接托管静态文件即可（当前为 hash 路由，无需额外 rewrite 规则）
- 注意：静态平台无法反代 `/api`，需把 `VITE_API_BASE_URL` 配成后端完整地址（如 `https://api.example.com/api`）

## 备注

- 路由使用 hash 模式，部署在子路径或不配 rewrite 的静态服务器上也不会白屏。
- 后端地址在 vite（`VITE_DEV_API_TARGET`）、serve.mjs（`API_TARGET`）、nginx.conf 三处配置，
  均已默认对齐为 8080 端口，改动时请保持一致。
- 多语言/深色模式等若后续需要，在 `vite.config.ts` 中配置 `base` 即可。
