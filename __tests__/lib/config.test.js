/**
 * @jest-environment node
 */
import BLOG from '@/blog.config'
import adminOverrides from '@/lib/adminConfigOverrides.json'
import { siteConfig } from '@/lib/config'

describe('siteConfig', () => {
  const originalPostListStyle = BLOG.POST_LIST_STYLE
  const originalAdminPostListStyle = adminOverrides?.POST_LIST_STYLE

  beforeEach(() => {
    if (adminOverrides && 'POST_LIST_STYLE' in adminOverrides) {
      delete adminOverrides.POST_LIST_STYLE
    }
  })

  afterEach(() => {
    BLOG.POST_LIST_STYLE = originalPostListStyle
    if (originalAdminPostListStyle !== undefined) {
      adminOverrides.POST_LIST_STYLE = originalAdminPostListStyle
    }
  })

  it('uses BLOG/env config before caller default for server-only keys', () => {
    BLOG.POST_LIST_STYLE = 'scroll'

    expect(siteConfig('POST_LIST_STYLE', 'page', {})).toBe('scroll')
  })

  it('keeps extend config higher priority than BLOG/env config', () => {
    BLOG.POST_LIST_STYLE = 'scroll'

    expect(siteConfig('POST_LIST_STYLE', 'page', { POST_LIST_STYLE: 'page' })).toBe(
      'page'
    )
  })

  it('reads inner page parent path toggle from Notion Config', () => {
    expect(
      siteConfig('INNER_PAGE_URL_PARENT_PATH', false, {
        INNER_PAGE_URL_PARENT_PATH: 'true'
      })
    ).toBe(true)
  })

  it('管理员后台主题覆盖配置优先于主题硬编码默认配置生效', () => {
    // 模拟主题默认文件写入 false，后台保存为 true
    const themeDefaultConfig = { HEO_HERO_REVERSE: false, HEO_HERO_TITLE_1: '默认标题' }
    adminOverrides.HEO_HERO_REVERSE = true
    adminOverrides.HEO_HERO_TITLE_1 = '分享 AI'

    expect(siteConfig('HEO_HERO_REVERSE', false, themeDefaultConfig)).toBe(true)
    expect(siteConfig('HEO_HERO_TITLE_1', null, themeDefaultConfig)).toBe('分享 AI')
  })

  it('网站标题与描述绝对优先读取Notion页面的真实siteInfo，严防硬编码劫持', () => {
    const { setGlobalSnapshot } = require('@/lib/global')
    setGlobalSnapshot({
      siteInfo: {
        title: 'Notion-Repo 官方模板（Fork）',
        description: '这是用户的真实描述'
      },
      NOTION_CONFIG: {}
    })

    expect(siteConfig('TITLE')).toBe('Notion-Repo 官方模板（Fork）')
    expect(siteConfig('DESCRIPTION')).toBe('这是用户的真实描述')
  })
})
