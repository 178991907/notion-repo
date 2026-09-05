import handler from '@/pages/api/fans/verify'

describe('粉丝暗号在线验证接口 /api/fans/verify', () => {
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      jsonPayload: null,
      status(code) {
        this.statusCode = code
        return this
      },
      json(payload) {
        this.jsonPayload = payload
        return this
      }
    }
    return res
  }

  it('非 POST 请求应返回 405 拦截', async () => {
    const req = { method: 'GET', body: {} }
    const res = createMockRes()
    await handler(req, res)
    expect(res.statusCode).toBe(405)
    expect(res.jsonPayload.success).toBe(false)
  })

  it('未输入暗号应返回 400 校验错误', async () => {
    const req = { method: 'POST', body: { passcode: '   ' } }
    const res = createMockRes()
    await handler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res.jsonPayload.valid).toBe(false)
  })

  it('输入通用暗号或文章专属验证码时应返回 200 且 valid: true', async () => {
    global.__adminConfigOverrides = { HEO_FANS_DEFAULT_PASSCODE: '666888' }
    
    // 1. 验证文章专属码通过
    const req1 = { method: 'POST', body: { passcode: 'E556MV', fansCode: 'E556MV' } }
    const res1 = createMockRes()
    await handler(req1, res1)
    expect(res1.statusCode).toBe(200)
    expect(res1.jsonPayload.valid).toBe(true)
    expect(res1.jsonPayload.isGlobal).toBe(false)

    // 2. 验证全站通用最新暗号通过
    const req2 = { method: 'POST', body: { passcode: '666888', fansCode: 'E556MV' } }
    const res2 = createMockRes()
    await handler(req2, res2)
    expect(res2.statusCode).toBe(200)
    expect(res2.jsonPayload.valid).toBe(true)
    expect(res2.jsonPayload.isGlobal).toBe(true)

    // 3. 验证错误暗号返回 valid: false
    const req3 = { method: 'POST', body: { passcode: 'wrong', fansCode: 'E556MV' } }
    const res3 = createMockRes()
    await handler(req3, res3)
    expect(res3.statusCode).toBe(200)
    expect(res3.jsonPayload.valid).toBe(false)
  })
})
