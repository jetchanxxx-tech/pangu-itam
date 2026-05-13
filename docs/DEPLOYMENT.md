# ITAM 部署说明书

## 架构概览

```
┌──────────────────────────────────────────────────┐
│                   Cloudflare                      │
│                                                    │
│  Pages (itam-frontend)          Workers (itam-api) │
│  ├─ React 18 SPA               ├─ Hono + TS       │
│  ├─ Ant Design 5               ├─ JWT Auth        │
│  └─ pages.dev 域名             ├─ REST API        │
│                                 └─ workers.dev 域名 │
│                                                    │
│  D1 (itam-db)                                     │
│  ├─ users, assets, contracts                      │
│  ├─ contract_files (BLOB), system_interfaces       │
│  └─ SQLite 兼容, 5 张表, 7 个索引                  │
└──────────────────────────────────────────────────┘
```

## 前置要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18 | 运行 wrangler 和构建前端 |
| npm | >= 9 | 包管理 |
| Cloudflare 账号 | - | 已登录浏览器或持有 API Token |
| Git | 任意 | 版本管理（可选） |

## 一、获取 Cloudflare API Token

1. 打开 https://dash.cloudflare.com/profile/api-tokens
2. 点击「创建令牌」→「自定义令牌」
3. 配置权限：

| 权限类别 | 资源 | 级别 |
|----------|------|------|
| D1 | 账户 | 编辑 |
| Workers Scripts | 账户 | 编辑 |
| Workers Routes | 账户 | 编辑 |
| Cloudflare Pages | 账户 | 编辑 |
| Account Settings | 账户 | 读取 |

4. 创建令牌并复制保存

## 二、初始化 D1 数据库

```bash
# 进入 workers 目录
cd workers

# 设置环境变量
export CLOUDFLARE_API_TOKEN=<你的API Token>
export CLOUDFLARE_ACCOUNT_ID=<你的Account ID>

# 创建 D1 数据库
npx wrangler d1 create itam-db
```

将输出的 `database_id` 填入 `workers/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "itam-db"
database_id = "你的database-id"
```

执行数据库迁移：

```bash
# 方式一：使用脚本（推荐）
node scripts/migrate.mjs

# 方式二：使用 wrangler
npx wrangler d1 execute itam-db --file=src/db/schema.sql
npx wrangler d1 execute itam-db --file=src/db/seed.sql
```

## 三、生成默认密码哈希

```bash
node scripts/setup-passwords.mjs
```

将输出粘贴到 `workers/src/db/seed.sql`，然后重新执行种子脚本。

默认账户：
- 管理员：`admin` / `admin123`
- 普通用户：`user` / `user123`

## 四、部署后端 API (Workers)

```bash
cd workers

# 设置 JWT 密钥
npx wrangler secret put JWT_SECRET

# 部署 Worker
npx wrangler deploy
```

部署完成后访问 `https://itam-api.<子域名>.workers.dev/health` 确认返回 `{"ok":true}`。

### 环境变量说明

| 变量名 | 类型 | 说明 |
|--------|------|------|
| JWT_SECRET | secret | JWT 签名密钥（必填） |
| NOTIFICATION_ENABLE | var | 是否启用通知（true/false） |
| FEISHU_WEBHOOK | var | 飞书机器人 Webhook 地址 |
| FEISHU_SECRET | var | 飞书机器人签名密钥 |

## 五、部署前端 (Pages)

```bash
cd frontend

# 安装依赖
npm install

# 构建生产包
npm run build

# 创建 Pages 项目（仅首次）
npx wrangler pages project create itam-frontend --production-branch=main

# 部署
npx wrangler pages deploy dist --project-name=itam-frontend --commit-dirty=true
```

部署完成后访问 `https://itam-frontend.pages.dev`。

## 六、一键部署脚本

```bash
cd workers

# 设置环境变量（替换为实际值）
export CLOUDFLARE_API_TOKEN=cf_xxx
export CLOUDFLARE_ACCOUNT_ID=xxx

# 一键部署后端
node scripts/deploy.mjs

# 一键部署前端
cd ../frontend
npm install && npm run build
npx wrangler pages deploy dist --project-name=itam-frontend --commit-dirty=true
```

## 七、本地开发

```bash
# 终端 1：启动 Worker 本地开发服务器
cd workers
npx wrangler dev --port 8787

# 终端 2：启动前端开发服务器
cd frontend
npm run dev
# Vite 在 :3000，自动代理 /api 到 :8787
```

## 八、故障排查

### Worker 启动失败
1. 检查 `npx wrangler tail` 查看实时日志
2. 确认 D1 database_id 在 wrangler.toml 中正确配置
3. 确认 `JWT_SECRET` 已通过 `wrangler secret put` 设置

### 前端 401 错误
1. 确认 API base URL 配置正确（`frontend/src/services/api.ts`）
2. 开发环境使用相对路径 `/api/v1`（Vite 代理）
3. 生产环境应使用完整 URL `https://<worker>.<subdomain>.workers.dev/api/v1`

### CORS 错误
1. Worker 的 CORS 中间件已配置允许所有来源
2. 如需限制来源，修改 `workers/src/middleware/cors.ts`

### D1 查询超时
1. Workers Free 计划有 10ms CPU 限制
2. 确保所有列表查询使用分页（limit ≤ 100）
3. 避免复杂 JOIN 查询

## 九、版本更新

```bash
# 更新后端
cd workers
git pull
npx wrangler deploy

# 更新前端
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name=itam-frontend --commit-dirty=true
```
