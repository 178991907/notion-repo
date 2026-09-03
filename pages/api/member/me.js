/**
 * 获取当前已登录会员信息 API
 * GET /api/member/me
 */
import { verifyMemberToken } from '@/lib/member/auth'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: '仅支持 GET 请求' })
  }

  // 从 Cookie 中读取 member_token
  const cookies = req.headers.cookie || ''
  const tokenMatch = cookies.match(/(?:^|;\s*)member_token=([^;]+)/)
  const token = tokenMatch ? tokenMatch[1] : null

  if (!token) {
    return res.status(200).json({
      success: true,
      isLoggedIn: false,
      member: null
    })
  }

  const payload = verifyMemberToken(token)

  if (!payload) {
    return res.status(200).json({
      success: true,
      isLoggedIn: false,
      member: null
    })
  }

  return res.status(200).json({
    success: true,
    isLoggedIn: true,
    member: {
      username: payload.username,
      expireDate: payload.expireDate || null,
      status: payload.status || 'Active',
      level: payload.level || 'VIP'
    }
  })
}
