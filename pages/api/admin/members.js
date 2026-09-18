import {
  listMembers,
  listInviteCodes,
  createInviteCode,
  updateInviteCodeStatus,
  createMember,
  syncNotionArticleProperties,
  getFansConfigFromNotion,
  saveFansConfigToNotion,
  initMemberDatabases
} from '@/lib/member/notion'
import { verifyRequestToken } from '@/lib/admin/auth'

/**
 * 校验管理员登录凭证（严格校验 HMAC-SHA256 签名与有效期）
 */
function checkAdminAuth(req) {
  return Boolean(verifyRequestToken(req))
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

import { withSecurity } from '@/lib/middleware/withSecurity'

async function handler(req, res) {
  // 校验管理员权限
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ success: false, message: '未授权：请先登录管理员后台' })
  }

  // GET: 获取会员与邀请码全量数据
  if (req.method === 'GET') {
    const token = process.env.NOTION_API_TOKEN || process.env.NOTION_ACCESS_TOKEN || process.env.NOTION_TOKEN
    if (!token && process.env.NODE_ENV !== 'test') {
      return res.status(200).json({
        success: false,
        needSetup: true,
        message: '未获取到 Notion API Token (NOTION_ACCESS_TOKEN)。请在 Vercel 环境变量中配置 NOTION_ACCESS_TOKEN，且生效环境务必勾选【Production】与【Preview】，保存后请点击 Redeploy 重新部署。',
        members: [],
        inviteCodes: [],
        fansConfig: {
          defaultPasscode: '888888',
          unlockTips: '关注公众号或联系博主获取解锁验证码'
        }
      })
    }

    try {
      const [members, inviteCodes, fansConfig] = await Promise.all([
        listMembers(),
        listInviteCodes(),
        getFansConfigFromNotion().catch(() => ({
          defaultPasscode: '888888',
          unlockTips: '关注公众号或联系博主获取解锁验证码'
        }))
      ])

      return res.status(200).json({
        success: true,
        members,
        inviteCodes,
        fansConfig
      })
    } catch (error) {
      console.error('[AdminMembersAPI] 获取数据失败:', error)
      return res.status(200).json({
        success: false,
        needSetup: true,
        message: '未能读取会员数据 (' + (error.message || '未知错误') + ')。请确认已在 Notion 博客主页面右上角通过「··· ➔ 品 集成 ➔ + 添加连接」完成授权。',
        members: [],
        inviteCodes: [],
        fansConfig: {
          defaultPasscode: '888888',
          unlockTips: '关注公众号或联系博主获取解锁验证码'
        }
      })
    }
  }

  // POST: 增删改操作
  if (req.method === 'POST') {
    const csrfToken = req.headers['x-admin-csrf']
    const isSameOrigin = !req.headers.origin || req.headers['sec-fetch-site'] === 'same-origin'
    if (!csrfToken && !isSameOrigin) {
      return res.status(403).json({ success: false, message: '缺少 CSRF 验证头或校验失败' })
    }

    const { action } = req.body

    try {
      // 0. 一键全自动在 Notion 根页面下初始化会员与邀请码数据库
      if (action === 'init_databases') {
        const result = await initMemberDatabases()
        return res.status(200).json({
          success: true,
          message: '🎉 成功全自动在您的 Notion 页面下创建了「会员数据库」与「邀请码数据库」！',
          ...result
        })
      }

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

        // 批量创建前先行自愈保障
        try {
          await initMemberDatabases()
        } catch (initErr) {
          console.warn('[AdminMembersAPI] 批量生成前自愈探测:', initErr.message)
        }

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

      // 5. 更新粉丝专区全局通用暗号与引导文案（写入 Notion 配置中心并清理缓存）
      if (action === 'update_fans_config') {
        const { defaultPasscode, unlockTips } = req.body
        const cleanedPasscode = defaultPasscode !== undefined ? String(defaultPasscode).trim() : '888888'
        const cleanedUnlockTips = unlockTips !== undefined ? String(unlockTips).trim() : ''

        // 持久化写入 Notion 配置中心数据库并清除前台缓存
        await saveFansConfigToNotion({
          defaultPasscode: cleanedPasscode,
          unlockTips: cleanedUnlockTips
        })

        if (!global.__adminConfigOverrides) {
          global.__adminConfigOverrides = {}
        }
        global.__adminConfigOverrides.HEO_FANS_DEFAULT_PASSCODE = cleanedPasscode
        global.__adminConfigOverrides.HEO_FANS_UNLOCK_TIPS = cleanedUnlockTips

        try {
          if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
            const fs = require('fs')
            const path = require('path')
            const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
            fs.writeFileSync(configPath, JSON.stringify(global.__adminConfigOverrides, null, 2), 'utf-8')
          }
        } catch (e) {}

        return res.status(200).json({
          success: true,
          fansConfig: {
            defaultPasscode: cleanedPasscode,
            unlockTips: cleanedUnlockTips
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
      const isNotionAuth = error.message?.includes('unauthorized') || 
                           error.message?.includes('API token is invalid') || 
                           error.message?.includes('Could not find') || 
                           error.message?.includes('object_not_found')
      const message = isNotionAuth
        ? `操作失败：未连接到 Notion 或权限不足。请检查：1. 是否已在 Notion 博客页面右上角通过「··· ➔ Connect to」授权您的集成；2. 环境变量 NOTION_ACCESS_TOKEN 是否正确。(${error.message})`
        : (error.message || '操作失败')
      return res.status(400).json({ success: false, needSetup: true, message })
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' })
}

export default withSecurity(handler, { rateLimit: { limit: 10, windowMs: 60000 } })
