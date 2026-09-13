import { syncNotionArticleProperties, syncSingleNotionArticle } from '@/lib/member/notion'

/**
 * Notion 官方 ⚡ 数据库自动化专属 Webhook API
 * 路由：/api/notion/webhook
 * 适配 Notion 官方 Automation 的 "Send webhook" 动作
 * 当在 Notion 客户端勾选 fans 或 vip 时，Notion 触发此 Webhook，云端 API 秒级回写专属码与 VIP！
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }

  // 安全校验：支持通过环境变量 NOTION_SYNC_SECRET 或 CRON_SECRET 进行防刷鉴权
  const authHeader = req.headers.authorization
  const querySecret = req.query?.secret || req.body?.secret
  const expectedSecret = process.env.NOTION_SYNC_SECRET || process.env.CRON_SECRET

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Secret Mismatch' })
  }

  try {
    const payload = req.body || {}
    // 智能提取 payload 中的 pageId（兼容 Notion Webhook 各种 payload 规范）
    const pageId =
      payload.data?.id ||
      payload.data?.page_id ||
      payload.pageId ||
      payload.page_id ||
      payload.id ||
      payload.entity?.id ||
      req.query?.pageId

    const defaultPasscode = global.__adminConfigOverrides?.HEO_FANS_DEFAULT_PASSCODE || process.env.HEO_FANS_DEFAULT_PASSCODE || '888888'

    if (pageId && typeof pageId === 'string' && pageId.replace(/-/g, '').length === 32) {
      // 精准针对该单篇文章执行回写
      const result = await syncSingleNotionArticle(pageId, {
        codeFormat: 'alphanumeric',
        fallbackCode: defaultPasscode
      })
      return res.status(200).json({
        success: true,
        trigger: 'webhook_single',
        pageId,
        ...result
      })
    }

    // 若无法解析出具体单个 pageId，则全库扫描补齐
    const allResult = await syncNotionArticleProperties({
      codeFormat: 'alphanumeric',
      fallbackCode: defaultPasscode
    })

    return res.status(200).json({
      success: true,
      trigger: 'webhook_all',
      ...allResult
    })
  } catch (err) {
    console.error('[API /api/notion/webhook] 异常:', err)
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}
