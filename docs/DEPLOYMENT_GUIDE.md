# NotionNext Pro 项目部署与环境变量使用指南

本文档提供详细的从零到一上线部署流程（以 Vercel 为例）以及全量环境变量的配置说明。

---

## 目录
1. [前期准备 (Notion 数据库配置)](#1-前期准备-notion-数据库配置)
2. [本地验证与代码提交](#2-本地验证与代码提交)
3. [Vercel 线上自动化部署 (推荐)](#3-vercel-线上自动化部署-推荐)
4. [绑定自定义独立域名](#4-绑定自定义独立域名)
5. [全量环境变量 (Environment Variables) 说明表](#5-全量环境变量-environment-variables-说明表)
6. [常见部署问题排查 (FAQ)](#6-常见部署问题排查-faq)

---

## 1. 前期准备 (Notion 数据库配置)

1. **复制 Notion 模板**：
   - 将 NotionNext 官方模板复制（Duplicate）到你的 Notion 个人工作区。
2. **公开发布页面 (Publish to web)**：
   - 打开复制后的 Notion 根页面；
   - 点击右上角 **Share (分享)** -> 选择 **Publish (发布)** -> 点击 **Publish to web (发布到网络)**；
   - 确保 **Search engine indexing (搜索引擎索引)** 开启。
3. **获取 NOTION_PAGE_ID**：
   - 复制公开页面的分享链接，链接末尾的 32 位字符即为你的 `NOTION_PAGE_ID`。
   - 示例：`https://notion.so/yourname/67e2xxxxxxx146xxxxxx8714` ➜ `67e2xxxxxxx146xxxxxx8714`

---

## 2. 本地验证与代码提交

在本地终端中确认项目运行正常后，将代码推送到你的 GitHub 仓库：

```bash
# 1. 检查本地开发服务与管理后台
ADMIN_PASSWORD=123456 npm run dev

# 2. 提交所有配置与代码
git add .
git commit -m "feat: complete admin console & heo theme setup"

# 3. 推送到你的 GitHub 仓库
git push origin main
```

---

## 3. Vercel 线上自动化部署 (推荐)

Vercel 是官方推荐的 Serverless 部署平台，支持全球 CDN 加速与自动化 CI/CD。

### 部署步骤：
1. 打开 **[Vercel 官网](https://vercel.com)** 并使用 GitHub 账号登录；
2. 点击右上角 **Add New...** -> 选择 **Project**；
3. 在 GitHub 仓库列表中找到你刚才推送的仓库，点击 **Import**；
4. **项目基本设置 (Project Settings)**：
   - **Framework Preset**：`Next.js`（默认自动识别）
   - **Root Directory**：`./`（默认即可）
   - **Node.js Version**：进入 Settings -> General 确保选择 **`24.x`**（推荐 Node 24，兼容 Node 22+）
5. **配置环境变量 (Environment Variables)**：
   在 **Environment Variables** 折叠面板中添加以下核心环境变量：
   - `NOTION_PAGE_ID` = `你的32位Notion页面ID`
   - `ADMIN_PASSWORD` = `你的后台管理密码` (用于登录 /admin)
   - `NEXT_PUBLIC_THEME` = `heo` (推荐主题)
6. 点击 **Deploy** 按钮开始构建，大约 1~2 分钟后即可完成部署！

---

## 4. 绑定自定义独立域名

1. 在 Vercel 项目控制台进入 **Settings** -> **Domains**；
2. 填入你的独立域名（例如 `blog.yourdomain.com` 或 `yourdomain.com`），点击 **Add**；
3. 根据 Vercel 提示，前往你的域名 DNS 服务商（如 Cloudflare、阿里云、腾讯云、Namecheap 等）添加解析：
   - **二级域名 (CNAME)**：主机记录填 `blog`，记录值填 `cname.vercel-dns.com`
   - **根域名 (A 记录)**：主机记录填 `@`，记录值填 `76.76.21.21`
4. 解析生效后，Vercel 会自动为你签发并续期免费的 HTTPS SSL 证书。

---

## 5. 全量环境变量 (Environment Variables) 说明表

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

### 评论系统环境变量 (按需配置)
| 环境变量名 | 示例值 | 说明 |
| :--- | :--- | :--- |
| **`NEXT_PUBLIC_COMMENT_TWIKOO_ENV_ID`** | `https://your-twikoo.vercel.app` | Twikoo 评论环境地址。 |
| **`NEXT_PUBLIC_GISCUS_REPO`** | `yourname/blog-comments` | Giscus 绑定的 GitHub 仓库。 |
| **`NEXT_PUBLIC_GISCUS_REPO_ID`** | `R_kgDOG...` | Giscus 仓库 ID。 |
| **`NEXT_PUBLIC_GISCUS_CATEGORY_ID`** | `DIC_kwDOG...` | Giscus Discussion 讨论分区 ID。 |
| **`NEXT_PUBLIC_WALINE_SERVER_URL`** | `https://waline.yourdomain.com` | Waline 评论服务端地址。 |

### 数据统计与分析环境变量 (按需配置)
| 环境变量名 | 示例值 | 说明 |
| :--- | :--- | :--- |
| **`NEXT_PUBLIC_ANALYTICS_GOOGLE_ID`** | `G-XXXXXXXXXX` | Google Analytics 4 计量 ID。 |
| **`NEXT_PUBLIC_ANALYTICS_BAIDU_ID`** | `3f8a0e...` | 百度统计 Token。 |
| **`NEXT_PUBLIC_ANALYTICS_BUSUANZI_ENABLE`** | `true` | 是否开启不蒜子访问量/访客数统计。 |

---

## 6. 常见部署问题排查 (FAQ)

#### Q1: Vercel / 平台构建报错 `@ai-sdk/google requires Node.js >= 22`？
- **解决办法**：进入 Vercel 项目控制台 -> **Settings** -> **General** -> 找到 **Node.js Version**，将其修改为 **`24.x`**（或 Node 22+），然后点击 **Redeploy** 重新部署即可。

#### Q2: 部署后页面显示白屏或提示 Page Not Found？
- **解决办法**：
  1. 检查 `NOTION_PAGE_ID` 是否正确（32 位无空格字符串）；
  2. 确认 Notion 页面已开启 **Share -> Publish -> Publish to web**；
  3. 确认 Notion 模板页面的结构未被误删核心字段（如 `type`, `status`, `title`, `slug`）。

#### Q3: 管理后台保存配置后，线上前台没有立即刷新？
- **解决办法**：
  1. 后台保存后系统会自动触发首页 ISR 刷新；
  2. 若在生产环境启用了强缓存 CDN，可在后台点击「清除缓存」或等待几秒后按 `Ctrl + F5` (Mac: `Cmd + Shift + R`) 强制刷新浏览器。
