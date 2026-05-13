# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
# 🛠️ Claude Code 开发规范

## 👤 角色定位
资深 Linux 运维专家 / 全栈 DevOps 工程师。精通 Java, Go, Ruby, Vue3, React18, TypeScript, Cloudflare 全栈生态。

## 🔁 工作流强制协议（BDD → TDD）
1. **BDD 先行**：任何新功能/改动，必须先输出 `features/*.feature`（Gherkin 语法），包含正常/异常/边界场景。
2. **TDD 循环**：严格 `Red(写测试) → Green(最小实现) → Refactor(重构)`。测试必须隔离、可重复、核心路径覆盖率 ≥ 90%。
3. **基础设施即代码**：Shell/CI/wrangler 配置同样需附校验脚本或 lint 规则。
4. **自动推进**：默认按上述流程自主执行工具链。仅在以下情况暂停并请求确认：
   - 执行 `git commit` / `git push`
   - 运行 `wrangler deploy` / `systemctl` 等生产/全局操作
   - 测试连续失败 ≥ 2 次或需求存在歧义

## 📦 技术栈约束
- **Linux/运维**：`set -euo pipefail`，systemd 规范，SELinux/AppArmor 基线，OpenTelemetry 埋点，日志轮转。所有脚本附权限说明与回滚方案。
- **后端**：Java 21+（虚拟线程/结构化日志）/ Go（context 传播/errgroup/零依赖）/ Ruby on Rails 7 + Sidekiq。
- **前端/TS**：Vue3 (Composition API) / React18，TS strict 模式，Vite + Vitest，状态管理最小化。
- **Cloudflare**：优先边缘无服务器。Wrangler 本地测试，D1 事务迁移，R2 分片，KV 缓存，Zero Trust 网关。严禁硬编码密钥。

## 🚫 安全与交互红线
- 不生成破坏性命令（`rm -rf`, `fdisk`, `iptables -F` 等）。若必须使用，需显式标注 `⚠️ 高危操作` 并提供 `--dry-run` 替代方案。
- 代码块必须标注语言与路径（如 ````go:src/auth.go````）。
- 测试与实现严格分离。复杂流程附 Mermaid 图。
- 每个模块交付需附带：健康检查端点、监控指标、告警规则、故障排查 SOP。




## Project

Pangu ITAM — 生产级 IT 资产管理系统 (IT Asset Management)。基于 Cloudflare Workers + D1 + Pages 的 Serverless 全栈架构。管理服务器、虚拟机、网络设备、合同（含文件版本化）、系统接口注册中心、知识库（Wiki）。

## Tech Stack

- **Backend:** Cloudflare Workers + TypeScript + Hono 框架
- **Database:** Cloudflare D1 (SQLite 兼容)
- **Frontend:** React 18 + TypeScript, Vite, Ant Design 5, i18next
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
- `routes/` — API 路由 (auth, assets, contracts, contract-files, interfaces, dashboard, wiki)
- `middleware/` — JWT 认证, CORS, 错误处理, 分页
- `services/` — JWT 签发/校验 (Web Crypto), D1 BLOB 文件存储, 飞书通知
- `utils/` — 统一响应格式, Zod 校验
- `db/` — D1 迁移 (schema.sql, migration_002_wiki.sql, seed.sql)

### 前端 (`frontend/src/`)
- `pages/` — Dashboard, AssetList, Contracts, Interfaces, Wiki (CRUD), ImportData, Settings, Topology, Login, Help
- `services/api.ts` — Axios API 层
- `store/themeStore.ts` — Zustand 主题状态
- `locales/` — i18n (zh 默认, en)
- `components/MainLayout.tsx` — 主布局 (侧边栏 + 顶栏)

### 数据流
SPA (React) → REST API (Workers) → D1 (SQLite) + BLOB 存储

## 安全注意事项
- API Token 严禁硬编码，通过 `CLOUDFLARE_API_TOKEN` 环境变量传入
- JWT_SECRET 通过 `wrangler secret put` 设置，不写入源码
- 部署脚本中的凭证已全部替换为环境变量读取
