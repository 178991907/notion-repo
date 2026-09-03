import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { MenuItemDrop } from './MenuItemDrop'

export const MenuListTop = props => {
  const { customNav, customMenu } = props
  const { locale } = useGlobal()

  let links = []

  // 1. 系统内置功能菜单项（严格由后台开关控制）
  if (Boolean(siteConfig('HEO_MENU_INDEX', true, CONFIG))) {
    links.push({ id: 'idx', icon: 'fa-solid fa-house', name: locale?.NAV?.INDEX || '首页', href: '/', show: true })
  }
  if (Boolean(siteConfig('HEO_MENU_CATEGORY', true, CONFIG))) {
    links.push({ id: 'cat', icon: 'fa-solid fa-folder', name: locale?.COMMON?.CATEGORY || locale?.NAV?.CATEGORY || '分类', href: '/category', show: true })
  }
  if (Boolean(siteConfig('HEO_MENU_TAG', true, CONFIG))) {
    links.push({ id: 'tag', icon: 'fa-solid fa-tags', name: locale?.COMMON?.TAGS || locale?.NAV?.TAG || '标签', href: '/tag', show: true })
  }
  if (Boolean(siteConfig('HEO_MENU_ARCHIVE', false, CONFIG))) {
    links.push({ id: 'arc', icon: 'fas fa-archive', name: locale?.NAV?.ARCHIVE || '归档', href: '/archive', show: true })
  }
  if (Boolean(siteConfig('HEO_MENU_SEARCH', false, CONFIG))) {
    links.push({ id: 'sch', icon: 'fas fa-search', name: locale?.NAV?.SEARCH || '搜索', href: '/search', show: true })
  }
  // 内置会员专区菜单入口（默认开启）
  if (Boolean(siteConfig('HEO_MENU_VIP', true, CONFIG))) {
    links.push({
      id: 'vip',
      icon: 'fas fa-crown text-amber-500',
      name: '会员专区',
      href: '/vip',
      show: true
    })
  }

  // 2. 后台自定义配置的顶栏菜单列表
  const customItems = siteConfig('HEO_MENU_CUSTOM_ITEMS', [], CONFIG)
  if (Array.isArray(customItems) && customItems.length > 0) {
    customItems.forEach((item, idx) => {
      if (item && item.title && item.url) {
        links.push({
          id: `custom-${idx}`,
          icon: item.icon || 'fas fa-link',
          name: item.title,
          href: item.url,
          show: true
        })
      }
    })
  }

  // 3. Notion 数据库中的页面菜单（支持总开关与5大内置菜单单独开关控制）
  const showNotionPages = Boolean(siteConfig('HEO_MENU_SHOW_NOTION_PAGES', true, CONFIG))
  const showFriends = Boolean(siteConfig('HEO_MENU_FRIENDS', true, CONFIG))
  const showTutorial = Boolean(siteConfig('HEO_MENU_TUTORIAL', true, CONFIG))
  const showHistory = Boolean(siteConfig('HEO_MENU_HISTORY', true, CONFIG))
  const showAbout = Boolean(siteConfig('HEO_MENU_ABOUT', true, CONFIG))
  const showLangSwitch = Boolean(siteConfig('HEO_MENU_LANG_SWITCH', true, CONFIG))

  if (showNotionPages) {
    const notionList = customMenu || customNav || []
    if (Array.isArray(notionList) && notionList.length > 0) {
      notionList.forEach(n => {
        const text = ((n.name || '') + ' ' + (n.title || '') + ' ' + (n.to || '') + ' ' + (n.href || '')).toLowerCase()
        if ((text.includes('friend') || text.includes('link') || text.includes('友链')) && !showFriends) return
        if ((text.includes('tutorial') || text.includes('教程')) && !showTutorial) return
        if ((text.includes('history') || text.includes('整理') || text.includes('往期')) && !showHistory) return
        if ((text.includes('about') || text.includes('关于')) && !showAbout) return
        if ((text.includes('中文') || text.includes('english') || text.includes('/en') || text.includes('/zh') || text.includes('lang')) && !showLangSwitch) return

        // 避免与系统内置菜单或自定义菜单重复
        const itemHref = n.href || n.to
        const itemName = n.name || n.title
        if (links.some(l => (itemHref && itemHref !== '#' && (l.href === itemHref || l.to === itemHref)) || (itemName && l.name === itemName))) {
          return
        }

        links.push({
          ...n,
          name: itemName,
          show: n.show !== undefined ? Boolean(n.show) : true
        })
      })
    }
  }

  if (!links || links.length === 0) {
    return null
  }

  return (
    <>
      <nav
        id='nav-mobile'
        className='leading-8 justify-center font-light w-full flex items-center space-x-1'>
        {links.map(
          (link, index) =>
            link && Boolean(link.show) && <MenuItemDrop key={index} link={link} />
        )}
      </nav>
    </>
  )
}
