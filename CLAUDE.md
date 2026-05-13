# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pangu ITAM — 生产级 IT 资产管理系统 (IT Asset Management)。基于 Cloudflare Workers + D1 + Pages 的 Serverless 全栈架构。管理服务器、虚拟机、网络设备、合同（含文件版本化）、系统接口注册中心、知识库（Wiki）、Web 终端。

## Tech Stack

- **Backend:** Cloudflare Workers + TypeScript + Hono 框架
- **Database:** Cloudflare D1 (SQLite 兼容)
- **Frontend:** React 18 + TypeScript, Vite, Ant Design 5, xterm.js, i18next
- **Auth:** JWT (Web Crypto API, HMAC-SHA256)
- **测试:** Playwright E2E

## Commands

```bash
# Workers 本地开发
cd workers && npm install && npx wrangler dev --port 8787

# 前端 本地开发 (代理到 :8787)
cd frontend && npm install && npm run dev

# 部署 Worker
cd workers && npx wrangler deploy

# 部署前端
cd frontend && npm run build && npx wrangler pages deploy dist --project-name=itam-frontend

# 数据库迁移
cd workers && node scripts/migrate.mjs
```

## Architecture

### Workers 后端 (`workers/src/`)
- `index.ts` — Hono 入口, 路由注册
- `routes/` — API 路由 (auth, assets, contracts, contract-files, interfaces, dashboard, wiki, terminal)
- `middleware/` — JWT 认证, CORS, 错误处理, 分页
- `services/` — JWT 签发/校验 (Web Crypto), D1 BLOB 文件存储, 飞书通知
- `utils/` — 统一响应格式, Zod 校验
- `db/` — D1 迁移 (schema.sql, migration_002_wiki.sql, seed.sql)

### 前端 (`frontend/src/`)
- `pages/` — Dashboard, AssetList, Contracts, Interfaces, Wiki (CRUD), ImportData, Settings, Topology, WebTerminal (xterm.js), Login, Help
- `services/api.ts` — Axios API 层
- `store/themeStore.ts` — Zustand 主题状态
- `locales/` — i18n (zh 默认, en)
- `components/MainLayout.tsx` — 主布局 (侧边栏 + 顶栏)

### 数据流
SPA (React) → REST API (Workers) → D1 (SQLite) + BLOB 存储
Web 终端: xterm.js → WebSocket → Workers → 终端网关 (可选)

## 安全注意事项
- API Token 严禁硬编码，通过 `CLOUDFLARE_API_TOKEN` 环境变量传入
- JWT_SECRET 通过 `wrangler secret put` 设置，不写入源码
- 部署脚本中的凭证已全部替换为环境变量读取
