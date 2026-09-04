import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../../utils/formatDate'
// import { createHash } from 'crypto'
import { siteConfig } from '../../config'
import { convertUrlStartWithOneSlash, getLastSegmentFromUrl, isHttpLink, isMailOrTelLink } from '../../utils'
import { extractLangPrefix } from '../../utils/pageId'
import {
  isMd5Digest,
  isSHA256Digest,
  sha256Digest
} from '../../utils/password'
import { mapImgUrl } from './mapImage'
import notionAPI from '@/lib/db/notion/getNotionAPI'

/**
 * 鑾峰彇椤甸潰鍏冪礌鎴愬憳灞炴€?
 * @param {*} id
 * @param {*} value
 * @param {*} schema
 * @param {*} authToken
 * @param {*} tagOptions
 * @returns
 */
export default async function getPageProperties(
  id,
  value,
  schema,
  authToken,
  tagOptions
) {
  const rawProperties = Object.entries(value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        case 'person': {
          const rawUsers = val.flat()
          const users = []

          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await notionAPI.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }

  // 鏄犲皠閿細鐢ㄦ埛鑷畾涔夎〃澶村悕
  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]]) {
        properties[key] = properties[fieldNames[key]]
      }
    })
  }

  // type\status\category 鏄崟閫変笅鎷夋 鍙栨暟缁勭涓€涓?
  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.category = properties.category?.[0] || ''
  properties.comment = properties.comment?.[0] || ''

  // 鏄犲皠鍊硷細鐢ㄦ埛涓€у寲type鍜宻tatus瀛楁鐨勪笅鎷夋閫夐」锛屽湪姝ゆ槧灏勫洖浠ｇ爜鐨勮嫳鏂囨爣璇?
  mapProperties(properties)

  // 解析发布时间戳：支持 Notion 中包含的具体时间 (start_time)
  const rawStartDate = properties?.date?.start_date
  const rawStartTime = properties?.date?.start_time
  let publishTimestamp = null
  if (rawStartDate && rawStartTime) {
    publishTimestamp = new Date(`${rawStartDate} ${rawStartTime}`).getTime()
  } else if (rawStartDate) {
    publishTimestamp = new Date(rawStartDate).getTime()
  } else {
    publishTimestamp = new Date(value?.created_time || Date.now()).getTime()
  }

  properties.publishDate = publishTimestamp
  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
  properties.createdTime = value?.created_time ? new Date(value.created_time).getTime() : properties.publishDate
  properties.lastEditedDate = new Date(value?.last_edited_time)
  properties.lastEditedTime = value?.last_edited_time ? new Date(value.last_edited_time).getTime() : properties.publishDate
  properties.lastEditedDay = formatDate(
    new Date(value?.last_edited_time),
    BLOG.LANG
  )
  properties.fullWidth = value?.format?.page_full_width ?? false
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''
  properties.pageCover = mapImgUrl(value?.format?.page_cover, value) ?? ''
  properties.pageCoverThumbnail =
    mapImgUrl(value?.format?.page_cover, value, 'block') ?? ''
  properties.ext = convertToJSON(properties?.ext)
  properties.content = value.content ?? []
  properties.tagItems =
    properties?.tags?.map(tag => {
      return {
        name: tag,
        color: tagOptions?.find(t => t.value === tag)?.color || 'gray'
      }
    }) || []
  delete properties.content

  // 会员专享标识：兼容 checkbox、select、或文本类型，支持 true / yes / vip / member / 会员
  const rawVip = properties.vip
  properties.vip = Boolean(
    rawVip === true ||
    rawVip === 'true' ||
    rawVip === 'Yes' ||
    (Array.isArray(rawVip) && (rawVip[0] === 'Yes' || rawVip[0] === 'true' || rawVip[0] === true)) ||
    (typeof rawVip === 'string' && /^(vip|member|true|yes|会员)$/i.test(rawVip.trim())) ||
    (Array.isArray(rawVip) && typeof rawVip[0] === 'string' && /^(vip|member|true|yes|会员)$/i.test(rawVip[0].trim()))
  )

  return properties
}

/**
 * 瀛楃涓茶浆json
 * @param {*} str
 * @returns
 */
function convertToJSON(str) {
  if (!str) {
    return {}
  }
  // 浣跨敤姝ｅ垯琛ㄨ揪寮忓幓闄ょ┖鏍煎拰鎹㈣绗?
  try {
    return JSON.parse(str.replace(/\s/g, ''))
  } catch (error) {
    console.warn('鏃犳晥JSON', str)
    return {}
  }
}

/**
 * 鏄犲皠鐢ㄦ埛鑷畾涔夎〃澶?
 */
