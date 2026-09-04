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
  <img src="https://img.shields.io/badge/Version-v4.15.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4+-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Admin_Console-Enabled-success?style=for-the-badge" alt="Admin Console" />
  <img src="https://img.shields.io/badge/Membership_System-Active-gold?style=for-the-badge" alt="Membership System" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

</div>

---

## 🌟 核心特性与架构亮点 (v4.15.0 重磅发布)

本项目深度研发并集成了 **全功能可视化管理后台**、**双轨制会员多等级系统**、**粉丝免登录暗号专区**、**分类/标签深度双向管理系统** 与 **高自适应排版视觉体系**：

### 1. 👑 会员分级鉴权与邀请码后台管理中心 (`/admin/members`)
- **双轨制会员权限控制（VIP / SVIP）**：全面打通普通会员（VIP）与尊享高级会员（SVIP）的分级内容访问控制，高级会员向下兼容阅读全部 VIP 内容。
- **高可用邀请码核销与分发引擎**：
  - **一人一码模式**：单码核销即作废，具备防重放并发锁保护；
  - **全站固定通用码模式**：多人通用，实时记录核销次数；
  - 支持后台批量创建、一键停用/启用、复制直链、账号手动延期与开通。
- **30天持久免密登录**：基于安全 HMAC-SHA256 Token 与安全 HttpOnly Cookie，用户登录后全站免密畅读 30 天，绝无需每篇重复验证。
- **会员免码直通特权**：已登录合格会员直接视为自动解锁全站粉丝专区文章，尊享免码直读特权。

---

### 2. 🎁 粉丝专区免登录访问码与双轨互通机制 (`/fans`)
- **多暗号灵活绑定（Multi-select）**：文章支持绑定多个暗号标签（如 `8888, 6666`），读者输入其中任意一个正确暗号即可瞬间解锁。
- **暗号与会员双轨放行**：文章同时标记粉丝专享与 VIP 时，未登录读者输入暗号即可阅读，已登录会员免码一键直达，互通引导友好无阻。
- **访问码本地安全缓存**：读者验证成功后自动在本地浏览器加密记录，有效期内无需反复输入。

---

### 3. 🎨 封面自适应防裁切排版与 16:9 超清标准 Logo 资产
- **角标层级防护置顶（`z-30`）**：彻底解决封面图层覆盖角标问题，粉丝专享与 VIP 专享角标无论在何种终端均清爽置顶悬浮。
- **推荐卡片与缩略图饱满充满（`object-cover`）**：彻底消除英雄区推荐卡片（TopGroup）与侧边栏推荐阅读缩略图左右多余的尴尬空白，恢复饱满大气的现代视觉质感。
- **重构 16:9 超清黄金比例封面（`1200 × 675 px`）**：
  - 精准消除实心纯白底板，无损保留主体原本自带的白色立体发光描边与平滑抗锯齿边缘；
  - 主体内容等比微缩至 83.3%（宽 1000px），视觉面积提升 30%，四周各预留 100~133px 充裕安全边距；
  - 左上角空出 160×157px 避让区，与角标实现 **0 像素重叠完美错落**，杜绝削顶切星。
- **Notion 模板全量自动同步**：现有文章及 Notion“Article Template”文章模板已全部通过官方 API 自动同步绑定最新版标准封面直链。

---

### 4. 🖼️ 英雄区右侧推荐大卡封面可视化与双驱动引擎
- **后台一键自定义封面 URL (`HEO_HERO_RECOMMEND_COVER`)**：在 `/admin/settings/theme` ->「英雄区」直接粘贴任意图床海报链接，并支持**实时缩略图即时预览**。
- **智能双驱动与自动回退机制**：当后台配置了图片 URL 时优先渲染自定义海报；留空时自动无缝回退至 Notion 根主页面顶部的封面大图（`siteInfo.pageCover`），兼具极高自由度与原生便捷度。
- **高清自适应海报排版**：支持 **2:1 (1200×600 px)** 与 **16:9 (1920×1080 px)** 宽幅高清海报，智能居中裁切并叠加渐变暗光，完美烘托推荐文章标题。

---

### 2. 📁 Category（分类）可视化编辑管理 (`/admin/categories`)
- **📊 实时分类总览与文章透视**：实时聚合 Notion 数据库中的全部已注册分类，展示各分类下的文章总数，支持点击即时展开文章明细（标题、发布日期、Slug 与前台直达链接）。
- **✏️ 一键批量重命名 (Rename)**：后台输入新分类名称，自动并发更新 Notion 数据库中所有对应文章的 `category` 属性，并智能更新 Schema Options。
- **🔀 智能分类合并 (Merge)**：将源分类下的所有文章一键迁移到目标分类，并自动注销旧分类。
- **🗑️ 彻底删除与未分类管理**：支持一键清空/转移分类文章并从 Notion Schema 中注销该分类；专设未分类文章看板，支持下拉框一键分配。
- **🧹 一键清理空分类**：自动检测并一键清理 0 篇文章引用的废弃 Schema 分类选项。

