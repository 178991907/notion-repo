/**
 * Notion 会员与邀请码数据库交互模块
 * 使用 Notion 官方 SDK (@notionhq/client) 实现数据读写
 * 具备属性中英文字段兼容、自动缓存与容错处理
 */
import { Client } from '@notionhq/client'
import { getCache, setCache, delCache } from '@/lib/cache/memory_cache'

// 单例客户端实例
let notionClientInstance = null

/**
 * 获取 Notion 官方 API 客户端
 * @returns {Client|null}
 */
export function getNotionClient() {
  const token = process.env.NOTION_API_TOKEN || process.env.NOTION_TOKEN
  if (!token) {
    return null
  }
  if (!notionClientInstance) {
    notionClientInstance = new Client({ auth: token })
  }
  return notionClientInstance
}

/**
 * 获取会员数据库 ID
 * @returns {string|null}
 */
export function getMembersDatabaseId() {
  return process.env.NOTION_MEMBERS_DATABASE_ID || null
}

/**
 * 获取邀请码数据库 ID
 * @returns {string|null}
 */
export function getInvitesDatabaseId() {
  return process.env.NOTION_INVITES_DATABASE_ID || null
}

/**
 * 从 properties 字典中查找指定的属性名（支持多候选词、大小写不敏感匹配）
 * @param {object} properties Notion 页面的 properties 对象
 * @param {string[]} candidates 候选键名列表
 * @returns {string|null} 匹配到的真实属性名
 */
function findPropertyKey(properties, candidates) {
  if (!properties) return null
  const propKeys = Object.keys(properties)
  for (const candidate of candidates) {
    // 精确匹配
    if (properties[candidate]) return candidate
    // 大小写不敏感匹配
    const lowerCandidate = candidate.toLowerCase()
    const matched = propKeys.find(k => k.toLowerCase() === lowerCandidate)
    if (matched) return matched
  }
  return null
}

/**
 * 安全提取 Notion Property 属性的原始值
 * @param {object} property
 * @returns {*} 纯文本、数字、布尔值或 null
 */
function extractPropertyValue(property) {
  if (!property) return null
  switch (property.type) {
    case 'title':
      return property.title?.map(t => t.plain_text).join('').trim() || ''
    case 'rich_text':
      return property.rich_text?.map(t => t.plain_text).join('').trim() || ''
    case 'select':
      return property.select?.name || ''
    case 'status':
      return property.status?.name || ''
    case 'date':
      return property.date?.start || null
    case 'number':
      return property.number ?? null
    case 'checkbox':
      return property.checkbox ?? false
    case 'email':
      return property.email || ''
    case 'phone_number':
      return property.phone_number || ''
    default:
      return null
  }
}

/**
 * 解析 Notion 会员 Page 对象为标准会员模型
 * @param {object} page
 * @returns {object}
 */
function parseMemberPage(page) {
  const props = page.properties || {}

  const usernameKey = findPropertyKey(props, ['Username', 'username', '账号', '用户名', 'Title'])
  const passwordKey = findPropertyKey(props, ['Password', 'password', '密码'])
  const statusKey = findPropertyKey(props, ['Status', 'status', '状态'])
  const expireDateKey = findPropertyKey(props, ['ExpireDate', 'expire_date', 'expireDate', '到期时间', '有效期'])
  const inviteCodeKey = findPropertyKey(props, ['InviteCode', 'invite_code', 'inviteCode', '邀请码'])
  const remarkKey = findPropertyKey(props, ['Remark', 'remark', '备注'])

  return {
    id: page.id,
    username: usernameKey ? extractPropertyValue(props[usernameKey]) : '',
    password: passwordKey ? extractPropertyValue(props[passwordKey]) : '',
    status: statusKey ? (extractPropertyValue(props[statusKey]) || 'Active') : 'Active',
    expireDate: expireDateKey ? extractPropertyValue(props[expireDateKey]) : null,
    inviteCode: inviteCodeKey ? extractPropertyValue(props[inviteCodeKey]) : '',
    remark: remarkKey ? extractPropertyValue(props[remarkKey]) : '',
    createdAt: page.created_time
  }
}

