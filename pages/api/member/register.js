/**
 * 会员邀请码注册 API
 * POST /api/member/register
 * 请求体：{ username: string, password: string, inviteCode: string }
 */
import {
  signMemberToken,
  buildMemberCookieHeader
} from '@/lib/member/auth'
import {
  findMemberByUsername,
  createMember,
  verifyAndConsumeInviteCode
} from '@/lib/member/notion'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '仅支持 POST 请求' })
  }

  const { username, password, inviteCode } = req.body || {}

  // 参数基础校验
  if (!username || typeof username !== 'string' || username.trim().length < 2) {
    return res.status(400).json({ success: false, error: '会员账号至少需要 2 个字符' })
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, error: '密码长度不能少于 6 位' })
  }

  if (!inviteCode || typeof inviteCode !== 'string' || !inviteCode.trim()) {
    return res.status(400).json({ success: false, error: '请输入专属邀请码' })
  }

  const cleanUsername = username.trim()
  const cleanPassword = password.trim()
  const cleanInviteCode = inviteCode.trim()

  try {
    // 1. 检查用户名是否已被注册
    const existingMember = await findMemberByUsername(cleanUsername)
    if (existingMember) {
      return res.status(409).json({ success: false, error: '该会员账号已被占用，请更换其他账号' })
    }

    // 2. 校验并核销邀请码
    const inviteCheck = await verifyAndConsumeInviteCode(cleanInviteCode)
    if (!inviteCheck.valid) {
      return res.status(400).json({
        success: false,
        error: inviteCheck.message || '邀请码无效或已失效'
      })
    }

    // 3. 计算会员到期时间（如果邀请码配置了有效天数）
    let expireDate = null
    if (inviteCheck.days && inviteCheck.days > 0) {
      const exp = new Date()
      exp.setDate(exp.getDate() + inviteCheck.days)
      expireDate = exp.toISOString().split('T')[0]
    }

    // 4. 在 Notion 中写入新会员记录
    const newMember = await createMember({
      username: cleanUsername,
      password: cleanPassword,
      inviteCode: cleanInviteCode,
      expireDate,
      remark: `前台邀请码注册 [${cleanInviteCode}]`
    })

    // 5. 注册成功后自动签发登录凭证，实现无缝登录
    const token = signMemberToken(
      {
        username: newMember.username,
        expireDate: newMember.expireDate,
        status: newMember.status
      },
      true // 注册默认长期保持登录
    )

    res.setHeader('Set-Cookie', buildMemberCookieHeader(token, true))

    return res.status(200).json({
      success: true,
      message: '恭喜，会员账号注册成功！',
      member: {
        username: newMember.username,
        expireDate: newMember.expireDate,
        status: newMember.status
      }
    })
  } catch (error) {
    console.error('[MemberRegister] 注册异常:', error)
    return res.status(500).json({
      success: false,
      error: error.message || '服务器创建账号异常，请稍后再试'
    })
  }
}
