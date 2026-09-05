/**
 * Notion 会员与邀请码数据库交互模块
 * 使用 Notion 官方 SDK (@notionhq/client) 实现数据读写
 * 具备属性中英文字段兼容、自动缓存与容错处理
 */
import { Client } from '@notionhq/client'
import { getCache, setCache, delCache, cleanCache as cleanMemCache } from '@/lib/cache/memory_cache'
import { cleanCache as cleanFileCache } from '@/lib/cache/local_file_cache'

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
  const levelKey = findPropertyKey(props, ['Level', 'level', '会员等级', '等级'])

  return {
    id: page.id,
    username: usernameKey ? extractPropertyValue(props[usernameKey]) : '',
    password: passwordKey ? extractPropertyValue(props[passwordKey]) : '',
    status: statusKey ? (extractPropertyValue(props[statusKey]) || 'Active') : 'Active',
    level: levelKey ? (extractPropertyValue(props[levelKey]) || 'VIP') : 'VIP',
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
export async function createMember({ username, password, inviteCode = '', expireDate = null, remark = '', level = 'VIP' }) {
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
  const levelKey = findPropertyKey(props, ['Level', 'level', '会员等级', '等级'])

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

  // 会员等级 (Select)
  if (levelKey && props[levelKey]) {
    pageProperties[levelKey] = {
      select: {
        name: String(level || 'VIP').toUpperCase()
      }
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
    const levelKey = findPropertyKey(db.properties, ['Level', 'level', '会员等级', '等级'])

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

    // 提取赠送会员天数与会员等级
    const days = daysKey ? (extractPropertyValue(props[daysKey]) ?? 0) : 0
    const inviteLevel = levelKey ? (extractPropertyValue(props[levelKey]) || 'VIP') : 'VIP'

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
      days: Number(days) || 0,
      level: String(inviteLevel || 'VIP').toUpperCase()
    }
  } catch (error) {
    console.error('[MemberNotion] 校验邀请码失败:', error)
    return { valid: false, message: '校验邀请码时发生异常，请稍后再试' }
  }
}

/**
 * 查询会员列表（供管理员后台查看）
 * @returns {Promise<Array>}
 */
export async function listMembers() {
  const client = getNotionClient()
  const databaseId = getMembersDatabaseId()
  if (!client || !databaseId) return []

  try {
    const db = await client.databases.retrieve({ database_id: databaseId })
    const props = db.properties
    const usernameKey = findPropertyKey(props, ['Username', 'username', '账号', '用户名', 'Title']) || 'Username'
    const statusKey = findPropertyKey(props, ['Status', 'status', '状态'])
    const expireDateKey = findPropertyKey(props, ['ExpireDate', 'expire_date', 'expireDate', '到期时间', '有效期'])
    const inviteCodeKey = findPropertyKey(props, ['InviteCode', 'invite_code', 'inviteCode', '邀请码'])
    const levelKey = findPropertyKey(props, ['Level', 'level', '会员等级', '等级'])

    const response = await client.databases.query({
      database_id: databaseId,
      page_size: 100
    })

    return (response.results || []).map(page => {
      const p = page.properties
      return {
        id: page.id,
        username: usernameKey ? extractPropertyValue(p[usernameKey]) : '',
        level: (levelKey ? extractPropertyValue(p[levelKey]) : 'VIP') || 'VIP',
        status: (statusKey ? extractPropertyValue(p[statusKey]) : 'Active') || 'Active',
        expireDate: expireDateKey ? extractPropertyValue(p[expireDateKey]) : null,
        inviteCode: inviteCodeKey ? extractPropertyValue(p[inviteCodeKey]) : '',
        createdAt: page.created_time
      }
    })
  } catch (error) {
    console.error('[MemberNotion] 获取会员列表失败:', error.message)
    return []
  }
}

/**
 * 查询邀请码列表（供管理员后台查看）
 * @returns {Promise<Array>}
 */
export async function listInviteCodes() {
  const client = getNotionClient()
  const databaseId = getInvitesDatabaseId()
  if (!client || !databaseId) return []

  try {
    const db = await client.databases.retrieve({ database_id: databaseId })
    const props = db.properties
    const codeKey = findPropertyKey(props, ['Code', 'code', '邀请码', 'Title']) || 'Code'
    const statusKey = findPropertyKey(props, ['Status', 'status', '状态'])
    const maxUsesKey = findPropertyKey(props, ['MaxUses', 'max_uses', 'maxUses', '最大次数', '次数'])
    const usedCountKey = findPropertyKey(props, ['UsedCount', 'used_count', 'usedCount', '已用次数'])
    const daysKey = findPropertyKey(props, ['Days', 'days', '有效天数', '赠送天数'])
    const levelKey = findPropertyKey(props, ['Level', 'level', '会员等级', '等级'])
    const remarkKey = findPropertyKey(props, ['Remark', 'remark', '备注'])

    const response = await client.databases.query({
      database_id: databaseId,
      page_size: 100
    })

    return (response.results || []).map(page => {
      const p = page.properties
      const maxUses = maxUsesKey ? (extractPropertyValue(p[maxUsesKey]) ?? 1) : 1
      const usedCount = usedCountKey ? (extractPropertyValue(p[usedCountKey]) ?? 0) : 0
      const status = statusKey ? (extractPropertyValue(p[statusKey]) || 'Active') : 'Active'
      const code = codeKey ? extractPropertyValue(p[codeKey]) : ''
      const level = (levelKey ? extractPropertyValue(p[levelKey]) : 'VIP') || 'VIP'
      const days = daysKey ? (extractPropertyValue(p[daysKey]) ?? 0) : 0
      const remark = remarkKey ? extractPropertyValue(p[remarkKey]) : ''

      return {
        id: page.id,
        code,
        level,
        status,
        maxUses,
        usedCount,
        days,
        remark,
        isSingleUse: maxUses === 1,
        isUnlimited: maxUses === 0 || maxUses >= 9999,
        createdAt: page.created_time
      }
    })
  } catch (error) {
    console.error('[MemberNotion] 获取邀请码列表失败:', error.message)
    return []
  }
}

/**
 * 后台创建邀请码（支持单人一次性码与多人固定通用码）
 * @param {object} param0 { code, level, maxUses, days, remark }
 * @returns {Promise<object>}
 */
export async function createInviteCode({ code, level = 'VIP', maxUses = 1, days = 0, remark = '' }) {
  const client = getNotionClient()
  const databaseId = getInvitesDatabaseId()
  if (!client || !databaseId) {
    throw new Error('未配置邀请码数据库 ID（NOTION_INVITES_DATABASE_ID）')
  }

  const db = await client.databases.retrieve({ database_id: databaseId })
  const props = db.properties
  const codeKey = findPropertyKey(props, ['Code', 'code', '邀请码', 'Title']) || 'Code'
  const statusKey = findPropertyKey(props, ['Status', 'status', '状态'])
  const maxUsesKey = findPropertyKey(props, ['MaxUses', 'max_uses', 'maxUses', '最大次数', '次数'])
  const usedCountKey = findPropertyKey(props, ['UsedCount', 'used_count', 'usedCount', '已用次数'])
  const daysKey = findPropertyKey(props, ['Days', 'days', '有效天数', '赠送天数'])
  const levelKey = findPropertyKey(props, ['Level', 'level', '会员等级', '等级'])
  const remarkKey = findPropertyKey(props, ['Remark', 'remark', '备注'])

  const pageProperties = {}
  pageProperties[codeKey] = {
    title: [{ text: { content: String(code).trim() } }]
  }

  if (levelKey && props[levelKey]) {
    pageProperties[levelKey] = { select: { name: String(level || 'VIP').toUpperCase() } }
  }

  if (statusKey && props[statusKey]) {
    const statusType = props[statusKey].type
    if (statusType === 'select') pageProperties[statusKey] = { select: { name: 'Active' } }
    else if (statusType === 'status') pageProperties[statusKey] = { status: { name: 'Active' } }
  }

  if (maxUsesKey && props[maxUsesKey]) {
    pageProperties[maxUsesKey] = { number: Number(maxUses) }
  }

  if (usedCountKey && props[usedCountKey]) {
    pageProperties[usedCountKey] = { number: 0 }
  }

  if (daysKey && props[daysKey] && Number(days) > 0) {
    pageProperties[daysKey] = { number: Number(days) }
  }

  if (remarkKey && props[remarkKey] && remark) {
    pageProperties[remarkKey] = { rich_text: [{ text: { content: String(remark) } }] }
  }

  const newPage = await client.pages.create({
    parent: { database_id: databaseId },
    properties: pageProperties
  })

  return { id: newPage.id, code, level, maxUses, days, status: 'Active' }
}

/**
 * 更新邀请码状态（作废/恢复）
 */
export async function updateInviteCodeStatus(pageId, newStatus = 'Disabled') {
  const client = getNotionClient()
  const databaseId = getInvitesDatabaseId()
  if (!client || !databaseId) throw new Error('未配置邀请码数据库')

  const db = await client.databases.retrieve({ database_id: databaseId })
  const statusKey = findPropertyKey(db.properties, ['Status', 'status', '状态'])
  if (!statusKey) return false

  const statusType = db.properties[statusKey].type
  const updateProps = {}
  if (statusType === 'select') updateProps[statusKey] = { select: { name: newStatus } }
  else if (statusType === 'status') updateProps[statusKey] = { status: { name: newStatus } }

  await client.pages.update({ page_id: pageId, properties: updateProps })
  return true
}

/**
 * 生成防猜解、互不相同的高随机粉丝访问码
 * @param {'alphanumeric'|'number'} format 格式模式：'alphanumeric' (大写字母数字防混淆) 或 'number' (6位纯数字)
 * @returns {string} 随机专属访问码
 */
export function generateRandomFansCode(format = 'alphanumeric') {
  if (format === 'number') {
    // 6 位高随机纯数字 (100000 - 999999)
    return String(Math.floor(100000 + Math.random() * 900000))
  }
  // 6 位大写字母与数字组合，排除易混淆字符 0, O, 1, I (组合数超过 7.2 亿种)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  let res = ''
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return res
}

/**
 * 自动扫描并补齐 Notion 博客文章数据库中的粉丝码与会员等级
 * 若勾选 fans 但未填 fans_code：为每篇自动生成独立的互不相同的随机专属访问码！
 * 若勾选 vip 但未填 vip_level：自动补充 VIP 等级
 * @param {object} options 配置项
 * @param {'alphanumeric'|'number'|'custom'} options.codeFormat 随机码类型
 * @param {string} options.fallbackCode 备用固定暗号
 */
export async function syncNotionArticleProperties({ codeFormat = 'alphanumeric', fallbackCode = '' } = {}) {
  const client = getNotionClient()
  const blogDbId = process.env.NOTION_PAGE_ID || 'd699622a6d1882f09e68814c63554113'
  if (!client || !blogDbId) {
    throw new Error('未配置 Notion API Token 或博客数据库 ID')
  }

  const response = await client.databases.query({
    database_id: blogDbId,
    page_size: 100
  })

  let updatedFansCount = 0
  let updatedVipCount = 0
  const updatedItems = []

  for (const page of response.results) {
    const title = page.properties.title?.title?.[0]?.plain_text || '无标题'
    const fans = page.properties.fans?.checkbox
    const fansCode = page.properties.fans_code?.multi_select || []
    const vip = page.properties.vip?.checkbox
    const vipLevel = page.properties.vip_level?.multi_select || []

    const needFans = fans && fansCode.length === 0
    const needVip = vip && vipLevel.length === 0

    if (needFans || needVip) {
      const updateProps = {}
      let generatedCode = null

      if (needFans) {
        // 为每一篇单独生成互不相同的高强度随机专属码
        generatedCode = codeFormat === 'custom' && fallbackCode
          ? String(fallbackCode).trim()
          : generateRandomFansCode(codeFormat)
        updateProps.fans_code = { multi_select: [{ name: generatedCode }] }
        updatedFansCount++
      }

      if (needVip) {
        updateProps.vip_level = { multi_select: [{ name: 'VIP' }] }
        updatedVipCount++
      }

      await client.pages.update({
        page_id: page.id,
        properties: updateProps
      })

      updatedItems.push({
        title,
        fansCode: generatedCode,
        vipLevel: needVip ? 'VIP' : null
      })
    }
  }

  return {
    totalScanned: response.results.length,
    updatedFansCount,
    updatedVipCount,
    updatedItems,
    updatedTitles: updatedItems.map(i => i.title)
  }
}

const NOTION_CONFIG_DB_ID = process.env.NOTION_CONFIG_DB_ID || '33f9622a-6d18-8244-872a-012c05388e5a'

/**
 * 从 Notion 配置中心读取粉丝专区配置（通用暗号与引导文案）
 */
export async function getFansConfigFromNotion() {
  const client = getNotionClient()
  if (!client || !NOTION_CONFIG_DB_ID) {
    return {
      defaultPasscode: '888888',
      unlockTips: '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码'
    }
  }

  try {
    const resp = await client.databases.query({
      database_id: NOTION_CONFIG_DB_ID,
      page_size: 100
    })

    let defaultPasscode = '888888'
    let unlockTips = '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码'

    for (const r of resp.results) {
      const name = r.properties['配置名']?.title?.[0]?.plain_text
      const val = r.properties['配置值']?.rich_text?.[0]?.plain_text
      if (name === 'HEO_FANS_DEFAULT_PASSCODE' && val) {
        defaultPasscode = String(val).trim()
      }
      if (name === 'HEO_FANS_UNLOCK_TIPS' && val) {
        unlockTips = String(val).trim()
      }
    }

    return { defaultPasscode, unlockTips }
  } catch (err) {
    console.warn('[getFansConfigFromNotion] 读取异常:', err.message)
    return {
      defaultPasscode: '888888',
      unlockTips: '关注微信公众号【Terry校长】，后台回复【暗号】免费获取解锁验证码'
    }
  }
}

/**
 * 将粉丝专区通用暗号与引导文案持久化写入 Notion 配置中心
 * @param {object} params
 * @param {string} params.defaultPasscode
 * @param {string} params.unlockTips
 */
export async function saveFansConfigToNotion({ defaultPasscode, unlockTips } = {}) {
  const client = getNotionClient()
  if (!client || !NOTION_CONFIG_DB_ID) {
    throw new Error('未配置 Notion API 客户端或配置中心数据库 ID')
  }

  // 1. 查询现有的配置中心数据
  const resp = await client.databases.query({
    database_id: NOTION_CONFIG_DB_ID,
    page_size: 100
  })

  const existingMap = new Map()
  resp.results.forEach(r => {
    const name = r.properties['配置名']?.title?.[0]?.plain_text
    if (name) {
      existingMap.set(name, r.id)
    }
  })

  const updates = []
  if (defaultPasscode !== undefined && defaultPasscode !== null) {
    const strVal = String(defaultPasscode).trim()
    if (strVal) {
      updates.push({ key: 'HEO_FANS_DEFAULT_PASSCODE', value: strVal })
    }
  }
  if (unlockTips !== undefined && unlockTips !== null) {
    const strVal = String(unlockTips).trim()
    if (strVal) {
      updates.push({ key: 'HEO_FANS_UNLOCK_TIPS', value: strVal })
    }
  }

  for (const { key, value } of updates) {
    const pageId = existingMap.get(key)
    if (pageId) {
      await client.pages.update({
        page_id: pageId,
        properties: {
          '配置值': { rich_text: [{ text: { content: value } }] },
          '启用': { checkbox: true }
        }
      })
    } else {
      await client.pages.create({
        parent: { database_id: NOTION_CONFIG_DB_ID },
        properties: {
          '配置名': { title: [{ text: { content: key } }] },
          '配置值': { rich_text: [{ text: { content: value } }] },
          '启用': { checkbox: true }
        }
      })
    }
  }

  // 2. 清理相关缓存与本地配置
  try {
    cleanFileCache()
    await cleanMemCache()
  } catch (e) {
    console.warn('[saveFansConfigToNotion] 清理缓存异常:', e.message)
  }

  return { success: true }
}

const memberNotion = {
  getNotionClient,
  getMembersDatabaseId,
  getInvitesDatabaseId,
  findMemberByUsername,
  createMember,
  verifyAndConsumeInviteCode,
  listMembers,
  listInviteCodes,
  createInviteCode,
  updateInviteCodeStatus,
  generateRandomFansCode,
  syncNotionArticleProperties,
  getFansConfigFromNotion,
  saveFansConfigToNotion
}

export default memberNotion

