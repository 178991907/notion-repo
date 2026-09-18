const crypto = require('crypto')
const adminAuth = require('../../lib/admin/auth')
const memberAuth = require('../../lib/member/auth')
const bcrypt = require('bcryptjs')

describe('管理员认证安全', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('未配置 ADMIN_SECRET 时应发出警告', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    delete process.env.ADMIN_SECRET
    delete process.env.ADMIN_PASSWORD
    process.env.NOTION_PAGE_ID = 'test-id'
    
    // 触发内部调用 getSecret
    adminAuth.signToken({ user: 'admin' })
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('【强烈警告】未设置 ADMIN_SECRET 和 ADMIN_PASSWORD'))
    consoleSpy.mockRestore()
  })

  test('signToken 生成的 token 应能被 verifyToken 验证', () => {
    process.env.ADMIN_SECRET = 'test_admin_secret'
    const payload = { role: 'admin' }
    const token = adminAuth.signToken(payload)
    
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    
    const verified = adminAuth.verifyToken(token)
    expect(verified).not.toBeNull()
    expect(verified.role).toBe('admin')
    expect(verified.iat).toBeDefined()
    expect(verified.exp).toBeDefined()
  })

  test('篡改后的 token 应被拒绝', () => {
    process.env.ADMIN_SECRET = 'test_admin_secret'
    const token = adminAuth.signToken({ role: 'admin' })
    
    // 篡改 payload
    const parts = token.split('.')
    parts[0] = Buffer.from(JSON.stringify({ role: 'superadmin' })).toString('base64url')
    const tamperedToken = parts.join('.')
    
    expect(adminAuth.verifyToken(tamperedToken)).toBeNull()
  })

  test('过期的 token 应被拒绝', () => {
    process.env.ADMIN_SECRET = 'test_admin_secret'
    
    // 我们需要修改一下生成的 exp
    // 因为 signToken 是硬编码的 Date.now()，我们可以 mock Date.now
    const originalDateNow = Date.now
    const mockDate = new Date('2024-01-01T00:00:00Z').getTime()
    Date.now = jest.fn(() => mockDate)
    
    const token = adminAuth.signToken({ role: 'admin' })
    
    // 恢复时间到更晚
    Date.now = jest.fn(() => mockDate + 86400000 + 1000) // 24小时后
    
    expect(adminAuth.verifyToken(token)).toBeNull()
    
    Date.now = originalDateNow
  })
})

describe('会员认证安全', () => {
  test('bcrypt 密码应能正确验证', () => {
    const plain = 'my_secure_password'
    const hash = bcrypt.hashSync(plain, 10)
    
    const result = memberAuth.verifyPassword(plain, hash)
    expect(result).toBe(true)
  })

  test('明文密码验证通过后应返回 needsUpgrade 标记', () => {
    const result = memberAuth.verifyPassword('plaintext', 'plaintext')
    expect(result).toEqual({ valid: true, needsUpgrade: true })
  })

  test('SHA-256 密码验证通过后应返回 needsUpgrade 标记', () => {
    const plain = 'sha256_pass'
    const hash = memberAuth.sha256Hex(plain)
    
    const result = memberAuth.verifyPassword(plain, hash)
    expect(result).toEqual({ valid: true, needsUpgrade: true })
  })

  test('错误密码应返回 false', () => {
    const plain = 'my_secure_password'
    const hash = bcrypt.hashSync(plain, 10)
    
    expect(memberAuth.verifyPassword('wrong_password', hash)).toBe(false)
    expect(memberAuth.verifyPassword('wrong_password', 'plaintext')).toBe(false)
    expect(memberAuth.verifyPassword('wrong_password', memberAuth.sha256Hex('plaintext'))).toBe(false)
  })

  test('空密码应返回 false', () => {
    const hash = bcrypt.hashSync('pass', 10)
    expect(memberAuth.verifyPassword('', hash)).toBe(false)
    expect(memberAuth.verifyPassword(null, hash)).toBe(false)
    expect(memberAuth.verifyPassword(undefined, hash)).toBe(false)
  })
})
