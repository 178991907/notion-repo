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

/**
 * 获取或创建用于挂载子数据库的合法 Page ID
 * 如果 rootId 是一个 Database，则在当前 Database 内查找或创建挂载 Page；
 * 如果 rootId 已经是 Page，则直接返回。
 */
export async function resolveMountPageId(notionClient, rawId) {
  if (!notionClient || !rawId) return null
  const cleanId = rawId.replace(/-/g, '').trim()

  // 1. 尝试直接作为 Page 读取
  try {
    const page = await notionClient.pages.retrieve({ page_id: cleanId })
    if (page && page.id) return page.id
  } catch (err) {}

  // 2. 尝试作为 Database 读取
  try {
    const db = await notionClient.databases.retrieve({ database_id: cleanId })
    if (db && db.id) {
      // 在此数据库下查找现有的挂载页面
      try {
        const queryRes = await notionClient.databases.query({
          database_id: db.id,
          filter: {
            property: 'title',
            title: { contains: '博客系统数据' }
          }
        })
        if (queryRes.results && queryRes.results.length > 0) {
          return queryRes.results[0].id
        }
      } catch (e) {}

      // 若未找到，在数据库内自动创建挂载 Page
      try {
        const newMountPage = await notionClient.pages.create({
          parent: { database_id: db.id },
          properties: {
            title: { title: [{ type: 'text', text: { content: '⚙️ 博客系统数据存储 (System Data)' } }] },
            type: { select: { name: 'Config' } },
            status: { select: { name: 'Invisible' } }
          }
        })
        return newMountPage.id
      } catch (e) {
        console.warn('[MountResolver] 创建挂载页面失败:', e.message)
      }
    }
  } catch (err) {}

  return cleanId
}

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

  let fallbackPageId = ''
  try {
    const BLOG = require('@/blog.config')
    fallbackPageId = BLOG?.default?.NOTION_PAGE_ID || BLOG?.NOTION_PAGE_ID || ''
  } catch (e) {}

  const cleanRootPageId = (rootPageId || process.env.NOTION_PAGE_ID || fallbackPageId || '').replace(/-/g, '').trim()

  // 3. 挂载页面穿透探测（毫秒级，不受 search 索引延迟影响）
  let mountPageId = null
  if (cleanRootPageId) {
    try {
      mountPageId = await resolveMountPageId(notionClient, cleanRootPageId)
      if (mountPageId && notionClient.blocks?.children?.list) {
        const blocksRes = await notionClient.blocks.children.list({ block_id: mountPageId })
        const childDbs = (blocksRes.results || []).filter(b => b.type === 'child_database')
        const matched = childDbs.find(b => /(评论|Comment)/i.test(b.child_database?.title || ''))
        if (matched && matched.id) {
          console.log(`[NotionComments] ✅ 挂载页面穿透定位到评论库: ${matched.id}`)
          global.__notionCommentDatabaseId = matched.id
          return matched.id
        }
      }
    } catch (e) {
      console.warn('[NotionComments] 挂载页面穿透探测异常:', e.message)
    }
  }

  // 4. 全局检索兜底探测
  try {
    const searchRes = await notionClient.search({
      filter: { value: 'database', property: 'object' },
      page_size: 100
    })
    const databases = searchRes.results || []

    let target = databases.find(db => {
      const title = db.title?.[0]?.plain_text || ''
      return /(评论|Comment)/i.test(title)
    })

    if (!target) {
      target = databases.find(db => {
        const props = db.properties || {}
        return (props.PostId || props.postId || props.post_id) && (props.Content || props.content)
      })
    }

    if (target && target.id) {
      console.log(`[NotionComments] ✅ 全局检索探测到评论库: ${target.id}`)
      global.__notionCommentDatabaseId = target.id
      return target.id
    }
  } catch (err) {
    console.warn('[NotionComments] 自动探测评论数据库异常:', err.message)
  }

  // 5. 智能自愈建库：在合法挂载页面下创建标准评论库
  const targetParentPageId = mountPageId || cleanRootPageId
  if (targetParentPageId && notionClient.databases?.create) {
    try {
      console.log(`[NotionComments] 🚀 正在挂载页面 ${targetParentPageId} 下全自动创建标准评论数据库...`)
      const newDb = await notionClient.databases.create({
        parent: { page_id: targetParentPageId },
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
      console.warn('[NotionComments] 自动创建评论数据库失败:', createErr.message)
    }
  }

  return null
}
