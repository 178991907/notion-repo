/**
 * 管理后台全功能深度测试套件
 * 全面覆盖鉴权认证、配置读写、防篡改保护、会员与暗号联动、分类与标签管理接口
 */
import authHandler from '@/pages/api/admin/auth'
import configHandler from '@/pages/api/admin/config'
import membersHandler from '@/pages/api/admin/members'
import categoriesHandler from '@/pages/api/admin/categories'
import tagsHandler from '@/pages/api/admin/tags'
import { signToken } from '@/lib/admin/auth'
import BLOG from '@/blog.config'

// 模拟会员底层 Notion 模块
jest.mock('@/lib/member/notion', () => {
  const actual = jest.requireActual('@/lib/member/notion')
  return {
    ...actual,
    listMembers: jest.fn().mockResolvedValue([
      { id: 'm-1', username: 'test_vip', level: 'VIP', status: 'active' }
    ]),
    listInviteCodes: jest.fn().mockResolvedValue([
      { id: 'i-1', code: 'VIP-TEST88', level: 'VIP', status: 'active', usedCount: 0, maxUses: 1 }
    ]),
    createInviteCode: jest.fn().mockImplementation(async (params) => ({
      id: 'mock-id-' + Math.random().toString(36).slice(2, 7),
      ...params,
      status: 'active',
      usedCount: 0
    })),
    updateInviteCodeStatus: jest.fn().mockResolvedValue({ success: true }),
    createMember: jest.fn().mockImplementation(async (params) => ({
      id: 'mock-member-' + Math.random().toString(36).slice(2, 7),
      ...params,
      status: 'active'
    })),
    getFansConfigFromNotion: jest.fn().mockResolvedValue({
      defaultPasscode: '666888',
      unlockTips: '关注公众号获取验证码'
    }),
    saveFansConfigToNotion: jest.fn().mockResolvedValue({ success: true }),
    syncNotionArticleProperties: jest.fn().mockResolvedValue({
      scanned: 10,
      updated: 2,
      articles: []
    })
  }
})

