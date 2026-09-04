import { listMembers, listInviteCodes, createInviteCode, updateInviteCodeStatus, createMember, syncNotionArticleProperties } from '@/lib/member/notion'

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

      // 读取粉丝专区通用暗号与引导文案
      const defaultPasscode = global.__adminConfigOverrides?.HEO_FANS_DEFAULT_PASSCODE || process.env.HEO_FANS_DEFAULT_PASSCODE || '888888'
      const unlockTips = global.__adminConfigOverrides?.HEO_FANS_UNLOCK_TIPS || process.env.HEO_FANS_UNLOCK_TIPS || '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码'

      return res.status(200).json({
        success: true,
        members,
        inviteCodes,
        fansConfig: {
          defaultPasscode,
          unlockTips
        }
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

      // 5. 更新粉丝专区全局通用暗号与引导文案
      if (action === 'update_fans_config') {
        const { defaultPasscode, unlockTips } = req.body
        if (!global.__adminConfigOverrides) {
          global.__adminConfigOverrides = {}
        }
        if (defaultPasscode !== undefined) {
          global.__adminConfigOverrides.HEO_FANS_DEFAULT_PASSCODE = String(defaultPasscode).trim()
        }
        if (unlockTips !== undefined) {
          global.__adminConfigOverrides.HEO_FANS_UNLOCK_TIPS = String(unlockTips).trim()
        }
        // 持久化到本地配置文件
        try {
          const fs = require('fs')
          const path = require('path')
          const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
          fs.writeFileSync(configPath, JSON.stringify(global.__adminConfigOverrides, null, 2), 'utf-8')
        } catch (e) {}

        return res.status(200).json({
          success: true,
          fansConfig: {
            defaultPasscode: global.__adminConfigOverrides.HEO_FANS_DEFAULT_PASSCODE,
            unlockTips: global.__adminConfigOverrides.HEO_FANS_UNLOCK_TIPS
          }
        })
      }

      // 6. 扫描 Notion 博客数据库并自动补齐空白访问码与 VIP 等级（为每篇文章生成互不相同的专属随机码）
      if (action === 'sync_notion_articles') {
        const { codeFormat = 'alphanumeric' } = req.body
        const defaultPasscode = global.__adminConfigOverrides?.HEO_FANS_DEFAULT_PASSCODE || process.env.HEO_FANS_DEFAULT_PASSCODE || '888888'
        const result = await syncNotionArticleProperties({
          codeFormat,
          fallbackCode: defaultPasscode
        })
        return res.status(200).json({
          success: true,
          ...result
        })
      }

      return res.status(400).json({ success: false, message: '未知的操作类型' })
    } catch (error) {
      console.error('[AdminMembersAPI] 操作失败:', error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' })
}
