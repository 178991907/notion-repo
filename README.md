<div align="center">

<img src="https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png" width="96" height="96" alt="Notion Repo Logo" style="border-radius: 50%;" />

# Notion Repo

### 用 Notion 打造专属高端独立站 · 全新可视化管理后台与深度主题定制

继续在 Notion 沉浸写作，一键发布为顶尖独立博客、作品集、知识库或产品官网。

<p>
  <a href="https://terry.yyqm.de5.net/">🌐 正式线上站点</a>
  ·
  <a href="https://terry.yyqm.de5.net/admin">🎛️ 在线管理后台</a>
  ·
  <a href="https://terry.yyqm.de5.net/admin/settings/theme">🎨 主题可视化配置</a>
  ·
  <a href="https://github.com/178991907/notion-repo">💻 GitHub 仓库</a>
</p>

<p>
  <img src="https://img.shields.io/badge/Version-v4.12.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4+-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Admin_Console-Enabled-success?style=for-the-badge" alt="Admin Console" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

</div>

---

## 🌟 核心特性与架构亮点 (v4.12.0)

本项目深度研发并集成了 **全功能可视化管理后台** 与 **高自由度主题深度定制体系**，所有配置支持在后台可视化编辑并永久固化保存：

### 1. 🎛️ 全功能可视化管理后台 (`/admin`)
- **安全鉴权系统**：基于轻量级 HMAC-SHA256 Token 与环境变量 `ADMIN_PASSWORD` 认证，具备防暴力破解速率限制。
- **全维度主题可视化编辑器 (`/admin/settings/theme`)**：
  - 🧭 **顶栏导航**：9 大内置功能菜单开关、Notion 页面显隐控制、自定义导航菜单列表（增删改与上下排序）、Logo 悬停高清大图浮窗。
  - 🚀 **英雄区 (Hero)**：大标题打字机动效、右侧精选分类卡片组、专属浮动技能图标群。
  - 👤 **侧边栏名片卡**：站长昵称 (`AUTHOR`) 与个人简介 (`BIO`) 直接可视化编辑、大头像尺寸调节、欢迎语轮播、富文本名片公告。
  - 📢 **首页顶部滚动通知横幅 (此刻 / NoticeBar)**：全链路变量动态驱动、1:1 动态实时轮播预览、自定义左侧徽标（如 `此刻` / `公告` / `NEWS`）、多条通知定时向上平滑滚动。
  - 🎨 **配色与风格**：主题主色调、强调色、背景渐变、卡片毛玻璃质感、圆角弧度自由微调。
  - 🐾 **挂件与宠物**：Live2D 萌宠模型深度定制、形象与模型预设精准映射。
  - 📑 **页脚与备案**：Powered By 自定义、建站年份、ICP 备案号与公安备案号。
- **👁️ 1:1 动态视觉实时预览**：后台内嵌与前台完全一致的实时渲染预览组件，打字即时更新，所见即所得。
- **⚡ 双向高可用数据流**：后台一键保存秒级写入 Notion 数据库的 `CONFIG-TABLE`，并自动触发全站 ISR 缓存刷新。

---

### 2. 📢 首页顶部滚动通知横幅（此刻 / NoticeBar）
- **全动态变量驱动**：彻底消除硬编码，左侧徽标文案（`HEO_NOTICE_BAR_BADGE`）与多条通知内容全链路响应 Notion 数据库与管理后台变量。
- **平滑向上垂直轮播**：每 3 秒平滑滚动切换一条通知，支持单独配置点击跳转链接（站内文章或外部网址）。
- **总开关与自由排版**：一键开启/隐藏整个通知横幅卡片。

---

### 3. 🎨 英雄区背景浮动技能图标群 (`HEO_GROUP_ICONS`)
- **动态斜向无限漂浮**：大卡片右上角斜向无限流动的精美技能/工具图标对（每组包含上下两个图标）。
- **专属 AI 图标预设**：ChatGPT、DeepSeek、Gemini、Grok、Notion、Claude、Kimi、豆包等专属 AI 浮动图标群。
- **可视化增删改与调色盘**：支持自由添加新图标、拖拽排序、自定义独立背景底色与图标图片 URL。

---

### 4. 💳 名片富文本公告与排版引擎
- **全能富文本排版**：支持 Markdown 格式、Emoji 表情、单行/多行文本、居中对齐、行首空格精准缩进（`whitespace-pre-wrap`）。
- **图片与超链接混排**：支持在公告中插入单张或多张图片，以及任意多个带描述的独立超链接 `[链接描述](URL)`。
- **快捷插入工具条**：后台提供超链接、图片、加粗、Emoji 的一键快捷插入按钮与 1:1 实时渲染卡片。

---

### 5. 🐾 Live2D 桌面萌宠挂件全套修复
- **形象与模型精准映射**：彻底校准 Z16 舰娘水手服萝莉、黑猫、和服少女、药齐、小埋等 Live2D 模型。
- **高度比例自由调整**：支持根据模型比例自适应调整显示高度（推荐 340~380px）。
- **点击交互联动**：支持配置点击宠物后的跳转页面或纯互动模式。