/**
 * 根据用户名查询会员信息
 * @param {string} username 用户名
 * @returns {Promise<object|null>} 会员对象或 null
 */
export async function findMemberByUsername(username) {
  if (!username) return null
  const trimmed = String(username).trim()
  const cacheKey = `member_user_${trimmed}`

  // 1. 尝试从本地缓存中获取（缓存 3 分钟）
  const cached = await getCache(cacheKey)
  if (cached) {
    return cached
  }

  const client = getNotionClient()
  const databaseId = getMembersDatabaseId()

  if (!client || !databaseId) {
    console.warn('[MemberNotion] 未配置 NOTION_API_TOKEN 或 NOTION_MEMBERS_DATABASE_ID')
    return null
  }

  try {
    // 首次先获取数据库 schema 以确定 Username 的具体列名
    const db = await client.databases.retrieve({ database_id: databaseId })
    const usernameKey = findPropertyKey(db.properties, ['Username', 'username', '账号', '用户名', 'Title']) || 'Username'

    const response = await client.databases.query({
      database_id: databaseId,
      filter: {
        property: usernameKey,
        title: {
          equals: trimmed
        }
      },
      page_size: 1
    })

    if (!response.results || response.results.length === 0) {
      return null
    }

    const member = parseMemberPage(response.results[0])
    // 写入内存缓存（3 分钟）
    await setCache(cacheKey, member, 180)
    return member
  } catch (error) {
    console.error('[MemberNotion] 查询会员失败:', error.message)
    return null
  }
}

/**
 * 在 Notion 中创建新会员记录
 * @param {object} param0 { username, password, inviteCode, expireDate, remark }
 * @returns {Promise<object>} 返回创建成功的会员对象
 */
export async function createMember({ username, password, inviteCode = '', expireDate = null, remark = '' }) {
  const client = getNotionClient()
  const databaseId = getMembersDatabaseId()

  if (!client || !databaseId) {
    throw new Error('系统尚未配置 Notion 会员数据库环境（NOTION_API_TOKEN 或 NOTION_MEMBERS_DATABASE_ID）')
  }

  // 先获取数据库 schema，动态匹配字段名和属性类型
  const db = await client.databases.retrieve({ database_id: databaseId })
  const props = db.properties

  const usernameKey = findPropertyKey(props, ['Username', 'username', '账号', '用户名', 'Title']) || 'Username'
  const passwordKey = findPropertyKey(props, ['Password', 'password', '密码']) || 'Password'
  const statusKey = findPropertyKey(props, ['Status', 'status', '状态']) || 'Status'
  const expireDateKey = findPropertyKey(props, ['ExpireDate', 'expire_date', 'expireDate', '到期时间', '有效期'])
  const inviteCodeKey = findPropertyKey(props, ['InviteCode', 'invite_code', 'inviteCode', '邀请码'])
  const remarkKey = findPropertyKey(props, ['Remark', 'remark', '备注'])

  // 构建 Notion 新增页面属性
  const pageProperties = {}

  // 用户名 (Title)
  pageProperties[usernameKey] = {
    title: [
      {
        text: {
          content: String(username).trim()
        }
      }
    ]
  }

  // 密码 (RichText)
  pageProperties[passwordKey] = {
    rich_text: [
      {
        text: {
          content: String(password).trim()
        }
      }
    ]
  }

  // 状态 (Select 或 Status)
  if (statusKey && props[statusKey]) {
    const statusType = props[statusKey].type
    if (statusType === 'select') {
      pageProperties[statusKey] = { select: { name: 'Active' } }
    } else if (statusType === 'status') {
      pageProperties[statusKey] = { status: { name: 'Active' } }
    }
  }

  // 到期时间 (Date)
  if (expireDateKey && expireDate) {
    pageProperties[expireDateKey] = {
      date: {
        start: new Date(expireDate).toISOString().split('T')[0]
      }
    }
  }

  // 邀请码 (RichText)
  if (inviteCodeKey && inviteCode) {
    pageProperties[inviteCodeKey] = {
      rich_text: [
        {
          text: {
            content: String(inviteCode).trim()
          }
        }
      ]
    }
  }

  // 备注 (RichText)
  if (remarkKey && remark) {
    pageProperties[remarkKey] = {
      rich_text: [
        {
          text: {
            content: String(remark).trim()
          }
        }
      ]
    }
  }

  const newPage = await client.pages.create({
    parent: { database_id: databaseId },
    properties: pageProperties
  })

  // 清理用户可能存在的脏缓存
  await delCache(`member_user_${String(username).trim()}`)

  return parseMemberPage(newPage)
}

