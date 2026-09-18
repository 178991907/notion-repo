/**
 * Notion 评论数据库智能解析与自动建库引擎
 * (NotionComments Auto-Discovery & Auto-Creation Engine)
 * 
 * 功能：
 * 1. 优先读取环境变量 NOTION_COMMENT_DATABASE_ID；
 * 2. 自动探测检索标题包含「评论/Comments」或具有 PostId、Content 特征字段的数据库；
 * 3. 若未找到，全自动在 NOTION_PAGE_ID 根页面下创建标准结构的评论数据库；
 * 4. 实现读者评论 100% 留存在站长自己的 Notion 空间，免第三方注册，天然物理隔离。
 */

export async function resolveCommentDatabaseId(notionClient, rootPageId) {
  // 1. 显式环境变量优先
  const envDbId = process.env.NOTION_COMMENT_DATABASE_ID
  if (envDbId && envDbId.trim()) {
    return envDbId.trim()
  }

  // 2. 内存全局缓存优先
  if (global.__notionCommentDatabaseId) {
    return global.__notionCommentDatabaseId
  }

  if (!notionClient) return null

  // 3. 智能探测：调用 Notion 官方检索查找已存在的评论库
  try {
    const searchRes = await notionClient.search({
      filter: { value: 'database', property: 'object' },
      page_size: 100
    })
    const databases = searchRes.results || []

    // 规则 A：标题包含「评论」或「Comment」的数据库
    let target = databases.find(db => {
      const title = db.title?.[0]?.plain_text || ''
      return /(评论|Comment)/i.test(title)
    })

    // 规则 B：属性中同时具有 PostId 和 Content 特征字段的数据库
    if (!target) {
      target = databases.find(db => {
        const props = db.properties || {}
        return (props.PostId || props.postId || props.post_id) && (props.Content || props.content)
      })
    }

    if (target && target.id) {
      console.log(`[NotionComments] ✅ 成功自动探测并关联 Notion 评论数据库: ${target.id} (${target.title?.[0]?.plain_text || ''})`)
      global.__notionCommentDatabaseId = target.id
      return target.id
    }
  } catch (err) {
    console.warn('[NotionComments] 自动探测评论数据库异常:', err.message)
  }

  // 4. 智能建库：若用户 Notion 尚未建库，且提供了根页面 ID，全自动在根页面下创建标准评论库
  let fallbackPageId = ''
  try {
    const BLOG = require('@/blog.config')
    fallbackPageId = BLOG?.default?.NOTION_PAGE_ID || BLOG?.NOTION_PAGE_ID || ''
  } catch (e) {}

  const cleanRootPageId = (rootPageId || process.env.NOTION_PAGE_ID || fallbackPageId || '').replace(/-/g, '').trim()
  if (cleanRootPageId && notionClient.databases?.create) {
    try {
      console.log(`[NotionComments] 🚀 正在根页面 ${cleanRootPageId} 下全自动创建标准评论数据库...`)
      const newDb = await notionClient.databases.create({
        parent: { page_id: cleanRootPageId },
        title: [{ type: 'text', text: { content: '💬 读者评论管理 (Comments)' } }],
        properties: {
          PostId: { title: {} },
          ParentId: { rich_text: {} },
          Content: { rich_text: {} },
          Author: { email: {} },
          Nickname: { rich_text: {} },
          EmailHash: { rich_text: {} },
          Level: { number: { format: 'number' } },
          Status: {
            select: {
              options: [
                { name: 'Approved', color: 'green' },
                { name: 'Pending', color: 'yellow' },
                { name: 'Spam', color: 'red' }
              ]
            }
          },
          IpAddress: { rich_text: {} },
          UserAgent: { rich_text: {} },
          CreatedAt: { date: {} }
        }
      })

      if (newDb && newDb.id) {
        console.log(`[NotionComments] 🎉 成功全自动创建 Notion 读者评论数据库: ${newDb.id}`)
        global.__notionCommentDatabaseId = newDb.id
        return newDb.id
      }
    } catch (createErr) {
      console.warn('[NotionComments] 自动创建评论数据库失败 (可能由于 Token 权限或页面结构):', createErr.message)
    }
  }

  return null
}
