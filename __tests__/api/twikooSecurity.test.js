jest.mock('twikoo-vercel', () => jest.fn())

import handler from '../../pages/api/twikoo'

describe('Twikoo API 敏感信息脱敏与安全隔离保护', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('未配置 MONGODB_URI 环境变量时，应安全拦截并返回 400，防止跨库数据污染', async () => {
    delete process.env.MONGODB_URI

    const req = {
      method: 'POST',
      body: {}
    }

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 400,
        message: expect.stringContaining('未配置环境变量 MONGODB_URI')
      })
    )
  })

  test('OPTIONS 请求应直接返回 200 状态码', async () => {
    const req = {
      method: 'OPTIONS'
    }

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    }

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })
})
