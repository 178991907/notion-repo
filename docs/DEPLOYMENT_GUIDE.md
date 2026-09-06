# Notion Repo 项目部署与环境变量完全指南

本文档提供详细的从零到一上线部署流程（以 Vercel 为例）以及全量环境变量的配置说明。

> 📖 **面向小白用户的保姆级图文教程**：请参阅 [docs/user-guide/deploy-vercel.md](./user-guide/deploy-vercel.md)  
> 💻 **源码仓库**：[https://github.com/178991907/notion-repo](https://github.com/178991907/notion-repo)  
> 🌐 **线上演示站点**：[https://terry.yyqm.de5.net/](https://terry.yyqm.de5.net/)  
> 🎛️ **在线管理后台演示**：[https://terry.yyqm.de5.net/admin](https://terry.yyqm.de5.net/admin)

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
5. **配置核心环境变量 (Environment Variables)**：
   在 **Environment Variables** 面板中添加以下关键变量：
   - `NOTION_PAGE_ID` = `你的32位Notion页面ID`（必填）
   - `ADMIN_PASSWORD` = `你的后台管理密码`（必填，用于登录 /admin）
   - `NEXT_PUBLIC_THEME` = `heo`（推荐，默认旗舰主题）
   - `NOTION_ACCESS_TOKEN` = `你的Notion官方集成Token`（选填，推荐）
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

### 核心必填变量
| 环境变量名 | 类型 | 示例值 | 详细说明 |
| :--- | :---: | :--- | :--- |
| **`NOTION_PAGE_ID`** | 字符串 | `02ab3b8678004aa69e...` | **必填**。Notion 根页面 ID，站点的文章数据源。 |
| **`ADMIN_PASSWORD`** | 字符串 | `MySecurePass_2026` | **必填**。管理后台 (`/admin`) 登录密码。 |

### 核心功能与外观变量
| 环境变量名 | 默认值 | 可选值 | 详细说明 |
| :--- | :---: | :--- | :--- |
| **`NEXT_PUBLIC_THEME`** | `heo` | `heo`, `hexo`, `simple`, `gitbook`, `nobelium` 等 | 全站默认主题。 |
| **`NEXT_PUBLIC_LANG`** | `zh-CN` | `zh-CN`, `en-US`, `zh-HK`, `zh-TW`, `ja-JP` | 站点默认语言。 |
| **`NEXT_PUBLIC_APPEARANCE`** | `auto` | `light`, `dark`, `auto` | 默认外观颜色模式。 |
| **`NEXT_REVALIDATE_SECOND`** | `5` | 数字 (秒) | 增量静态生成 (ISR) 刷新周期，Notion 内容变更后几秒重新拉取。 |
| **`ADMIN_SECRET`** | 自动派生 | 任意强字符串 | 后台 JWT 签发密钥，若不填写则根据管理密码自动生成。 |
| **`NEXT_PUBLIC_CUSTOM_MENU`** | `true` | `true`, `false` | 是否开启自定义多级菜单能力。 |

### 粉丝福利与会员专区环境变量
| 环境变量名 | 默认值 | 示例值 | 详细说明 |
| :--- | :---: | :--- | :--- |
| **`HEO_FANS_DEFAULT_PASSCODE`** | `888888` | `666888` | 全站粉丝通用解锁暗号。 |
| **`HEO_FANS_UNLOCK_TIPS`** | 默认引导文案 | `关注微信公众号【xxx】后台回复暗号获取` | 粉丝文章上锁时的解锁引导文案。 |
| **`NOTION_ACCESS_TOKEN`** | - | `secret_xxxx...` | 官方 Notion 集成 Token，用于会员与粉丝高可用双向同步。 |

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
