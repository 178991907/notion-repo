import BLOG from '@/blog.config'
import { idToUuid } from 'notion-utils'
import ReactNotionX from 'react-notion-x'
import formatDate from '../../utils/formatDate'
import { fetchNotionPageBlocks, formatNotionBlock } from './getPostBlocks'
import { checkStrIsNotionId, checkStrIsUuid } from '@/lib/utils'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'

/**
 * 根据页面ID获取文章，同时打印获取耗时
 * @param {*} pageId
 * @returns
 */
export async function fetchPageFromNotion(pageId) {
  const start = Date.now() // 开始时间

  // 获取页面内容块
  const rawBlockMap = await fetchNotionPageBlocks(pageId, 'slug')
  const fetchEnd = Date.now() // fetchNotionPageBlocks 耗时
  console.log(`⏱ [Notion] pageId: ${pageId} fetch blocks耗时: ${fetchEnd - start}ms`)

  if (!rawBlockMap) {
    return null
  }
  const blockMap = adapterNotionBlockMap(rawBlockMap)
  if (blockMap?.block) {
    blockMap.block = formatNotionBlock(blockMap.block)
  }
  if (checkStrIsNotionId(pageId)) {
    pageId = idToUuid(pageId)
  }
  if (!checkStrIsUuid(pageId)) {
    return null
  }

  const postInfo = blockMap?.block?.[pageId]?.value
  if (!postInfo) {
    return null
  }

  const result = {
    id: pageId,
    type: postInfo.type,
    category: '',
    tags: [],
    title: postInfo?.properties?.title?.[0] || null,
    status: 'Published',
    createdTime: formatDate(
      new Date(postInfo.created_time).toString(),
      BLOG.LANG
    ),
    lastEditedDay: formatDate(
      new Date(postInfo?.last_edited_time).toString(),
      BLOG.LANG
    ),
    fullWidth: postInfo?.fullWidth || false,
    page_cover: getPageCover(postInfo) || BLOG.HOME_BANNER_IMAGE || null,
    date: {
      start_date: formatDate(
        new Date(postInfo?.last_edited_time).toString(),
        BLOG.LANG
      )
    },
    vip: Boolean(
      postInfo?.properties?.vip === true ||
      postInfo?.properties?.vip?.[0]?.[0] === 'Yes' ||
      postInfo?.properties?.vip?.[0]?.[0] === 'true' ||
      (typeof postInfo?.properties?.vip?.[0]?.[0] === 'string' &&
        /^(vip|member|true|yes|会员)$/i.test(postInfo.properties.vip[0][0].trim()))
    ),
    vip_level: (() => {
      const raw = postInfo?.properties?.vip_level || postInfo?.properties?.level
      let levels = []
      if (Array.isArray(raw)) {
        levels = raw.map(l => (Array.isArray(l) ? l[0] : (typeof l === 'object' ? l?.name : String(l)))).filter(Boolean).map(s => String(s).trim().toUpperCase())
      } else if (typeof raw === 'string') {
        levels = raw.split(/[,，;\s/]+/).map(s => s.trim().toUpperCase()).filter(Boolean)
      }

      const hasSVIP = levels.some(l => /^(SVIP|高级会员|尊享会员)$/i.test(l))
      const hasVIP = levels.some(l => /^(VIP|普通会员)$/i.test(l))

      if (hasSVIP && !hasVIP) {
        return 'SVIP'
      }
      return (hasVIP || postInfo?.properties?.vip) ? 'VIP' : null
    })(),
    fans: Boolean(
      postInfo?.properties?.fans === true ||
      postInfo?.properties?.fans?.[0]?.[0] === 'Yes' ||
      postInfo?.properties?.fans?.[0]?.[0] === 'true' ||
      postInfo?.properties?.fans_code?.[0]?.[0] ||
      postInfo?.properties?.fans_code ||
      (typeof postInfo?.properties?.fans?.[0]?.[0] === 'string' &&
        /^(fans|true|yes|粉丝)$/i.test(postInfo.properties.fans[0][0].trim()))
    ),
    fans_code: (() => {
      const raw = postInfo?.properties?.fans_code
      if (Array.isArray(raw)) {
        return raw.map(item => (Array.isArray(item) ? item[0] : (typeof item === 'object' ? item?.name : String(item)))).filter(Boolean).join(',')
      }
      return String(raw || '').trim()
    })(),
    blockMap
  }

  const end = Date.now() // 总耗时
  console.log(`✅ [Notion] pageId: ${pageId} total处理耗时: ${end - start}ms`)

  return result
}

/**
 * 获取页面封面，优先级：Notion页面封面 > 站点默认封面 > null
 */
function getPageCover(postInfo) {
  const pageCover = postInfo.format?.page_cover
  if (pageCover) {
    if (pageCover.startsWith('/')) return BLOG.NOTION_HOST + pageCover
    if (pageCover.startsWith('http')) {
      console.log('ReactNotionX', ReactNotionX)
      return pageCover
    }
    // return defaultMapImageUrl(pageCover, postInfo)
    return null
  }
}