function mapProperties(properties) {
  const typeMap = {
    [BLOG.NOTION_PROPERTY_NAME.type_post]: 'Post',
    [BLOG.NOTION_PROPERTY_NAME.type_page]: 'Page',
    [BLOG.NOTION_PROPERTY_NAME.type_notice]: 'Notice',
    [BLOG.NOTION_PROPERTY_NAME.type_menu]: 'Menu',
    [BLOG.NOTION_PROPERTY_NAME.type_sub_menu]: 'SubMenu',
    [BLOG.NOTION_PROPERTY_NAME.type_member]: 'Member',
    [BLOG.NOTION_PROPERTY_NAME.type_event]: 'Event'
  }

  const statusMap = {
    [BLOG.NOTION_PROPERTY_NAME.status_publish]: 'Published',
    [BLOG.NOTION_PROPERTY_NAME.status_invisible]: 'Invisible'
  }

  if (properties?.type && typeMap[properties.type]) {
    properties.type = typeMap[properties.type]
  }

  if (properties?.status && statusMap[properties.status]) {
    properties.status = statusMap[properties.status]
  }
}

/**
 * 杩囨护澶勭悊椤甸潰鏁版嵁
 * 杩囨护澶勭悊杩囩▼浼氱敤鍒癗OTION_CONFIG涓殑閰嶇疆
 */
export function adjustPageProperties(properties, NOTION_CONFIG) {
  // 澶勭悊URL
  // 1.鎸夌収鐢ㄦ埛閰嶇疆鐨刄RL_PREFIX 杞崲涓€涓媠lug
  // 2.涓烘枃绔犳坊鍔犱竴涓猦ref瀛楁锛屽瓨鍌ㄦ渶缁堣皟鏁寸殑璺緞
  if (properties.type === 'Post') {
    properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Page') {
    if (shouldUseMappedCategorySlug(properties, NOTION_CONFIG)) {
      properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)
    }
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Menu' || properties.type === 'SubMenu') {
    // 鑿滃崟璺緞涓虹┖銆佷綔涓哄彲灞曞紑鑿滃崟浣跨敤
    properties.href = properties.slug ?? '#'
    properties.name = properties.title ?? ''
  }

  // http or https 寮€澶寸殑瑙嗕负澶栭摼
  if (isHttpLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_blank'
  } else if (isMailOrTelLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_self'
  } else {
    properties.target = '_self'
    // 浼潤鎬佽矾寰勫彸渚ф嫾鎺?html
    if (siteConfig('PSEUDO_STATIC', false, NOTION_CONFIG)) {
      if (
        !properties?.href?.endsWith('.html') &&
        properties?.href !== '' &&
        properties?.href !== '#' &&
        properties?.href !== '/'
      ) {
        properties.href += '.html'
      }
    }

    // 鐩稿璺緞杞粷瀵硅矾寰勶細url宸︿晶鎷兼帴 /
    properties.href = convertUrlStartWithOneSlash(properties?.href)
  }

  // 濡傛灉璺宠浆閾炬帴鏄璇█锛屽垯鍦ㄦ柊绐楀彛鎵撳紑
  if (BLOG.NOTION_PAGE_ID.indexOf(',') > 0) {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const prefix = extractLangPrefix(siteId)
      if (getLastSegmentFromUrl(properties.href) === prefix) {
        properties.target = '_blank'
      }
    }
  }

  // 文章锁：新版为 SHA256(明文)；支持 Notion 内直接填 64 位 SHA256；保留 32 位 md5 摘要以兼容旧数据（PR #3389）
  if (!properties.password) {
    properties.password = ''
  } else if (isSHA256Digest(properties.password)) {
    properties.password = properties.password.trim()
  } else if (isMd5Digest(properties.password)) {
    properties.password = properties.password.trim()
  } else {
    properties.password = sha256Digest(properties.password)
  }

  // 会员专享标识：兼容 checkbox、select、或文本类型，支持 true / yes / vip / member / 会员
  const rawVip = properties.vip
  properties.vip = Boolean(
    rawVip === true ||
    rawVip === 'true' ||
    rawVip === 'Yes' ||
    (Array.isArray(rawVip) && (rawVip[0] === 'Yes' || rawVip[0] === 'true' || rawVip[0] === true)) ||
    (typeof rawVip === 'string' && /^(vip|member|true|yes|会员)$/i.test(rawVip.trim())) ||
    (Array.isArray(rawVip) && typeof rawVip[0] === 'string' && /^(vip|member|true|yes|会员)$/i.test(rawVip[0].trim()))
  )

  // 会员等级标识：VIP (普通会员) 或 SVIP (高级会员)，支持多选 (multi_select) 与单选
  const rawVipLevel = properties.vip_level || properties.level
  let vipLevels = []
  if (Array.isArray(rawVipLevel)) {
    vipLevels = rawVipLevel.map(l => (typeof l === 'string' ? l : l?.[0] || String(l))).map(s => s.trim().toUpperCase())
  } else if (typeof rawVipLevel === 'string') {
    vipLevels = rawVipLevel.split(/[,，;\s/]+/).map(s => s.trim().toUpperCase())
  }

  const hasSVIP = vipLevels.some(l => /^(SVIP|高级会员|尊享会员)$/i.test(l))
  const hasVIP = vipLevels.some(l => /^(VIP|普通会员)$/i.test(l))

  if (hasSVIP && !hasVIP) {
    // 明确仅限高级会员访问
    properties.vip_level = 'SVIP'
    properties.vip = true
  } else if (hasVIP || properties.vip) {
    // 普通 VIP 即可（SVIP 会员自动包含 VIP 访问权限）
    properties.vip_level = 'VIP'
    properties.vip = true
  } else {
    properties.vip_level = null
  }

  // 粉丝专区标识与独立验证码：支持多选 (multi_select) 标签与多码逗号分隔
  const rawFans = properties.fans
  let fansCodes = []
  const rawFansCode = properties.fans_code
  if (Array.isArray(rawFansCode)) {
    fansCodes = rawFansCode.map(c => (typeof c === 'string' ? c : c?.[0] || String(c))).map(s => s.trim()).filter(Boolean)
  } else if (typeof rawFansCode === 'string' && rawFansCode.trim()) {
    fansCodes = rawFansCode.split(/[,，;\s/]+/).map(s => s.trim()).filter(Boolean)
  }

  properties.fans_code = fansCodes.length > 0 ? fansCodes.join(',') : ''
  properties.fans_codes = fansCodes // 数组形式备用
  properties.fans = Boolean(
    rawFans === true ||
    rawFans === 'true' ||
    rawFans === 'Yes' ||
    (Array.isArray(rawFans) && (rawFans[0] === 'Yes' || rawFans[0] === 'true' || rawFans[0] === true)) ||
    (typeof rawFans === 'string' && /^(fans|true|yes|粉丝)$/i.test(rawFans.trim())) ||
    fansCodes.length > 0
  )
}