---

### 3. 🏷️ Tags（标签）全景云与批量打标管理 (`/admin/tags`)
- **🎨 Notion 原生多彩 Badge 全景云**：完美还原 Notion 的彩色胶囊（红色、橙色、黄色、绿色、蓝色、紫色、粉色等），实时统计每个标签的文章引用数。
- **➕ 新建标签**：支持在后台直接创建新标签并选择 Notion 原生色彩预设。
- **✏️ 一键批量重命名**：例如一键将 `NotionNext` 标签更名为 `Notion Repo`，自动遍历替换所有关联文章的多选标签数组。
- **🔀 多选批量合并**：勾选任意多个相近标签，一键合并为一个统称标签。
- **⚡ 批量文章打标**：可视化勾选多篇文章，一键批量追加或移除指定标签。
- **🧹 一键清理空标签**：自动检测并一键注销 0 篇文章引用的废弃 Schema 标签。

---

### 4. 🎛️ 全功能可视化管理后台 (`/admin`)
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

### 7. 💓 全自动 MongoDB 数据库防休眠保活守护程序
- **GitHub Actions 云端定时心跳**：每天（北京时间 10:00）自动在 GitHub 云端执行 Ping 连接与数据读写，彻底防止 MongoDB Atlas 免费集群因 60 天闲置而自动休眠（`Paused`）。
- **TTL 索引与自动清理**：内置 24 小时 TTL 物理自毁索引，心跳数据即写即清，保持数据库 100% 纯净无残留。
- **零本地开机**：完全无需本地电脑运行，GitHub 云端终身免费自动化守护。

---

### 8. 💬 Twikoo 评论互动与社区管理中心
- **单项目内置引擎**：基于 Next.js API 路由无缝驱动，零跨域、零多余域名配置。
- **开箱即用互动**：读者可直接在文章底部发表评论、表情包互动与点赞；站长可在前台一键登录管理后台审核与回复。

---

## 🔄 双向配置与保活数据流架构

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
                             ▲
                             │ 每天 10:00 自动心跳握手与数据清理
┌────────────────────────────┴─────────────────────────────┐
│          💓 GitHub Actions 每日自动化保活守护体系           │
│    (MongoDB Atlas 数据库永不休眠，零本地开机，终身稳定在线)  │
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
├── .github/workflows/           # GitHub Actions 自动化工作流 (每日 MongoDB 防休眠保活)
├── blog.config.js               # 站点全局默认配置文件
├── conf/                        # 分类功能配置文件 (comment, widget, code 等)
├── lib/
│   ├── admin/                   # 管理后台鉴权与配置字典
│   ├── fans/                    # 粉丝专区验证码鉴权引擎
│   ├── member/                  # 会员系统认证、Token 与 Notion 数据库驱动
│   ├── config.js                # 全栈配置解析引擎 (支持后台与 Notion 动态覆盖)
│   └── db/notion/               # Notion 数据库通信与 CONFIG-TABLE 解析
├── pages/
│   ├── admin/                   # 管理后台页面 (仪表盘、会员管理、主题可视化)
│   │   ├── members.js           # 👑 网站会员与邀请码管理中心
│   │   └── settings/theme.js    # 主题全维度可视化编辑器
│   ├── api/admin/               # 后台管理 API (auth, members, config 读写持久化)
│   ├── api/member/              # 会员登录、注册、状态校验 API
│   ├── fans/                    # 🎁 粉丝专区免登录前台入口
│   ├── vip/                     # 👑 会员专区前台入口
│   └── ...                      # 前台路由与文章渲染
├── public/
│   └── images/                  # 🎨 高清标准封面图与静态媒体资源
└── themes/
    └── heo/                     # Heo 主题源码
        ├── components/          # 主题组件 (Hero, BlogPostCard, NoticeBar, InfoCard 等)
        └── config.js            # Heo 主题专属配置项
```

---

## 📄 开源协议与鸣谢

- 本项目基于 [MIT License](./LICENSE) 开源；
- 感谢 [NotionNext 开源社区](https://github.com/notionnext-org/NotionNext) 与所有贡献者的付出！

---

<div align="center">
  <b>Designed with ❤️ by Terry 校长</b>
</div>