describe('管理后台全功能深度排查与双向数据流测试套件', () => {
  let originalEnv
  let mockRes
  let validAdminToken

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.ADMIN_PASSWORD = 'super_secret_admin_pass'
    process.env.ADMIN_SECRET = 'test_admin_jwt_secret_key'
    validAdminToken = signToken({ role: 'admin' })

    mockRes = {
      statusCode: 200,
      jsonData: null,
      headers: {},
      status(code) {
        this.statusCode = code
        return this
      },
      json(data) {
        this.jsonData = data
        return this
      },
      setHeader(name, value) {
        this.headers[name] = value
        return this
      },
      revalidate: jest.fn().mockResolvedValue(true)
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('1. 登录认证 API (POST /api/admin/auth)', () => {
    test('拒绝非 POST 请求并返回 405', async () => {
      const req = { method: 'GET', headers: {} }
      await authHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(405)
      expect(mockRes.jsonData.error).toContain('仅支持 POST')
    })

    test('密码错误时拒绝并返回 401', async () => {
      const req = {
        method: 'POST',
        headers: { 'x-forwarded-for': '127.0.0.1' },
        body: { password: 'wrong_password' }
      }
      await authHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(401)
      expect(mockRes.jsonData.error).toBe('密码错误')
    })

    test('密码正确时签发 HttpOnly Cookie 并返回 200', async () => {
      const req = {
        method: 'POST',
        headers: { 'x-forwarded-for': '127.0.0.1' },
        body: { password: 'super_secret_admin_pass' }
      }
      await authHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.headers['Set-Cookie']).toBeDefined()
      expect(mockRes.headers['Set-Cookie'][0]).toContain('admin_token=')
      expect(mockRes.headers['Set-Cookie'][0]).toContain('HttpOnly')
    })
  })

  describe('2. 配置读写与安全性保护 API (/api/admin/config)', () => {
    test('未登录请求直接拦截返回 401', async () => {
      const req = { method: 'GET', headers: {} }
      await configHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(401)
      expect(mockRes.jsonData.error).toContain('未登录')
    })

    test('携带合法 Cookie 时能够成功读取全量配置字典', async () => {
      const req = {
        method: 'GET',
        headers: {
          cookie: `admin_token=${validAdminToken}`
        }
      }
      await configHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.config).toBeDefined()
      expect(mockRes.jsonData.config.NOTION_PAGE_ID).toBeDefined()
      expect(Array.isArray(mockRes.jsonData.configs)).toBe(true)
      expect(mockRes.jsonData.configs.length).toBeGreaterThan(50)
    })

    test('POST 保存配置时必须进行 CSRF 头校验，缺失则返回 403', async () => {
      const req = {
        method: 'POST',
        headers: {
          cookie: `admin_token=${validAdminToken}`
          // 故意缺少 x-admin-csrf
        },
        body: {
          configs: [{ key: 'AUTHOR', value: 'New Author' }]
        }
      }
      await configHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(403)
      expect(mockRes.jsonData.error).toContain('缺少 CSRF 验证头')
    })

    test('POST 保存配置成功并触发前台 res.revalidate("/") 缓存刷新', async () => {
      const req = {
        method: 'POST',
        headers: {
          cookie: `admin_token=${validAdminToken}`,
          'x-admin-csrf': '1'
        },
        body: {
          configs: [
            { key: 'BIO', value: '全栈架构师的个人知识库' },
            { key: 'HEO_NOTICE_BAR', value: [{ title: '测试通知', url: '/' }] }
          ]
        }
      }
      await configHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.applied).toEqual(expect.arrayContaining(['BIO', 'HEO_NOTICE_BAR']))
      expect(mockRes.revalidate).toHaveBeenCalledWith('/')
    })

    test('核心安全防线：严防 NOTION_PAGE_ID 被后台覆盖篡改，保护环境变量不受污染', async () => {
      process.env.NOTION_PAGE_ID = '3dce78c0e8d4812598f8e90892c4c95e'
      const req = {
        method: 'POST',
        headers: {
          cookie: `admin_token=${validAdminToken}`,
          'x-admin-csrf': '1'
        },
        body: {
          configs: [
            { key: 'NOTION_PAGE_ID', value: 'malicious_overwrite_page_id' },
            { key: 'TITLE_TEST_SAFE', value: '测试配置' }
          ]
        }
      }
      await configHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      // NOTION_PAGE_ID 应被安全过滤，不出现在 applied 列表中
      expect(mockRes.jsonData.applied).not.toContain('NOTION_PAGE_ID')
      expect(mockRes.jsonData.applied).toContain('TITLE_TEST_SAFE')
      // 环境变量维持原样
      expect(process.env.NOTION_PAGE_ID).toBe('3dce78c0e8d4812598f8e90892c4c95e')
    })
  })

  describe('3. 会员与粉丝专区联动 API (/api/admin/members)', () => {
    test('未提供有效登录凭据时拦截 401', async () => {
      const req = { method: 'GET', headers: {}, cookies: {} }
      await membersHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(401)
    })

    test('GET 获取会员列表与邀请码数据成功', async () => {
      const req = {
        method: 'GET',
        headers: {
          cookie: `admin_token=${validAdminToken}`
        },
        cookies: {
          admin_token: validAdminToken
        }
      }
      await membersHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.members.length).toBe(1)
      expect(mockRes.jsonData.inviteCodes.length).toBe(1)
      expect(mockRes.jsonData.fansConfig.defaultPasscode).toBe('666888')
    })

    test('POST update_fans_config 更新粉丝专区全局暗号与引导语', async () => {
      const req = {
        method: 'POST',
        headers: {
          cookie: `admin_token=${validAdminToken}`
        },
        cookies: {
          admin_token: validAdminToken
        },
        body: {
          action: 'update_fans_config',
          defaultPasscode: '999888',
          unlockTips: '微信搜索【Terry校长】发送【暗号】'
        }
      }
      await membersHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.fansConfig.defaultPasscode).toBe('999888')
      expect(global.__adminConfigOverrides.HEO_FANS_DEFAULT_PASSCODE).toBe('999888')
    })

    test('POST batch_create_invites 批量生成一人一码', async () => {
      const req = {
        method: 'POST',
        headers: {
          cookie: `admin_token=${validAdminToken}`
        },
        cookies: {
          admin_token: validAdminToken
        },
        body: {
          action: 'batch_create_invites',
          count: 3,
          level: 'SVIP',
          prefix: 'TEST'
        }
      }
      await membersHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.count).toBe(3)
      expect(mockRes.jsonData.invites.length).toBe(3)
    })
  })

  describe('4. 分类与标签管理 API (/api/admin/categories & /api/admin/tags)', () => {
    test('未登录访问 categories 拦截 401', async () => {
      const req = { method: 'GET', headers: {} }
      await categoriesHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(401)
    })

    test('未登录访问 tags 拦截 401', async () => {
      const req = { method: 'GET', headers: {} }
      await tagsHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(401)
    })

    test('未配置 Notion API Token 时优雅返回 400 提示', async () => {
      delete process.env.NOTION_API_TOKEN
      delete process.env.NOTION_ACCESS_TOKEN
      delete process.env.NOTION_TOKEN
      const req = {
        method: 'GET',
        headers: {
          cookie: `admin_token=${validAdminToken}`
        }
      }
      await categoriesHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(400)
      expect(mockRes.jsonData.error).toContain('未配置环境变量')

      const mockResTags = { ...mockRes, statusCode: 200 }
      await tagsHandler(req, mockResTags)
      expect(mockResTags.statusCode).toBe(400)
      expect(mockResTags.jsonData.error).toContain('未配置环境变量')
    })
  })

  describe('6. 客户端与服务端 siteConfig 优先级穿透测试', () => {
    const { siteConfig } = require('@/lib/config')
    const { setGlobalSnapshot } = require('@/lib/global')

    test('云端 NOTION_CONFIG 动态配置绝对优先于任何静态配置', () => {
      setGlobalSnapshot({
        NOTION_CONFIG: {
          HEO_HERO_TITLE_1: '云端动态标题AI',
          HEO_HERO_REVERSE: true
        }
      })
      expect(siteConfig('HEO_HERO_TITLE_1')).toBe('云端动态标题AI')
      expect(siteConfig('HEO_HERO_REVERSE')).toBe(true)
    })

    test('服务端进程内存覆盖 globalThis.__adminConfigOverrides 优先于旧云端快照', () => {
      setGlobalSnapshot({
        NOTION_CONFIG: {
          HEO_HERO_TITLE_1: '旧云端标题'
        }
      })
      globalThis.__adminConfigOverrides = {
        HEO_HERO_TITLE_1: '最新保存的内存标题'
      }
      expect(siteConfig('HEO_HERO_TITLE_1')).toBe('最新保存的内存标题')
      delete globalThis.__adminConfigOverrides
    })
  })
})

