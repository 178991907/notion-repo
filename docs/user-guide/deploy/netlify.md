# Netlify云函数部署
> 迁移自：[Netlify云函数部署](https://docs.tangly1024.com/article/deploy-notion-next-with-netlify)
> 发布日期：2023-8-1
> 最后编辑：2026-5-2
> 原栏目：🚀 安装部署
> 标签：部署方案、Notion Repo、Netlify

::: tip 提示
从Notion Repo 4.0.9 开始 支持 Netlify部署，Netlify相比Vercel有更充足的免费额度，而且中国大陆访问的速度很不错。

构建环境请使用 Node 22（与官方仓库 README 一致），本地开发与构建命令以 Yarn 为准，例如 &lt;code&gt;yarn&lt;/code&gt;、&lt;code&gt;yarn build&lt;/code&gt;。
:::


## 序

Netlify 和 Vercel的部署方案大同小异，只是在之前的版本中存在依赖的不兼容，导致Netlify部署失败。在4.0.9版本中已经修复

现在您可以在netlify中轻松部署

![Untitled](/legacy/8bce12d26893bcf5.png)


## 开始

用github登录Netlify

[Develop and deploy websites and apps in record time | Netlify](https://www.netlify.com/)

Accelerate the time to deploy your websites and apps. Bring your integrations and APIs together on one powerful serverless platform. Get started for free!

点击Import an existing project ，导入您的github项目

![Untitled](/legacy/2c01f30a32ff7cb6.png)

### 配置核心环境变量 (四大建站基石，缺一不可)

在 Netlify 导入项目的向导中（或站点部署后的 **Site configuration -> Environment variables**），逐一添加以下 4 个核心变量：

| 环境变量名称 (Key) | 申请/获取入口 | 填写值格式 | 是否必填 | 功能与说明 |
| :--- | :--- | :--- | :---: | :--- |
| **`NOTION_PAGE_ID`** | 复制自您的 Notion 模板主页 | 32 位纯字符串（无横杠与参数） | **必填** | **数据源**：Notion 博客文章根页面 ID |
| **`ADMIN_PASSWORD`** | 自行设定 | 自定义高强度密码（如 `admin888`） | **必填** | **管理权限**：管理后台 `/admin` 的超级登录密码 |
| **`NOTION_ACCESS_TOKEN`**<br>*(或 `NOTION_API_TOKEN`)* | [Notion 官方集成中心](https://www.notion.so/profile/integrations) | `ntn_...` 或 `secret_...` | **核心必填** | **数据回写引擎**：用于粉丝暗号自动生成回写、会员系统与后台设置直接写回 Notion。**必须通过内部集成获取，永久有效！** |
| **`NOTION_SYNC_SECRET`** | 自行设定 | 任意随机私钥（如 `sec_sync_888`） | **核心必填** | **云端安全通信**：保护 Webhook 实时触发与定时同步。不配置会报 `403 Forbidden` |

> 💡 **主题免配置**：`NEXT_PUBLIC_THEME` 无需填写，项目默认已绑定为您专属定制的 `heo` 旗舰主题！

#### 🔍 环境变量获取保姆级指引：
1. **`NOTION_PAGE_ID`**：打开复制好的 Notion 博客模板主页，点击右上角 **Share** -> **Publish** 开启网络发布，点击 **Copy link**。从 URL 中提取纯 32 位数字字母 ID（切勿复制 `?v=` 及后面的参数）。
2. **`ADMIN_PASSWORD`**：无需申请，由您自行构思并记牢，后续用于登录 `https://你的域名/admin` 控制台。
3. **`NOTION_ACCESS_TOKEN`（官方内部集成 Token，永久有效）**：
   - 申请直达链接：👉 **[https://www.notion.so/profile/integrations](https://www.notion.so/profile/integrations)**
   - 点击 **「+ New integration」**，名称填 `Notion-Repo`（或任意名字，记好），工作区选择当前空间，类型保持 **Internal**（内部），点击 **Save**。
   - 复制 **Internal Integration Secret**（以 `secret_` 或 `ntn_` 开头）。此 Secret **永久有效、永不过期**。
   - **🔥 关键授权步骤（仅需 5 秒，解决评论、分类与会员库访问权限）**：
     - 打开您的 Notion 博客主页面（即 `NOTION_PAGE_ID` 对应的页面）；
     - 点击页面右上角三个点 **`···`** 展开设置菜单；
     - 下滑找到 **`品 集成`**（英文版为 `Connect to`）；
     - 点击 **`+ 添加连接`**，直接点击刚才创建的名称（例如 **`Notion-Repo`**）；
     - 在弹出的窗口中点击蓝色的 **「添加到页面」** 即可！
     
     ![Notion 页面添加连接授权指引](/images/notion-connect-guide.png)
4. **`NOTION_SYNC_SECRET`**：无需申请，由您自行设定的随机字符串私钥（如 `sec_sync_myblog_2026`），保护同步接口。


### 配置域名

和Vercel的方案大同小异，可以在首页的Domain settings中找到配置，按照指引添加域名，并配置CNAME即可。

![Untitled](/legacy/f0a0593c7209a949.png)

## 原文链接

https://docs.tangly1024.com/article/deploy-notion-next-with-netlify