/**
 * 校验并消耗邀请码
 * @param {string} inviteCode 邀请码
 * @returns {Promise<{ valid: boolean, message?: string, days?: number }>}
 */
export async function verifyAndConsumeInviteCode(inviteCode) {
  if (!inviteCode) {
    return { valid: false, message: '请输入邀请码' }
  }
  const trimmed = String(inviteCode).trim()

  const client = getNotionClient()
  const databaseId = getInvitesDatabaseId()

  if (!client || !databaseId) {
    // 如果未配置邀请码数据库，则拒绝注册，保护系统
    return {
      valid: false,
      message: '系统尚未配置邀请码数据库（NOTION_INVITES_DATABASE_ID），请联系管理员'
    }
  }

  try {
    const db = await client.databases.retrieve({ database_id: databaseId })
    const codeKey = findPropertyKey(db.properties, ['Code', 'code', '邀请码', 'Title']) || 'Code'
    const statusKey = findPropertyKey(db.properties, ['Status', 'status', '状态'])
    const maxUsesKey = findPropertyKey(db.properties, ['MaxUses', 'max_uses', 'maxUses', '最大次数', '次数'])
    const usedCountKey = findPropertyKey(db.properties, ['UsedCount', 'used_count', 'usedCount', '已用次数'])
    const daysKey = findPropertyKey(db.properties, ['Days', 'days', '有效天数', '赠送天数'])

    const response = await client.databases.query({
      database_id: databaseId,
      filter: {
        property: codeKey,
        title: {
          equals: trimmed
        }
      },
      page_size: 1
    })

    if (!response.results || response.results.length === 0) {
      return { valid: false, message: '无效的邀请码，请核对后重试' }
    }

    const invitePage = response.results[0]
    const props = invitePage.properties

    // 检查状态
    const statusVal = statusKey ? extractPropertyValue(props[statusKey]) : 'Active'
    if (statusVal && !/^(active|有效|正常)$/i.test(statusVal)) {
      return { valid: false, message: '该邀请码已被禁用或已失效' }
    }

    // 检查最大使用次数与已用次数
    const maxUses = maxUsesKey ? (extractPropertyValue(props[maxUsesKey]) ?? 1) : 1
    const usedCount = usedCountKey ? (extractPropertyValue(props[usedCountKey]) ?? 0) : 0

    if (maxUses > 0 && usedCount >= maxUses) {
      return { valid: false, message: '该邀请码的使用次数已达上限' }
    }

    // 提取赠送会员天数
    const days = daysKey ? (extractPropertyValue(props[daysKey]) ?? 0) : 0

    // 更新邀请码的使用次数与状态
    const newUsedCount = usedCount + 1
    const updateProperties = {}

    if (usedCountKey) {
      updateProperties[usedCountKey] = {
        number: newUsedCount
      }
    }

    // 如果达到最大次数，自动将状态更新为 Used/已用完
    if (maxUses > 0 && newUsedCount >= maxUses && statusKey) {
      const statusType = db.properties[statusKey]?.type
      if (statusType === 'select') {
        updateProperties[statusKey] = { select: { name: 'Used' } }
      } else if (statusType === 'status') {
        updateProperties[statusKey] = { status: { name: 'Used' } }
      }
    }

    if (Object.keys(updateProperties).length > 0) {
      await client.pages.update({
        page_id: invitePage.id,
        properties: updateProperties
      })
    }

    return {
      valid: true,
      days: Number(days) || 0
    }
  } catch (error) {
    console.error('[MemberNotion] 校验邀请码失败:', error)
    return { valid: false, message: '校验邀请码时发生异常，请稍后再试' }
  }
}

const memberNotion = {
  getNotionClient,
  getMembersDatabaseId,
  getInvitesDatabaseId,
  findMemberByUsername,
  createMember,
  verifyAndConsumeInviteCode
}

export default memberNotion
