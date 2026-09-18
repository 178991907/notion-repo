/**
 * 文章主数据库智能解析器 (Post Database Auto-Discovery Engine)
 * 智能区分 Page ID 与 Database ID，并通过子块递归与特征属性自动探测文章主库
 */
export async function resolvePostDatabaseId(notionClient, fallbackId = "") {
  // 1. 显式环境变量优先
  const envDbId = process.env.NOTION_POSTS_DATABASE_ID
  if (envDbId && envDbId.trim()) {
    return envDbId.trim()
  }

  // 2. 内存全局缓存优先
  if (global.__notionPostDatabaseId) {
    return global.__notionPostDatabaseId
  }

  if (!notionClient) {
    return null
  }

  const cleanId = (fallbackId || "").replace(/-/g, "").trim()

  // 3. 尝试直接校验 fallbackId 是否本身就是可访问的有效数据库
  if (cleanId) {
    try {
      const db = await notionClient.databases.retrieve({ database_id: cleanId })
      if (db && db.id) {
        const propKeys = Object.keys(db.properties || {}).map(k => k.toLowerCase())
        // 若包含 category 或 tags 等特征属性，说明正是文章库
        const isPostDb = propKeys.some(k => ['category', 'categories', 'tags', 'tag', '分类', '类别', '标签'].includes(k))
        if (isPostDb) {
          global.__notionPostDatabaseId = db.id
          return db.id
        }
      }
    } catch (e) {
      // fallbackId 并非直接的 Database ID (例如传入的是 Page ID 或尚待穿透)，继续后续探测
    }
  }

  // 4. 深度穿透：若 cleanId 是 Page ID，尝试直接遍历该页面的子块查找嵌入的 child_database
  if (cleanId) {
    try {
      const childrenRes = await notionClient.blocks.children.list({
        block_id: cleanId,
        page_size: 100
      })
      const childDbs = (childrenRes.results || []).filter(block => block.type === 'child_database')

      for (const item of childDbs) {
        try {
          const innerDb = await notionClient.databases.retrieve({ database_id: item.id })
          if (innerDb && innerDb.id) {
            const propKeys = Object.keys(innerDb.properties || {}).map(k => k.toLowerCase())
            const matchKeywords = ['category', 'categories', 'tags', 'tag', 'type', 'status', '分类', '类别', '标签', '状态', '类型']
            if (propKeys.some(k => matchKeywords.includes(k))) {
              console.log(`[PostDb-Discovery] ✅ 成功从页面子块穿透定位到文章数据库: ${innerDb.id} ("${innerDb.title?.[0]?.plain_text || ''}")`)
              global.__notionPostDatabaseId = innerDb.id
              return innerDb.id
            }
          }
        } catch (innerErr) {
          // 单个子库读取失败，继续尝试下一个
        }
      }

      // 如果页面下恰好只有唯一一个 child_database，即使未匹配特定属性也优先采用
      if (childDbs.length === 1) {
        console.log(`[PostDb-Discovery] ✅ 页面下仅包含唯一子数据库，直接绑定: ${childDbs[0].id}`)
        global.__notionPostDatabaseId = childDbs[0].id
        return childDbs[0].id
      }
    } catch (childrenErr) {
      // 当前 cleanId 可能不是页面或无 blocks.children 权限
    }
  }

  // 5. 智能搜索：调用 Notion 官方搜索在集成授权范围内检索数据库
  try {
    const searchRes = await notionClient.search({
      filter: { value: "database", property: "object" },
      page_size: 100
    })

    const databases = searchRes.results || []

    // 规则 A：严格匹配属性同时包含分类与标签的数据库（支持中英文）
    let target = databases.find(db => {
      const propKeys = Object.keys(db.properties || {}).map(k => k.toLowerCase())
      const hasCategory = propKeys.some(k => ['category', 'categories', '分类', '类别'].includes(k))
      const hasTags = propKeys.some(k => ['tags', 'tag', '标签'].includes(k))
      return hasCategory && hasTags
    })

    // 规则 B：若未找到，匹配包含分类或标签且含有 status/type 等文章特征字段的数据库
    if (!target) {
      target = databases.find(db => {
        const propKeys = Object.keys(db.properties || {}).map(k => k.toLowerCase())
        const hasTaxonomy = propKeys.some(k => ['category', 'categories', 'tags', 'tag', '分类', '类别', '标签'].includes(k))
        const hasPostFeatures = propKeys.some(k => ['status', 'type', 'slug', 'date', '状态', '类型'].includes(k))
        return hasTaxonomy && hasPostFeatures
      })
    }

    // 规则 C：若搜索结果总共只有 1 个数据库，直接选定
    if (!target && databases.length === 1) {
      target = databases[0]
    }

    if (target && target.id) {
      console.log(`[PostDb-Discovery] ✅ 成功全局探测并关联文章主数据库: ${target.id} ("${target.title?.[0]?.plain_text || ""}")`)
      global.__notionPostDatabaseId = target.id
      return target.id
    }
  } catch (err) {
    console.warn("[PostDb-Discovery] 自动探测文章主数据库异常:", err.message)
  }

  // 若均未匹配成功，返回 null，不再返回无效 cleanId，防止下游报 500
  console.warn(`[PostDb-Discovery] ⚠️ 未能探测到文章数据库。请确认已在 Notion 页面右上角通过「··· ➔ 品 集成（Connect to）➔ + 添加连接」授权该连接。`)
  return null
}
