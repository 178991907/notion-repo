import syncHandler from '@/pages/api/notion/sync'
import webhookHandler from '@/pages/api/notion/webhook'
import { syncSingleNotionArticle, syncNotionArticleProperties } from '@/lib/member/notion'

jest.mock('@/lib/member/notion', () => {
  const actual = jest.requireActual('@/lib/member/notion')
  return {
    ...actual,
    syncSingleNotionArticle: jest.fn(),
    syncNotionArticleProperties: jest.fn()
  }
})

describe('Notion 自动化同步 API 测试', () => {
  let originalEnv
  let mockRes

  beforeEach(() => {
    originalEnv = { ...process.env }
    jest.clearAllMocks()
    mockRes = {
      statusCode: null,
      jsonData: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(data) {
        this.jsonData = data
        return this
      }
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('/api/notion/sync 端点', () => {
    test('拒绝不支持的 HTTP 方法 (如 PUT)', async () => {
      const req = { method: 'PUT', query: {}, body: {}, headers: {} }
      await syncHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(405)
      expect(mockRes.jsonData.success).toBe(false)
    })

    test('当设置了 CRON_SECRET 时，未携带或密钥不匹配应返回 401', async () => {
      process.env.CRON_SECRET = 'super-secret-token'
      const req = {
        method: 'GET',
        headers: { authorization: 'Bearer wrong-secret' },
        query: {},
        body: {}
      }
      await syncHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(401)
      expect(mockRes.jsonData.success).toBe(false)
    })

    test('单篇模式：当携带 pageId 时调用 syncSingleNotionArticle', async () => {
      syncSingleNotionArticle.mockResolvedValue({
        updated: true,
        title: '测试文章',
        fansCode: 'TEST88',
        vipLevel: 'VIP'
      })

      const req = {
        method: 'POST',
        headers: {},
        query: {},
        body: { pageId: '12345678123456781234567812345678' }
      }
      await syncHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.mode).toBe('single')
      expect(mockRes.jsonData.fansCode).toBe('TEST88')
      expect(syncSingleNotionArticle).toHaveBeenCalled()
    })

    test('全量模式：当无 pageId 时调用 syncNotionArticleProperties', async () => {
      syncNotionArticleProperties.mockResolvedValue({
        totalScanned: 10,
        updatedFansCount: 1,
        updatedVipCount: 1,
        updatedItems: []
      })

      const req = {
        method: 'GET',
        headers: {},
        query: {},
        body: {}
      }
      await syncHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.mode).toBe('all')
      expect(mockRes.jsonData.totalScanned).toBe(10)
      expect(syncNotionArticleProperties).toHaveBeenCalled()
    })
  })

  describe('/api/notion/webhook 端点', () => {
    test('拒绝不支持的 HTTP 方法 (如 DELETE)', async () => {
      const req = { method: 'DELETE', body: {} }
      await webhookHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(405)
      expect(mockRes.jsonData.success).toBe(false)
    })

    test('智能提取 Notion Webhook payload 中的 pageId 并触发单篇回写', async () => {
      syncSingleNotionArticle.mockResolvedValue({
        updated: true,
        title: 'Webhook 触发文章',
        fansCode: 'WH1234',
        vipLevel: 'VIP'
      })

      const valid32Id = '32420379994c81cb918af5e955cf1c81'
      const req = {
        method: 'POST',
        headers: {},
        body: {
          data: { id: valid32Id }
        }
      }
      await webhookHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.trigger).toBe('webhook_single')
      expect(mockRes.jsonData.pageId).toBe(valid32Id)
      expect(syncSingleNotionArticle).toHaveBeenCalledWith(valid32Id, expect.any(Object))
    })

    test('当 payload 无法解析出具体 pageId 时自动降级为全库扫描补齐', async () => {
      syncNotionArticleProperties.mockResolvedValue({
        totalScanned: 5,
        updatedFansCount: 0,
        updatedVipCount: 0,
        updatedItems: []
      })

      const req = {
        method: 'POST',
        headers: {},
        body: {}
      }
      await webhookHandler(req, mockRes)
      expect(mockRes.statusCode).toBe(200)
      expect(mockRes.jsonData.success).toBe(true)
      expect(mockRes.jsonData.trigger).toBe('webhook_all')
      expect(syncNotionArticleProperties).toHaveBeenCalled()
    })
  })
})
