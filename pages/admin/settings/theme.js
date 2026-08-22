import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

// ==================== 8套专业预设配色方案 ====================
const COLOR_PRESETS = [
  {
    id: 'geek-blue',
    name: '经典极客蓝',
    desc: 'Heo 官方经典蓝金撞色，现代科技质感',
    emoji: '🌊',
    colors: {
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
      HEO_COLOR_TEXT_SECONDARY: '#4b5563'
    }
  },
  {
    id: 'emerald-forest',
    name: '翡翠生机绿',
    desc: '清新自然的森林与薄荷绿调，温润护眼',
    emoji: '🍃',
    colors: {
      HEO_COLOR_PRIMARY: '#10b981',
      HEO_COLOR_PRIMARY_HOVER: '#059669',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#f59e0b',
      HEO_COLOR_BG: '#f0fdf4',
      HEO_COLOR_BG_DARK: '#062016',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#0c2d20',
      HEO_COLOR_CARD_MUTED: '#e6f7ec',
      HEO_COLOR_BORDER: '#10b981',
      HEO_COLOR_BORDER_DARK: '#34d399',
      HEO_COLOR_TEXT: '#064e3b',
      HEO_COLOR_TEXT_SECONDARY: '#047857'
    }
  },
  {
    id: 'cyber-purple',
    name: '赛博霓虹紫',
    desc: '极客先锋电竞风格，充满未来科技魅力',
    emoji: '🌌',
    colors: {
      HEO_COLOR_PRIMARY: '#8b5cf6',
      HEO_COLOR_PRIMARY_HOVER: '#7c3aed',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#06b6d4',
      HEO_COLOR_BG: '#f5f3ff',
      HEO_COLOR_BG_DARK: '#0f0d1a',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#19152b',
      HEO_COLOR_CARD_MUTED: '#ece8ff',
      HEO_COLOR_BORDER: '#8b5cf6',
      HEO_COLOR_BORDER_DARK: '#a78bfa',
      HEO_COLOR_TEXT: '#2e1065',
      HEO_COLOR_TEXT_SECONDARY: '#5b21b6'
    }
  },
  {
    id: 'warm-sunset',
    name: '活力暖日落',
    desc: '温暖热情的珊瑚橙与落霞渐变，充满活力',
    emoji: '🔥',
    colors: {
      HEO_COLOR_PRIMARY: '#f97316',
      HEO_COLOR_PRIMARY_HOVER: '#ea580c',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#3b82f6',
      HEO_COLOR_BG: '#fff7ed',
      HEO_COLOR_BG_DARK: '#1c130c',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#271b12',
      HEO_COLOR_CARD_MUTED: '#ffedd5',
      HEO_COLOR_BORDER: '#f97316',
      HEO_COLOR_BORDER_DARK: '#fb923c',
      HEO_COLOR_TEXT: '#7c2d12',
      HEO_COLOR_TEXT_SECONDARY: '#9a3412'
    }
  },
  {
    id: 'sakura-pink',
    name: '浪漫樱花粉',
    desc: '甜美柔和的樱花与马卡龙粉紫，治愈优雅',
    emoji: '🌸',
    colors: {
      HEO_COLOR_PRIMARY: '#ec4899',
      HEO_COLOR_PRIMARY_HOVER: '#db2777',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#8b5cf6',
      HEO_COLOR_BG: '#fdf2f8',
      HEO_COLOR_BG_DARK: '#1a0f15',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#25141f',
      HEO_COLOR_CARD_MUTED: '#fce7f3',
      HEO_COLOR_BORDER: '#ec4899',
      HEO_COLOR_BORDER_DARK: '#f472b6',
      HEO_COLOR_TEXT: '#831843',
      HEO_COLOR_TEXT_SECONDARY: '#9d174d'
    }
  },
  {
    id: 'minimal-mono',
    name: '极简黑白灰',
    desc: '纯粹克制的高级现代冷灰风格，排版突出',
    emoji: '🌑',
    colors: {
      HEO_COLOR_PRIMARY: '#18181b',
      HEO_COLOR_PRIMARY_HOVER: '#27272a',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#6366f1',
      HEO_COLOR_BG: '#f4f4f5',
      HEO_COLOR_BG_DARK: '#09090b',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#18181b',
      HEO_COLOR_CARD_MUTED: '#e4e4e7',
      HEO_COLOR_BORDER: '#d4d4d8',
      HEO_COLOR_BORDER_DARK: '#3f3f46',
      HEO_COLOR_TEXT: '#09090b',
      HEO_COLOR_TEXT_SECONDARY: '#52525b'
    }
  },
  {
    id: 'glacier-cyan',
    name: '深海冰川蓝',
    desc: '深邃辽阔的天空与冰川青蓝，宁静致远',
    emoji: '🧊',
    colors: {
      HEO_COLOR_PRIMARY: '#0284c7',
      HEO_COLOR_PRIMARY_HOVER: '#0369a1',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#10b981',
      HEO_COLOR_BG: '#f0f9ff',
      HEO_COLOR_BG_DARK: '#081a28',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#0e263a',
      HEO_COLOR_CARD_MUTED: '#e0f2fe',
      HEO_COLOR_BORDER: '#0284c7',
      HEO_COLOR_BORDER_DARK: '#38bdf8',
      HEO_COLOR_TEXT: '#0c4a6e',
      HEO_COLOR_TEXT_SECONDARY: '#0369a1'
    }
  },
  {
    id: 'vintage-mocha',
    name: '复古暖摩卡',
    desc: '典雅浓郁的书卷纸张与暖咖啡色调，沉稳内敛',
    emoji: '☕',
    colors: {
      HEO_COLOR_PRIMARY: '#78350f',
      HEO_COLOR_PRIMARY_HOVER: '#92400e',
      HEO_COLOR_PRIMARY_TEXT: '#ffffff',
      HEO_COLOR_ACCENT: '#d97706',
      HEO_COLOR_BG: '#fefce8',
      HEO_COLOR_BG_DARK: '#1c1611',
      HEO_COLOR_CARD: '#ffffff',
      HEO_COLOR_CARD_DARK: '#261e17',
      HEO_COLOR_CARD_MUTED: '#fef9c3',
      HEO_COLOR_BORDER: '#b45309',
      HEO_COLOR_BORDER_DARK: '#d97706',
      HEO_COLOR_TEXT: '#451a03',
      HEO_COLOR_TEXT_SECONDARY: '#78350f'
    }
  }
]

