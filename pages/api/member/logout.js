/**
 * 会员登出 API
 * POST /api/member/logout
 */
import { buildClearMemberCookieHeader } from '@/lib/member/auth'

export default function handler(req, res) {
  res.setHeader('Set-Cookie', buildClearMemberCookieHeader())
  return res.status(200).json({
    success: true,
    message: '会员账号已成功退出'
  })
}
