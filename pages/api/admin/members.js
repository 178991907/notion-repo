import { listMembers, listInviteCodes, createInviteCode, updateInviteCodeStatus, createMember } from '@/lib/member/notion'

/**
 * 校验管理员登录凭证
 */
function checkAdminAuth(req) {
  const token = req.cookies.admin_token
  return Boolean(token)
}

/**
 * 生成指定长度的随机邀请码（如 VIP-A8K2F9）
 */
function generateRandomCode(prefix = 'VIP') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix ? `${prefix}-${res}` : res
}

export default async function handler(req, res) {
  // 校验管理员权限
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, message: '未授权：请先登录管理员后台' })
  }

  // GET: 获取会员与邀请码全量数据
  if (req.method === 'GET') {
    try {
      const [members, inviteCodes] = await Promise.all([
        listMembers(),
        listInviteCodes()
      ])
      return res.status(200).json({
        success: true,
        members,
        inviteCodes
      })
    } catch (error) {
      console.error('[AdminMembersAPI] 获取数据失败:', error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  // POST: 增删改操作
  if (req.method === 'POST') {
    const { action } = req.body

    try {
      // 1. 创建单个邀请码
      if (action === 'create_invite') {
        const { code, level = 'VIP', maxUses = 1, days = 0, remark = '' } = req.body
        if (!code) {
          return res.status(400).json({ success: false, message: '邀请码不能为空' })
        }
        const created = await createInviteCode({
          code: String(code).trim().toUpperCase(),
          level,
          maxUses: Number(maxUses),
          days: Number(days),
          remark
        })
        return res.status(200).json({ success: true, invite: created })
      }

      // 2. 批量生成一人一码（一次性核销码）
      if (action === 'batch_create_invites') {
        const { count = 5, level = 'VIP', prefix = 'VIP', days = 0, remark = '' } = req.body
        const num = Math.min(Math.max(Number(count) || 1, 1), 20) // 最多单次生成 20 个
        const createdList = []

        for (let i = 0; i < num; i++) {
          const code = generateRandomCode(prefix)
          const item = await createInviteCode({
            code,
            level,
            maxUses: 1, // 一人一码
            days: Number(days),
            remark: remark || `批量生成一人一码 [${i + 1}/${num}]`
          })
          createdList.push(item)
        }

        return res.status(200).json({ success: true, count: createdList.length, invites: createdList })
      }

      // 3. 切换邀请码状态（启用 / 作废）
      if (action === 'toggle_invite_status') {
        const { id, status } = req.body
        if (!id) {
          return res.status(400).json({ success: false, message: '缺少邀请码记录 ID' })
        }
        await updateInviteCodeStatus(id, status)
        return res.status(200).json({ success: true })
      }

      // 4. 管理员在后台直接创建会员账号
      if (action === 'create_member') {
        const { username, password, level = 'VIP', expireDate = null, remark = '' } = req.body
        if (!username || !password) {
          return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
        }
        const newMember = await createMember({
          username: String(username).trim(),
          password: String(password).trim(),
          level,
          expireDate,
          remark: remark || '管理员后台手动创建'
        })
        return res.status(200).json({ success: true, member: newMember })
      }

      return res.status(400).json({ success: false, message: '未知的操作类型' })
    } catch (error) {
      console.error('[AdminMembersAPI] 操作失败:', error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' })
}
