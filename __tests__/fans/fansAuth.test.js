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

  it('会员免码直通特权逻辑：已登录合格会员直接视为已解锁粉丝文章', () => {
    // 模拟 heo/index.js 中的权限判定公式
    const checkAccess = ({ isFansPost, fansUnlocked, isLoggedIn, userLevel, requiredLevel }) => {
      const isMemberQualified = Boolean(isLoggedIn && (!requiredLevel || (userLevel === 'SVIP' || userLevel === requiredLevel)))
      const isFansSatisfied = Boolean(fansUnlocked || isMemberQualified)
      const isFansLocked = Boolean(isFansPost && !isFansSatisfied)
      const isVipLocked = Boolean(requiredLevel && !isMemberQualified && !fansUnlocked)
      return { canRead: !isFansLocked && !isVipLocked }
    }

    // 1. 纯粉丝文章，访客未登录且未输码 -> 锁定
    expect(checkAccess({ isFansPost: true, fansUnlocked: false, isLoggedIn: false }).canRead).toBe(false)

    // 2. 纯粉丝文章，访客输入暗号 -> 放行
    expect(checkAccess({ isFansPost: true, fansUnlocked: true, isLoggedIn: false }).canRead).toBe(true)

    // 3. 纯粉丝文章，VIP 会员登录 -> 免输暗号直接放行
    expect(checkAccess({ isFansPost: true, fansUnlocked: false, isLoggedIn: true, userLevel: 'VIP' }).canRead).toBe(true)

    // 4. 双轨文章（既是粉丝也是 VIP），未登录用户输入暗号 -> 放行
    expect(checkAccess({ isFansPost: true, fansUnlocked: true, isLoggedIn: false, requiredLevel: 'VIP' }).canRead).toBe(true)

    // 5. 双轨文章（既是粉丝也是 VIP），VIP 会员登录未输码 -> 免暗号直接放行
    expect(checkAccess({ isFansPost: true, fansUnlocked: false, isLoggedIn: true, userLevel: 'VIP', requiredLevel: 'VIP' }).canRead).toBe(true)
  })
})

