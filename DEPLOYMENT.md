# 部署指南

## 概述

Notion Repo 支持多种部署方式，本指南将详细介绍各种部署选项和最佳实践。

## 部署前准备

### 0. 本地统一基线（推荐）

为提升跨平台兼容性（Vercel / Cloudflare Pages / Netlify / EdgeOne Pages 等），本项目建议统一使用以下最简流程：

```bash
# Node 22（版本以仓库根目录 `.nvmrc` 为准，便于与各平台预装列表对齐）
nvm use || nvm install

# Yarn
npm i -g yarn

# 安装依赖 / 本地开发 / 构建
yarn
yarn dev
yarn build
```

### 1. 环境变量配置

创建 `.env.local` 文件并配置必要的环境变量：

```bash
# 核心必需配置
NOTION_PAGE_ID=your-notion-page-id
ADMIN_PASSWORD=your-secure-admin-password

# 企业级安全密钥配置 (推荐)
ADMIN_SECRET=your-random-admin-jwt-secret-key        # 后台 JWT 签名私钥
MEMBER_AUTH_SECRET=your-random-member-jwt-secret     # 会员系统 JWT 签名私钥
CRON_SECRET=your-random-cron-secret                  # Vercel Cron 定时任务鉴权私钥
FANS_CODE_SECRET=your-random-fans-code-secret        # 粉丝暗号 HMAC 签名私钥

# 推荐外观与元数据配置
NEXT_PUBLIC_THEME=heo
NEXT_PUBLIC_TITLE=你的博客标题
NEXT_PUBLIC_DESCRIPTION=你的博客描述
NEXT_PUBLIC_AUTHOR=作者名称
NEXT_PUBLIC_LINK=https://yourdomain.com

# 评论与第三方后端代理配置 (服务端私密使用，杜绝前端泄露)
COMMENT_GITALK_CLIENT_SECRET=ghs_your_github_app_secret
NOTION_API_TOKEN=ntn_your_official_integration_token

# 可选缓存与分析配置
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_ANALYTICS_GOOGLE_ID=G-XXXXXXXXXX
```

### 2. 构建与安全测试验证

在部署前确保项目能够正常构建并通过安全回归测试：

```bash
# 1. 运行企业级自动化安全回归测试套件 (20 项全用例保障)
npm test __tests__/security/

# 2. 生产环境构建与启动验证
yarn build
yarn start
```

### 3. 质量检查

运行完整的代码质量检查：

```bash
yarn quality
```

## Vercel 部署（推荐）

Vercel 是 Next.js 的官方部署平台，提供最佳的性能和开发体验。

### 自动部署

1. **连接 GitHub**
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub 账号登录
   - 导入你的 Notion Repo 仓库

