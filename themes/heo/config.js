const CONFIG = {
  HEO_HOME_POST_TWO_COLS: true, // 首页博客两列显示，若为false则只显示一列
  HEO_LOADING_COVER: true, // 页面加载的遮罩动画

  HEO_HOME_BANNER_ENABLE: true,
  HEO_LOGO_IMAGE: "https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png", // 自定义顶栏 Logo 图标图片 URL，留空则默认使用 Notion Icon / AVATAR
  HEO_LOGO_SHOW_ICON: true, // 是否在顶栏左侧显示 Logo 图标图片
  HEO_LOGO_SIZE: 38, // 顶栏 Logo 图标像素大小（默认 38px）

  HEO_INFO_CARD_AVATAR_BLUR: false, // 文章详情页个人资料卡头像样式。true：显示为模糊装饰头像；false：与首页头像保持一致（默认显示清晰头像）

  HEO_COLOR_PRIMARY: '#4f65f0',
  HEO_COLOR_PRIMARY_HOVER: '#4f46e5',
  HEO_COLOR_PRIMARY_TEXT: '#ffffff',
  HEO_COLOR_ACCENT: '#dca846',
  HEO_COLOR_BG: '#f7f9fe',
  HEO_COLOR_BG_DARK: '#18171d',
  HEO_COLOR_CARD: '#ffffff',
  HEO_COLOR_CARD_DARK: '#1e1e1e',
  HEO_COLOR_CARD_MUTED: '#f1f3f8',
  HEO_COLOR_BORDER: '#4f46e5',
  HEO_COLOR_BORDER_DARK: '#dca846',
  HEO_COLOR_TEXT: '#111827',
  HEO_COLOR_TEXT_SECONDARY: '#4b5563',

  HEO_SITE_CREATE_TIME: '2025-01-01', // 建站日期，用于计算网站运行的第几天

  // 首页顶部通知条滚动内容，如不需要可以留空 []
  HEO_NOTICE_BAR_ENABLE: true, // 是否开启首页顶部「此刻」横向滚动通知条
  HEO_NOTICE_BAR_BADGE: 'NEWS', // 左侧徽标文案（默认：此刻，可自定义为：公告、广播、NEWS 等）
  HEO_NOTICE_BAR: [
    { title: '欢迎来 terry 校长个人博客', url: '' },
    { title: '前沿 AI 解锁高效启蒙与教育', url: '' },
    { title: '英语全科启蒙', url: '' }
  ],

  // 英雄区左右侧组件颠倒位置
  HEO_HERO_REVERSE: false,
  // 博客主体区左右侧组件颠倒位置
  HEO_HERO_BODY_REVERSE: false,

  // 英雄区(首页顶部大卡)
  HEO_HERO_TITLE_1: "分享 AI 实操",
  HEO_HERO_TITLE_2: "英语全科启蒙",
  HEO_HERO_TITLE_3: "用前沿 AI 解锁高效启蒙与教育",
  HEO_HERO_TITLE_4: "新版上线",
  HEO_HERO_TITLE_5: "Notion Repo 轻松定制主题",
  HEO_HERO_TITLE_LINK: "https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png",
  // 英雄区遮罩文字
  HEO_HERO_COVER_TITLE: '随便逛逛',

  // 英雄区显示三个置顶分类
  HEO_HERO_CATEGORY_1: { title: '必看精选', url: '/tag/必看精选' },
  HEO_HERO_CATEGORY_2: { title: '热门文章', url: '/tag/热门文章' },
  HEO_HERO_CATEGORY_3: { title: '实用教程', url: '/tag/实用教程' },

  // 英雄区右侧推荐文章标签, 例如 [推荐] , 最多六篇文章; 若留空白''，则推荐最近更新文章
  HEO_HERO_RECOMMEND_POST_TAG: '推荐',
  HEO_HERO_RECOMMEND_POST_SORT_BY_UPDATE_TIME: false, // 推荐文章排序，为`true`时将强制按最后修改时间倒序
  HEO_HERO_RECOMMEND_COVER: '', // 英雄区右侧大卡封面图 URL（留空则自动使用 Notion 根页面顶部封面图）

  // 英雄区右侧推荐文章遮罩控制
  HEO_HERO_RECOMMEND_COVER_ENABLE: false, // 是否显示推荐文章遮罩图片，true显示遮罩需点击查看，false直接显示推荐文章

  // 右侧个人资料卡牌欢迎语，点击可自动切换
  HEO_INFOCARD_GREETINGS: [
    '你好！我是',
    '🔍 分享 AI 实操',
    '✨英语全科启蒙',
    '✨AI 教育教学'
  ],

  // 个人资料底部按钮
  HEO_INFO_CARD_URL1: '/about',
  HEO_INFO_CARD_ICON1: 'fas fa-user',
  HEO_INFO_CARD_URL2: "https://github.com/178991907/notion-repo",
  HEO_INFO_CARD_ICON2: 'fab fa-github',
  HEO_INFO_CARD_ICON_ORCID: 'fab fa-orcid',
  HEO_INFO_CARD_URL3: "https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png",
  HEO_INFO_CARD_TEXT3: '了解更多',

  // 个人资料头像与公告自定义
  HEO_INFO_CARD_AVATAR: "https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png", // 自定义头像图片URL，留空则使用 Notion 头像
  HEO_INFO_CARD_AVATAR_URL: '/about', // 点击头像跳转链接
  HEO_INFO_CARD_AVATAR_SIZE: 80, // 首页名片卡头像像素大小（默认 80px，醒目大头像）
  HEO_INFO_CARD_SHOW_ANNOUNCEMENT: true, // 是否显示名片公告
  HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT: "🎉Notion Repo正式上线🎉\n   -- 感谢您的支持 ---\n      👏欢迎体验👏\n\n[联系作者](https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png)", // 自定义名片公告内容，留空则读取 Notion Notice 数据库文章
  HEO_INFO_CARD_ANNOUNCEMENT_URL: '', // 点击名片公告跳转链接，留空则纯文本展示

  // 用户技能图标
  HEO_GROUP_ICONS: [
    {
      title_1: 'ChatGPT',
      img_1: 'https://pic1.imgdb.cn/i/034BhcStGcIGk6M1O6L7yX.png',
      color_1: '#10a37f',
      title_2: 'deepseek',
      img_2: 'https://pic1.imgdb.cn/i/034BhmOPeUrkZCJ4mcIqeb.png',
      color_2: '#d97706'
    },
    {
      title_1: 'gemini',
      img_1: 'https://pic1.imgdb.cn/i/034BhcSz14OodSBNkLEFVu.png',
      color_1: '#d7eaf9',
      title_2: 'gork',
      img_2: 'https://pic1.imgdb.cn/i/034BhcShlQ7PrJbPT3m0PI.png',
      color_2: '#2496ed'
    },
    {
      title_1: 'Notion',
      img_1: 'https://pic1.imgdb.cn/i/034BhcTM1WMd1O4qFxIzQq.png',
      color_1: '#ffffff',
      title_2: 'nanobanana',
      img_2: 'https://pic1.imgdb.cn/i/034BhcShxUfeBf7JydJtzh.png',
      color_2: '#4f46e5'
    },
    {
      title_1: 'KIMI',
      img_1: 'https://pic1.imgdb.cn/i/034BhmOBQAj6sk3OBPqXFX.png',
      color_1: '#4f46e5',
      title_2: 'Claude',
      img_2: 'https://pic1.imgdb.cn/i/034BhcT1SARXzm7QldxcXd.png',
      color_2: '#3b82f6'
    },
    {
      title_1: 'doubao',
      img_1: 'https://pic1.imgdb.cn/i/034BhmOHGxghuyEkMBCaPK.png',
      color_1: '#4f46e5',
      title_2: 'hermes',
      img_2: 'https://pic1.imgdb.cn/i/034BhmOB8BXWSCZAHrRCOo.png',
      color_2: '#3b82f6'
    }
  ],

  HEO_SOCIAL_CARD: true, // 是否显示右侧，点击加入社群按钮
  HEO_SOCIAL_CARD_TITLE_1: '交流频道',
  HEO_SOCIAL_CARD_TITLE_2: '加入我们的社群讨论分享',
  HEO_SOCIAL_CARD_TITLE_3: '点击加入社群',
  HEO_SOCIAL_CARD_URL: "https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png",

  // 底部统计面板文案
  HEO_POST_COUNT_TITLE: '文章数:',
  HEO_SITE_TIME_TITLE: '建站天数:',
  HEO_SITE_VISIT_TITLE: '访问量:',
  HEO_SITE_VISITOR_TITLE: '访客数:',

  // 菜单配置
  HEO_MENU_INDEX: true, // 显示首页
  HEO_MENU_CATEGORY: true, // 显示分类
  HEO_MENU_TAG: true, // 显示标签
  HEO_MENU_ARCHIVE: false, // 显示归档
  HEO_MENU_SEARCH: false, // 显示搜索
  HEO_MENU_VIP: true, // 显示会员专区菜单
  HEO_CATEGORY_BAR_VIP: true, // 是否在文章列表上方的分类横条中显示「会员专区」Tab
  HEO_CATEGORY_BAR_VIP_TITLE: '会员专区', // 分类横条中会员专区的显示文案
  HEO_SIDEBAR_VIP_CARD: true, // 是否在右侧边栏显示会员专区推广卡片
  HEO_SIDEBAR_VIP_CARD_TITLE_1: '会员专区', // 侧边栏卡片主标题
  HEO_SIDEBAR_VIP_CARD_TITLE_2: '解锁全部深度实战专栏与源码', // 侧边栏卡片副标题
  HEO_SIDEBAR_VIP_CARD_TITLE_3: '进入会员专区', // 侧边栏卡片翻转后按钮文案
  HEO_SIDEBAR_VIP_CARD_URL: '/vip', // 侧边栏卡片跳转链接
  HEO_MENU_FANS: true, // 顶栏菜单是否显示「粉丝专区」
  HEO_CATEGORY_BAR_FANS: true, // 分类横条是否显示「粉丝福利」Tab
  HEO_CATEGORY_BAR_FANS_TITLE: '粉丝福利', // 分类横条中粉丝专区的显示文案
  HEO_FANS_DEFAULT_PASSCODE: '888888', // 全站默认通用粉丝暗号 / 验证码
  HEO_FANS_UNLOCK_TIPS: '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码', // 粉丝解锁引导提示语
  HEO_MENU_FRIENDS: true, // 显示「友情链接」菜单 (Friendship links)
  HEO_MENU_TUTORIAL: true, // 显示「建站教程」菜单 (Tutorial)
  HEO_MENU_HISTORY: true, // 显示「往期整理 / 历史」菜单 (History)
  HEO_MENU_ABOUT: true, // 显示「关于我」菜单 (About)
  HEO_MENU_LANG_SWITCH: true, // 显示「语言切换」菜单 (中文 / English)
  HEO_MENU_SHOW_NOTION_PAGES: true, // 是否显示来自 Notion 数据库的页面菜单 (如 Friendship links / Tutorial / About)
  HEO_MENU_CUSTOM_ITEMS: [], // 后台自定义顶栏菜单列表 [{ title: '', url: '', icon: '' }]

  HEO_POST_LIST_COVER: true, // 列表显示文章封面
  HEO_POST_LIST_COVER_HOVER_ENLARGE: false, // 列表鼠标悬停放大

  HEO_POST_LIST_COVER_DEFAULT: true, // 封面为空时用站点背景做默认封面
  HEO_POST_LIST_SUMMARY: true, // 文章摘要
  HEO_POST_LIST_PREVIEW: false, // 读取文章预览
  HEO_POST_LIST_IMG_CROSSOVER: true, // 博客列表图片左右交错

  HEO_ARTICLE_ADJACENT: true, // 显示上一篇下一篇文章推荐
  HEO_ARTICLE_COPYRIGHT: true, // 文章版权声明：true 全部显示；false 全部关闭；custom 仅填写 copyright 时显示
  HEO_ARTICLE_NOT_BY_AI: false, // 显示非AI写作
  HEO_ARTICLE_RECOMMEND: true, // 文章关联推荐

  HEO_WIDGET_LATEST_POSTS: true, // 显示最新文章卡
  HEO_WIDGET_ANALYTICS: false, // 显示统计卡
  HEO_WIDGET_TO_TOP: true,
  HEO_WIDGET_TO_COMMENT: true, // 跳到评论区
  HEO_WIDGET_DARK_MODE: true, // 夜间模式
  HEO_WIDGET_TOC: true // 移动端悬浮目录
}
export default CONFIG