// ==================== 全量社交分享服务列表 ====================
const ALL_SHARE_SERVICES = [
  { id: 'link', name: '复制链接', icon: '🔗', bg: 'bg-amber-500', desc: '一键复制当前文章链接到剪贴板' },
  { id: 'wechat', name: '微信扫码', icon: '💬', bg: 'bg-emerald-600', desc: '生成弹窗二维码供微信扫一扫' },
  { id: 'qq', name: 'QQ 分享', icon: '🐧', bg: 'bg-sky-500', desc: '分享至 QQ 好友或 QQ 空间' },
  { id: 'weibo', name: '新浪微博', icon: '🔴', bg: 'bg-red-500', desc: '一键发布图文微博' },
  { id: 'twitter', name: 'Twitter / X', icon: '𝕏', bg: 'bg-zinc-900', desc: '发布推文分享至 X (Twitter)' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', bg: 'bg-sky-500', desc: '转发至 Telegram 频道或对话' },
  { id: 'facebook', name: 'Facebook', icon: '🔵', bg: 'bg-blue-600', desc: '分享到 Facebook 动态' },
  { id: 'messenger', name: 'Messenger', icon: '💬', bg: 'bg-indigo-500', desc: '发送至 Facebook Messenger' },
  { id: 'line', name: 'LINE', icon: '🟢', bg: 'bg-green-500', desc: '分享至 LINE 好友' },
  { id: 'reddit', name: 'Reddit', icon: '🟠', bg: 'bg-orange-500', desc: '提交链接到 Reddit 社区' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '🟢', bg: 'bg-green-600', desc: '通过 WhatsApp 消息发送' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', bg: 'bg-blue-700', desc: '分享至领英职场动态' },
  { id: 'email', name: '邮件发送', icon: '✉️', bg: 'bg-gray-600', desc: '通过系统默认邮件客户端分享' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', bg: 'bg-red-600', desc: '采集文章封面至 Pinterest 画板' },
  { id: 'pocket', name: 'Pocket', icon: '🔖', bg: 'bg-rose-600', desc: '保存至 Pocket 稍后阅读' }
]

// ==================== 默认配置 ====================
const HEO_DEFAULTS = {
  TITLE: 'Terry Blog',
  DESCRIPTION: '用AI解锁英语启蒙与教育',
  AUTHOR: 'Terry 校长',
  BIO: '前沿 AI 解锁高效启蒙与教育',
  SINCE: '2025',
  HEO_LOGO_IMAGE: 'https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png',
  HEO_LOGO_SHOW_ICON: true,
  HEO_LOGO_SIZE: 38,
  HEO_HERO_TITLE_1: '分享 AI 实操',
  HEO_HERO_TITLE_2: '英语全科启蒙',
  HEO_HERO_TITLE_3: '用前沿 AI 解锁高效启蒙与教育',
  HEO_HERO_TITLE_4: '新版上线',
  HEO_HERO_TITLE_5: 'Notion Repo 轻松定制主题',
  HEO_HERO_TITLE_LINK: 'https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png',
  HEO_HERO_COVER_TITLE: '随便逛逛',
  HEO_HERO_RECOMMEND_POST_TAG: '推荐',
  HEO_HERO_RECOMMEND_POST_SORT_BY_UPDATE_TIME: false,
  HEO_HERO_RECOMMEND_COVER_ENABLE: false,
  HEO_HERO_REVERSE: false,
  HEO_HERO_BODY_REVERSE: false,
  HEO_HOME_BANNER_ENABLE: true,
  HEO_HERO_CATEGORY_1: { title: '必看精选', url: '/tag/必看精选' },
  HEO_HERO_CATEGORY_2: { title: '热门文章', url: '/tag/热门文章' },
  HEO_HERO_CATEGORY_3: { title: '实用教程', url: '/tag/实用教程' },
  HEO_NOTICE_BAR_ENABLE: true,
  HEO_NOTICE_BAR_BADGE: '此刻',
  HEO_NOTICE_BAR: [
    { title: '欢迎来 terry 校长个人博客', url: '' },
    { title: '前沿 AI 解锁高效启蒙与教育', url: '' },
    { title: '英语全科启蒙', url: '' }
  ],
  HEO_INFOCARD_GREETINGS: ['你好！我是', '🔍 分享 AI 实操', '✨英语全科启蒙', '✨AI 教育教学'],
  HEO_INFO_CARD_URL1: '/about',
  HEO_INFO_CARD_ICON1: 'fas fa-user',
  HEO_INFO_CARD_URL2: 'https://github.com/178991907/notion-repo',
  HEO_INFO_CARD_ICON2: 'fab fa-github',
  HEO_INFO_CARD_ICON_ORCID: 'fab fa-orcid',
  HEO_INFO_CARD_URL3: 'https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png',
  HEO_INFO_CARD_TEXT3: '了解更多',
  HEO_INFO_CARD_AVATAR: 'https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png',
  HEO_INFO_CARD_AVATAR_URL: '/about',
  HEO_INFO_CARD_AVATAR_SIZE: 80,
  HEO_INFO_CARD_SHOW_ANNOUNCEMENT: true,
  HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT: '🎉Notion Repo正式上线🎉\n   -- 感谢您的支持 ---\n      👏欢迎体验👏\n\n[联系作者](https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png)',
  HEO_INFO_CARD_ANNOUNCEMENT_URL: '',
  HEO_INFO_CARD_AVATAR_BLUR: true,
  HEO_SOCIAL_CARD: true,
  HEO_SOCIAL_CARD_TITLE_1: '交流频道',
  HEO_SOCIAL_CARD_TITLE_2: '加入我们的社群讨论分享',
  HEO_SOCIAL_CARD_TITLE_3: '点击加入社群',
  HEO_SOCIAL_CARD_URL: 'https://pic1.imgdb.cn/i/034BfzDhRhxZqya8uJorEM.png',
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
  HEO_SITE_CREATE_TIME: '2021-09-21',
  BEI_AN: '',
  BEI_AN_LINK: 'https://beian.miit.gov.cn',
  BEI_AN_GONGAN: '',
  FOOTER_POWER_BY: true,
  FOOTER_POWER_BY_TEXT: 'Notion Repo',
  FOOTER_POWER_BY_URL: 'https://github.com/178991907/notion-repo',
  WIDGET_PET: true,
  WIDGET_PET_LINK: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-z16@1.0.5/assets/z16.model.json',
  WIDGET_PET_CUSTOM_URL: '',
  WIDGET_PET_HEIGHT: 340,
  HEO_POST_COUNT_TITLE: '文章数:',
  HEO_SITE_TIME_TITLE: '建站天数:',
  HEO_SITE_VISIT_TITLE: '访问量:', HEO_SITE_VISITOR_TITLE: '访客数:',
  HEO_HOME_POST_TWO_COLS: true, HEO_LOADING_COVER: true,
  HEO_POST_LIST_COVER: true, HEO_POST_LIST_COVER_DEFAULT: true,
  HEO_POST_LIST_COVER_HOVER_ENLARGE: false, HEO_POST_LIST_SUMMARY: true,
  HEO_POST_LIST_PREVIEW: false, HEO_POST_LIST_IMG_CROSSOVER: true,
  TITLE: 'Notion Blog',
  DESCRIPTION: '基于 Notion 的静态博客',
  HEO_LOGO_IMAGE: '',
  HEO_LOGO_SHOW_ICON: true,
  HEO_LOGO_SIZE: 38,
  HEO_MENU_INDEX: true,
  HEO_MENU_CATEGORY: true,
  HEO_MENU_TAG: true,
  HEO_MENU_ARCHIVE: false,
  HEO_MENU_SEARCH: false,
  HEO_MENU_FRIENDS: true,
  HEO_MENU_TUTORIAL: true,
  HEO_MENU_HISTORY: true,
  HEO_MENU_ABOUT: true,
  HEO_MENU_LANG_SWITCH: true,
  HEO_MENU_SHOW_NOTION_PAGES: true,
  HEO_MENU_CUSTOM_ITEMS: [],
  HEO_ARTICLE_ADJACENT: true, HEO_ARTICLE_COPYRIGHT: true,
  HEO_ARTICLE_NOT_BY_AI: false, HEO_ARTICLE_RECOMMEND: true,
  HEO_INFO_CARD_AVATAR_BLUR: true,
  POST_SHARE_BAR_ENABLE: true,
  POSTS_SHARE_SERVICES: 'link,wechat,qq,weibo,email,facebook,twitter,telegram,messenger,line,reddit,whatsapp,linkedin',
  HEO_WIDGET_LATEST_POSTS: true, HEO_WIDGET_ANALYTICS: false,
  HEO_WIDGET_TO_TOP: true, HEO_WIDGET_TO_COMMENT: true,
  HEO_WIDGET_DARK_MODE: true, HEO_WIDGET_TOC: true,
}

// ==================== 辅助组件 ====================
function TextField({ label, configKey, value, onChange, placeholder, desc }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(configKey, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
      {desc && <p className="text-xs text-gray-400 mt-1">{desc}</p>}
    </div>
  )
}

function ColorField({ label, configKey, value, onChange }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <input type="color" value={value || '#000000'} onChange={e => onChange(configKey, e.target.value)}
        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" value={value || ''} onChange={e => onChange(configKey, e.target.value)}
          className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono mt-0.5" />
      </div>
    </div>
  )
}

function ToggleField({ label, configKey, value, onChange, desc }) {
  const isOn = value === true || value === 'true'
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      <button onClick={() => onChange(configKey, !isOn)}
        className={`relative w-12 h-6 rounded-full transition-colors ${isOn ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  )
}

function SectionTitle({ icon, title, desc }) {
  return (
    <div className="mb-6 mt-2">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h3>
      {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
    </div>
  )
}

function SectionCard({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 ${className}`}>{children}</div>
}

function DraggableItem({ index, children, onMoveUp, onMoveDown, onDelete, isFirst, isLast }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2 group hover:border-blue-300 transition">
      <div className="flex flex-col gap-1 pt-1">
        <button onClick={() => onMoveUp(index)} disabled={isFirst} className="text-gray-400 hover:text-blue-600 disabled:opacity-20 text-xs" title="上移">▲</button>
        <button onClick={() => onMoveDown(index)} disabled={isLast} className="text-gray-400 hover:text-blue-600 disabled:opacity-20 text-xs" title="下移">▼</button>
      </div>
      <div className="flex-1">{children}</div>
      <button onClick={() => onDelete(index)} className="text-gray-300 hover:text-red-500 transition p-1" title="删除">✕</button>
    </div>
  )
}

// ==================== 主页面 ====================
export default function HeoThemeEditor() {
  const router = useRouter()
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('hero')
  const [categories, setCategories] = useState([])
  const [notices, setNotices] = useState([])
  const [greetings, setGreetings] = useState([])
  const [customNavItems, setCustomNavItems] = useState([])
  const [groupIcons, setGroupIcons] = useState([])

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null } return r.json() })
      .then(data => {
        if (!data) return
        const merged = { ...HEO_DEFAULTS }
        if (data.config && typeof data.config === 'object') {
          Object.keys(data.config).forEach(k => {
            if (data.config[k] !== undefined && data.config[k] !== null) {
              merged[k] = data.config[k]
            }
          })
        } else if (Array.isArray(data.configs)) {
          data.configs.forEach(c => {
            if (c.key && c.value !== undefined && c.value !== null) {
              merged[c.key] = c.value
            }
          })
        }
        setFormData(merged)
        const cats = []
        for (let i = 1; i <= 6; i++) {
          const key = 'HEO_HERO_CATEGORY_' + i
          if (merged[key] && typeof merged[key] === 'object' && merged[key].title) cats.push({ ...merged[key] })
          else if (typeof merged[key] === 'string') { try { cats.push(JSON.parse(merged[key])) } catch(e) {} }
        }
        if (cats.length === 0) cats.push({ title: '必看精选', url: '/tag/必看精选' }, { title: '热门文章', url: '/tag/热门文章' }, { title: '实用教程', url: '/tag/实用教程' })
        setCategories(cats)
        let nb = merged.HEO_NOTICE_BAR
        if (typeof nb === 'string') { try { nb = JSON.parse(nb) } catch(e) { nb = [] } }
        setNotices(Array.isArray(nb) ? nb : [])
        let gr = merged.HEO_INFOCARD_GREETINGS
        if (typeof gr === 'string') { try { gr = JSON.parse(gr.replace(/'/g, '"')) } catch(e) { gr = gr.split(',').map(s => s.trim()) } }
        setGreetings(Array.isArray(gr) ? gr : [])
        let navs = merged.HEO_MENU_CUSTOM_ITEMS
        if (typeof navs === 'string') { try { navs = JSON.parse(navs) } catch(e) { navs = [] } }
        setCustomNavItems(Array.isArray(navs) ? navs : [])

        let gi = merged.HEO_GROUP_ICONS
        if (typeof gi === 'string') { try { gi = JSON.parse(gi) } catch(e) { gi = [] } }
        setGroupIcons(Array.isArray(gi) && gi.length > 0 ? gi : [
          { title_1: 'AfterEffect', img_1: '/images/heo/20239df3f66615b532ce571eac6d14ff21cf072602.webp', color_1: '#989bf8', title_2: 'Sketch', img_2: '/images/heo/2023e0ded7b724a39f12d59c3dc8fbdc7cbe074202.webp', color_2: '#ffffff' },
          { title_1: 'Docker', img_1: '/images/heo/20231108a540b2862d26f8850172e4ea58ed075102.webp', color_1: '#57b6e6', title_2: 'Photoshop', img_2: '/images/heo/2023e4058a91608ea41751c4f102b131f267075902.webp', color_2: '#4082c3' },
          { title_1: 'FinalCutPro', img_1: '/images/heo/20233e777652412247dd57fd9b48cf997c01070702.webp', color_1: '#ffffff', title_2: 'Python', img_2: '/images/heo/20235c0731cd4c0c95fc136a8db961fdf963071502.webp', color_2: '#ffffff' },
          { title_1: 'Swift', img_1: '/images/heo/202328bbee0b314297917b327df4a704db5c072402.webp', color_1: '#eb6840', title_2: 'Principle', img_2: '/images/heo/2023f76570d2770c8e84801f7e107cd911b5073202.webp', color_2: '#8f55ba' }
        ])

        setLoading(false)
      }).catch(err => {
        console.error('加载配置失败:', err)
        setLoading(false)
      })
  }, [])

  const handleChange = useCallback((key, value) => { setFormData(prev => ({ ...prev, [key]: value })) }, [])

  const listOps = (list, setList) => ({
    moveUp: (i) => { if (i > 0) { const n = [...list]; [n[i-1], n[i]] = [n[i], n[i-1]]; setList(n) }},
    moveDown: (i) => { if (i < list.length - 1) { const n = [...list]; [n[i], n[i+1]] = [n[i+1], n[i]]; setList(n) }},
    remove: (i) => { setList(list.filter((_, idx) => idx !== i)) },
    update: (i, field, val) => { const n = [...list]; n[i] = { ...n[i], [field]: val }; setList(n) },
  })

  const groupIconOps = listOps(groupIcons, setGroupIcons)

  const handleSave = async () => {
    setSaving(true)
    const configs = []
    Object.keys(formData).forEach(key => {
      if (key.startsWith('HEO_HERO_CATEGORY_')) return
      if (key === 'HEO_NOTICE_BAR' || key === 'HEO_INFOCARD_GREETINGS' || key === 'HEO_MENU_CUSTOM_ITEMS' || key === 'HEO_GROUP_ICONS') return
      configs.push({ key, value: formData[key] })
    })
    categories.forEach((cat, i) => { configs.push({ key: 'HEO_HERO_CATEGORY_' + (i + 1), value: cat }) })
    for (let i = categories.length + 1; i <= 6; i++) { configs.push({ key: 'HEO_HERO_CATEGORY_' + i, value: null }) }
    configs.push({ key: 'HEO_NOTICE_BAR', value: notices })
    configs.push({ key: 'HEO_INFOCARD_GREETINGS', value: greetings })
    configs.push({ key: 'HEO_MENU_CUSTOM_ITEMS', value: customNavItems.filter(item => item && item.title) })
    configs.push({ key: 'HEO_GROUP_ICONS', value: groupIcons })
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-csrf': '1' },
        body: JSON.stringify({ configs })
      })
      const result = await res.json().catch(() => ({}))
      if (res.ok && (result.success !== false)) {
        setToast({ type: 'success', msg: '✅ 所有配置已保存！刷新前台页面即可生效。' })
      } else {
        setToast({ type: 'error', msg: '❌ 保存失败：' + (result.error || '请检查登录状态') })
      }
    } catch (e) {
      setToast({ type: 'error', msg: '❌ 保存提示：' + e.message })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">加载主题配置中...</p>
      </div>
    </div>
  )

  const catOps = listOps(categories, setCategories)
  const noticeOps = listOps(notices, setNotices)
  const customNavOps = listOps(customNavItems, setCustomNavItems)
  const tabs = [
    { id: 'header', icon: '🧭', label: '顶栏导航' },
    { id: 'hero', icon: '🎯', label: '英雄区' },
    { id: 'sidebar', icon: '👤', label: '侧边栏' },
    { id: 'colors', icon: '🎨', label: '配色' },
    { id: 'layout', icon: '📐', label: '布局' },
    { id: 'article', icon: '📝', label: '文章' },
    { id: 'footer', icon: '📊', label: '页脚' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-gray-700 transition">← 返回</button>
            <h1 className="text-lg font-bold text-gray-900">🎨 Heo 主题可视化编辑器</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-blue-600 hover:underline">预览前台 ↗</a>
            <button onClick={handleSave} disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition shadow-sm">
              {saving ? '保存中...' : '💾 保存全部配置'}
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className={`fixed top-16 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      {/* Tab 导航 */}
      <div className="sticky top-14 z-40 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ==================== 顶栏导航 ==================== */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 站点品牌与名称 */}
              <SectionCard>
                <SectionTitle icon="🏷️" title="顶栏 Logo 与品牌信息" desc="控制顶栏左侧显示的 Logo 图标、站点主标题与描述" />
                <div className="space-y-4">
                  <TextField label="网站主标题 (TITLE)" configKey="TITLE" value={formData.TITLE} onChange={handleChange} placeholder="TERRY" desc="显示在顶栏最左侧的 Logo 品牌文字" />
                  
                  <div className="pt-2 border-t border-gray-100">
                    <ToggleField label="显示 Logo 图标图片" configKey="HEO_LOGO_SHOW_ICON" value={formData.HEO_LOGO_SHOW_ICON} onChange={handleChange} desc="是否在文字左侧显示 Logo 图标" />
                    {formData.HEO_LOGO_SHOW_ICON !== false && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        <div className="sm:col-span-2">
                          <TextField label="自定义 Logo 图标图片 URL" configKey="HEO_LOGO_IMAGE" value={formData.HEO_LOGO_IMAGE} onChange={handleChange} placeholder="https://... 或 /logo.png" desc="留空则自动使用 Notion 数据库的页面 Icon 图标" />
                        </div>
                        <div>
                          <TextField label="Logo 图标大小 (px)" configKey="HEO_LOGO_SIZE" value={formData.HEO_LOGO_SIZE} onChange={handleChange} placeholder="38" desc="默认 38px，推荐 36 ~ 44px" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <TextField label="网站副标题 / 描述 (DESCRIPTION)" configKey="DESCRIPTION" value={formData.DESCRIPTION} onChange={handleChange} placeholder="基于 Notion 的个人博客" desc="网站的描述信息，用于 SEO 与副标题展示" />
                    <TextField label="站长名称 (AUTHOR)" configKey="AUTHOR" value={formData.AUTHOR} onChange={handleChange} placeholder="Terry" desc="站长昵称，用于版权与名片卡" />
                  </div>
                </div>
              </SectionCard>

              {/* 系统内置功能菜单开关 */}
              <SectionCard>
                <SectionTitle icon="🧭" title="内置功能菜单开关" desc="自由开启或隐藏顶栏的所有常用功能菜单（包含模板自带菜单）" />
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">基础功能链接</h5>
                    <ToggleField label="显示「首页」菜单 (/) " configKey="HEO_MENU_INDEX" value={formData.HEO_MENU_INDEX} onChange={handleChange} desc="开启后导航栏显示首页快捷链接" />
                    <ToggleField label="显示「分类」菜单 (/category)" configKey="HEO_MENU_CATEGORY" value={formData.HEO_MENU_CATEGORY} onChange={handleChange} desc="开启后导航栏显示文章分类聚合" />
                    <ToggleField label="显示「标签」菜单 (/tag)" configKey="HEO_MENU_TAG" value={formData.HEO_MENU_TAG} onChange={handleChange} desc="开启后导航栏显示标签云链接" />
                    <ToggleField label="显示「归档」菜单 (/archive)" configKey="HEO_MENU_ARCHIVE" value={formData.HEO_MENU_ARCHIVE} onChange={handleChange} desc="开启后导航栏显示时间轴归档" />
                    <ToggleField label="显示「搜索」菜单 (/search)" configKey="HEO_MENU_SEARCH" value={formData.HEO_MENU_SEARCH} onChange={handleChange} desc="开启后导航栏菜单区显示搜索项" />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">模板拓展页面 (随时一键开关)</h5>
                    <ToggleField label="🔗 显示「友情链接」菜单 (Friendship links)" configKey="HEO_MENU_FRIENDS" value={formData.HEO_MENU_FRIENDS} onChange={handleChange} desc="控制顶部导航栏中的友情链接入口" />
                    <ToggleField label="📁 显示「建站教程」菜单 (Tutorial)" configKey="HEO_MENU_TUTORIAL" value={formData.HEO_MENU_TUTORIAL} onChange={handleChange} desc="控制顶部导航栏中的教程/知识库入口" />
                    <ToggleField label="🗃️ 显示「往期整理 / 历史」菜单 (History)" configKey="HEO_MENU_HISTORY" value={formData.HEO_MENU_HISTORY} onChange={handleChange} desc="控制顶部导航栏中的往期整理/历史归档入口" />
                    <ToggleField label="ℹ️ 显示「关于我」菜单 (About)" configKey="HEO_MENU_ABOUT" value={formData.HEO_MENU_ABOUT} onChange={handleChange} desc="控制顶部导航栏中的个人介绍/关于我入口" />
                    <ToggleField label="🌐 显示「语言切换」菜单 (中文 / English)" configKey="HEO_MENU_LANG_SWITCH" value={formData.HEO_MENU_LANG_SWITCH} onChange={handleChange} desc="控制顶部导航栏中的中英文语言切换入口" />
                  </div>
                </div>
              </SectionCard>

              {/* 自定义顶栏菜单项管理 */}
              <SectionCard className="lg:col-span-2">
                <SectionTitle icon="🔗" title="自定义顶栏菜单列表" desc="直接在此自由添加、排序、修改你的专属导航菜单（如：关于、友链、教程、GitHub 等）" />
                {customNavItems.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    暂无自定义菜单项，点击下方按钮即可添加菜单链接
                  </div>
                )}
                {customNavItems.map((item, i) => (
                  <DraggableItem key={i} index={i} onMoveUp={customNavOps.moveUp} onMoveDown={customNavOps.moveDown} onDelete={customNavOps.remove} isFirst={i === 0} isLast={i === customNavItems.length - 1}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input value={item.title || ''} onChange={e => customNavOps.update(i, 'title', e.target.value)} placeholder="菜单名称 (如: 友情链接)" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                      <input value={item.url || ''} onChange={e => customNavOps.update(i, 'url', e.target.value)} placeholder="跳转链接 (如: /links 或 https://...)" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                      <input value={item.icon || ''} onChange={e => customNavOps.update(i, 'icon', e.target.value)} placeholder="图标 class (如: fas fa-link)" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                  </DraggableItem>
                ))}
                <button onClick={() => setCustomNavItems([...customNavItems, { title: '', url: '', icon: 'fas fa-link' }])}
                  className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-600 transition text-sm">
                  + 添加自定义菜单项
                </button>
              </SectionCard>

              {/* Notion 动态页面菜单控制 */}
              <SectionCard className="lg:col-span-2">
                <SectionTitle icon="📋" title="Notion 数据库页面菜单总开关" desc="控制是否显示由 Notion 数据库自动同步生成的全部菜单项" />
                <ToggleField
                  label="显示来自 Notion 数据库的页面菜单 (总控制)"
                  configKey="HEO_MENU_SHOW_NOTION_PAGES"
                  value={formData.HEO_MENU_SHOW_NOTION_PAGES}
                  onChange={handleChange}
                  desc="关闭后，将完全隐藏 Notion 自动生成的菜单，只展示上方你自主勾选和添加的菜单项！"
                />
              </SectionCard>
            </div>

            {/* 顶栏 1:1 视觉实时预览卡片 */}
            <SectionCard>
              <SectionTitle icon="👁️" title="顶栏导航 1:1 实时预览" desc="实时查看前台顶部导航栏的完整布局效果（鼠标悬浮在 Logo 上可体验放大效果）" />
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                {/* 左侧 Logo */}
                <div className="group flex items-center gap-2.5 flex-shrink-0 cursor-pointer">
                  {formData.HEO_LOGO_SHOW_ICON !== false && (
                    formData.HEO_LOGO_IMAGE ? (
                      <img
                        src={formData.HEO_LOGO_IMAGE}
                        alt="Logo"
                        style={{ width: `${Math.max(24, Math.min(56, parseInt(formData.HEO_LOGO_SIZE) || 38))}px`, height: `${Math.max(24, Math.min(56, parseInt(formData.HEO_LOGO_SIZE) || 38))}px` }}
                        className="rounded-xl object-cover shadow-sm transition-transform duration-300 group-hover:scale-125 z-10"
                      />
                    ) : (
                      <div
                        style={{ width: `${Math.max(24, Math.min(56, parseInt(formData.HEO_LOGO_SIZE) || 38))}px`, height: `${Math.max(24, Math.min(56, parseInt(formData.HEO_LOGO_SIZE) || 38))}px` }}
                        className="bg-black text-white rounded-xl font-extrabold flex items-center justify-center text-sm shadow-sm transition-transform duration-300 group-hover:scale-125 z-10"
                      >
                        N
                      </div>
                    )
                  )}
                  <div className="font-extrabold text-base text-gray-900 tracking-tight">{formData.TITLE || 'TERRY'}</div>
                </div>

                {/* 中间菜单项 */}
                <div className="hidden md:flex items-center gap-3 text-xs text-gray-700 font-medium overflow-x-auto">
                  {formData.HEO_MENU_INDEX !== false && <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">🏠 首页</span>}
                  {formData.HEO_MENU_CATEGORY !== false && <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">📁 分类</span>}
                  {formData.HEO_MENU_TAG !== false && <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">🏷️ 标签</span>}
                  {formData.HEO_MENU_ARCHIVE && <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">🗃️ 归档</span>}
                  {formData.HEO_MENU_SEARCH && <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">🔍 搜索</span>}
                  {customNavItems.map((item, idx) => (
                    item.title && <span key={idx} className="hover:text-blue-600 cursor-pointer flex items-center gap-1 font-bold text-blue-600">🔗 {item.title}</span>
                  ))}
                  {formData.HEO_MENU_SHOW_NOTION_PAGES !== false && (
                    <>
                      {formData.HEO_MENU_FRIENDS !== false && <span className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-1">🔗 友情链接</span>}
                      {formData.HEO_MENU_TUTORIAL !== false && <span className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-1">📁 建站教程</span>}
                      {formData.HEO_MENU_HISTORY !== false && <span className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-1">🗃️ 往期整理</span>}
                      {formData.HEO_MENU_ABOUT !== false && <span className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-1">ℹ️ 关于我</span>}
                      {formData.HEO_MENU_LANG_SWITCH !== false && <span className="text-gray-700 hover:text-blue-600 cursor-pointer flex items-center gap-1">🌐 语言切换</span>}
                    </>
                  )}
                </div>

                {/* 右侧功能按钮组 */}
                <div className="flex items-center gap-1 flex-shrink-0 text-gray-700">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs" title="RSS 订阅">📡</div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs" title="随机文章">📻</div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs" title="搜索">🔍</div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs" title="夜间模式">🌙</div>
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs" title="返回顶部">⬆️</div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ==================== 英雄区 ==================== */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard>
              <SectionTitle icon="🖼️" title="左侧大 Banner" desc="首页顶部英雄区的主视觉区域" />
              <ToggleField label="启用首页 Banner" configKey="HEO_HOME_BANNER_ENABLE" value={formData.HEO_HOME_BANNER_ENABLE} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="主标题第一行" configKey="HEO_HERO_TITLE_1" value={formData.HEO_HERO_TITLE_1} onChange={handleChange} placeholder="分享编程" />
                <TextField label="主标题第二行" configKey="HEO_HERO_TITLE_2" value={formData.HEO_HERO_TITLE_2} onChange={handleChange} placeholder="与思维认知" />
              </div>
              <TextField label="英文副标题" configKey="HEO_HERO_TITLE_3" value={formData.HEO_HERO_TITLE_3} onChange={handleChange} placeholder="TANGLY1024.COM" />
              <TextField label="鼠标悬浮遮罩文字" configKey="HEO_HERO_COVER_TITLE" value={formData.HEO_HERO_COVER_TITLE} onChange={handleChange} placeholder="随便逛逛" />
              <ToggleField label="左右区域翻转" configKey="HEO_HERO_REVERSE" value={formData.HEO_HERO_REVERSE} onChange={handleChange} desc="交换英雄区左右侧组件" />
              <ToggleField label="博客主体区左右翻转" configKey="HEO_HERO_BODY_REVERSE" value={formData.HEO_HERO_BODY_REVERSE} onChange={handleChange} />
              {/* 实时预览 */}
              <div className="mt-4 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-2xl font-bold">{formData.HEO_HERO_TITLE_1 || '分享编程'}</div>
                  <div className="text-2xl font-bold">{formData.HEO_HERO_TITLE_2 || '与思维认知'}</div>
                  <div className="text-xs mt-2 opacity-70">{formData.HEO_HERO_TITLE_3 || 'TANGLY1024.COM'}</div>
                </div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                  <span className="text-3xl font-extrabold">{formData.HEO_HERO_COVER_TITLE || '随便逛逛'}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionTitle icon="⭐" title="右侧推荐卡片" desc="英雄区右侧的推荐文章区域" />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="推荐副标题" configKey="HEO_HERO_TITLE_4" value={formData.HEO_HERO_TITLE_4} onChange={handleChange} placeholder="新版上线" />
                <TextField label="推荐主标题" configKey="HEO_HERO_TITLE_5" value={formData.HEO_HERO_TITLE_5} onChange={handleChange} placeholder="轻松定制主题" />
              </div>
              <TextField label="推荐卡片跳转链接" configKey="HEO_HERO_TITLE_LINK" value={formData.HEO_HERO_TITLE_LINK} onChange={handleChange} placeholder="https://..." />
              <TextField label="推荐文章抓取标签" configKey="HEO_HERO_RECOMMEND_POST_TAG" value={formData.HEO_HERO_RECOMMEND_POST_TAG} onChange={handleChange}
                desc="填写 Notion 中的文章标签名。无匹配文章时右侧区域自动隐藏。" />
              <ToggleField label="按更新时间排序" configKey="HEO_HERO_RECOMMEND_POST_SORT_BY_UPDATE_TIME" value={formData.HEO_HERO_RECOMMEND_POST_SORT_BY_UPDATE_TIME} onChange={handleChange} />
              <ToggleField label="推荐区遮罩覆盖" configKey="HEO_HERO_RECOMMEND_COVER_ENABLE" value={formData.HEO_HERO_RECOMMEND_COVER_ENABLE} onChange={handleChange} desc="开启后需点击才能查看推荐文章" />
            </SectionCard>

            {/* 分类卡片 */}
            <SectionCard className="lg:col-span-2">
              <SectionTitle icon="🏷️" title="分类快捷入口卡片" desc="英雄区下方的彩色标签卡片，1~6 个，可排序增删" />
              <div className="flex gap-3 mb-4 flex-wrap">
                {categories.map((cat, i) => {
                  const colors = ['bg-blue-600 text-white','bg-gradient-to-r from-red-500 to-yellow-500 text-white','bg-gradient-to-r from-teal-300 to-cyan-300 text-white','bg-gradient-to-r from-blue-500 to-indigo-500 text-white','bg-gradient-to-r from-pink-500 to-rose-500 text-white','bg-gradient-to-r from-emerald-400 to-green-500 text-white']
                  return <div key={i} className={`${colors[i % colors.length]} px-5 py-3 rounded-xl font-bold text-sm`}>{cat.title || '未命名'}</div>
                })}
              </div>
              {categories.map((cat, i) => (
                <DraggableItem key={i} index={i} onMoveUp={catOps.moveUp} onMoveDown={catOps.moveDown} onDelete={catOps.remove} isFirst={i === 0} isLast={i === categories.length - 1}>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={cat.title || ''} onChange={e => catOps.update(i, 'title', e.target.value)} placeholder="卡片名称" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                    <input value={cat.url || ''} onChange={e => catOps.update(i, 'url', e.target.value)} placeholder="跳转链接 /tag/xxx" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                </DraggableItem>
              ))}
              <button onClick={() => { if (categories.length < 6) setCategories([...categories, { title: '', url: '' }]) }} disabled={categories.length >= 6}
                className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-600 transition text-sm disabled:opacity-30">
                + 添加卡片 ({categories.length}/6)
              </button>
            </SectionCard>

            {/* 首页顶部滚动通知栏 (此刻) */}
            <SectionCard className="lg:col-span-2">
              <SectionTitle icon="📢" title="首页顶部滚动通知横幅（此刻 / NoticeBar）" desc="首页顶部横贯全屏的精致轮播通知条，支持多条公告轮播与点击跳转" />

              {/* 1:1 动态实时渲染预览 */}
              <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-gray-500 flex items-center justify-between">
                  <span>👁️ 前台 1:1 动态轮播实时预览效果:</span>
                  {formData.HEO_NOTICE_BAR_ENABLE === false && (
                    <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded font-normal">当前已全局隐藏</span>
                  )}
                </div>
                
                {formData.HEO_NOTICE_BAR_ENABLE !== false && notices.length > 0 ? (
                  <div className="bg-white border border-gray-200 hover:border-blue-500 shadow-sm rounded-xl h-12 flex items-center justify-between px-5 transition-all duration-300">
                    <span className="text-sm font-extrabold text-blue-600 whitespace-nowrap">
                      {formData.HEO_NOTICE_BAR_BADGE || '此刻'}
                    </span>
                    <div className="text-sm font-bold text-gray-800 flex-1 text-center truncate px-4">
                      {notices[0]?.title || '欢迎来到我的博客'}
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                    {formData.HEO_NOTICE_BAR_ENABLE === false ? '通知栏已被关闭' : '暂无通知内容，添加下方通知后即可在前台展示'}
                  </div>
                )}
              </div>

              {/* 功能开关与左侧徽标 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                <ToggleField
                  label="启用首页顶部滚动通知横幅"
                  configKey="HEO_NOTICE_BAR_ENABLE"
                  value={formData.HEO_NOTICE_BAR_ENABLE}
                  onChange={handleChange}
                  desc="关闭后首页将完全隐藏顶部的「此刻」长条通知卡片"
                />
                <TextField
                  label="左侧徽标文案 (默认: 此刻)"
                  configKey="HEO_NOTICE_BAR_BADGE"
                  value={formData.HEO_NOTICE_BAR_BADGE}
                  onChange={handleChange}
                  placeholder="此刻"
                  desc="可自定义为：公告、广播、NEWS、更新 等"
                />
              </div>

              {/* 通知列表 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-700">📋 轮播通知内容列表 (每 3 秒自动切换)</h4>
                  <span className="text-xs text-gray-400">共 {notices.length} 条</span>
                </div>
                {notices.map((n, i) => (
                  <DraggableItem key={i} index={i} onMoveUp={noticeOps.moveUp} onMoveDown={noticeOps.moveDown} onDelete={noticeOps.remove} isFirst={i === 0} isLast={i === notices.length - 1}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">公告文案</label>
                        <input value={n.title || ''} onChange={e => noticeOps.update(i, 'title', e.target.value)} placeholder="例如：欢迎来到 Terry 校长的博客" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-0.5">点击跳转链接 (可选)</label>
                        <input value={n.url || ''} onChange={e => noticeOps.update(i, 'url', e.target.value)} placeholder="例如：https://... 或 /about" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </DraggableItem>
                ))}
                <button
                  type="button"
                  onClick={() => setNotices([...notices, { title: '新的通知公告', url: '' }])}
                  className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition text-xs font-semibold"
                >
                  + 添加一条滚动通知
                </button>
              </div>
            </SectionCard>

            {/* 🎨 英雄区背景浮动图标群 */}
            <SectionCard className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <SectionTitle icon="🎨" title="英雄区背景浮动技能图标群" desc="大卡片右上角斜向无限漂浮的技能/工具图标对（每组包含上下两个图标）" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGroupIcons([
                        { title_1: 'ChatGPT', img_1: 'https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png', color_1: '#10a37f', title_2: 'Claude', img_2: 'https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png', color_2: '#d97706' },
                        { title_1: 'Python', img_1: '/images/heo/20235c0731cd4c0c95fc136a8db961fdf963071502.webp', color_1: '#3776ab', title_2: 'Docker', img_2: '/images/heo/20231108a540b2862d26f8850172e4ea58ed075102.webp', color_2: '#2496ed' },
                        { title_1: 'Notion', img_1: 'https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png', color_1: '#000000', title_2: 'AI', img_2: 'https://pic1.imgdb.cn/i/37IqlxOxneBI8BGe8NiYsT.png', color_2: '#4f46e5' }
                      ])
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                  >
                    🤖 一键加载 AI 实操预设
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupIcons([
                        { title_1: 'AfterEffect', img_1: '/images/heo/20239df3f66615b532ce571eac6d14ff21cf072602.webp', color_1: '#989bf8', title_2: 'Sketch', img_2: '/images/heo/2023e0ded7b724a39f12d59c3dc8fbdc7cbe074202.webp', color_2: '#ffffff' },
                        { title_1: 'Docker', img_1: '/images/heo/20231108a540b2862d26f8850172e4ea58ed075102.webp', color_1: '#57b6e6', title_2: 'Photoshop', img_2: '/images/heo/2023e4058a91608ea41751c4f102b131f267075902.webp', color_2: '#4082c3' },
                        { title_1: 'FinalCutPro', img_1: '/images/heo/20233e777652412247dd57fd9b48cf997c01070702.webp', color_1: '#ffffff', title_2: 'Python', img_2: '/images/heo/20235c0731cd4c0c95fc136a8db961fdf963071502.webp', color_2: '#ffffff' },
                        { title_1: 'Swift', img_1: '/images/heo/202328bbee0b314297917b327df4a704db5c072402.webp', color_1: '#eb6840', title_2: 'Principle', img_2: '/images/heo/2023f76570d2770c8e84801f7e107cd911b5073202.webp', color_2: '#8f55ba' }
                      ])
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                  >
                    🔄 恢复官方全套预设
                  </button>
                </div>
              </div>

              {/* 图标对列表 */}
              <div className="space-y-3">
                {groupIcons.map((item, i) => (
                  <DraggableItem key={i} index={i} onMoveUp={groupIconOps.moveUp} onMoveDown={groupIconOps.moveDown} onDelete={groupIconOps.remove} isFirst={i === 0} isLast={i === groupIcons.length - 1}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-gray-100">
                      {/* 上方图标 */}
                      <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 md:pr-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color_1 || '#4f46e5' }} />
                            上方图标 1
                          </span>
                          <input type="color" value={item.color_1 || '#4f46e5'} onChange={e => groupIconOps.update(i, 'color_1', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" title="选择底色" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={item.title_1 || ''} onChange={e => groupIconOps.update(i, 'title_1', e.target.value)} placeholder="图标名称 (如 Python)" className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                          <input value={item.color_1 || ''} onChange={e => groupIconOps.update(i, 'color_1', e.target.value)} placeholder="底色代码 (如 #3776ab)" className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono" />
                        </div>
                        <input value={item.img_1 || ''} onChange={e => groupIconOps.update(i, 'img_1', e.target.value)} placeholder="图片 URL (支持外链 https://... 或 /images/heo/...)" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                      </div>

                      {/* 下方图标 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color_2 || '#4082c3' }} />
                            下方图标 2
                          </span>
                          <input type="color" value={item.color_2 || '#4082c3'} onChange={e => groupIconOps.update(i, 'color_2', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" title="选择底色" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={item.title_2 || ''} onChange={e => groupIconOps.update(i, 'title_2', e.target.value)} placeholder="图标名称 (如 Docker)" className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                          <input value={item.color_2 || ''} onChange={e => groupIconOps.update(i, 'color_2', e.target.value)} placeholder="底色代码 (如 #2496ed)" className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono" />
                        </div>
                        <input value={item.img_2 || ''} onChange={e => groupIconOps.update(i, 'img_2', e.target.value)} placeholder="图片 URL (支持外链 https://... 或 /images/heo/...)" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                      </div>
                    </div>
                  </DraggableItem>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setGroupIcons([...groupIcons, { title_1: 'New Icon', img_1: '/images/heo/20235c0731cd4c0c95fc136a8db961fdf963071502.webp', color_1: '#4f46e5', title_2: 'New Icon 2', img_2: '/images/heo/20231108a540b2862d26f8850172e4ea58ed075102.webp', color_2: '#3b82f6' }])}
                className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition text-sm font-medium"
              >
                + 添加一组背景浮动图标对
              </button>
            </SectionCard>
          </div>
        )}

        {/* ==================== 侧边栏 ==================== */}
        {activeTab === 'sidebar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard>
              <SectionTitle icon="💳" title="个人名片卡与头像" desc="右侧边栏顶部的个人资料名片与公告" />
              <div className="mb-4 p-4 bg-blue-600 rounded-xl text-white relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="bg-blue-500 inline-block px-2 py-1 rounded text-xs mb-2">{greetings[0] || '你好！我是'}</div>
                  {formData.HEO_INFO_CARD_AVATAR ? (
                    <img src={formData.HEO_INFO_CARD_AVATAR} alt="头像预览" className="w-13 h-13 rounded-full object-cover border-2 border-white/50 shadow-sm" style={{ width: `${Math.min(64, Math.max(32, parseInt(formData.HEO_INFO_CARD_AVATAR_SIZE) || 52))}px`, height: `${Math.min(64, Math.max(32, parseInt(formData.HEO_INFO_CARD_AVATAR_SIZE) || 52))}px` }} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm border-2 border-white/40">N</div>
                  )}
                </div>
                <div className="text-2xl font-extrabold mt-1">{formData.AUTHOR || 'Notion Repo'}</div>
                {formData.HEO_INFO_CARD_SHOW_ANNOUNCEMENT !== false && (
                  <div className="text-xs text-white/95 mt-2.5 bg-blue-700/50 p-2.5 rounded-lg border border-white/10">
                    {formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT ? (
                      <RichNoticePreview content={formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT} defaultUrl={formData.HEO_INFO_CARD_ANNOUNCEMENT_URL} />
                    ) : (
                      <div className="text-white/80">📢 [Notion 动态公告] 默认读取 Notion Notice 数据库文章内容...</div>
                    )}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <span className="bg-blue-500 p-2 rounded-full text-xs"><i className={formData.HEO_INFO_CARD_ICON1 || 'fas fa-user'} /></span>
                  <span className="bg-blue-500 p-2 rounded-full text-xs"><i className={formData.HEO_INFO_CARD_ICON2 || 'fab fa-github'} /></span>
                  <span className="bg-blue-500 px-3 py-2 rounded-full text-xs font-bold">{formData.HEO_INFO_CARD_TEXT3 || '了解更多'}</span>
                </div>
              </div>

              {/* 站长昵称与个人身份 */}
              <h4 className="text-sm font-bold text-gray-700 mb-2">👤 站长昵称与身份简介</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  label="站长昵称 / 名片主名称 (AUTHOR)"
                  configKey="AUTHOR"
                  value={formData.AUTHOR}
                  onChange={handleChange}
                  placeholder="Terry 校长"
                  desc="显示在个人名片卡正中央的大字姓名/昵称"
                />
                <TextField
                  label="个人简介 / 标语 (BIO)"
                  configKey="BIO"
                  value={formData.BIO}
                  onChange={handleChange}
                  placeholder="前沿 AI 解锁高效启蒙与教育"
                  desc="站长的一句话个性介绍"
                />
              </div>

              {/* 头像配置 */}
              <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">🖼️ 头像与跳转</h4>
              <TextField label="自定义头像图片 URL" configKey="HEO_INFO_CARD_AVATAR" value={formData.HEO_INFO_CARD_AVATAR} onChange={handleChange} placeholder="https://... 或 /avatar.png" desc="留空则默认使用 Notion 头像 / AVATAR 图标" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="点击头像跳转链接" configKey="HEO_INFO_CARD_AVATAR_URL" value={formData.HEO_INFO_CARD_AVATAR_URL} onChange={handleChange} placeholder="/about" desc="点击头像时跳转的地址" />
                <TextField label="头像像素大小 (px)" configKey="HEO_INFO_CARD_AVATAR_SIZE" value={formData.HEO_INFO_CARD_AVATAR_SIZE} onChange={handleChange} placeholder="80" desc="推荐 64 ~ 80 像素，醒目大头像" />
              </div>
              <ToggleField label="文章页头像虚化" configKey="HEO_INFO_CARD_AVATAR_BLUR" value={formData.HEO_INFO_CARD_AVATAR_BLUR} onChange={handleChange} desc="在文章详情页名片头像显示为模糊装饰效果" />

              {/* 公告栏配置 */}
              <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">📢 名片公告与富文本排版</h4>
              <ToggleField label="显示名片公告" configKey="HEO_INFO_CARD_SHOW_ANNOUNCEMENT" value={formData.HEO_INFO_CARD_SHOW_ANNOUNCEMENT} onChange={handleChange} desc="是否在个人名片卡中展示公告区域" />
              
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-800">自定义公告展示内容 (支持 Markdown 富文本、Emoji、图片、超链接)</label>
                  <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">支持多链接混排</span>
                </div>

                {/* 快捷插入工具条 */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-gray-200 rounded-lg text-xs">
                  <span className="text-gray-400 text-[11px] mr-1">快捷插入:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT || ''
                      handleChange('HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT', text + (text ? '\n' : '') + '[链接文字描述](https://example.com)')
                    }}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition font-medium flex items-center gap-1"
                  >
                    🔗 超链接
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT || ''
                      handleChange('HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT', text + (text ? '\n' : '') + '![图片描述](https://example.com/pic.png)')
                    }}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition font-medium flex items-center gap-1"
                  >
                    🖼️ 插入图片
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT || ''
                      handleChange('HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT', text + ' **加粗文字**')
                    }}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded transition font-medium flex items-center gap-1 font-bold"
                  >
                    𝗕 加粗
                  </button>
                  <div className="h-3 w-px bg-gray-200 mx-1" />
                  {['🌻', '👭', '🚀', '🎉', '👏', '💡', '💬', '📌'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        const text = formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT || ''
                        handleChange('HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT', text + emoji + ' ')
                      }}
                      className="px-1.5 py-0.5 hover:bg-gray-100 rounded text-sm transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT || ''}
                  onChange={e => handleChange('HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT', e.target.value)}
                  placeholder="例如：&#10;🌻 **Notion笔记建站**&#10;轻松放大您的个人品牌！&#10;&#10;👭 [查看成功案例](https://your-link.com)&#10;&#10;🚀 **V4.0即将上线**&#10;请移步 [Notion Repo文档中心](https://docs.tangly1024.com)"
                  className="w-full font-mono border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />

                {/* 实时富文本渲染预览 */}
                {formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT && (
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-inner">
                    <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                      <span>👁️ 前台公告实时渲染效果:</span>
                    </div>
                    <RichNoticePreview
                      content={formData.HEO_INFO_CARD_CUSTOM_ANNOUNCEMENT}
                      defaultUrl={formData.HEO_INFO_CARD_ANNOUNCEMENT_URL}
                    />
                  </div>
                )}
              </div>

              <TextField
                label="🔗 点击公告默认跳转 URL (可选兜底)"
                configKey="HEO_INFO_CARD_ANNOUNCEMENT_URL"
                value={formData.HEO_INFO_CARD_ANNOUNCEMENT_URL}
                onChange={handleChange}
                placeholder="https://... 或 /about"
                desc="当某一行文字未单独设置 [文字](链接) 时，点击该行触发的全局兜底跳转地址。留空则纯展示。"
              />

              {/* 欢迎语 */}
              <h4 className="text-sm font-bold text-gray-700 mt-4 mb-2">✨ 欢迎语 (点击随机切换)</h4>
              {greetings.map((g, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={g} onChange={e => { const n = [...greetings]; n[i] = e.target.value; setGreetings(n) }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" placeholder="欢迎语" />
                  <button onClick={() => setGreetings(greetings.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-500 px-2">✕</button>
                </div>
              ))}
              <button onClick={() => setGreetings([...greetings, ''])}
                className="mt-1 w-full py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition text-xs">
                + 添加欢迎语
              </button>
            </SectionCard>

            <SectionCard>
              <SectionTitle icon="🔗" title="名片按钮与社交链接" desc="名片底部的图标按钮和跳转链接" />
              <h4 className="text-sm font-bold text-gray-600 mb-2">按钮 1 (个人主页)</h4>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="跳转链接" configKey="HEO_INFO_CARD_URL1" value={formData.HEO_INFO_CARD_URL1} onChange={handleChange} placeholder="/about" />
                <TextField label="图标 class" configKey="HEO_INFO_CARD_ICON1" value={formData.HEO_INFO_CARD_ICON1} onChange={handleChange} placeholder="fas fa-user" desc="Font Awesome 图标类名" />
              </div>
              <h4 className="text-sm font-bold text-gray-600 mb-2 mt-3">按钮 2 (GitHub)</h4>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="跳转链接" configKey="HEO_INFO_CARD_URL2" value={formData.HEO_INFO_CARD_URL2} onChange={handleChange} placeholder="https://github.com/..." />
                <TextField label="图标 class" configKey="HEO_INFO_CARD_ICON2" value={formData.HEO_INFO_CARD_ICON2} onChange={handleChange} placeholder="fab fa-github" />
              </div>
              <h4 className="text-sm font-bold text-gray-600 mb-2 mt-3">按钮 3 (了解更多)</h4>
              <TextField label="按钮文字" configKey="HEO_INFO_CARD_TEXT3" value={formData.HEO_INFO_CARD_TEXT3} onChange={handleChange} placeholder="了解更多" />
              <TextField label="跳转链接" configKey="HEO_INFO_CARD_URL3" value={formData.HEO_INFO_CARD_URL3} onChange={handleChange} placeholder="https://..." />
              <TextField label="ORCID 图标 class" configKey="HEO_INFO_CARD_ICON_ORCID" value={formData.HEO_INFO_CARD_ICON_ORCID} onChange={handleChange} placeholder="fab fa-orcid" />
            </SectionCard>

            <SectionCard className="lg:col-span-2">
              <SectionTitle icon="💬" title="社群交流卡片" desc="侧边栏的社群入口卡片" />
              <div className="mb-4 p-4 bg-blue-600 rounded-xl text-white inline-block">
                <div className="text-xl font-extrabold">{formData.HEO_SOCIAL_CARD_TITLE_1 || '交流频道'}</div>
                <div className="text-sm opacity-80 mt-1">{formData.HEO_SOCIAL_CARD_TITLE_2 || '加入我们的社群讨论分享'}</div>
              </div>
              <ToggleField label="启用社群卡片" configKey="HEO_SOCIAL_CARD" value={formData.HEO_SOCIAL_CARD} onChange={handleChange} />
              <div className="grid grid-cols-3 gap-4">
                <TextField label="主标题" configKey="HEO_SOCIAL_CARD_TITLE_1" value={formData.HEO_SOCIAL_CARD_TITLE_1} onChange={handleChange} placeholder="交流频道" />
                <TextField label="副标题" configKey="HEO_SOCIAL_CARD_TITLE_2" value={formData.HEO_SOCIAL_CARD_TITLE_2} onChange={handleChange} placeholder="加入社群分享" />
                <TextField label="按钮文字" configKey="HEO_SOCIAL_CARD_TITLE_3" value={formData.HEO_SOCIAL_CARD_TITLE_3} onChange={handleChange} placeholder="点击加入社群" />
              </div>
              <TextField label="跳转链接" configKey="HEO_SOCIAL_CARD_URL" value={formData.HEO_SOCIAL_CARD_URL} onChange={handleChange} placeholder="https://..." />
            </SectionCard>
          </div>
        )}

        {/* ==================== 配色 ==================== */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* 预设配色卡片网格 */}
            <SectionCard>
              <SectionTitle icon="✨" title="预设配色方案 (一键换肤)" desc="精选 8 套专业调色方案，点击任意方案即可一键应用全部颜色。套用后依然可在下方自由微调！" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLOR_PRESETS.map(preset => {
                  const isCurrent = formData.HEO_COLOR_PRIMARY?.toLowerCase() === preset.colors.HEO_COLOR_PRIMARY.toLowerCase()
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, ...preset.colors }))
                        setToast({ type: 'success', msg: `✨ 已套用「${preset.name}」配色方案！记得点击底部保存。` })
                        setTimeout(() => setToast(null), 3000)
                      }}
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative ${
                        isCurrent ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20' : 'border-gray-200 bg-white hover:border-blue-400'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          使用中
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{preset.emoji}</span>
                        <span className="font-bold text-sm text-gray-900">{preset.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{preset.desc}</p>
                      {/* 色卡色块预览 */}
                      <div className="flex items-center gap-1.5 bg-gray-100 p-2 rounded-lg">
                        <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: preset.colors.HEO_COLOR_PRIMARY }} title="主色" />
                        <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: preset.colors.HEO_COLOR_ACCENT }} title="强调色" />
                        <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: preset.colors.HEO_COLOR_BG }} title="页面背景" />
                        <div className="w-5 h-5 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: preset.colors.HEO_COLOR_BG_DARK }} title="暗色背景" />
                        <span className="text-[10px] text-gray-400 ml-auto font-mono">{preset.colors.HEO_COLOR_PRIMARY}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            {/* 单项微调与实时预览 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard>
                <SectionTitle icon="🌈" title="品牌色 (浅色模式微调)" desc="在预设基础上自由微调每个单独的颜色字段" />
                <ColorField label="主色调" configKey="HEO_COLOR_PRIMARY" value={formData.HEO_COLOR_PRIMARY} onChange={handleChange} />
                <ColorField label="主色调悬浮" configKey="HEO_COLOR_PRIMARY_HOVER" value={formData.HEO_COLOR_PRIMARY_HOVER} onChange={handleChange} />
                <ColorField label="主色文字色" configKey="HEO_COLOR_PRIMARY_TEXT" value={formData.HEO_COLOR_PRIMARY_TEXT} onChange={handleChange} />
                <ColorField label="强调色 (Accent)" configKey="HEO_COLOR_ACCENT" value={formData.HEO_COLOR_ACCENT} onChange={handleChange} />
                <ColorField label="页面背景" configKey="HEO_COLOR_BG" value={formData.HEO_COLOR_BG} onChange={handleChange} />
                <ColorField label="卡片背景" configKey="HEO_COLOR_CARD" value={formData.HEO_COLOR_CARD} onChange={handleChange} />
                <ColorField label="卡片柔和色" configKey="HEO_COLOR_CARD_MUTED" value={formData.HEO_COLOR_CARD_MUTED} onChange={handleChange} />
                <ColorField label="边框色" configKey="HEO_COLOR_BORDER" value={formData.HEO_COLOR_BORDER} onChange={handleChange} />
                <ColorField label="正文文字" configKey="HEO_COLOR_TEXT" value={formData.HEO_COLOR_TEXT} onChange={handleChange} />
                <ColorField label="次要文字" configKey="HEO_COLOR_TEXT_SECONDARY" value={formData.HEO_COLOR_TEXT_SECONDARY} onChange={handleChange} />
              </SectionCard>

              <SectionCard>
                <SectionTitle icon="🌙" title="暗色模式微调" desc="夜间模式下的颜色覆盖" />
                <ColorField label="暗色背景" configKey="HEO_COLOR_BG_DARK" value={formData.HEO_COLOR_BG_DARK} onChange={handleChange} />
                <ColorField label="暗色卡片" configKey="HEO_COLOR_CARD_DARK" value={formData.HEO_COLOR_CARD_DARK} onChange={handleChange} />
                <ColorField label="暗色边框" configKey="HEO_COLOR_BORDER_DARK" value={formData.HEO_COLOR_BORDER_DARK} onChange={handleChange} />
                
                {/* 实时预览 */}
                <div className="mt-6 p-4 rounded-xl border border-gray-200">
                  <h5 className="text-sm font-bold mb-3">📺 实时配色效果预览</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: formData.HEO_COLOR_BG || '#f7f9fe' }}>
                      <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: formData.HEO_COLOR_CARD || '#ffffff', border: '1px solid ' + (formData.HEO_COLOR_BORDER || '#4f46e5') }}>
                        <div className="text-xs font-bold" style={{ color: formData.HEO_COLOR_TEXT || '#111827' }}>标题文字示例</div>
                        <div className="text-xs mt-1" style={{ color: formData.HEO_COLOR_TEXT_SECONDARY || '#4b5563' }}>次要正文描述内容</div>
                        <div className="mt-3 flex gap-2 items-center">
                          <div className="text-xs px-2.5 py-1 rounded-md font-medium text-white shadow-sm" style={{ backgroundColor: formData.HEO_COLOR_PRIMARY || '#4f65f0' }}>主按钮</div>
                          <div className="text-xs px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: formData.HEO_COLOR_ACCENT || '#dca846' }}>TAG</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: formData.HEO_COLOR_BG_DARK || '#18171d' }}>
                      <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: formData.HEO_COLOR_CARD_DARK || '#1e1e1e', border: '1px solid ' + (formData.HEO_COLOR_BORDER_DARK || '#dca846') }}>
                        <div className="text-xs font-bold text-white">暗色标题文字</div>
                        <div className="text-xs mt-1 text-gray-400">暗色正文描述内容</div>
                        <div className="mt-3 flex gap-2 items-center">
                          <div className="text-xs px-2.5 py-1 rounded-md font-medium text-white shadow-sm" style={{ backgroundColor: formData.HEO_COLOR_PRIMARY || '#4f65f0' }}>主按钮</div>
                          <div className="text-xs px-2 py-0.5 rounded text-white font-bold" style={{ backgroundColor: formData.HEO_COLOR_ACCENT || '#dca846' }}>TAG</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center mt-3 text-gray-400">← 浅色模式预览 | 暗色模式预览 →</div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ==================== 布局 ==================== */}
        {activeTab === 'layout' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard>
              <SectionTitle icon="📐" title="首页布局" desc="控制首页的排列方式和加载行为" />
              <ToggleField label="首页文章双列显示" configKey="HEO_HOME_POST_TWO_COLS" value={formData.HEO_HOME_POST_TWO_COLS} onChange={handleChange} desc="false 时只显示一列" />
              <ToggleField label="页面加载遮罩动画" configKey="HEO_LOADING_COVER" value={formData.HEO_LOADING_COVER} onChange={handleChange} />
            </SectionCard>
            <SectionCard>
              <SectionTitle icon="🖼️" title="文章列表" desc="文章列表的封面和摘要设置" />
              <ToggleField label="显示文章封面" configKey="HEO_POST_LIST_COVER" value={formData.HEO_POST_LIST_COVER} onChange={handleChange} />
              <ToggleField label="封面悬停放大" configKey="HEO_POST_LIST_COVER_HOVER_ENLARGE" value={formData.HEO_POST_LIST_COVER_HOVER_ENLARGE} onChange={handleChange} />
              <ToggleField label="无封面时用站点背景" configKey="HEO_POST_LIST_COVER_DEFAULT" value={formData.HEO_POST_LIST_COVER_DEFAULT} onChange={handleChange} />
              <ToggleField label="显示文章摘要" configKey="HEO_POST_LIST_SUMMARY" value={formData.HEO_POST_LIST_SUMMARY} onChange={handleChange} />
              <ToggleField label="读取文章预览" configKey="HEO_POST_LIST_PREVIEW" value={formData.HEO_POST_LIST_PREVIEW} onChange={handleChange} />
              <ToggleField label="封面左右交错" configKey="HEO_POST_LIST_IMG_CROSSOVER" value={formData.HEO_POST_LIST_IMG_CROSSOVER} onChange={handleChange} desc="奇偶行的封面图片左右交替显示" />
            </SectionCard>
            <SectionCard className="lg:col-span-2">
              <SectionTitle icon="🔧" title="悬浮小组件" desc="页面右侧/底部的悬浮功能按钮" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8">
                <ToggleField label="最新文章卡" configKey="HEO_WIDGET_LATEST_POSTS" value={formData.HEO_WIDGET_LATEST_POSTS} onChange={handleChange} />
                <ToggleField label="统计面板" configKey="HEO_WIDGET_ANALYTICS" value={formData.HEO_WIDGET_ANALYTICS} onChange={handleChange} />
                <ToggleField label="回到顶部" configKey="HEO_WIDGET_TO_TOP" value={formData.HEO_WIDGET_TO_TOP} onChange={handleChange} />
                <ToggleField label="跳到评论区" configKey="HEO_WIDGET_TO_COMMENT" value={formData.HEO_WIDGET_TO_COMMENT} onChange={handleChange} />
                <ToggleField label="夜间模式切换" configKey="HEO_WIDGET_DARK_MODE" value={formData.HEO_WIDGET_DARK_MODE} onChange={handleChange} />
                <ToggleField label="移动端悬浮目录" configKey="HEO_WIDGET_TOC" value={formData.HEO_WIDGET_TOC} onChange={handleChange} />
              </div>
            </SectionCard>
          </div>
        )}

        {/* ==================== 文章 ==================== */}
        {activeTab === 'article' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基础详情页组件 */}
              <SectionCard>
                <SectionTitle icon="📝" title="文章详情页基础显示" desc="单篇文章页面的核心功能卡片与标识控制" />
                <ToggleField label="显示上/下一篇推荐" configKey="HEO_ARTICLE_ADJACENT" value={formData.HEO_ARTICLE_ADJACENT} onChange={handleChange} desc="文章末尾展示相邻文章快速翻页卡片" />
                <ToggleField label="显示版权声明卡片" configKey="HEO_ARTICLE_COPYRIGHT" value={formData.HEO_ARTICLE_COPYRIGHT} onChange={handleChange} desc="展示作者名、文章原始链接及 CC 知识共享许可声明" />
                <ToggleField label="显示非 AI 写作标识" configKey="HEO_ARTICLE_NOT_BY_AI" value={formData.HEO_ARTICLE_NOT_BY_AI} onChange={handleChange} desc="声明本文章由真人原创撰写" />
                <ToggleField label="显示关联推荐文章" configKey="HEO_ARTICLE_RECOMMEND" value={formData.HEO_ARTICLE_RECOMMEND} onChange={handleChange} desc="基于标签相关度自动推荐 6 篇延伸阅读" />
                <ToggleField label="文章页侧栏头像虚化" configKey="HEO_INFO_CARD_AVATAR_BLUR" value={formData.HEO_INFO_CARD_AVATAR_BLUR} onChange={handleChange} desc="在单篇文章页中名片头像呈现毛玻璃虚化装饰质感" />
              </SectionCard>

              {/* 分享栏总开关与实时预览 */}
              <SectionCard>
                <SectionTitle icon="🚀" title="文章底部分享栏 (ShareBar)" desc="控制文章末尾彩色社交分享按钮条" />
                <ToggleField label="启用底部分享条" configKey="POST_SHARE_BAR_ENABLE" value={formData.POST_SHARE_BAR_ENABLE} onChange={handleChange} desc="关闭后文章底部将不再显示任何社交分享按钮" />

                {formData.POST_SHARE_BAR_ENABLE !== false && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200/70 space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>👁️ 1:1 视觉实时预览</span>
                      <span className="text-gray-400 font-normal">共激活 {(formData.POSTS_SHARE_SERVICES || '').split(',').filter(Boolean).length} 个平台</span>
                    </div>
                    {/* 模拟文章底部真实的 ShareButtons 预览 */}
                    <div className="flex items-center justify-end flex-wrap gap-1.5 p-3 bg-white rounded-lg border border-gray-100 shadow-sm min-h-[50px]">
                      {(formData.POSTS_SHARE_SERVICES || '')
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                        .map(serviceId => {
                          const item = ALL_SHARE_SERVICES.find(s => s.id === serviceId) || { id: serviceId, name: serviceId, icon: '🔗', bg: 'bg-gray-600' }
                          return (
                            <div
                              key={serviceId}
                              title={item.name}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-sm transform transition hover:scale-110 cursor-pointer ${item.bg}`}
                            >
                              <span>{item.icon}</span>
                            </div>
                          )
                        })}
                      {(!formData.POSTS_SHARE_SERVICES || formData.POSTS_SHARE_SERVICES.trim() === '') && (
                        <div className="text-xs text-gray-400 italic">尚未勾选任何分享平台</div>
                      )}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* 社交媒体分享平台独立开关矩阵 */}
            {formData.POST_SHARE_BAR_ENABLE !== false && (
              <SectionCard>
                <SectionTitle icon="🌐" title="社交分享平台独立勾选" desc="点击任意平台卡片即可快速启用/停用该分享按钮（按勾选顺序展示）" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {ALL_SHARE_SERVICES.map(service => {
                    const currentServices = (formData.POSTS_SHARE_SERVICES || '').split(',').map(s => s.trim()).filter(Boolean)
                    const isEnabled = currentServices.includes(service.id)

                    const toggleService = () => {
                      let nextServices = []
                      if (isEnabled) {
                        nextServices = currentServices.filter(s => s !== service.id)
                      } else {
                        nextServices = [...currentServices, service.id]
                      }
                      handleChange('POSTS_SHARE_SERVICES', nextServices.join(','))
                    }

                    return (
                      <div
                        key={service.id}
                        onClick={toggleService}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                          isEnabled
                            ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400 shadow-sm'
                            : 'bg-gray-50/60 border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-sm ${service.bg}`}>
                            {service.icon}
                          </div>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-transparent'}`}>
                            ✓
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className={`text-xs font-bold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>{service.name}</div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5" title={service.desc}>{service.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ==================== 页脚 ==================== */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左下角版权与作者信息 */}
              <SectionCard>
                <SectionTitle icon="©️" title="左下角版权与作者信息" desc="控制页面左下角显示的作者名称、格言简介、建站年份、驱动声明和备案号" />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="作者姓名 (AUTHOR)" configKey="AUTHOR" value={formData.AUTHOR} onChange={handleChange} placeholder="Notion Repo" desc="页脚版权处展示的名字" />
                  <TextField label="建站起始年份 (SINCE)" configKey="SINCE" value={formData.SINCE} onChange={handleChange} placeholder="2021" desc="用于显示 © 2021-2026" />
                </div>
                <TextField label="作者格言 / 简介 (BIO)" configKey="BIO" value={formData.BIO} onChange={handleChange} placeholder="一个普通的干饭人🍚" desc="作者名字右侧的标语或格言" />
                
                {/* Powered by 驱动声明 */}
                <div className="pt-2 border-t border-gray-100 my-2">
                  <ToggleField label="显示 Powered by 驱动声明" configKey="FOOTER_POWER_BY" value={formData.FOOTER_POWER_BY} onChange={handleChange} desc="是否在页脚左下角第一行显示驱动版权" />
                  {formData.FOOTER_POWER_BY !== false && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <TextField label="驱动展示文案" configKey="FOOTER_POWER_BY_TEXT" value={formData.FOOTER_POWER_BY_TEXT} onChange={handleChange} placeholder="Notion Repo 4.10.10" desc="留空则显示系统默认版本" />
                      <TextField label="驱动跳转链接" configKey="FOOTER_POWER_BY_URL" value={formData.FOOTER_POWER_BY_URL} onChange={handleChange} placeholder="https://github.com/..." />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <TextField label="ICP 备案号 (BEI_AN)" configKey="BEI_AN" value={formData.BEI_AN} onChange={handleChange} placeholder="粤ICP备XXXXXXXX号" desc="留空则不显示" />
                  <TextField label="ICP 备案跳转链接" configKey="BEI_AN_LINK" value={formData.BEI_AN_LINK} onChange={handleChange} placeholder="https://beian.miit.gov.cn" />
                </div>
                <TextField label="公安网备案号 (BEI_AN_GONGAN)" configKey="BEI_AN_GONGAN" value={formData.BEI_AN_GONGAN} onChange={handleChange} placeholder="粤公网安备 12345678901234号" desc="留空则不显示" />
              </SectionCard>

              {/* 页脚统计面板文案 */}
              <SectionCard>
                <SectionTitle icon="📊" title="页脚运行与统计标签" desc="底部统计面板显示的文字标签与起始日期" />
                <TextField label="建站起始日期" configKey="HEO_SITE_CREATE_TIME" value={formData.HEO_SITE_CREATE_TIME} onChange={handleChange} placeholder="2021-09-21" desc="用于实时计算运行第 N 天" />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="文章数标签" configKey="HEO_POST_COUNT_TITLE" value={formData.HEO_POST_COUNT_TITLE} onChange={handleChange} placeholder="文章数:" />
                  <TextField label="建站天数标签" configKey="HEO_SITE_TIME_TITLE" value={formData.HEO_SITE_TIME_TITLE} onChange={handleChange} placeholder="建站天数:" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="访问量标签" configKey="HEO_SITE_VISIT_TITLE" value={formData.HEO_SITE_VISIT_TITLE} onChange={handleChange} placeholder="访问量:" />
                  <TextField label="访客数标签" configKey="HEO_SITE_VISITOR_TITLE" value={formData.HEO_SITE_VISITOR_TITLE} onChange={handleChange} placeholder="访客数:" />
                </div>
              </SectionCard>

              {/* 🐶 右下角卡通宠物挂件 */}
              <SectionCard className="lg:col-span-2">
                <SectionTitle icon="🐶" title="右下角卡通宠物挂件 (Live2D)" desc="控制页面右下角显示的萌宠动画挂件与点击跳转行为" />
                <ToggleField label="启用卡通宠物挂件" configKey="WIDGET_PET" value={formData.WIDGET_PET} onChange={handleChange} desc="关闭后右下角不再显示卡通宠物" />
                {formData.WIDGET_PET !== false && (
                  <div className="space-y-4 mt-3">
                    <TextField
                      label="点击宠物跳转链接 (留空则纯互动不跳走)"
                      configKey="WIDGET_PET_CUSTOM_URL"
                      value={formData.WIDGET_PET_CUSTOM_URL}
                      onChange={handleChange}
                      placeholder="/about 或 https://..."
                      desc="填入你的个人主页或自定义网址。留空则点击仅有摇晃互动动画，不会跳转任何网页！"
                    />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">选择宠物形象预设或自定义</label>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">支持输入任意 Live2D 模型 URL</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-3">
                        {[
                          { name: '🌸 和服少女 (Koharu 小春)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json', desc: '粉白和服萌系萝莉少女' },
                          { name: '👧 水手服少女 (Shizuku 雫)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json', desc: '经典校服长发美少女' },
                          { name: '⚓ 水手服萝莉 (Z16 舰娘)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-z16@1.0.5/assets/z16.model.json', desc: '金发水手服元气萝莉' },
                          { name: '🌟 元气金发娘 (UnityChan)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-unitychan@1.0.5/assets/unitychan.model.json', desc: '活泼阳光金发少女' },
                          { name: '🐶 碗中小白狗 (Wanko)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json', desc: '趴在茶杯里的萌宠小狗' },
                          { name: '🐱 趴姿橘白猫 (Tororo)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json', desc: '懒洋洋趴着的橘白小猫' },
                          { name: '🐱 呆萌黑猫 (Hijiki)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json', desc: '可爱圆眼睛黑猫' },
                          { name: '👧 双马尾少女 (Tsumiki)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-tsumiki@1.0.5/assets/tsumiki.model.json', desc: '乖巧可爱的双马尾少女' },
                          { name: '⚓ 水手帽舰娘 (Hibiki 响)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hibiki@1.0.5/assets/hibiki.model.json', desc: '海军帽蓝白水手服舰娘' },
                          { name: '👦 帅气少年 (Chitose 千岁)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-chitose@1.0.5/assets/chitose.model.json', desc: '短发帅气中性书生少年' },
                          { name: '👘 长袍公子 (Izumi 泉)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-izumi@1.0.5/assets/izumi.model.json', desc: '日系长袍古风俊雅公子' },
                          { name: '👦 阳光男孩 (Haruto)', link: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json', desc: '运动风活力阳光少年' }
                        ].map((item, idx) => {
                          const isSelected = formData.WIDGET_PET_LINK === item.link
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleChange('WIDGET_PET_LINK', item.link)}
                              className={`p-2.5 rounded-lg border text-xs font-medium transition text-left flex flex-col justify-between ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm ring-2 ring-blue-500/20'
                                  : 'border-gray-200 hover:border-blue-300 text-gray-700 bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div>{item.name}</div>
                              <div className="text-[10px] text-gray-400 font-normal mt-0.5">{item.desc}</div>
                            </button>
                          )
                        })}
                      </div>

                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                        <TextField
                          label="🎨 自定义宠物形象模型 JSON (URL)"
                          configKey="WIDGET_PET_LINK"
                          value={formData.WIDGET_PET_LINK}
                          onChange={handleChange}
                          placeholder="https://.../model.json"
                          desc="支持任意 Live2D v2 规范的 .model.json 模型地址（可使用 jsDelivr CDN、GitHub Raw 或个人图床/OSS链接）"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <TextField
                          label="📐 宠物画布显示高度 (px)"
                          configKey="WIDGET_PET_HEIGHT"
                          value={formData.WIDGET_PET_HEIGHT}
                          onChange={handleChange}
                          placeholder="340"
                          desc="默认 340px。常规立绘/二次元少女建议 320~360px 避免头顶被裁切；扁平矮宠可设 250px"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* 1:1 完整页脚实时预览卡片 */}
            <SectionCard>
              <SectionTitle icon="🦶" title="页脚 1:1 实时预览" desc="实时查看前台页脚底部栏的渲染效果" />
              <div className="p-6 bg-[#f1f3f7] rounded-xl text-sm text-gray-700 border border-gray-300/70 shadow-inner">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  {/* 左侧 */}
                  <div className="text-center lg:text-left space-y-1">
                    {formData.FOOTER_POWER_BY !== false && (
                      <div className="text-xs text-gray-500 font-serif">
                        Powered by{' '}
                        <a href={formData.FOOTER_POWER_BY_URL || 'https://github.com/notionnext-org/Notion Repo'} target="_blank" rel="noreferrer" className="underline font-sans">
                          {formData.FOOTER_POWER_BY_TEXT || 'Notion Repo 4.10.10'}
                        </a>
                        .
                      </div>
                    )}
                    <div className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap justify-center lg:justify-start">
                      <span>© {formData.SINCE || '2021'}–{new Date().getFullYear()}</span>
                      <a href="/about" className="font-bold underline text-gray-900">{formData.AUTHOR || 'Notion Repo'}</a>
                      {formData.BIO && <span className="text-gray-500 font-normal"> | {formData.BIO}</span>}
                    </div>
                  </div>

                  {/* 右侧 */}
                  <div className="text-xs text-gray-500 flex items-center gap-3 flex-wrap justify-center">
                    {formData.BEI_AN && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <i className="fas fa-shield-alt text-gray-400" />
                        <a href={formData.BEI_AN_LINK || '#'} target="_blank" rel="noreferrer" className="hover:underline">{formData.BEI_AN}</a>
                      </span>
                    )}
                    {formData.BEI_AN_GONGAN && (
                      <span className="text-gray-600">{formData.BEI_AN_GONGAN}</span>
                    )}
                    <span className="text-gray-400 font-mono">👁️ 10,240 PV | 👥 3,120 UV</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

      </main>

      {/* 底部保存栏 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">修改后请点击右侧保存，刷新前台页面查看效果。</p>
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition shadow">
            {saving ? '⏳ 保存中...' : '💾 保存全部配置'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 后台专用的名片富文本实时渲染组件
 */
function RichNoticePreview({ content, defaultUrl }) {
  if (!content || typeof content !== 'string') return null
  const trimmed = content.trim()

  const isPureImageUrl = /^https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif|svg)(\?[^\s]*)?$/i.test(trimmed)
  if (isPureImageUrl) {
    return (
      <div className="my-1">
        <img src={trimmed} alt="公告配图" className="rounded-lg max-h-24 object-cover border border-white/20 shadow-sm" />
        {defaultUrl && <div className="text-[10px] text-blue-200 mt-0.5">🔗 点击跳转: {defaultUrl}</div>}
      </div>
    )
  }

  const lines = content.split('\n')

  return (
    <div className="space-y-1 leading-relaxed text-xs whitespace-pre-wrap font-sans">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return <div key={idx} className="h-1.5" />

        const pureImgMatch = trimmedLine.match(/^https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif|svg)(\?[^\s]*)?$/i)
        if (pureImgMatch) {
          return (
            <div key={idx} className="my-1">
              <img src={trimmedLine} alt="公告配图" className="rounded-md max-h-16 object-cover border border-white/20" />
            </div>
          )
        }

        // 正则解析
        const tokenRegex = /(!\[(.*?)\]\((.*?)\))|(\[(.*?)\]\((.*?)\))|(\*\*(.*?)\*\*)|(https?:\/\/[^\s<]+)/g
        const elements = []
        let lastIndex = 0
        let match
        let keyCount = 0

        while ((match = tokenRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            elements.push(line.slice(lastIndex, match.index))
          }

          const full = match[0]
          if (full.startsWith('![')) {
            elements.push(
              <span key={keyCount++} className="inline-block my-0.5">
                <img src={match[3]} alt={match[2] || '配图'} className="rounded max-h-16 object-cover border border-white/20" />
              </span>
            )
          } else if (full.startsWith('[')) {
            elements.push(
              <span key={keyCount++} className="underline underline-offset-2 text-white font-bold bg-white/10 px-1 py-0.5 rounded inline-flex items-center gap-0.5">
                <span>{match[5]}</span>
                <span className="text-[9px] opacity-75">↗</span>
              </span>
            )
          } else if (full.startsWith('**')) {
            elements.push(
              <strong key={keyCount++} className="font-bold text-white bg-white/10 px-0.5 rounded">
                {match[8]}
              </strong>
            )
          } else if (full.startsWith('http')) {
            elements.push(
              <span key={keyCount++} className="underline text-blue-200">
                {full}
              </span>
            )
          }

          lastIndex = tokenRegex.lastIndex
        }

        if (lastIndex < line.length) {
          elements.push(line.slice(lastIndex))
        }

        return (
          <div key={idx} className="break-words whitespace-pre-wrap">
            {elements.length > 0 ? elements : line}
          </div>
        )
      })}
    </div>
  )
}
