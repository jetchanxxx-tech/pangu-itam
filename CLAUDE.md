# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pangu ITAM — full-stack IT Asset Management system. Tracks servers, VMs, network devices, contracts (with file versioning), and centralized system interface registry. Includes dashboard, Wiki, and optional web terminal.

## Tech Stack

- **Backend:** Go 1.20+ with Gin, GORM, golang-jwt, Viper. Supports SQLite (default), MySQL, PostgreSQL.
- **Frontend:** React 18 + TypeScript, Vite, Ant Design 5, Zustand, react-i18next, Axios.
- **Infra:** Docker multi-stage build, docker-compose (PostgreSQL + Redis).

## Commands

```bash
# Backend (standalone)
cd backend && go run cmd/server/main.go          # listens on :8080

# Frontend (dev server)
cd frontend && npm install && npm run dev         # Vite on :5173

# Full stack (Docker)
docker compose up -d                              # builds & starts all services

# Docker rebuild after Go changes
docker compose up -d --build
```
# 🛠️ Claude Code 开发规范

## 👤 角色定位
资深 Linux 运维专家 / 全栈 DevOps 工程师。精通 Java, Go, Ruby, Vue3, React18, TypeScript, Cloudflare 全栈生态。

## 🔁 工作流强制协议（BDD → TDD）
1. **BDD 先行**：任何新功能/改动，必须先输出 `features/*.feature`（Gherkin 语法），包含正常/异常/边界场景。
2. **TDD 循环**：严格 `Red(写测试) → Green(最小实现) → Refactor(重构)`。测试必须隔离、可重复、核心路径覆盖率 ≥ 90%。
3. **基础设施即代码**：Shell/CI/Docker/wrangler 配置同样需附校验脚本或 lint 规则。
4. **自动推进**：默认按上述流程自主执行工具链。仅在以下情况暂停并请求确认：
   - 执行 `git commit` / `git push`
   - 运行 `wrangler deploy` / `docker build` / `systemctl` 等生产/全局操作
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
- 严禁使用docker技术去部署项目,可以构建和封装docker镜像
## Architecture

Backend follows layered layout under `backend/`:
- `cmd/server/main.go` — entry point
- `internal/conf/` — Viper config loading
- `internal/data/` — DB init
- `internal/model/` — GORM models (Asset, Contract, Interface, etc.)
- `internal/handler/` — HTTP handlers
- `internal/server/` — Gin route registration
- `internal/middleware/` — JWT auth middleware
- `internal/notification/` — notification service

Frontend under `frontend/src/`:
- `pages/` — page components (Dashboard, AssetList, Contracts, Wiki, WebTerminal, Topology, Settings, ImportData)
- `services/api.ts` — unified Axios API layer
- `store/` — Zustand stores
- `locales/` — i18n (en, zh)

SPA → RESTful API → GORM → SQLite/MySQL/PostgreSQL. Docker production stack uses PostgreSQL + Redis.
