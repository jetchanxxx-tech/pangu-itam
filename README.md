# 🖥️ Pangu ITAM — IT 资产管理系统

<p align="center">
  <img src="frontend/public/logo.png" alt="Pangu ITAM" width="200"/>
</p>

<p align="center">
  <strong>基于 Cloudflare Workers + D1 + Pages 的生产级全栈 IT 资产管理系统</strong>
</p>

<p align="center">
  <a href="https://itsam.pangu-cloud.com/"><img src="https://img.shields.io/badge/线上环境-itsam.pangu--cloud.com-6200EE?style=flat-square" alt="Production"></a>
  <img src="https://img.shields.io/badge/后端-Cloudflare%20Workers-F38020?style=flat-square&logo=cloudflare">
  <img src="https://img.shields.io/badge/数据库-Cloudflare%20D1-F38020?style=flat-square&logo=cloudflare">
  <img src="https://img.shields.io/badge/前端-React%2018-61DAFB?style=flat-square&logo=react">
  <img src="https://img.shields.io/badge/测试-Playwright-45ba4b?style=flat-square&logo=playwright">
  <img src="https://img.shields.io/badge/许可-MIT-green?style=flat-square">
</p>

---

## 🎨 界面预览

> 配色方案：`#6200EE` / `#3700B3` / `#03DAC6` / `#018786` — Material Design 紫-青主题

- **浅色模式**：淡紫底色 + 深紫侧边栏 + 紫色主色调
- **深色模式**：全深紫调 + 紫色高亮

---

## 🚀 线上地址

