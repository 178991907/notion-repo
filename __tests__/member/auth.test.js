/**
 * 会员认证工具库单元测试
 */
import {
  sha256Hex,
  verifyPassword,
  isMemberExpired,
  signMemberToken,
  verifyMemberToken,
  buildMemberCookieHeader,
  buildClearMemberCookieHeader
} from '@/lib/member/auth'

describe('会员认证模块 lib/member/auth', () => {
  describe('密码校验功能 verifyPassword', () => {
    test('支持管理员在后台填写的明文密码直接比对', () => {
      expect(verifyPassword('123456', '123456')).toBe(true)
      expect(verifyPassword('mySecretPass', 'mySecretPass')).toBe(true)
      expect(verifyPassword('wrongPass', 'mySecretPass')).toBe(false)
    })

    test('支持 SHA-256 哈希密码比对', () => {
      const plain = 'terry2026'
      const hashed = sha256Hex(plain)
      expect(verifyPassword(plain, hashed)).toBe(true)
      expect(verifyPassword('wrongPass', hashed)).toBe(false)
    })

    test('空值输入应安全返回 false', () => {
      expect(verifyPassword('', '123456')).toBe(false)
      expect(verifyPassword('123456', '')).toBe(false)
      expect(verifyPassword(null, null)).toBe(false)
    })
  })

  describe('会员到期时间校验 isMemberExpired', () => {
    test('到期时间为空或 null 时视为永久有效', () => {
      expect(isMemberExpired(null)).toBe(false)
      expect(isMemberExpired('')).toBe(false)
      expect(isMemberExpired(undefined)).toBe(false)
    })

    test('未来时间未过期', () => {
      const future = new Date(Date.now() + 86400000).toISOString()
      expect(isMemberExpired(future)).toBe(false)
    })

    test('过去时间已过期', () => {
      const past = new Date(Date.now() - 86400000).toISOString()
      expect(isMemberExpired(past)).toBe(true)
    })
  })

  describe('会员 Token 签发与验证', () => {
    test('正常签发并验证 Token 成功解析 Payload', () => {
      const payload = {
        username: 'terry_vip',
        expireDate: null,
        status: 'Active'
      }
      const token = signMemberToken(payload, false)
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)

      const verified = verifyMemberToken(token)
      expect(verified).not.toBeNull()
      expect(verified.username).toBe('terry_vip')
      expect(verified.status).toBe('Active')
    })

    test('篡改 Token 签名应验证失败', () => {
      const token = signMemberToken({ username: 'hacker' })
      const parts = token.split('.')
      // 篡改 payload
      const tampered = `${parts[0]}.${parts[1]}abc.${parts[2]}`
      expect(verifyMemberToken(tampered)).toBeNull()
    })

    test('已过期业务日期的 Token 应验证失败', () => {
      const pastDate = new Date(Date.now() - 100000).toISOString()
      const token = signMemberToken({ username: 'expired_user', expireDate: pastDate })
      expect(verifyMemberToken(token)).toBeNull()
    })
  })

  describe('Cookie 头部构建', () => {
    test('构建登录 Cookie 包含 HttpOnly 与 Path', () => {
      const header = buildMemberCookieHeader('test_token_123', false)
      expect(header).toContain('member_token=test_token_123')
      expect(header).toContain('HttpOnly')
      expect(header).toContain('Path=/')
      expect(header).toContain('SameSite=Lax')
    })

    test('构建清除 Cookie 头部包含 Max-Age=0', () => {
      const clearHeader = buildClearMemberCookieHeader()
      expect(clearHeader).toContain('member_token=')
      expect(clearHeader).toContain('Max-Age=0')
    })
  })
})
