import { hasAccessLevel, signMemberToken, verifyMemberToken } from '@/lib/member/auth'

describe('会员多等级权限鉴权逻辑', () => {
  it('普通会员 (VIP) 可以访问普通会员 (VIP) 内容', () => {
    expect(hasAccessLevel('VIP', 'VIP')).toBe(true)
  })

  it('普通会员 (VIP) 无法访问高级会员 (SVIP) 内容', () => {
    expect(hasAccessLevel('VIP', 'SVIP')).toBe(false)
  })

  it('高级会员 (SVIP) 可以同时访问普通 VIP 与高级 SVIP 内容', () => {
    expect(hasAccessLevel('SVIP', 'VIP')).toBe(true)
    expect(hasAccessLevel('SVIP', 'SVIP')).toBe(true)
  })

  it('空值缺省回退测试：默认作为普通 VIP 校验', () => {
    expect(hasAccessLevel(null, null)).toBe(true)
    expect(hasAccessLevel(undefined, 'SVIP')).toBe(false)
  })

  it('Token 签发与解析携带 level 属性', () => {
    const token = signMemberToken({
      username: 'svip_user',
      level: 'SVIP',
      expireDate: null
    })
    const payload = verifyMemberToken(token)
    expect(payload).not.toBeNull()
    expect(payload.username).toBe('svip_user')
    expect(payload.level).toBe('SVIP')
  })
})
