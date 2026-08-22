<div align="center">

<img src="https://github.com/user-attachments/assets/c111204d-2016-4343-92e4-83357cac4b19" width="96" height="96" alt="NotionNext Logo" />

# NotionNext Pro 增强版

### 用 Notion 搭建自己的独立站 · 全新可视化管理后台与主题深度定制

继续在 Notion 写作，一键发布为博客、作品集、知识库、导航站或产品官网。

<p>
  <a href="http://localhost:3000/admin">后台管理</a>
  ·
  <a href="http://localhost:3000/admin/settings/theme">主题可视化配置</a>
  ·
  <a href="https://preview.tangly1024.com/">官方在线预览</a>
  ·
  <a href="https://notionnext.tangly1024.com/user-guide/start-here">搭建教程</a>
  ·
  <a href="https://github.com/notionnext-org/NotionNext">官方仓库</a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4+-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Admin_Console-Enabled-success?style=for-the-badge" alt="Admin Console" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

中文 | [English](./README_EN.md)

</div>

---

## 🌟 核心特性与增强亮点

本项目基于 **NotionNext 4.10.10**，深度研发并集成了 **全功能可视化管理后台** 与 **高自由度主题配置体系**：

### 1. 🎛️ 全功能可视化管理后台 (`/admin`)
- **安全鉴权**：支持环境变量 `ADMIN_PASSWORD` 快速认证，防暴力破解与轻量级 Token 机制。
- **仪表盘总览**：站点状态监控、快速跳转 Notion 写作、一键清除缓存与版本管理。
- **全维度主题可视化编辑器 (`/admin/settings/theme`)**：
  - 🧭 **顶栏导航**：内置菜单开关、Notion 页面显隐控制、自定义菜单列表（增删改与上下排序）、Logo 图标/尺寸/悬停弹出大图浮窗。
  - 🚀 **英雄区 (Hero)**：大标题、副标题打字机动效、右侧问候卡片、自定义快捷入口组。
  - 👤 **侧边栏名片卡**：站长头像、名片背景、个性签名、问候语、点击跳转链接、公告栏（支持图文与外链跳转）。
  - 🎨 **配色与风格**：主题主色调、强调色、背景渐变、卡片毛玻璃质感、圆角弧度。
  - 📱 **布局与挂件**：侧边栏位置、文章列表样式、封面图显示与交错排版。
  - 📄 **文章详情**：AI 摘要、文章版权声明、字数与阅读时间、相邻文章推荐。
  - 📑 **页脚与版权**：Powered By 自定义、建站年份、ICP 备案号与公安备案号、Live2D 桌面宠物深度定制。
- **👁️ 1:1 视觉实时预览**：后台内嵌与前台完全一致的实时渲染预览组件，所见即所得。
- **💾 配置持久化**：一键保存自动写入配置文件并在服务端触发 ISR 缓存刷新，重启或部署均不丢失。

---

### 2. 🧭 顶栏导航与菜单全自主控制
- **9 大内置功能菜单自由开关**：
  - **基础功能**：🏠 首页 (`/`)、📁 分类 (`/category`)、🏷️ 标签 (`/tag`)、🗃️ 归档 (`/archive`)、🔍 搜索 (`/search`)。
  - **模板拓展页面**：🔗 友情链接 (`/links`)、📁 建站教程 (`Tutorial`)、🗃️ 往期整理 (`History`)、ℹ️ 关于我 (`/about`)、🌐 语言切换 (`中文 / EN`)。
- **自定义导航列表**：在后台自由添加任意自定义外部链接或站内链接，支持图标与排序。
- **Notion 页面总开关**：一键彻底隐藏/显示 Notion 数据库自动同步生成的页面菜单。
- **Logo 悬停弹出大图浮窗**：鼠标悬停在左上角 Logo 上时，平滑弹出 128px 高清大 Logo 品牌浮窗卡片。
- **分类横条 (CategoryBar) 交互升级**：
  - 独立左右平滑步进滑动按钮（`❮❮` 与 `❯❯`），彻底杜绝误触跳转；
  - 支持鼠标滚轮直接在分类横条上左右横滑；
  - 独立「全部分类 ❯」总入口。