| 服务 | URL |
|------|-----|
| 前端 | [itsam.pangu-cloud.com](https://itsam.pangu-cloud.com/) |
| API | [itam-api.jet-s.workers.dev](https://itam-api.jet-s.workers.dev/health) |

**默认账户**：`admin` / `admin123`

---

## ✨ 核心功能

| 模块 | 功能描述 |
|------|----------|
| 📊 **仪表盘** | 资产/合同实时统计，SLA 合规率，系统健康度 |
| 🖥️ **资产管理** | 服务器/虚拟机/容器/软件 CRUD，归档/取消归档，CSV 批量导入 |
| 📝 **合同管理** | 合同全生命周期，文件版本化管理（D1 BLOB 存储，≤10MB） |
| 🔌 **接口注册** | 系统 API 接口元数据集中管理，方法/URL/状态跟踪 |
| 📚 **知识库** | 创建/编辑/删除文章，分类与标签，全文搜索 |
| 💻 **Web 终端** | 基于 xterm.js 的真实终端模拟，WebSocket 代理，RDP 文件下载 |
| 📥 **数据导入** | CSV 模板下载 + 批量导入 + 结果反馈 |
| ❓ **帮助中心** | 内置功能指南、FAQ、API 参考、快捷操作说明 |
| 🌍 **国际化** | 中文（默认）/ English，一键切换 |
| 🌙 **深色模式** | 完整的浅色/深色主题，侧边栏独立深紫配色 |

---

## 🛠️ 技术栈

| 层级 | 技术选型 |
|------|----------|
| **后端运行时** | Cloudflare Workers |
| **后端框架** | Hono (TypeScript) |
| **数据库** | Cloudflare D1 (SQLite 兼容) |
| **认证** | JWT — Web Crypto API (HMAC-SHA256) |
| **密码哈希** | PBKDF2 + SHA-256 (100,000 次迭代) |
| **文件存储** | D1 BLOB 列 |
| **前端框架** | React 18 + TypeScript |
| **构建工具** | Vite 4 |
| **UI 组件** | Ant Design 5 (自定义紫-青主题) |
| **终端** | @xterm/xterm + WebSocket |
| **国际化** | react-i18next + i18next |
| **状态管理** | Zustand |
| **E2E 测试** | Playwright |
| **部署** | Wrangler CLI + REST API |

---

## 📂 项目结构

```
pangu-itam/
├── workers/                          # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts                  # Hono 入口，路由注册
│   │   ├── routes/                   # 10 个路由模块
│   │   │   ├── auth.ts               #   登录/登出/用户信息
│   │   │   ├── assets.ts             #   资产 CRUD + 归档 + CSV 导入
│   │   │   ├── contracts.ts          #   合同 CRUD
│   │   │   ├── contract-files.ts     #   文件上传/下载/版本
│   │   │   ├── interfaces.ts         #   系统接口 CRUD
│   │   │   ├── wiki.ts               #   知识库 CRUD
│   │   │   ├── dashboard.ts          #   仪表盘统计
│   │   │   └── terminal.ts           #   WebSocket 终端代理
│   │   ├── middleware/               # JWT 认证, CORS, 错误处理, 分页
│   │   ├── services/                 # JWT (Web Crypto), 文件存储, 飞书通知
│   │   └── utils/                    # 统一响应, Zod 校验
│   ├── scripts/                      # 部署/迁移/密码生成/E2E 测试
│   └── wrangler.toml
├── frontend/                         # React SPA 前端
│   ├── src/
│   │   ├── pages/                    # 14 个页面组件
│   │   │   ├── Login.tsx             #   登录（Logo + 渐变背景）
│   │   │   ├── Dashboard.tsx         #   仪表盘（实时指标）
│   │   │   ├── AssetList.tsx         #   资产管理 + 归档
│   │   │   ├── Contracts.tsx         #   合同管理 + 文件版本
│   │   │   ├── Interfaces.tsx        #   接口注册中心
│   │   │   ├── Wiki.tsx              #   知识库 CRUD
│   │   │   ├── WebTerminal.tsx       #   xterm.js 终端
│   │   │   ├── ImportData.tsx        #   CSV 导入
│   │   │   ├── Help.tsx              #   帮助中心
│   │   │   └── ...
│   │   ├── components/MainLayout.tsx # 主布局（紫色侧边栏 + Logo）
│   │   ├── services/api.ts          # Axios API 层（20+ 端点）
│   │   ├── locales/                 # 中文 / English
│   │   └── index.css                # 全局主题样式
│   └── public/logo.png              # Pangu Logo
├── backend/                          # 原 Go 后端（参考保留）
├── docs/                             # 文档
│   ├── DEPLOYMENT.md                 # 部署说明书
│   └── USER_GUIDE.md                 # 用户使用手册
├── CLAUDE.md                         # Claude Code 开发指南
└── docker-compose.yml                # Docker 编排（Go 版本）
```

---

## 🏗️ 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Cloudflare                          │
│                                                         │
│  Pages (itam-frontend)            Workers (itam-api)    │
│  ┌─────────────────────┐         ┌──────────────────┐  │
│  │ React 18 + Vite     │  HTTP   │ Hono + TypeScript │  │
│  │ Ant Design 5        │◄───────►│ JWT Auth          │  │
│  │ xterm.js            │  /api   │ Zod Validation    │  │
│  │ i18next (zh/en)     │         │ WebSocket (SSH)   │  │
│  └─────────────────────┘         └────────┬─────────┘  │
│                                           │             │
│                                     D1 (itam-db)       │
│                                     ┌──────────────┐   │
│                                     │ users         │   │
│                                     │ assets        │   │
│                                     │ contracts     │   │
│                                     │ contract_files│   │
│                                     │ system_interf.│   │
│                                     │ wiki_articles │   │
│                                     └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ 快速开始

```bash
# 1. 安装依赖
cd workers && npm install
cd ../frontend && npm install

# 2. 本地开发（两个终端）
# 终端 1 — Workers
cd workers && npx wrangler dev --port 8787

# 终端 2 — 前端（自动代理 API 到 :8787）
cd frontend && npm run dev

# 3. 部署
cd workers && npx wrangler deploy
cd ../frontend && npm run build
npx wrangler pages deploy dist --project-name=itam-frontend
```

---

## 📡 API 概览

> 前缀 `/api/v1`，除 `/auth/login` 和 `/health` 外均需 JWT 认证

### 认证
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/auth/login` | 用户登录，返回 JWT |
| POST | `/auth/logout` | 登出 |
| GET | `/user/me` | 当前用户信息 |

### 业务 API
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/dashboard/stats` | 仪表盘统计 |
| GET/POST | `/assets` | 资产列表 / 创建 |
| PUT/DELETE | `/assets/:id` | 更新 / 删除资产 |
| POST | `/assets/:id/archive` | 归档资产 |
| POST | `/assets/:id/unarchive` | 取消归档 |
| POST | `/assets/import` | CSV 批量导入 |
| GET/POST | `/contracts` | 合同列表 / 创建 |
| GET/PUT/DELETE | `/contracts/:id` | 合同详情 / 更新 / 删除 |
| GET/POST | `/contracts/:id/files` | 文件列表 / 上传 |
| GET | `/contract-files/:id/download` | 下载文件 |
| GET/POST | `/interfaces` | 接口列表 / 创建 |
| PUT/DELETE | `/interfaces/:id` | 更新 / 删除接口 |
| GET/POST | `/wiki` | 文章列表 / 创建 |
| GET/PUT/DELETE | `/wiki/:id` | 文章详情 / 更新 / 删除 |
| GET | `/wiki/categories` | 分类列表 |
| GET | `/ping` | 连通性测试 |
| GET | `/health` | 健康检查（公开） |

---

## 📖 文档

- [部署说明书](docs/DEPLOYMENT.md) — D1 创建、迁移、Worker/Pages 部署、环境变量
- [用户使用手册](docs/USER_GUIDE.md) — 功能指南、操作说明、FAQ

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。

## 📄 许可证

MIT License
