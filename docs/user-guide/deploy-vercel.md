# Vercel 部署 Notion Repo 保姆级极速建站教程

> 本教程专为 **Notion Repo** 新手量身打造，带您从零开始、免费、极速搭建属于您自己的顶尖独立博客与知识库系统！  
> 源码仓库：[178991907/notion-repo](https://github.com/178991907/notion-repo)  
> 部署后访问：`https://你的自定义域名/` 或 `https://你的项目.vercel.app/`  
> 在线管理后台：`https://你的自定义域名/admin`

---

## 💡 为什么选择 Notion Repo + Vercel？

- **无需购买服务器，终身完全免费**：利用国外领先的 Serverless 托管平台 [Vercel](https://vercel.com/)，个人免费版额度充沛，无需承担任何服务器与带宽费用；
- **沉浸写作在 Notion**：所有的文章、随笔、专栏编写全部在 Notion 原生编辑器中完成，即写即发布，图文并茂、多端自动云同步；
- **全网独家可视化管理后台**：彻底告别传统静态博客改配置必须修改代码的痛点！内置专属后台控制台（`/admin`），网页端在线修改标题、头像、导航、英雄区胶囊与配色，秒级全站生效；
- **全端极速自适应与丰富生态**：搭载 Next.js 15+ 与 Tailwind CSS，集成 27 套现代旗舰主题（默认推荐 `heo`），全端完美自适应（桌面/平板/手机），更独家搭载了双轨制会员系统与 24 小时粉丝免密通行证体系。

---

## 🧭 部署前极速路线图 (只需 3 步)

```mermaid
graph LR
    A["1. 准备 Notion 页面\n(复制模板并开启分享)"] --> B["2. Fork 源代码\n(一键复刻到个人 GitHub)"]
    B --> C["3. Vercel 导入与部署\n(设置 Node 24 与环境变量)"]
    C --> D["🎉 站点上线！\n(登录 /admin 可视化定制)"]
```

---

## 第一步：准备您的 Notion 数据源

### 1. 复制官方专属纯净增强母版 (Duplicate)
1. 打开并登录您的 [Notion 账号](https://www.notion.so/)（若无账号可免费注册）；
2. 访问官方推荐的专属纯净增强母版：
   👉 **[Notion-Repo 官方全功能母版](https://www.notion.so/3dce78c0e8d481af9ac5eb92016756dd)**
3. 在打开的 Notion 页面右上角，点击 **Duplicate (复制)** 按钮，将母版（含全套建站指引、系统数据存储与核心数据库）完整复刻到您自己的个人 Notion 工作区中。

### 2. 开启公开网页分享 (Publish to web)
> [!IMPORTANT]
> **必须开启网络发布**，否则 Vercel 无法读取您的笔记数据！

1. 在复制到您工作区后的根页面中，点击右上角的 **Share (分享)** 按钮；
2. 切换到 **Publish (发布)** 选项卡；
3. 点击开启 **Publish to web (发布到网络)** 开关；
4. 勾选保持开启 **Allow duplicate as template**；
5. 点击进入内部的「**Notion-Repo 官方模板（Fork）**」数据库页面，点击右上角 **Copy link (复制链接)**。

### 3. 获取并准确提取 32 位页面 ID (`NOTION_PAGE_ID`)
请仔细观察您刚才复制出的公开分享链接：

- **链接格式示例**：
  ```text
  https://www.notion.so/3dce78c0e8d4812598f8e90892c4c95e?v=...
  ```
  此时位于链接中间由纯数字与小写字母组成的 **连续 32 位字符** 即为核心数据库 ID：
  👉 `3dce78c0e8d4812598f8e90892c4c95e`

> [!WARNING]
> **避坑提醒**：只复制这 32 位的纯字符串！**切勿包含 `?v=`、`?pvs=4` 及其后面的任何多余字符**。请将这串 32 位 ID 妥善暂存，下一步将用到。

---

## 第二步：一键 Fork GitHub 源代码

> [!TIP]
> **账号注册避坑建议**：注册 GitHub 账号时，建议使用 **Gmail、Outlook 等国际主流邮箱**，避免使用部分国内邮箱导致后续注册 Vercel 时触发封控。

1. 登录您的 [GitHub 账号](https://github.com/)；
2. 访问 **Notion Repo** 官方仓库并点击 Fork：
   👉 **[一键 Fork Notion Repo 仓库](https://github.com/178991907/notion-repo/fork)**
3. 在 Fork 页面中保持默认设置，点击绿色的 **Create fork** 按钮；
4. 代码将自动完整复制到您的个人 GitHub 账号下。

---

## 第三步：Vercel 导入与部署上线 (核心关键步骤)

### 1. 登录 Vercel
1. 访问 **[Vercel 官网](https://vercel.com/)**；
2. 推荐直接选择 **Continue with GitHub** 授权登录，即可直接读取到您刚刚 Fork 的代码仓库。

### 2. 导入项目 (Import Project)
1. 登录后进入控制台，点击右上角的 **Add New...** ➔ 选择 **Project**（或直接访问 [https://vercel.com/new](https://vercel.com/new)）；
2. 在代码仓库列表中找到您刚才 Fork 的 `notion-repo`，点击右侧的 **Import (导入)** 按钮。

### 3. ⚠️ 核心设置：选择 Node.js 24 版本 (小白必做避坑点！)
> [!CAUTION]
> **重要必做步骤**：Notion Repo 最新版基于 Next.js 15+ 深度优化，要求运行环境必须为 **Node.js 22 或 24**。
> 若未设置，Vercel 默认可能会使用较旧的 Node 版本导致构建报错退出！

在导入页面暂不点击 Deploy，请展开或者在项目设置中确认：
- **Framework Preset**：保持默认 `Next.js`；
- **Root Directory**：保持默认 `./`；
- **Node.js Version**：若当前界面支持选择，请选择 **`24.x`**（如未出现，可部署后进入 Project -> Settings -> General 确认选择 24.x）。

### 4. 配置环境变量 (Environment Variables) —— 🌟 新手建站四大核心必配基石

在导入页面的 **Environment Variables (环境变量)** 折叠面板中，逐一添加以下 4 个核心变量：

| 环境变量名称 (Key) | 申请/获取入口 | 填写值 (Value) 格式 | 是否必填 | 功能与重要说明 |
| :--- | :--- | :--- | :---: | :--- |
| **`NOTION_PAGE_ID`** | [您的 Notion 页面](#1-notion_page_id-获取方法) | 32 位纯字符串（无横杠与参数） | **必填** | **数据源**：站点文章与核心数据库来源的根页面 ID |
| **`ADMIN_PASSWORD`** | [自行设定](#2-admin_password-设定方法) | 任意高强度自定义密码（如 `admin888`） | **必填** | **管理权限**：用于登录可视化后台 `/admin` 的超级管理密码 |
| **`NOTION_ACCESS_TOKEN`**<br>*(或 `NOTION_API_TOKEN`)* | [Notion 官方集成中心](#3-notion_access_token-申请与获取方法重点永久有效) | `ntn_...` 或 `secret_...` | **核心必填** | **双向通信引擎**：用于驱动专属粉丝码生成、VIP 属性打标、会员注册与激活码核销、后台设置直接写回 Notion。**若不配置，涉及数据写回与会员功能将直接报错失败！** |
| **`NOTION_SYNC_SECRET`** | [自行设定](#4-notion_sync_secret-设定方法) | 任意自定义随机密钥（如 `sec_sync_888`） | **核心必填** | **云端安全防护**：用于保护 Webhook 实时触发与 Cron 定时同步接口。**生产环境若未配置此项，调用接口将直接被系统安全拦截并报错 `403 Forbidden`！** |

---

#### 🔍 四大核心环境变量申请与获取保姆级教程

##### 1. `NOTION_PAGE_ID` 获取方法
- **申请/获取入口**：打开您在第一步复制（Duplicate）到自己账号中的 Notion 博客模板主页。
- **操作步骤**：
  1. 打开主页面（或进入内部的「Notion-Repo 官方模板（Fork）」数据库页面）；
  2. 点击右上角 **Share (分享)** ➔ 切换到 **Publish (发布)** ➔ 确保开启 **Publish to web (发布到网络)**；
  3. 点击右上角 **Copy link (复制链接)**（或直接复制浏览器地址栏中的网址）；
  4. 从复制的链接中提取 32 位字符串：
     - 例如链接为：`https://www.notion.so/username/3dce78c0e8d4812598f8e90892c4c95e?v=...`
     - 提取其中的纯 32 位字母数字部分：`3dce78c0e8d4812598f8e90892c4c95e`。
- ⚠️ **避坑提醒**：切勿复制 `?v=` 或 `?pvs=4` 等问号及其后面的参数，仅需 32 位纯字符！

##### 2. `ADMIN_PASSWORD` 设定方法
- **申请/获取入口**：**无需向任何平台申请**，由您自行设立。
- **操作步骤**：
  1. 自行构思一个高强度的管理员登录密码（建议 8 位以上，包含字母与数字，如 `MyBlogAdmin_2026`）；
  2. 牢记该密码，未来访问您的博客后台（`https://你的域名/admin`）时用于登录管理后台，修改站点标题、头像、导航、会员设置等。

##### 3. `NOTION_ACCESS_TOKEN` 申请与获取方法（重点：永久有效）
> [!IMPORTANT]
> **切勿在 Notion 设置里创建「个人访问令牌 (PAT)」**！PAT 最长只有 1 年有效期，到期会导致网站功能失效。  
> 必须按照以下官方标准创建 **「内部集成 (Internal Integration)」**，生成的 Secret **永久有效、永不过期**！

- **申请直达链接**：👉 **[https://www.notion.so/profile/integrations](https://www.notion.so/profile/integrations)**  
  *(备用链接：[https://www.notion.so/my-integrations](https://www.notion.so/my-integrations))*
- **操作步骤**：
  1. 浏览器打开 [Notion 集成管理页面](https://www.notion.so/profile/integrations)；
  2. 点击页面中的 **「+ New integration」**（或「新建集成」）按钮；
  3. 填写集成信息：
     - **Name（名称）**：输入 `Notion-Repo`（仅用于标识）；
     - **Associated workspace（关联工作空间）**：选择您存放博客模板的工作空间；
     - **Type（类型）**：保持默认的 **Internal**（内部集成）；
  4. **Capabilities（权限）**：保持默认勾选（包含 Read content 读取内容、Update content 更新内容、Insert content 插入内容）；
  5. 点击底部的 **Save (保存)**；
  6. **复制 Token**：保存后在页面中的 **Internal Integration Secret** 点击 **Show**，然后点击 **Copy**，得到以 `secret_` 或 `ntn_` 开头的字符串，这就是 `NOTION_ACCESS_TOKEN`！
  7. **🔥【极关键步骤：给主页面授权连接（仅需 5 秒）】**：
     - 回到您的 Notion 博客模板主页面；
     - 点击右上角的三个点 **`···`** 展开菜单；
     - 下滑找到 **`品 集成`**（英文版界面为 `Connect to`）；
     - 点击 **`+ 添加连接`**，在列表中直接点击刚才创建的名称（例如 **`Notion-Repo`**）；
     - 在弹出的窗口中点击蓝色的 **「添加到页面」** 即可！
     
     ![Notion 页面添加连接授权指引](/images/notion-connect-guide.png)

##### 4. `NOTION_SYNC_SECRET` 设定方法
- **申请/获取入口**：**无需向任何平台申请**，由您自行定义的生产安全通信私钥。
- **操作步骤**：
  1. 自定义一串不易被猜解的长随机字符串（例如 `sec_sync_2026_x89a`）；
  2. 该私钥用于防御未授权的恶意调用，保护 Notion Webhook 自动触发更新与 Vercel Cron 定时同步接口；
  3. 后续若配置 GitHub Actions 或 Notion 自动化 Webhook，在请求头或 URL 参数中携带此 Secret 即可安全同步。

---

> [!CAUTION]
> ### 🚨 为什么新手建站务必完整配置这 4 个环境变量？（避坑重点）
> 很多新手部署时误以为只配前 2 个就能用，结果后续使用中频繁遇到功能报错：
> 1. **缺少 `NOTION_ACCESS_TOKEN`**：会导致【会员注册】、【邀请码核销】、【Notion 粉丝码与 VIP 属性自动打标回写】、【后台管理修改分类/标签/配置保存】无法连接 Notion 官方接口，直接报错崩溃；
> 2. **缺少 `NOTION_SYNC_SECRET`**：项目内置了工业级生产安全防御，当 Notion 自动化 Webhook 触发或 Vercel Cron 定时巡检时，若检测到未设防刷密钥，API 路由会直接返回 **`403 Forbidden: 生产环境必须配置 NOTION_SYNC_SECRET 以保护 Webhook 安全`** 导致同步失败！
> 
> **请务必在创建项目时，一次性把这 4 个核心变量全部添加进 Vercel 中！**

---

### 可选进阶安全变量 (按需配置)

| 环境变量名称 (Key) | 申请/获取入口 | 推荐填写值 (Value) | 是否必填 | 功能与说明 |
| :--- | :--- | :--- | :---: | :--- |
| **`ADMIN_SECRET`** | 自行设定 | 随机长字符串（如 `sec_adm_999`） | 选填（推荐） | 后台 Edge JWT 独立签名私钥，未配置时系统将自动安全派生 |
| **`MEMBER_AUTH_SECRET`** | 自行设定 | 随机长字符串（如 `sec_mem_888`） | 选填（推荐） | 会员系统 JWT 独立签名私钥，未配置时自动安全派生 |
| **`FANS_CODE_SECRET`** | 自行设定 | 随机长字符串（如 `fans_sec_666`） | 选填（推荐） | 粉丝暗号 HMAC 签名私钥，彻底阻断专属码被逆推预测 |
| **`COMMENT_GITALK_CLIENT_SECRET`** | [GitHub OAuth Apps 申请入口](https://github.com/settings/applications/new) | 您的 GitHub OAuth Client Secret | 选填 | 仅在使用 Gitalk 评论时配置，供后端安全代理调用（前端零泄露）。申请时 Homepage URL 与 Callback URL 填写您的博客域名即可 |
| **`NEXT_PUBLIC_THEME`** | 代码已默认锁定 | 默认留空无需填写 | 选填 | **无需配置**！代码底层默认已锁定为您专属定制的 `heo` 旗舰主题。仅当您想切换体验原作者其他传统主题（如 simple, hexo, gitbook）时才需填入 |


### 5. 点击一键部署
确认环境变量添加完毕后，点击醒目的 **Deploy** 按钮！  
Vercel 将全自动为您拉取依赖、编译前端、打包生产镜像。大约静候 **1 ~ 2 分钟**，界面将会撒花并提示：**Congratulations!** 部署成功！🎉

点击页面上的 **Continue to Dashboard** 或右侧预览窗口的 **Visit** 按钮，您即可正式访问您崭新的独立博客！

---

## 第四步：进入可视化后台，自由定制您的站点

Notion Repo 为您配备了业界领先的**全功能在线管理后台**：

1. **登录后台**：在您的博客域名后面加上 `/admin`（例如 `https://your-domain.vercel.app/admin`）；
2. 输入您在部署时设置的 `ADMIN_PASSWORD` 密码，点击登录；
3. **随心所欲可视化定制**：
   - **🎨 主题全维度设置 (`/admin/settings/theme`)**：
     - 在线修改网站大标题、副标题、建站年份、博主头像、个人简介；
     - 在线配置社交联系方式（GitHub、微信公众号、邮箱等）；
     - **一键添加英雄区胶囊**：点击【🎁 粉丝专区】Tab 中的“⚡ 一键添加至英雄区胶囊”，秒级在首页英雄区添加高亮翡翠绿【🎁 粉丝福利】胶囊；
     - 自由切换首页双列/单列排版、深色/浅色模式、代码高亮风格；
   - **👑 会员专区与邀请码管理 (`/admin/members`)**：
     - 一键生成 VIP / SVIP 分级激活码，支持单人单码核销与全站通用码；
     - 享受已登录会员免输码畅读专属内容的超级特权；
   - **🎁 粉丝专区与 24 小时通行证**：
     - 专属粉丝文章暗号解锁，输入一次暗号 24 小时全站免输畅读；
   - **📁 分类与标签批量管理 (`/admin/categories`, `/admin/tags`)**：
     - 一键批量重命名、智能分类合并、空标签清理。

所有的修改只需在后台底部点击 **“💾 保存全部配置”**，系统将实时写回 Notion 并自动刷新 CDN 缓存，无需重新构建即可生效！

---

## 第五步：绑定您自己的个性独立域名 (进阶可选)

Vercel 默认提供的 `*.vercel.app` 域名在部分国内网络环境下可能受到限制。如果您拥有自己的独立域名（如 `yourname.com` 或 `blog.yourname.com`），建议一键绑定：

1. 在 Vercel 项目管理面板中，点击上方导航栏的 **Settings** ➔ 进入 **Domains**；
2. 在输入框中填写您的域名（如 `blog.yourname.com`），点击 **Add**；
3. 按照页面提示，前往您的域名购买商（如阿里云、腾讯云、Cloudflare、NameSilo 等）添加 DNS 解析记录：
   - **如果是二级域名（推荐）**：
     - 记录类型：`CNAME`
     - 主机记录：`blog`（或您自定义的前缀）
     - 记录值：`cname.vercel-dns.com`
   - **如果是顶级根域名**：
     - 记录类型：`A`
     - 主机记录：`@`
     - 记录值：`76.76.21.21`
4. 添加后等待数分钟 DNS 生效，Vercel 会全自动为您申请并定期续签免费的 **HTTPS SSL 证书**。

---

## 常见排坑与故障排除 (FAQ)

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

### Q4: 注册 Vercel 时提示 `This user account is blocked`？
- 这是由于 Vercel 对部分国内邮箱域名存在自动化反欺诈限制；
- 建议使用国际主流邮箱（如 Gmail 或 Outlook）注册 GitHub，并在 GitHub 的 Settings -> Emails 中将其设为 Primary 邮箱，随后重新通过 GitHub 登录 Vercel 即可畅通无阻。

### Q5: 部署项目是不是必须先配置环境变量？不配置部署时会报错吗？
- **结论**：**不会报错**！即使一个环境变量都不填，直接点击 **Deploy**，Vercel 也能够顺利打包构建成功并上线。
- **原理说明**：项目源码中内置了官方演示库的 `NOTION_PAGE_ID` 兜底值；而管理员密码 `ADMIN_PASSWORD` 属于运行时接口鉴权，打包构建阶段无需读取。
- **不配置的后果**：
  1. 部署出来的网站展示的是作者的示例文章，无法同步您自己在 Notion 中写的内容；
  2. 访问 `/admin` 准备登录后台时，系统会提示“*未配置管理员密码*”而无法登录。
- **后续补配方法（必须 Redeploy）**：
  若先点击了 Deploy，您可以随时进入 Vercel 项目的 **Settings -> Environment Variables** 补充添加变量。**但请务必注意**：添加变量后必须前往 **Deployments** 列表，在最新一条记录右侧点击 **`...` -> Redeploy** 重新触发一次构建打包，新环境变量才会正式生效！
- **真正导致部署报错的元凶**：
  只有 **Node.js 运行版本不匹配**！请务必在项目设置中确认选择 **`24.x`**（Next.js 15+ 强制要求 Node 22+）。

---

## 常见操作进阶：如何设置与修改文章的封面 LOGO 图

系统内置了**智能三级封面继承机制**（文章专属封面 ➔ 站点全局封面 ➔ 系统默认保底 LOGO）：
- **默认机制**：新建文章若未在 Notion 中上传封面，系统将全自动使用模板内置的专属品牌 LOGO（`public/default_cover.png`），告别毫无辨识度的风景图。
- **自定义单篇封面**：
  1. 在 Notion 数据库中打开具体文章；
  2. 鼠标悬浮在文章大标题上方，点击 **`Add cover`（添加封面）**；
  3. 点击右下角 **`Change cover`** ➔ **`Upload`** 上传本地图片即可；
  4. 该文章在前台首页卡片、侧边推荐阅读及详情页顶部将即刻显示专属新封面。
- **修改全站默认底图**：
  在 Notion 母版根页面（`Notion-Repo 官方博客模板`）顶部大标题上方点击 **`Add cover`** 上传您的全站横幅，所有未配封面的文章都会自动同步继承。

---

## 结语

祝贺您成功拥有了属于自己的高端个人独立站！无论是沉淀学术笔记、分享 AI 实操经验、还是打造专属粉丝与会员社群，**Notion Repo** 都将是您最坚实优雅的数字家园。

- 💬 **交流反馈与技术支持**：欢迎在 [GitHub Issues](https://github.com/178991907/notion-repo/issues) 提交反馈或参与讨论。
- 🌟 **如果觉得本项目对您有所帮助，欢迎前往 GitHub 为我们点亮一颗 Star ⭐️！**
