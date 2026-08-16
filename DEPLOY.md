# 前端部署说明（rent-frontend）

当前版本为**纯前端 mock 原型**：房源 / 预约 / 签约 / 我的 等数据均在浏览器内存中，
不依赖任何后端，刷新页面后 mock 数据重置。后端（`rent-backend`）就绪后，
在前端新增 `src/api` 层、把 `VITE_API_BASE_URL` 指向后端即可对接，无需改动页面组件。

## 本地运行

```bash
npm install
npm run dev        # 开发预览 http://localhost:5173
npm run build      # 产出 dist/ 静态资源
npm run preview    # 本地预览构建产物
```

## 方式一：Docker 容器部署（推荐，任意服务器/云平台通用）

```bash
docker build -t rent-frontend .
docker run -d -p 8080:80 --name rent-front rent-frontend
# 访问 http://<服务器IP>:8080
```

## 方式二：Nginx 静态托管

```bash
npm run build
# 把 dist/ 目录整体丢到 nginx 站点根目录（如 /usr/share/nginx/html）
```

## 方式三：Vercel / Netlify / GitHub Pages 等静态平台

- 构建命令：`npm run build`
- 输出目录：`dist`
- 无需服务端，直接托管静态文件即可（当前为 hash 路由，无需额外 rewrite 规则）

## 备注

- 路由使用 hash 模式，部署在子路径或不配 rewrite 的静态服务器上也不会白屏。
- 多语言/深色模式等若后续需要，在 `vite.config.ts` 中配置 `base` 即可。
