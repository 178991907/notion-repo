import BLOG from '@/blog.config'
import { syncNotionArticleProperties, syncSingleNotionArticle } from '@/lib/member/notion'

/**
 * 云端 Notion 自动化属性补齐 API
 * 路由：/api/notion/sync
 * 支持方式：
 * 1. GET / POST 触发全库检测并补齐 fans 专属码与 VIP 等级
 * 2. POST 传参 { pageId } 触发指定单篇精准秒级回写
 * 3. 供 Vercel Cron、GitHub Actions、外部 Webhook 等定时或事件驱动调用
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }

  // 安全检查：如果配置了 CRON_SECRET 或 NOTION_SYNC_SECRET 则校验
  const authHeader = req.headers.authorization
  const querySecret = req.query?.secret || req.body?.secret
  const expectedSecret = process.env.CRON_SECRET || process.env.NOTION_SYNC_SECRET

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Secret Mismatch' })
  }

  try {
    const pageId = req.query?.pageId || req.body?.pageId
    const codeFormat = req.query?.codeFormat || req.body?.codeFormat || 'alphanumeric'
    const defaultPasscode = global.__adminConfigOverrides?.HEO_FANS_DEFAULT_PASSCODE || process.env.HEO_FANS_DEFAULT_PASSCODE || '888888'

    if (pageId) {
      // 针对单页面精准回写
      const result = await syncSingleNotionArticle(pageId, {
        codeFormat,
        fallbackCode: defaultPasscode
      })
      return res.status(200).json({
        success: true,
        mode: 'single',
        ...result
      })
    }

    // 全库扫描自动补齐
    const result = await syncNotionArticleProperties({
      codeFormat,
      fallbackCode: defaultPasscode
    })

    return res.status(200).json({
      success: true,
      mode: 'all',
      timestamp: new Date().toISOString(),
      ...result
    })
  } catch (err) {
    console.error('[API /api/notion/sync] 异常:', err)
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}
