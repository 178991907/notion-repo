import { verifyFansPasscode, getFansStorageKey } from '@/lib/fans/auth'

describe('粉丝专区免登录验证码逻辑', () => {
  it('通用暗号模式：文章未设专属码时，输入全站默认暗号校验通过', () => {
    const res = verifyFansPasscode('888888', '', '888888')
    expect(res.valid).toBe(true)
    expect(res.isGlobal).toBe(true)
  })

  it('通用暗号模式：暗号输入错误时返回失败并提示信息', () => {
    const res = verifyFansPasscode('123456', '', '888888')
    expect(res.valid).toBe(false)
    expect(res.isGlobal).toBe(false)
  })

  it('单篇专属验证码模式：文章配置了独立验证码，必须匹配该专属码', () => {
    const resSuccess = verifyFansPasscode('AI2026', 'AI2026', '888888')
    expect(resSuccess.valid).toBe(true)
    expect(resSuccess.isGlobal).toBe(false)

    // 输入通用暗号不应解锁单篇专属文章
    const resFail = verifyFansPasscode('888888', 'AI2026', '888888')
    expect(resFail.valid).toBe(false)
  })

  it('大小写不敏感与去空格测试', () => {
    const res = verifyFansPasscode('  ai2026  ', 'AI2026', '888888')
    expect(res.valid).toBe(true)
  })

  it('StorageKey 格式化', () => {
    const key = getFansStorageKey('my-slug-123')
    expect(key).toBe('fans_unlocked_post_my-slug-123')
  })
})