/**
 * 鑾峰彇鑷畾涔塙RL
 * 鍙互鏍规嵁鍙橀噺鐢熸垚URL
 * 鏀寔锛?category%/%year%/%month%/%day%/%slug%
 * @param {*} postProperties
 * @returns
 */
function shouldUseMappedCategorySlug(properties, NOTION_CONFIG) {
  const allSlugPatterns =
    NOTION_CONFIG?.POST_URL_PREFIX ??
    siteConfig('POST_URL_PREFIX', BLOG.POST_URL_PREFIX, NOTION_CONFIG)
  const categoryMap = siteConfig(
    'POST_URL_PREFIX_MAPPING_CATEGORY',
    {},
    NOTION_CONFIG
  )

  return (
    properties?.type === 'Page' &&
    properties?.category &&
    allSlugPatterns?.includes('%category%') &&
    !!categoryMap?.[properties.category]
  )
}

function generateCustomizeSlug(postProperties, NOTION_CONFIG) {
  // 澶栭摼涓嶅鐞?
  if (isHttpLink(postProperties.slug)) {
    return postProperties.slug
  }
  const fullPrefixParts = []
  let allSlugPatterns = NOTION_CONFIG?.POST_URL_PREFIX
  if (allSlugPatterns === undefined || allSlugPatterns === null) {
    allSlugPatterns = siteConfig(
      'POST_URL_PREFIX',
      BLOG.POST_URL_PREFIX,
      NOTION_CONFIG
    ).split('/')
  } else {
    allSlugPatterns = allSlugPatterns.split('/')
  }

  const POST_URL_PREFIX_MAPPING_CATEGORY = siteConfig(
    'POST_URL_PREFIX_MAPPING_CATEGORY',
    {},
    NOTION_CONFIG
  )

  allSlugPatterns.forEach(pattern => {
    if (pattern === '%year%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefixParts.push(String(formatPostCreatedDate.getUTCFullYear()))
    } else if (pattern === '%month%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefixParts.push(
        String(formatPostCreatedDate.getUTCMonth() + 1).padStart(2, 0)
      )
    } else if (pattern === '%day%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefixParts.push(String(formatPostCreatedDate.getUTCDate()).padStart(2, 0))
    } else if (pattern === '%slug%') {
      fullPrefixParts.push(postProperties.slug ?? postProperties.id)
    } else if (pattern === '%category%' && postProperties?.category) {
      let categoryPrefix = postProperties.category
      // 鍏佽鏄犲皠鍒嗙被鍚嶏紝閫氬父鐢ㄦ潵灏嗕腑鏂囧垎绫绘槧灏勬垚鑻辨枃锛岀編鍖杣rl.
      if (POST_URL_PREFIX_MAPPING_CATEGORY[postProperties?.category]) {
        categoryPrefix =
          POST_URL_PREFIX_MAPPING_CATEGORY[postProperties?.category]
      }
      fullPrefixParts.push(categoryPrefix)
    } else if (!pattern.includes('%')) {
      fullPrefixParts.push(pattern)
    }
  })
  const fullPrefix = fullPrefixParts.filter(Boolean).join('/')
  const rawSlug = postProperties.slug ?? postProperties.id
  const cleanSlug = typeof rawSlug === 'string' ? rawSlug.replace(/^\/+/, '').trim() : rawSlug

  if (fullPrefix) {
    return `${fullPrefix}/${cleanSlug}`
  } else {
    return `${cleanSlug}`
  }
}
