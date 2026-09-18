import { withSecurity } from '../../lib/middleware/withSecurity'
import { rateLimitMiddleware, securityHeadersMiddleware } from '../../lib/middleware/security'
import { globalRateLimiter } from '../../lib/utils/validation'

jest.mock('../../lib/utils/validation', () => ({
  globalRateLimiter: {
    isRateLimited: jest.fn(),
    requests: new Map()
  }
}))

describe('安全中间件', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('withSecurity 应将 handler 包装并返回函数', async () => {
    const mockHandler = jest.fn().mockResolvedValue('success')
    const wrapped = withSecurity(mockHandler)
    
    expect(typeof wrapped).toBe('function')
    
    // 模拟 req 和 res
    const req = {
      headers: {},
      url: '/api/test',
      method: 'GET'
    }
    const res = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    }
    
    await wrapped(req, res)
    expect(mockHandler).toHaveBeenCalledWith(req, res)
  })

  test('速率限制应在超出阈值时返回 429', () => {
    globalRateLimiter.isRateLimited.mockReturnValue(true)
    
    const middleware = rateLimitMiddleware({ limit: 5, windowMs: 1000 })
    const req = {
      headers: { 'x-forwarded-for': '127.0.0.1' },
      url: '/api/test'
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    const next = jest.fn()
    
    middleware(req, res, next)
    
    expect(globalRateLimiter.isRateLimited).toHaveBeenCalledWith('127.0.0.1:/api/test', 5, 1000)
    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }))
    expect(next).not.toHaveBeenCalled()
  })

  test('安全头应被设置', () => {
    const middleware = securityHeadersMiddleware()
    const req = {}
    const res = {
      setHeader: jest.fn(),
      removeHeader: jest.fn()
    }
    const next = jest.fn()
    
    middleware(req, res, next)
    
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By')
    expect(next).toHaveBeenCalled()
  })
})