2. **配置核心环境变量（四大建站基石）**
   - 在 Vercel 项目设置（Environment Variables）中添加 4 个核心关键变量（缺一不可，否则涉及 Notion 回写与同步会报错）：
     - `NOTION_PAGE_ID`: 你的 32 位 Notion 根页面 ID（复制自 Notion 页面分享链接，提取纯 32 位字符串）
     - `ADMIN_PASSWORD`: 管理后台 `/admin` 登录密码（自行设定高强度密码）
     - `NOTION_ACCESS_TOKEN`: [Notion 官方集成中心](https://www.notion.so/profile/integrations) 创建的内部连接密钥（以 `secret_` 或 `ntn_` 开头，**永久有效**，用于安全读写评论与会员数据。**创建后必须在 Notion 页面点击右上角「···」->「品 集成」完成授权！**）
     - `NOTION_SYNC_SECRET`: 生产环境安全私钥（自行设定，保护 Webhook 与 Cron 定时巡检，防 403 阻断）
   - *(注：项目默认已锁定 `heo` 旗舰主题，无需配置 `NEXT_PUBLIC_THEME`)*

   > 🚨 **Vercel 部署核心避坑提醒**：
   > 1. **环境范围 Environments 必须全部勾选**：添加/编辑变量时，请展开 Environments 确保勾选 **`Production`**、**`Preview`**、**`Development`** 全部三项。若漏选 Preview，访问默认提供的 `.vercel.app` 域名或分支时变量会为 `undefined` 导致 Token 提示失效！
   > 2. **Secret 类型不显示 Value 是正常特性**：选择 `Secret` 后系统实行单向加密脱敏（提示 *You can't reveal this value after saving*），右侧仅显示小锁图标。这绝对不是未保存成功或值是空的，切勿反复删除！
   > 3. **变量修改后必须 Redeploy**：修改环境变量后在线容器**不会自动热生效**，必须在 **Deployments** 列表对最新记录点击 **`···` ➔ Redeploy** 重新构建才能注入生效。

3. **在 Notion 博客主页面授权（必做关键步骤）**
   > ⚠️ **新手必看**：这是 Notion 官方平台的底层隐私安全机制（如同给博客发放进出房间的门禁卡），如果不授权，系统将无法读取和写入评论与会员数据。

   - **第 1 步**：打开您的 **Notion 博客主页面**（即 `NOTION_PAGE_ID` 对应的页面）。
   - **第 2 步**：点击页面右上角三个点 **「···」**，在下拉菜单中找到 **「品 集成」**（英文版为 **Connect to**）。
   - **第 3 步**：点击 **「+ 添加连接」**，在列表中选择您申请 Token 时填写的连接名称（例如 `Notion-Repo`），点击蓝色的 **「添加到页面」** 确认。

   ![Notion 页面授权操作指引](/images/notion-connect-guide.png)

4. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 每次推送到主分支都会自动部署

### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### Vercel 配置文件

创建 `vercel.json` 文件进行高级配置：

```json
{
  "framework": "nextjs",
  "buildCommand": "yarn build",
  "outputDirectory": ".next",
  "installCommand": "yarn",
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/feed",
      "destination": "/rss.xml",
      "permanent": true
    }
  ]
}
```

## Netlify 部署
 
### 自动部署
 
1. **连接仓库**
   - 访问 [Netlify](https://netlify.com) 并使用 GitHub 登录
   - 导入你的 `notion-repo` 仓库
 
2. **构建设置**
   - 项目已内置 `netlify.toml`，自动应用以下最佳实践（无需手动修改）：
     - Build command: `yarn run build`
     - Publish directory: `.next`
     - Node Version: `22`
     - Plugin: `@netlify/plugin-nextjs`
 
3. **配置四大核心环境变量**
   - 在 Netlify 项目的 **Site configuration -> Environment variables** 中配置四大基石：
     - `NOTION_PAGE_ID`: Notion 博客数据源页面 ID（32 位）
     - `ADMIN_PASSWORD`: 管理员后台 `/admin` 登录密码（自行设定）
     - `NOTION_ACCESS_TOKEN`: [Notion 官方集成中心](https://www.notion.so/profile/integrations) 创建的内部连接密钥（以 `secret_` 或 `ntn_` 开头，**永久有效**）
     - `NOTION_SYNC_SECRET`: 云端通信安全私钥（自行设定，保护数据同步）

4. **在 Notion 博客主页面授权（必做关键步骤）**
   > ⚠️ **新手必看**：这是 Notion 官方平台的底层隐私安全机制（如同给博客发放进出房间的门禁卡），如果不授权，系统将无法读取和写入评论与会员数据。

   - **第 1 步**：打开您的 **Notion 博客主页面**（即 `NOTION_PAGE_ID` 对应的页面）。
   - **第 2 步**：点击页面右上角三个点 **「···」**，在下拉菜单中找到 **「品 集成」**（英文版为 **Connect to**）。
   - **第 3 步**：点击 **「+ 添加连接」**，在列表中选择您申请 Token 时填写的连接名称（例如 `Notion-Repo`），点击蓝色的 **「添加到页面」** 确认。

   ![Notion 页面授权操作指引](/images/notion-connect-guide.png)


```bash
# 构建静态文件
yarn export

# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --dir=out

# 生产部署
netlify deploy --prod --dir=out
```

### Netlify 配置文件

创建 `netlify.toml` 文件：

```toml
[build]
  command = "yarn export"
  publish = "out"

[build.environment]
  EXPORT = "true"
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/feed"
  to = "/rss.xml"
  status = 301
```

## 腾讯云 EdgeOne Pages

EdgeOne 构建阶段会按仓库中的 `.nvmrc` 切换 Node 版本。若控制台报错类似 **Failed to switch to Node.js x.y.z**，通常是因为平台上 **未提供该版本**。

处理方式：

1. **保持上游**：拉取最新 Notion Repo，确认 `.nvmrc` 已与 EdgeOne「项目设置 → Node.js 版本」下拉列表中可选版本一致。
2. **自建仓库**：在 EdgeOne 控制台选择与 `.nvmrc` **完全一致**的 Node 版本；仍失败时检查构建日志是否仍在读取旧的 `.nvmrc`（需推送后再构建）。
3. `package.json` 中 `engines.node` 为 `>=22 <25`；关键是 **构建环境实际安装的版本**能解析 `.nvmrc`。

**兼容尝试（按顺序，任选其一即可，不必全做）：**

| 尝试 | 做法 |
|------|------|
| A. 对齐版本 | 打开 EdgeOne **项目设置 → Node.js 版本**，选择与仓库根目录 **`.nvmrc` 完全一致**的一项，保存后 **重新部署**。 |
| B. 改自建 fork | 若平台下拉列表**没有**当前 `.nvmrc` 里的版本：把 fork 里的 `.nvmrc` 改成平台**已有**的 Node 22 版本，推送后再构建。 |
| C. 清缓存 / 换分支 | 确认构建日志里 **Switching node** 读到的版本已更新；关闭「使用构建缓存」或触发一次无缓存构建，排除旧 `.nvmrc` 缓存。 |
| D. `engines` 报错时 | 若日志是 **Yarn does not satisfy engine** 而非 **Switching node**：在构建环境设 `YARN_IGNORE_ENGINES=1`（仅当确为 engines 校验问题时使用）。 |
| E. 按平台要求写版本 | 若平台不支持 `.nvmrc` 仅写 `22`，改为平台支持的 Node 22 完整版本号。 |

说明：Next.js 14 与当前依赖不要求锁在某一补丁版本；**兼容的核心是「平台实际能装上的 Node」与「`.nvmrc` / 控制台选择」一致**。

构建命令与静态导出等与其它平台相同，按需配置环境变量（至少 `NOTION_PAGE_ID`）。

### `yarn install` 报 `ENOSPC: no space left on device`

与 **Node 版本** 无关（日志里已出现正确 Node 版本即表示切换成功）。错误 **`ENOSPC`** 表示构建机 **磁盘或 `/dev/shm`（内存盘）空间不足**，在安装依赖从 cache 拷贝到 `node_modules` 时写满。

**可尝试：**

1. **向 EdgeOne / 腾讯云工单反馈**：说明构建任务在 `yarn install` 阶段 `ENOSPC`，申请更大构建盘或确认是否为平台侧临时配额。  
2. **减少单次写入体积**（若控制台支持自定义安装命令）：  
   - 使用 `yarn install --frozen-lockfile --prefer-offline` 且**开启依赖缓存**（命中缓存时少下载）；或  
   - 在构建前增加 `yarn cache clean`（会多下载，仅当怀疑缓存损坏时尝试，**不一定**缓解 ENOSPC）。  
3. **自定义 Yarn 缓存目录**（若平台文档支持挂载更大分区）：设置环境变量 **`YARN_CACHE_FOLDER`** 到有足够剩余空间的路径（具体以 EdgeOne 构建环境说明为准）。  
4. **换构建方案**：在磁盘更大的 CI（如 GitHub Actions）完成 `yarn build` / `next build`，将产物同步到 EdgeOne（仅静态托管），绕过 Pages 内置构建机容量限制。

**备选：怀疑「构建/文件缓存」把空间占满时**

| 做法 | 适用阶段 | 说明 |
|------|----------|------|
| **关闭 EdgeOne「依赖/构建缓存」再构建** | `yarn install` 前后 | 若平台在恢复缓存后又解压一份 `node_modules`，可能出现「缓存 + 工作区」双份占用 **`/dev/shm`**。在控制台**关闭缓存恢复**后重试（构建会变慢，但有时能腾出空间；视平台实现而定）。 |
| **`YARN_CACHE_FOLDER` 指到大磁盘路径** | `yarn install` | 避免 Yarn 默认缓存与仓库同落在小容量分区；路径以 **EdgeOne 官方文档** 为准。 |
| **构建环境变量 `ENABLE_CACHE=false`** | **`next build` 阶段** | 关闭 Notion 数据**读**盘缓存为主，会**增加 Notion 请求与耗时**；**锁文件/会话目录仍可能写入**。对日志里 **`yarn install` 拷贝 `node_modules` 即失败**的 ENOSPC **通常无效**，因尚未执行到 Next 构建。 |

仓库本身无法通过改 `package.json` 消除平台磁盘上限；根本解决依赖 **构建环境配额** 或 **外置构建**。

## Docker 部署

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NOTION_PAGE_ID=${NOTION_PAGE_ID}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### 部署命令

```bash
# 构建镜像
docker build -t notionnext .

# 运行容器
docker run -p 3000:3000 -e NOTION_PAGE_ID=your-id -e ADMIN_PASSWORD=your-pass notionnext

# 使用 Docker Compose
docker-compose up -d
```

### 容器安全基线保障 (v4.21.0 Enterprise Baseline)
- **非特权用户运行**：Dockerfile 生产阶段默认创建并切换为 `nextjs:nodejs`（UID/GID 1001）普通账号，避免容器逃逸与 root 权限滥用。
- **构建上下文脱敏**：项目根目录 `.dockerignore` 预设了严密过滤规则，彻底排除 `.env*` 真实密钥、`.git` 版本历史、测试脚本及私钥证书打包进镜像。
- **自动健康探针**：容器内置 `HEALTHCHECK`（每 30 秒轮询），智能检测 Node.js 实例活性。
- **遥测数据禁用**：默认内置 `ENV NEXT_TELEMETRY_DISABLED 1`，保护内网部署隐私。

## 静态导出部署

适用于 GitHub Pages、Cloudflare Pages 等静态托管服务。

### 构建静态文件

```bash
yarn export
```

若构建出现 Notion API 过慢或 `timeout of 300 seconds`，可在平台环境变量中配置 `BUILD_PREFETCH_ENABLED`、`STATIC_PAGE_GENERATION_TIMEOUT` 等，详见 [docs/user-guide/deploy/build-tuning.md](docs/user-guide/deploy/build-tuning.md)。

### GitHub Pages 部署

1. **GitHub Actions 配置**

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: yarn export
      env:
        NOTION_PAGE_ID: ${{ secrets.NOTION_PAGE_ID }}
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

2. **配置 Secrets**
   - 在 GitHub 仓库设置中添加 `NOTION_PAGE_ID`

## 性能优化

### 1. 缓存配置

```bash
# Redis 缓存
REDIS_URL=redis://localhost:6379

# 内存缓存
ENABLE_CACHE=true
```

### 2. CDN 配置

```bash
# 图片 CDN
NEXT_PUBLIC_IMAGE_CDN=https://cdn.example.com

# 静态资源 CDN
NEXT_PUBLIC_STATIC_CDN=https://static.example.com
```

### 3. 压缩优化

```bash
# 启用压缩
NEXT_PUBLIC_COMPRESS=true

# 图片优化
NEXT_PUBLIC_IMAGE_OPTIMIZE=true
```

## 监控和日志

### 1. 错误监控

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# LogRocket
NEXT_PUBLIC_LOGROCKET_ID=your-logrocket-id
```

### 2. 性能监控

```bash
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# Google Analytics
NEXT_PUBLIC_ANALYTICS_GOOGLE_ID=G-XXXXXXXXXX
```

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存
   yarn clean
   rm -rf node_modules package-lock.json
   yarn
   yarn build
   ```

2. **环境变量问题**
   ```bash
   # 检查环境变量
   yarn quality
   ```

3. **内存不足**
   ```bash
   # 增加 Node.js 内存限制
   NODE_OPTIONS="--max-old-space-size=4096" yarn build
   ```

### 调试模式

```bash
# 启用调试
DEBUG=* yarn build

# Next.js 调试
NEXT_DEBUG=true yarn dev
```

## 安全检查清单

- [ ] 环境变量已正确配置
- [ ] 敏感信息未暴露在客户端
- [ ] HTTPS 已启用
- [ ] 安全头部已配置
- [ ] 依赖包无安全漏洞
- [ ] 访问日志已启用
- [ ] 错误监控已配置

## 备份和恢复

### 数据备份

```bash
# 备份数据（按你的脚本体系执行）
# 例如：node scripts/backup-notion.js

# 备份配置文件
tar -czf config-backup.tar.gz .env.local blog.config.js
```

### 恢复流程

1. 恢复代码仓库
2. 恢复环境变量配置
3. 重新部署应用
4. 验证功能正常

## 更新和维护

### 定期维护

```bash
# 检查依赖更新
yarn check-updates

# 更新依赖
yarn upgrade

# 安全审计
yarn audit

# 性能分析
yarn bundle-report
```

### 版本升级

1. 备份当前版本
2. 更新代码
3. 测试新功能
4. 部署到生产环境
5. 监控运行状态
