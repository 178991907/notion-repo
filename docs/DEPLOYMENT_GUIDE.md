# Notion Repo 项目部署与环境变量完全指南

本文档提供详细的从零到一上线部署流程（以 Vercel 为例）以及全量环境变量的配置说明。

> 📖 **面向小白用户的保姆级图文教程**：请参阅 [docs/user-guide/deploy-vercel.md](./user-guide/deploy-vercel.md)  
> 💻 **源码仓库**：[https://github.com/178991907/notion-repo](https://github.com/178991907/notion-repo)  
> 🌐 **部署后访问**：`https://你的自定义域名/` 或 `https://你的项目.vercel.app/`  
> 🎛️ **在线管理后台**：`https://你的自定义域名/admin`

---

## 目录
1. [前期准备 (Notion 数据库配置)](#1-前期准备-notion-数据库配置)
2. [一键 Fork 源码或本地代码推送](#2-一键-fork-源码或本地代码推送)
3. [Vercel 线上自动化部署 (推荐)](#3-vercel-线上自动化部署-推荐)
4. [可视化后台定制与功能开通](#4-可视化后台定制与功能开通)
5. [绑定自定义独立域名](#5-绑定自定义独立域名)
6. [全量环境变量 (Environment Variables) 说明表](#6-全量环境变量-environment-variables-说明表)
7. [常见部署问题排查 (FAQ)](#7-常见部署问题排查-faq)

---

## 1. 前期准备 (Notion 数据库配置)

1. **复制 Notion 官方模板**：
   - 访问并复制（Duplicate）[Notion Repo 官方博客数据源模板](https://tanghh.notion.site/02ab3b8678004aa69e9e415905ef32a5) 到你的个人工作区。
2. **公开发布页面 (Publish to web)**：
   - 打开复制后的 Notion 根页面；
   - 点击右上角 **Share (分享)** -> 选择 **Publish (发布)** -> 点击 **Publish to web (发布到网络)**；
   - 确保 **Search engine indexing (搜索引擎索引)** 开启。
3. **获取 NOTION_PAGE_ID**：
   - 复制公开页面的分享链接，提取链接中间的 **连续 32 位字符** 即为你的 `NOTION_PAGE_ID`；
   - 示例：`https://notion.site/02ab3b8678004aa69e9e415905ef32a5?pvs=4` ➜ 页面 ID 为 `02ab3b8678004aa69e9e415905ef32a5`。
   - **注意**：切勿包含 `?v=` 或 `?pvs=4` 及其后面的参数！

---

## 2. 一键 Fork 源码或本地代码推送

### 方式 A：纯网页端一键 Fork（推荐新手）
直接点击 [一键 Fork Notion Repo 仓库](https://github.com/178991907/notion-repo/fork)，将项目复刻到您自己的 GitHub 账号下。

### 方式 B：本地开发与推送（面向开发者）
```bash
# 1. 克隆你的仓库并安装依赖
git clone https://github.com/你的账号/notion-repo.git
cd notion-repo
npm install

# 2. 本地启动开发服务与后台调试
export ADMIN_PASSWORD=你的管理密码
npm run dev

# 3. 提交更改并推送到 GitHub
git add .
git commit -m "feat: custom site setup"
git push origin main
```

---

## 3. Vercel 线上自动化部署 (推荐)

Vercel 是官方推荐的 Serverless 部署平台，支持全球 CDN 加速与自动化 CI/CD。

### 部署步骤：
1. 打开 **[Vercel 官网](https://vercel.com)** 并使用 GitHub 账号登录；
2. 点击右上角 **Add New...** -> 选择 **Project**；
3. 在 GitHub 仓库列表中找到刚才 Fork 的 `notion-repo`，点击 **Import**；
4. **项目基本设置 (Project Settings)**：
   - **Framework Preset**：`Next.js`（默认自动识别）；
   - **Root Directory**：`./`（默认即可）；
   - **⚠️ Node.js Version 避坑重点**：确保选择 **`24.x`**（或 Node 22+），切勿使用旧版 Node！
5. **配置核心环境变量 (Environment Variables) —— 🌟 四大建站基石**：
   在 **Environment Variables** 面板中添加以下 4 个核心关键变量（缺一不可，否则涉及回写与同步会报错）：
   > ⚠️ **核心避坑要点**：
   > - **🔥 生效环境 (Environments) 务必全选**：添加变量时，Environments 展开项中的 **`Production`**、**`Preview`**、**`Development`** 必须全部勾选（All Environments），防止访问 `.vercel.app` 预览域名或分支环境时变量失效；
   > - **🔒 Secret 类型说明**：选择 `Secret` 后系统单向加密不显示 Value 明文（仅显示锁图标），这是正常安全特性，值已存入，切勿误判；
   > - **⚡ 生效必须 Redeploy**：修改或添加变量后，必须前往 **Deployments** 列表对最新记录点击 **`···` ➔ Redeploy** 重新部署才能注入生效！

   - `NOTION_PAGE_ID` = `你的32位Notion页面ID`（必填，文章数据源根页面，生效环境选 All）
   - `ADMIN_PASSWORD` = `你的后台管理密码`（必填，用于登录 `/admin` 控制台，生效环境选 All）
   - `NOTION_ACCESS_TOKEN` = `你的Notion官方集成Token`（核心必填，以 `ntn_` 或 `secret_` 开头，驱动暗号自动生成回写、VIP 属性打标、会员注册与后台数据写回 Notion，生效环境选 All）
   - `NOTION_SYNC_SECRET` = `你的自定义安全私钥`（核心必填，用于保护 Webhook 与 Cron 定时同步，生产环境未配置将直接被安全网关拦截并报错 `403 Forbidden`，生效环境选 All）
   *(注：`NEXT_PUBLIC_THEME` 无需填写，代码底层默认已锁定为您专属打造的 `heo` 主题！)*
6. 点击 **Deploy** 按钮开始构建，大约 1~2 分钟后即可完成部署！

---

## 4. 可视化后台定制与功能开通

部署完成后，在您的域名后追加 `/admin`（如 `https://yourdomain.com/admin`）并输入 `ADMIN_PASSWORD` 登录：

- **🎨 主题可视化配置 (`/admin/settings/theme`)**：在线自由更改网站标题、副标题、博主头像、个人简介、导航条、名片公告与社交链接；一键在英雄区胶囊栏添加【🎁 粉丝福利】与【👑 会员专区】高亮彩色胶囊；
- **👑 会员专区管理 (`/admin/members`)**：支持普通会员 VIP 与高级会员 SVIP 双轨制邀请码生成、核销与账号权限管理；
- **🎁 粉丝专区管理 (`/admin/settings/theme` 粉丝专区 Tab)**：自定义全站默认粉丝暗号、解锁引导提示语，开启 24 小时全站免密畅读特权；
- **📁 分类与标签全量管理 (`/admin/categories`, `/admin/tags`)**：一键重命名、智能分类合并与空标签清理。

---

## 5. 绑定自定义独立域名

1. 在 Vercel 项目控制台进入 **Settings** -> **Domains**；
2. 填入你的独立域名（例如 `blog.yourdomain.com` 或 `yourdomain.com`），点击 **Add**；
3. 根据 Vercel 提示，前往你的域名 DNS 服务商（如 Cloudflare、阿里云、腾讯云、Namecheap 等）添加解析：
   - **二级域名 (CNAME)**：主机记录填 `blog`，记录值填 `cname.vercel-dns.com`
   - **根域名 (A 记录)**：主机记录填 `@`，记录值填 `76.76.21.21`
4. 解析生效后，Vercel 会自动为您签发并续期免费的 HTTPS SSL 证书。

---

## 6. 全量环境变量 (Environment Variables) 说明表

### 🌟 核心必填变量 (四大建站基石，缺一不可)
| 环境变量名 | 申请/获取入口 | 类型 | 示例值 | 详细说明与报错预警 |
| :--- | :--- | :---: | :--- | :--- |
| **`NOTION_PAGE_ID`** | [您的 Notion 页面](#-四大核心环境变量获取与申请直达指引) | 字符串 | `02ab3b8678004aa69e...` | **必填**。Notion 根页面 ID，站点的文章数据源。不填无法读取数据。 |
| **`ADMIN_PASSWORD`** | [自行设定](#-四大核心环境变量获取与申请直达指引) | 字符串 | `MySecurePass_2026` | **必填**。管理后台 (`/admin`) 登录密码。不填无法管理站点。 |
| **`NOTION_ACCESS_TOKEN`**<br>*(或 `NOTION_API_TOKEN`)* | [Notion 官方集成中心](#-四大核心环境变量获取与申请直达指引) | 字符串 | `ntn_xxxx...` 或 `secret_...` | **核心必填**。官方 Notion 内部集成 Token（永不过期），用于粉丝暗号自动生成回写、VIP 属性联动、会员注册激活码核销、后台设置写回 Notion。**不配置将导致涉及 Notion 写操作的所有功能直接报错崩溃！** |
| **`NOTION_SYNC_SECRET`** | [自行设定](#-四大核心环境变量获取与申请直达指引) | 字符串 | 自定义随机高强度密钥 | **核心必填**。云端安全通信密钥，保护 Webhook 实时触发与 Cron 定时同步。**生产环境若未配置，外部触发同步时接口直接被安全机制拦截并报 `403 Forbidden`！** |

#### 🧭 四大核心环境变量获取与申请直达指引

1. **`NOTION_PAGE_ID`（数据源页面 ID）**：
   - **获取入口**：打开复制到您个人账号下的 Notion 博客根页面；
   - **提取方法**：在页面右上角点击 **Share** ➔ **Publish** 开启网络发布，点击 **Copy link**。链接形如 `https://www.notion.so/xxx/02ab3b8678004aa69e89...?v=...`，提取中间纯 **32 位字母数字** 字符串（不要带问号及后续参数）。
2. **`ADMIN_PASSWORD`（后台管理密码）**：
   - **获取入口**：无需向第三方申请，由您自行设定。
   - **操作建议**：自定义一个高强度密码（如 `Admin_Pass2026!`），用于登录 `https://你的域名/admin` 控制台。
3. **`NOTION_ACCESS_TOKEN`（官方内部集成 Token，永久有效）**：
   - **申请直达链接**：👉 **[https://www.notion.so/profile/integrations](https://www.notion.so/profile/integrations)** *(备用：[https://www.notion.so/my-integrations](https://www.notion.so/my-integrations))*；
   - **申请步骤**：
     1. 点击 **「+ New integration」**（新建集成）；
     2. Name 填 `Notion-Repo`（或任意名称，记好这个名称），工作区选择您当前工作区，Type 保持 **Internal**（内部集成）；
     3. 权限保持默认全选（Read/Update/Insert），点击 **Save**；
     4. 复制展示的 **Internal Integration Secret**（以 `secret_` 或 `ntn_` 开头），**此 Token 永久有效、永不过期**；
     5. **🔥 关键授权步骤（仅需 5 秒，解决评论、分类与会员库访问权限）**：
        - 打开您的 Notion 博客主页面（即 `NOTION_PAGE_ID` 对应的页面）；
        - 点击右上角的三个点 **`···`** 展开设置菜单；
        - 下滑找到 **`品 集成`**（英文版界面为 `Connect to`）；
        - 点击 **`+ 添加连接`**，直接点击您刚刚创建的名称（例如 **`Notion-Repo`**）；
        - 在弹出的窗口中点击蓝色的 **「添加到页面」** 即可！
        
        ![Notion 页面添加连接授权指引](/images/notion-connect-guide.png)
4. **`NOTION_SYNC_SECRET`（同步安全私钥）**：
   - **获取入口**：无需向第三方申请，由您自行定义的一串随机字符串（如 `sec_sync_notion_888`）。
   - **核心作用**：保护 `/api/sync` 同步端点，防止未授权恶意刷爆调用配额。

### 企业级进阶安全变量 (按需选配)
| 环境变量名 | 申请/获取入口 | 默认值 | 示例值 | 详细说明 |
| :--- | :--- | :---: | :--- | :--- |
| **`ADMIN_SECRET`** | 自行设定 | 动态派生 | 任意高强度私钥 | 后台 Edge Runtime HMAC-SHA256 JWT 独立签发密钥，未配置将自动优雅派生。 |
| **`MEMBER_AUTH_SECRET`** | 自行设定 | 动态派生 | 任意高强度私钥 | 会员登录态 JWT 独立签发密钥，杜绝会员凭证伪造与越权。 |
| **`CRON_SECRET`** | 自行设定 | 与 SYNC_SECRET 一致 | 自定义随机密钥 | Vercel Cron 定时同步专用数字签名秘钥，可直接复用 `NOTION_SYNC_SECRET`。 |
| **`FANS_CODE_SECRET`** | 自行设定 | 动态派生 | 自定义随机密钥 | 粉丝专属暗号 HMAC 计算密钥，彻底杜绝专属码被逆推预测。 |
| **`COMMENT_GITALK_CLIENT_SECRET`** | [GitHub OAuth Apps 申请入口](https://github.com/settings/applications/new) | - | `ghs_xxxx...` | GitHub OAuth App 客户端私钥（纯后端代理端点使用，绝不在客户端暴露）。申请时填写主页 URL 与 Callback 即可。 |


### 核心功能与外观变量
| 环境变量名 | 默认值 | 可选值 | 详细说明 |
| :--- | :---: | :--- | :--- |
| **`NEXT_PUBLIC_THEME`** | `heo` (代码默认) | 选填（留空即可） | **无需配置**！项目底层默认已锁定为您专属打造的旗舰主题 `heo`。仅在需要切换使用原作者传统主题（如 simple, hexo, gitbook）时才填入。 |
| **`NEXT_PUBLIC_LANG`** | `zh-CN` | `zh-CN`, `en-US`, `zh-HK`, `zh-TW`, `ja-JP` | 站点默认语言。 |
| **`NEXT_PUBLIC_APPEARANCE`** | `auto` | `light`, `dark`, `auto` | 默认外观颜色模式。 |
| **`NEXT_REVALIDATE_SECOND`** | `5` | 数字 (秒) | 增量静态生成 (ISR) 刷新周期，Notion 内容变更后几秒重新拉取。 |
| **`NEXT_PUBLIC_CUSTOM_MENU`** | `true` | `true`, `false` | 是否开启自定义多级菜单能力。 |

### 粉丝福利与会员专区环境变量
| 环境变量名 | 默认值 | 示例值 | 详细说明 |
| :--- | :---: | :--- | :--- |
| **`HEO_FANS_DEFAULT_PASSCODE`** | `888888` | `666888` | 全站粉丝通用解锁暗号。 |
| **`HEO_FANS_UNLOCK_TIPS`** | 默认引导文案 | `关注微信公众号【xxx】后台回复暗号获取` | 粉丝文章上锁时的解锁引导文案。 |
| **`NOTION_API_TOKEN`** | - | `ntn_xxxx...` | 官方 Notion 集成 Token，用于会员密码同步与粉丝专属码云端写入。 |

---

## 7. 常见部署问题排查 (FAQ)

### Q1: Vercel 部署报错 `Error: Node.js version is not supported` 或依赖安装失败？
- **根因**：使用了旧版 Node 运行环境。
- **解决方案**：进入 Vercel 项目控制台 ➔ **Settings** ➔ **General** ➔ 找到 **Node.js Version** ➔ 切换为 **`24.x`**（或 22.x）➔ 返回 Deployments 页面点击 **Redeploy** 重新部署即可。

### Q2: 部署完成后打开网站提示错误，或者页面一片空白？
- **排查项 1**：检查 Notion 根页面是否真正开启了 **Publish to web**（请使用无痕浏览器窗口打开分享链接，确认游客可以正常浏览）；
- **排查项 2**：检查环境变量中的 `NOTION_PAGE_ID` 是否严格为 32 位字符串，是否不小心复制了问号及其后面的参数（如 `?pvs=4`）；
- **排查项 3**：修改环境变量后，必须触发一次 **Redeploy** 才能让新变量生效。

### Q3: 在 Notion 中修改或发布了新文章，博客什么时候会同步？
- Notion Repo 采用现代增量静态再生（ISR）技术，具有极速访问性能。
- 默认情况下，访客访问页面时会在后台静默抓取最新 Notion 内容，通常**等待几十秒到一分钟**再次刷新页面即可看到最新文章；
- 若您希望立即刷新，可登录 `/admin` 管理后台，点击任意保存配置，系统会自动触发全站缓存清空与即时更新。

### Q4: 别人 Fork 本项目后部署，会出现 Bug 或语法错误吗？
- **完全不会！已实现开箱即用零 Bug 目标**：
  - 本项目已通过全面的企业级安全审计与 20 项端到端安全测试回归（`npm test __tests__/security/`），修补了 26 项历史漏洞；
  - 依赖已在 `package.json` 中固化声明（包含 `bcryptjs`、`isomorphic-dompurify`），新用户 Fork 之后只需在 Vercel 中一次性填入四大核心环境变量（`NOTION_PAGE_ID`、`ADMIN_PASSWORD`、`NOTION_ACCESS_TOKEN`、`NOTION_SYNC_SECRET`），无需二次安装或手动补充包体，全站 100% 顺畅构建运行！

### Q5: 老用户升级 v4.21.0 后，原数据库里的会员密码需要重置吗？
- **完全不需要**：
  - 系统搭载了**旧密码登录静默自愈引擎 (Auto-Upgrade)**；
  - 历史会员账号输入原密码登录成功瞬间，后台会自动将其密码升级为现代强单向加盐 `bcrypt` 哈希，并秒级写回 Notion 数据库，无需站长参与，平滑无感升级。

### Q6: Gitalk 评论客户端密钥移出前端后如何配置？
- 过去将 Client Secret 暴露在前端存在 OAuth 被盗用的高危漏洞。
- 最新版内置了专用安全后端代理路由 `/api/proxy/gitalk-token`；
- 您只需在环境变量或 Notion Config 中配置 `COMMENT_GITALK_CLIENT_SECRET`，前端将自动向同源后端发起请求换取 Token，实现完全安全的评论互动。

### Q7: 为什么在 Vercel 配置了环境变量，后台仍提示未配置或保存无反应？
- **排查环境生效范围**：进入 Vercel 项目 **Settings ➔ Environment Variables**，点击每个变量的 `···` ➔ **Edit**，确保 **Environments** 勾选了 **All Environments**（即 `Production`、`Preview`、`Development` 全部勾选）。很多时候访问默认的 `.vercel.app` 域名被划分为 Preview，若只勾选 Production，运行时变量直接为 `undefined`！
- **排查是否重新部署（Redeploy）**：Vercel 添加或修改环境变量后**绝不会自动热生效**！必须前往 **Deployments** 列表，在最新部署记录右侧点击 **`···` ➔ Redeploy**，新变量才会被注入容器。
- **关于 Secret 锁图标**：Vercel 显示锁图标且不显示明文是单向加密安全机制（提示 *You can't reveal this value after saving*），绝不代表值是空的，不要删除重复填写。
