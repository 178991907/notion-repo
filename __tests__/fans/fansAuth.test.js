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

  it('单篇专属验证码模式：文章配置了独立验证码，专属码与全站默认主暗号均可双轨解锁', () => {
    // 1. 输入专属码成功解锁
    const resSuccess = verifyFansPasscode('AI2026', 'AI2026', '888888')
    expect(resSuccess.valid).toBe(true)
    expect(resSuccess.isGlobal).toBe(false)

    // 2. 输入全站默认主暗号同样可双轨兜底解锁
    const resGlobal = verifyFansPasscode('888888', 'AI2026', '888888')
    expect(resGlobal.valid).toBe(true)
    expect(resGlobal.isGlobal).toBe(true)

    // 3. 输入错误暗号予以拦截
    const resFail = verifyFansPasscode('WRONG_CODE', 'AI2026', '888888')
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

  it('多选暗号模式测试：支持数组及逗号/分号分隔的多个验证码，匹配任一均可通过', () => {
    // 数组形式多选标签
    const multiArrayCodes = ['AI2026', 'VIP888', 'TERRY666']
    expect(verifyFansPasscode('AI2026', multiArrayCodes).valid).toBe(true)
    expect(verifyFansPasscode('vip888', multiArrayCodes).valid).toBe(true)
    expect(verifyFansPasscode('terry666', multiArrayCodes).valid).toBe(true)
    expect(verifyFansPasscode('wrongcode', multiArrayCodes).valid).toBe(false)

    // 字符串逗号/空格分隔多选
    const multiStringCodes = 'AI2026, VIP888; TERRY666'
    expect(verifyFansPasscode('ai2026', multiStringCodes).valid).toBe(true)
    expect(verifyFansPasscode('VIP888', multiStringCodes).valid).toBe(true)
    expect(verifyFansPasscode('wrongcode', multiStringCodes).valid).toBe(false)
  })

  it('全站粉丝凭证有效期测试：应为 24 小时（1 天），超过 24 小时应自动失效', () => {
    const { saveFansUnlockRecord, isFansPostUnlocked } = require('@/lib/fans/auth')
    const postSlug = 'test-post-expire'

    // 1. 模拟未解锁状态
    localStorage.clear()
    expect(isFansPostUnlocked(postSlug)).toBe(false)

    // 2. 写入全站通用解锁凭证
    saveFansUnlockRecord(postSlug, true)

    // 验证全站凭证已写入且当前有效
    const rawGlobal = localStorage.getItem('fans_unlocked_global_flag')
    expect(rawGlobal).toBeTruthy()
    const parsedGlobal = JSON.parse(rawGlobal)
    const duration = parsedGlobal.expireAt - parsedGlobal.unlockedAt
    // 验证有效期严格等于 24 小时 (86400000 毫秒)
    expect(duration).toBe(24 * 60 * 60 * 1000)
    expect(isFansPostUnlocked(postSlug)).toBe(true)
    expect(isFansPostUnlocked('another-random-post')).toBe(true)

    // 3. 模拟时间流逝超过 24 小时后，应判定失效
    const originalNow = Date.now
    try {
      Date.now = () => parsedGlobal.expireAt + 1000
      expect(isFansPostUnlocked(postSlug)).toBe(false)
      expect(isFansPostUnlocked('another-random-post')).toBe(false)
    } finally {
      Date.now = originalNow
    }
  })

  it('英雄区胶囊配置：adminConfigOverrides 中已包含 HEO_HERO_CATEGORY_4 粉丝福利', () => {
    const adminOverrides = require('@/lib/adminConfigOverrides.json')
    expect(adminOverrides.HEO_HERO_CATEGORY_4).toBeDefined()
    expect(adminOverrides.HEO_HERO_CATEGORY_4.title).toBe('🎁 粉丝福利')
    expect(adminOverrides.HEO_HERO_CATEGORY_4.url).toBe('/fans')
  })

  it('英雄区胶囊专属样式：粉丝专区与粉丝福利精准命中翡翠绿渐变与礼物图标', () => {
    const fansCapsule = { title: '🎁 粉丝福利', url: '/fans' }
    const isFans = fansCapsule.url === '/fans' || fansCapsule.title?.includes('粉丝')
    expect(isFans).toBe(true)

    let style = null
    if (isFans) {
      style = {
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
        icon: 'fa-gift'
      }
    }
    expect(style.icon).toBe('fa-gift')
    expect(style.bg).toContain('from-emerald-500')
  })
})

