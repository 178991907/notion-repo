# Notion Repo 安全策略与防御规范 (Security Policy)

## 一、受支持版本 (Supported Versions)

本项目高度重视开源系统与用户数据的安全性，所有生产发布均执行全自动化安全扫描与端到端回归测试：

| 版本系列 | 安全维护状态 | 说明 |
| :--- | :---: | :--- |
| **`4.21.x`** (当前最新) | ✅ **官方最高级别支持** | **企业级安全深度加固版**，已全面修复 26 项历史漏洞，包含密码 bcrypt 加密、Edge HMAC 鉴权、DOMPurify XSS 免疫、速率限制与安全代理等 |
| `4.20.x` | ⚠️ 基础维护 | 推荐平滑升级至 `4.21.x`，享受完整零信任安全防御体系 |
| `4.19.x` 及更早 | ❌ 不再维护 | 存在已知安全缺陷，强烈建议升级至最新 `main` 分支 |
| 第三方长期分支 (Fork) | ⚠️ 社区维护 | 建议定期与官方上游仓库同步（Sync fork）以获取最新安全补丁 |

---

## 二、核心安全防御与加固架构

Notion Repo 在 **v4.21.0** 中完成了由外至内的全栈安全加固，构建了多层立体防御网络：

### 1. 认证与密码安全 (Authentication & Password Security)
- **bcrypt 加盐单向加密**：会员密码全部采用工业标准 `bcryptjs` 进行加盐哈希，根除明文存储风险。
- **无感平滑自愈升级 (Auto-Upgrade)**：系统向下兼容旧版明文与单次 SHA-256 密码，会员下次正常登录时在后台静默升级为 bcrypt 并自动写回 Notion 数据库。
- **常数时间签名比对**：所有 Token 签名与散列核验均使用 `crypto.timingSafeEqual`，阻断时序侧信道攻击（Timing Attack）。
- **Edge 运行时真鉴权中间件**：基于 Web Crypto API（`crypto.subtle`）实现 Edge Runtime HMAC-SHA256 签名校验，废除假鉴权逻辑，严密防护 `/admin` 与 `/api/admin/*`。
- **OAuth Token 凭据加密隔离**：Notion OAuth 回调端点使用 AES-256-CBC 加密存储于 HttpOnly Cookie，杜绝 URL 传参及日志泄漏。

### 2. 注入与跨站脚本防御 (XSS & Injection Defense)
- **DOMPurify 全站评论免疫**：引入 `isomorphic-dompurify`，对全站 15+ 现代主题的 RecentComments 评论组件实施强制消毒，阻断第三方存储型 XSS。
- **废除 eval() 与 document.write**：彻底移除 `eval(GLOBAL_JS)`，改用安全受控的动态 script 注入，完美配合现代内容安全策略（CSP）。
- **结构化数据标签转义**：SEO JSON-LD 数据输出自动进行 `</script>` 序列化转义，杜绝标签逃逸注入。
- **参数化与安全查询**：所有数据库交互与配置读取均采用严格的参数化与类型白名单。

### 3. API 网关防护与速率限制 (Rate Limiting & Gateway)
- **全线 API 接入安全中间件 (`withSecurity`)**：为会员登录、注册、暗号校验、配置更新、缓存刷新等 9 大核心 API 全量注入 IP 级滑动窗口速率限制（Rate Limiting），有效防范暴力破解与拒绝服务（DoS/CC）。
- **敏感字段黑名单过滤**：后台配置读取接口严密剔除 Redis 密码、数据库连接串、各类私钥等敏感凭证。
- **日志敏感信息脱敏**：错误日志严禁打印包含用户密码等机密信息的请求体内容。

### 4. 凭据隔离与后端代理 (Secret Isolation & Backend Proxy)
- **Gitalk OAuth 安全代理**：设立专用后端代理端点 `/api/proxy/gitalk-token`，GitHub Client Secret 移出客户端 Bundle，彻底杜绝 OAuth 凭据滥用。
- **双重提交 Cookie (Double Submit Cookie) CSRF 防御**：后台所有写操作接口强制比对请求头与 Cookie。
- **Vercel Cron 防伪造**：剔除对可伪造 User-Agent 的依赖，强制校验官方网关签名与秘钥。

### 5. 容器与部署安全 (Container & Deployment Baseline)
- **非特权用户隔离**：Dockerfile 生产镜像默认创建并切换为 `nextjs:nodejs`（UID/GID 1001）非特权账号运行。
- **敏感构建文件阻隔**：`.dockerignore` 排除所有 `.env*` 敏感文件、`.git` 历史与证书私钥。
- **健康检查与遥测控制**：内置容器 HEALTHCHECK 探针，默认禁用 Next.js 遥测数据上报。
- **自动化安全回归**：内置 `__tests__/security/` 测试套件，覆盖 20 项全自动安全用例，保障持续集成安全。

---

## 三、报告安全漏洞 (Reporting a Vulnerability)

我们极其重视安全社区与开发者的漏洞反馈。**请勿在公开的 GitHub Issue、PR 或 Discussions 中披露可利用的漏洞细节。**

### 安全漏洞提报渠道：
1. **GitHub 私密漏洞报告 (推荐)**：  
   请访问仓库的 **[Security → Advisories → Report a vulnerability](https://github.com/178991907/notion-repo/security/advisories/new)** 发起私密安全通告。
2. **安全团队官方邮箱**：  
   如需直接联系，请发邮件至 **mail@tangly1024.com**（如需加密传输，请在邮件正文中注明并索取 PGP 公钥）。

### 报告时请尽量提供：
- 受影响的模块、路由或具体文件；
- 复现步骤、攻击场景说明或概念验证（PoC）；
- 影响面评估（数据泄露、未授权访问、提权、DoS 等）；
- 修复建议（如有）。

---

## 四、响应时效承诺 (SLA)

| 处理阶段 | 响应目标 |
| :--- | :--- |
| **漏洞确认** | 收到报告后的 **2 个工作日内** 给予官方确认并建立私密沟通通道 |
| **严重度评估** | 确认后的 **5 个工作日内** 完成威胁建模与影响面评估 |
| **修复补丁发布** | 针对严重/高危漏洞，优先在 **7 个工作日内** 合入主分支并发布安全补丁 Release |

---

## 五、开发者安全贡献规范

1. 提交 PR 时严禁包含任何真实的私有 Token、Cookie、`.env` 配置文件或私有 Notion 数据库 ID。
2. 所有新增的 API 路由必须通过 `withSecurity` 包装并显式声明速率限制配置。
3. 任何动态 HTML 渲染必须经过 `DOMPurify.sanitize()` 安全过滤。
4. 提交前请运行本地安全测试套件：`npm test __tests__/security/`。