---

### 6. 🛡️ 全量配置深度物理固化（防丢配置）
- 站点主域名、标题、作者、简介、年份、主题、名片卡、AI 图标群及通知条已深度固化至 `blog.config.js`、`themes/heo/config.js` 与 `lib/adminConfigOverrides.json`。
- 无论何时拉取代码、重新部署或冷启动，均默认加载站长专属配置，彻底无需手动重复填写。

---

## 🔄 双向配置数据流架构

```text
┌──────────────────────────────────────────────────────────┐
│              🎛️ 可视化管理后台 (/admin)                     │
│    (基础设置、主题配色、英雄区大卡、名片公告、NoticeBar、Live2D)    │
└────────────────────────────┬─────────────────────────────┘
                             │ POST /api/admin/config
                             ▼
┌──────────────────────────────────────────────────────────┐
│              ⚡ 配置中心与全栈持久化引擎                     │
│  ├─ 1. Notion 数据库 (CONFIG-TABLE 表高并发写入)           │
│  ├─ 2. 本地静态固化层 (adminConfigOverrides.json 物理备份) │
│  └─ 3. Next.js 生产环境 (自动触发 res.revalidate('/'))     │
└────────────────────────────┬─────────────────────────────┘
                             │ 优先读取 NOTION_CONFIG 动态变量
                             ▼
┌──────────────────────────────────────────────────────────┐
│              🌐 前台博客页面 (Heo / 全主题响应)             │
│    (毫秒级响应管理员最新修改，彻底消除硬编码，永久固化防丢)        │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 快速上手与本地开发

### 1. 环境要求
- **Node.js**：Node 24（推荐使用 `nvm`）
- **包管理器**：Yarn 或 npm
- **管理后台环境依赖**：支持通过 `ADMIN_PASSWORD` 环境变量设置登录密码

### 2. 本地启动

```bash
# 1. 克隆仓库
git clone https://github.com/178991907/notion-repo.git
cd notion-repo

# 2. 安装依赖
npm install

# 3. 设置后台管理密码并启动开发服务
export ADMIN_PASSWORD=你的后台登录密码
npm run dev
```

启动完成后：
- **前台博客首页**：访问 [http://localhost:3000](http://localhost:3000)
- **可视化管理后台**：访问 [http://localhost:3000/admin](http://localhost:3000/admin)（输入你设置的密码登录）
- **主题可视化定制面板**：访问 [http://localhost:3000/admin/settings/theme](http://localhost:3000/admin/settings/theme)

---

## 📦 生产部署指南 (Vercel)

1. **Fork 本仓库** 到你的 GitHub 账号（或直接使用当前仓库 `178991907/notion-repo`）；
2. 在 **[Vercel](https://vercel.com)** 中点击 **Add New Project** 导入该仓库；
3. **设置 Node.js 版本**：在 Project Settings 中将 Node.js Version 设为 **`24.x`**（或 Node 22+）；
4. 在 **Environment Variables (环境变量)** 中配置核心变量：
   - `NOTION_PAGE_ID`：你的 Notion 根页面 ID
   - `NOTION_ACCESS_TOKEN`：你的 Notion 集成 Token
   - `ADMIN_PASSWORD`：你的后台管理密码（例如 `123456`）
   - `NEXT_PUBLIC_THEME`：默认主题（推荐 `heo`）
5. 点击 **Deploy** 部署上线；
6. 部署成功后，直接访问 `https://你的域名/admin` 即可随时在线可视化修改博客全部外观与功能！

---

## 🛠️ 核心目录结构

```text
├── blog.config.js               # 站点全局默认配置文件
├── conf/                        # 分类功能配置文件 (comment, widget, code 等)
├── lib/
│   ├── admin/                   # 管理后台鉴权与配置字典
│   ├── adminConfigOverrides.json# 后台可视化配置物理固化备份
│   ├── config.js                # 全栈配置解析引擎 (支持后台与 Notion 动态覆盖)
│   └── db/notion/               # Notion 数据库通信与 CONFIG-TABLE 解析
├── pages/
│   ├── admin/                   # 管理后台页面 (仪表盘、基础设置、主题可视化)
│   │   └── settings/theme.js    # 主题全维度可视化编辑器
│   ├── api/admin/               # 后台管理 API (auth, config 读写持久化)
│   └── ...                      # 前台路由与文章渲染
└── themes/
    └── heo/                     # Heo 主题源码
        ├── components/          # 主题组件 (Logo, Header, MenuList, NoticeBar, InfoCard 等)
        └── config.js            # Heo 主题专属配置项
```

---

## 📄 开源协议与鸣谢

本项目基于 MIT 协议开源。感谢 [NotionNext](https://github.com/notionnext-org/NotionNext) 社区与所有开源贡献者的付出！

---

<div align="center">
  <b>Designed with ❤️ by Terry 校长</b>
</div>

- 本项目基于 [MIT License](./LICENSE) 开源；
- 感谢 [NotionNext 官方团队与开源社区](https://github.com/notionnext-org/NotionNext)。
