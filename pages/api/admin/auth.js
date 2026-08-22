import { getAdminPassword, signToken } from '@/lib/admin/auth'

/**
 * 简单的 IP 级 Rate Limiter（内存存储）
 * 5 分钟内超过 5 次失败则拒绝
 */
const failedAttempts = {}
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 分钟
const RATE_LIMIT_MAX = 5

function checkRateLimit(ip) {
  const now = Date.now()
  if (!failedAttempts[ip]) return true
  // 清理过期记录
  failedAttempts[ip] = failedAttempts[ip].filter(t => now - t < RATE_LIMIT_WINDOW)
  return failedAttempts[ip].length < RATE_LIMIT_MAX
}

function recordFailedAttempt(ip) {
  if (!failedAttempts[ip]) failedAttempts[ip] = []
  failedAttempts[ip].push(Date.now())
}

/**
 * 管理员登录认证 API
 * POST /api/admin/auth
 * 请求体：{ password: string }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' })
  }

  // 获取客户端 IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'

  // 频率限制检查
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: '请求过于频繁，请 5 分钟后再试' })
  }

  // 检查是否配置了管理员密码
  const adminPassword = getAdminPassword()
  if (!adminPassword) {
    return res.status(403).json({
      error: '未配置管理员密码。请在部署平台设置环境变量 ADMIN_PASSWORD'
    })
  }

  const { password } = req.body || {}
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: '请输入密码' })
  }

  // 验证密码
  if (password !== adminPassword) {
    recordFailedAttempt(ip)
    return res.status(401).json({ error: '密码错误' })
  }

  // 签发 token 并设置 HttpOnly Cookie
  const token = signToken({ role: 'admin' })
  const isProduction = process.env.NODE_ENV === 'production'

  res.setHeader('Set-Cookie', [
    `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${isProduction ? '; Secure' : ''}`
  ])

  return res.status(200).json({ success: true, message: '登录成功' })
}
