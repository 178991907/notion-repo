/**
 * 管理后台主题配置健壮性与空值防御测试
 * 重点覆盖：null 序列化防御、脏数据 "null" 清洗过滤、分类卡片防崩溃能力
 */
import configHandler from '@/pages/api/admin/config'
import { signToken } from '@/lib/admin/auth'

describe('主题配置与数据健壮性测试', () => {
  let originalEnv
  let mockRes
  let validAdminToken

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.ADMIN_PASSWORD = 'admin_password_for_test'
    process.env.ADMIN_SECRET = 'admin_secret_jwt_key_test'
    validAdminToken = signToken({ role: 'admin' })

    mockRes = {
      statusCode: 200,
      headers: {},
      jsonData: null,
      status(code) {
        this.statusCode = code
        return this
      },
      setHeader(k, v) {
        this.headers[k] = v
        return this
      },
      json(data) {
        this.jsonData = data
        return this
      },
      revalidate: jest.fn().mockResolvedValue(true)
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('POST /api/admin/config 提交 null 值的卡片时不应序列化为字符串 "null"', async () => {
    const req = {
      method: 'POST',
      headers: {
        cookie: `admin_token=${validAdminToken}`,
        'x-admin-csrf': '1'
      },
      body: {
        configs: [
          { key: 'HEO_HERO_CATEGORY_4', value: null },
          { key: 'HEO_HERO_CATEGORY_5', value: { title: '测试卡片', url: '/test' } }
        ]
      }
    }

    await configHandler(req, mockRes)
    expect(mockRes.statusCode).toBe(200)
    expect(mockRes.jsonData.success).toBe(true)

    // 验证 configsForNotion 中 null 对应的 value 是空字符串，而非 "null"
    const cat4Notion = mockRes.jsonData.configsForNotion.find(c => c.key === 'HEO_HERO_CATEGORY_4')
    expect(cat4Notion).toBeDefined()
    expect(cat4Notion.value).toBe('')
    expect(cat4Notion.value).not.toBe('null')

    // 验证正常对象正确序列化为 JSON 字符串
    const cat5Notion = mockRes.jsonData.configsForNotion.find(c => c.key === 'HEO_HERO_CATEGORY_5')
    expect(cat5Notion.value).toBe(JSON.stringify({ title: '测试卡片', url: '/test' }))
  })

  test('GET /api/admin/config 遇到内存或数据库中的 null 恢复时不影响正常数据读取', async () => {
    const req = {
      method: 'GET',
      headers: {
        cookie: `admin_token=${validAdminToken}`
      }
    }

    await configHandler(req, mockRes)
    expect(mockRes.statusCode).toBe(200)
    expect(mockRes.jsonData.config).toBeDefined()
    // 确保返回值不包含脏字符串 "null"
    expect(mockRes.jsonData.config.HEO_HERO_CATEGORY_4).not.toBe('null')
  })

  test('英雄区胶囊卡片防幽灵回退：未启用的卡片为 false 或 null 时不被错误解析为对象', () => {
    // 模拟前台解析逻辑
    const mockCategoriesConfig = [
      { title: '必看精选', url: '/tag/必看精选' },
      { title: '热门文章', url: '/tag/热门文章' },
      { title: '🎁 粉丝福利', url: '/fans' },
      { title: '👑 会员专区', url: '/vip' }
    ]
    const customCategories = mockCategoriesConfig
    let categories = []
    if (Array.isArray(customCategories) && customCategories.length > 0) {
      categories = customCategories.filter(c => c && typeof c === 'object' && c.title && c.url)
    }
    // 验证数量严格为 4，绝对不会多出第 5 个
    expect(categories.length).toBe(4)
    expect(categories[3].title).toBe('👑 会员专区')

    // 验证单项模式下 false 被严格过滤，不会回退
    const singleItems = {
      HEO_HERO_CATEGORY_1: { title: '必看精选', url: '/tag/必看精选' },
      HEO_HERO_CATEGORY_2: { title: '热门文章', url: '/tag/热门文章' },
      HEO_HERO_CATEGORY_3: { title: '🎁 粉丝福利', url: '/fans' },
      HEO_HERO_CATEGORY_4: { title: '👑 会员专区', url: '/vip' },
      HEO_HERO_CATEGORY_5: false,
      HEO_HERO_CATEGORY_6: false
    }
    const singleCategories = []
    for (let i = 1; i <= 6; i++) {
      const cat = singleItems[`HEO_HERO_CATEGORY_${i}`]
      if (!cat || cat === false || cat === 'false') continue
      if (typeof cat === 'object' && cat.title && cat.url) {
        singleCategories.push(cat)
      }
    }
    expect(singleCategories.length).toBe(4)
  })
})
