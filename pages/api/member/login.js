/**
 * 会员登录 API
 * POST /api/member/login
 * 请求体：{ username: string, password: string, rememberMe?: boolean }
 */
import {
  verifyPassword,
  isMemberExpired,
  signMemberToken,
  buildMemberCookieHeader
} from '@/lib/member/auth'
import { findMemberByUsername } from '@/lib/member/notion'

// 简单的 IP 频率限制器（内存存储）
// 5 分钟内最多允许尝试失败 10 次
const failedLoginAttempts = {}
const RATE_LIMIT_WINDOW = 5 * 60 * 1000
const RATE_LIMIT_MAX = 10

function checkLoginRateLimit(ip) {
  const now = Date.now()
  if (!failedLoginAttempts[ip]) return true
  failedLoginAttempts[ip] = failedLoginAttempts[ip].filter(t => now - t < RATE_LIMIT_WINDOW)
  return failedLoginAttempts[ip].length < RATE_LIMIT_MAX
}

function recordFailedLogin(ip) {
  if (!failedLoginAttempts[ip]) failedLoginAttempts[ip] = []
  failedLoginAttempts[ip].push(Date.now())
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持 POST 请求' })
  }

  // 客户端 IP 获取
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  if (!checkLoginRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: '登录失败尝试过多，已被临时锁定，请 5 分钟后再试'
    })
  }

  const { username, password, rememberMe = false } = req.body || {}

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ success: false, error: '请输入会员账号' })
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: '请输入会员密码' })
  }

  try {
    const member = await findMemberByUsername(username.trim())

    if (!member) {
      recordFailedLogin(ip)
      return res.status(401).json({ success: false, error: '账号不存在或密码错误' })
    }

    // 检查账号状态是否有效
    if (member.status && !/^(active|有效|正常)$/i.test(member.status)) {
      return res.status(403).json({
        success: false,
        error: '该会员账号已被禁用，请联系管理员'
      })
    }

    // 检查是否到期
    if (member.expireDate && isMemberExpired(member.expireDate)) {
      return res.status(403).json({
        success: false,
        error: `该会员账号已于 ${member.expireDate} 到期，请联系管理员续期`
      })
    }

    // 验证密码
    const isPasswordValid = verifyPassword(password, member.password)
    if (!isPasswordValid) {
      recordFailedLogin(ip)
      return res.status(401).json({ success: false, error: '账号不存在或密码错误' })
    }

    // 签发会员 Token 并设置 Cookie
    const token = signMemberToken(
      {
        username: member.username,
        expireDate: member.expireDate,
        status: member.status
      },
      Boolean(rememberMe)
    )

    res.setHeader('Set-Cookie', buildMemberCookieHeader(token, Boolean(rememberMe)))

    return res.status(200).json({
      success: true,
      message: '登录成功',
      member: {
        username: member.username,
        expireDate: member.expireDate,
        status: member.status
      }
    })
  } catch (error) {
    console.error('[MemberLogin] 登录发生未知异常:', error)
    return res.status(500).json({ success: false, error: '服务器内部错误，请稍后再试' })
  }
}
