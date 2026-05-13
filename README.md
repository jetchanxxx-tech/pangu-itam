# Pangu ITAM — IT 资产管理系统

基于 **Cloudflare Workers + D1 + Pages** 的 Serverless 全栈 IT 资产管理系统。

## 线上地址

| 服务 | URL |
|------|-----|
| 前端 | https://itsam.pangu-cloud.com/ |
| API | https://itam-api.jet-s.workers.dev |

## 功能

- **仪表盘** — 实时资产/合同统计，SLA 合规率
- **资产管理** — 服务器、虚拟机、容器、软件资产 CRUD，导入/导出，归档管理
- **合同管理** — 合同全生命周期管理，文件版本化存储（BLOB）
- **接口注册中心** — 系统 API 接口元数据统一管理
- **知识库 (Wiki)** — 支持创建/编辑/删除文章，分类和标签
- **Web 终端** — 基于 xterm.js 的真实终端，支持 SSH/RDP 连接
- **数据导入** — CSV 批量导入资产
- **帮助中心** — 内置功能指南、FAQ、API 参考
- **国际化** — 中文（默认）/ English

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Cloudflare Workers + Hono + TypeScript |
| 数据库 | Cloudflare D1 (SQLite 兼容) |
| 前端 | React 18 + TypeScript + Vite + Ant Design 5 |
| 终端 | xterm.js + WebSocket |
| 认证 | JWT (Web Crypto API, HMAC-SHA256) |
| 测试 | Playwright E2E |

## 项目结构

```
.
├── workers/                    # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts            # Hono 入口
│   │   ├── routes/             # API 路由 (auth/assets/contracts/wiki/terminal...)
│   │   ├── middleware/         # JWT 认证, CORS, 错误处理, 分页
│   │   ├── services/           # JWT, 文件存储, 通知
│   │   └── utils/              # 响应工具, Zod 校验
│   ├── scripts/                # 部署/迁移/测试脚本
│   └── wrangler.toml
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── pages/              # 14 个页面组件
│   │   ├── components/         # MainLayout
│   │   ├── services/api.ts     # Axios API 层
│   │   └── locales/            # 中文/英文
│   └── vite.config.ts
├── backend/                    # 原 Go 后端 (参考)
├── docs/                       # 文档
│   ├── DEPLOYMENT.md           # 部署说明书
│   └── USER_GUIDE.md           # 用户使用手册
└── docker-compose.yml          # Docker 编排 (Go 版本)
```

## 快速开始

```bash
# 1. 安装依赖
cd workers && npm install
cd ../frontend && npm install

# 2. 本地开发
# 终端 1: Workers
cd workers && npx wrangler dev --port 8787

# 终端 2: 前端
cd frontend && npm run dev    # Vite :3000 代理到 :8787

# 3. 部署
cd workers && npx wrangler deploy
cd ../frontend && npm run build && npx wrangler pages deploy dist --project-name=itam-frontend
```

## 文档

- [部署说明书](docs/DEPLOYMENT.md)
- [用户使用手册](docs/USER_GUIDE.md)

## API 概览

所有 API 端点前缀 `/api/v1`，需 JWT 认证（`/auth/login` 和 `/health` 除外）。

| 模块 | 端点 |
|------|------|
| 认证 | POST /auth/login, /user/me |
| 资产 | GET/POST /assets, PUT/DELETE /assets/:id, POST /assets/:id/archive, POST /assets/import |
| 合同 | GET/POST /contracts, GET/PUT/DELETE /contracts/:id |
| 文件 | GET/POST /contracts/:id/files, GET /contract-files/:id/download |
| 接口 | GET/POST /interfaces, GET/PUT/DELETE /interfaces/:id |
| Wiki | GET/POST /wiki, GET/PUT/DELETE /wiki/:id, GET /wiki/categories |
| 仪表盘 | GET /dashboard/stats |
| 终端 | WS /terminal/ws |
| 健康 | GET /health |