---

### 3. 🐾 Live2D 桌面宠物挂件增强
- 支持一键开启/关闭 Live2D 萌宠看板娘；
- **自定义模型 URL**：支持自由填入任意 `.model.json` 模型直链（内置常用宠物快速预设）；
- **点击交互跳转**：可设置点击宠物后跳转的目标网址，留空则为纯互动不跳走；
- **高度与尺寸调节**：自由设定宠物显示高度与比例。

---

### 4. 🖼️ 名片卡公告与点击联动
- 名片卡支持 **图片公告** 与 **文字公告** 智能识别；
- 填入图片 URL 自动渲染为精致配图，填入文字自动呈现下划线交互；
- 支持独立配置 **公告点击跳转 URL**，点击即可直达目标页面。

---

## 🚀 快速上手与本地开发

### 1. 环境要求
- **Node.js**：Node 24（推荐使用 `nvm`）
- **包管理器**：Yarn 或 npm
- **管理后台环境依赖**：支持通过 `ADMIN_PASSWORD` 环境变量设置登录密码

### 2. 本地启动

```bash
# 1. 克隆仓库
git clone https://github.com/notionnext-org/NotionNext.git
cd NotionNext

# 2. 安装依赖
yarn install
# 或者
npm install

# 3. 设置后台管理密码并启动开发服务
export ADMIN_PASSWORD=你的后台登录密码
yarn dev
# 或者
ADMIN_PASSWORD=123456 npm run dev
```

启动完成后：
- **前台博客首页**：访问 [http://localhost:3000](http://localhost:3000)
- **可视化管理后台**：访问 [http://localhost:3000/admin](http://localhost:3000/admin)（输入你设置的密码登录）
- **主题可视化定制面板**：访问 [http://localhost:3000/admin/settings/theme](http://localhost:3000/admin/settings/theme)

---

## 📦 生产部署指南 (Vercel / Netlify)

> 📖 **完整详尽手册**：更深入的部署步骤、域名解析与全量变量配置，请阅读 [《部署与环境变量完全指南》](./docs/DEPLOYMENT_GUIDE.md)。

1. **Fork 本仓库** 到你的 GitHub 个人账号；
2. 在 **[Vercel](https://vercel.com)** 中点击 **Add New Project**，导入该仓库；
3. **设置 Node.js 版本**：在 Project Settings 中将 Node.js Version 设为 **`24.x`**（或 Node 22+）；
4. 在 **Environment Variables (环境变量)** 中配置核心变量：
   - `NOTION_PAGE_ID`：你的 Notion 根页面 ID
   - `ADMIN_PASSWORD`：你的后台管理密码（例如 `my_secure_password_2026`）
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
│   ├── adminConfigOverrides.json# 后台可视化配置持久化存储
│   └── config.js                # 全栈配置解析引擎 (支持后台无缝覆盖)
├── pages/
│   ├── admin/                   # 管理后台页面 (仪表盘、基础设置、主题可视化)
│   │   └── settings/theme.js    # 主题全维度可视化编辑器
│   ├── api/admin/               # 后台管理 API (auth, config 读写持久化)
│   └── ...                      # 前台路由与文章渲染
└── themes/
    └── heo/                     # Heo 主题源码
        ├── components/          # 主题组件 (Logo, Header, MenuList, CategoryBar, InfoCard 等)
        └── config.js            # Heo 主题专属配置项
```

---

## 📄 开源协议与鸣谢

- 本项目基于 [MIT License](./LICENSE) 开源；
- 感谢 [NotionNext 官方团队与开源社区](https://github.com/notionnext-org/NotionNext)。
