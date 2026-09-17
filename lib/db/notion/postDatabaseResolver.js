/**
 * 文章主数据库智能解析器 (Post Database Auto-Discovery Engine)
 * 智能区分 Page ID 与 Database ID，并在需要时通过特征属性自动探测文章主库
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
    return fallbackId || ""
  }

  // 3. 尝试直接校验 fallbackId 是否本身就是可访问的有效数据库
  const cleanId = (fallbackId || "").replace(/-/g, "").trim()
  if (cleanId) {
    try {
      const db = await notionClient.databases.retrieve({ database_id: cleanId })
      if (db && db.id) {
        const propKeys = Object.keys(db.properties || {}).map(k => k.toLowerCase())
        // 若包含 category 或 tags 属性，说明正是文章库
        if (propKeys.includes("category") || propKeys.includes("tags")) {
          global.__notionPostDatabaseId = db.id
          return db.id
        }
      }
    } catch (e) {
      // fallbackId 并非有效 Database ID (例如传入的是 Page ID 或无权限)，继续走智能探测
    }
  }

  // 4. 智能探测：调用 Notion 官方搜索检索文章主库
  try {
    const searchRes = await notionClient.search({
      filter: { value: "database", property: "object" },
      page_size: 100
    })

    const databases = searchRes.results || []

    // 规则 A：严格匹配属性同时包含 category 与 tags 的数据库
    let target = databases.find(db => {
      const propKeys = Object.keys(db.properties || {}).map(k => k.toLowerCase())
      return propKeys.includes("category") && propKeys.includes("tags")
    })

    // 规则 B：若未找到，匹配包含 category 或 tags 且含有 status/type 等文章特征字段的数据库
    if (!target) {
      target = databases.find(db => {
        const propKeys = Object.keys(db.properties || {}).map(k => k.toLowerCase())
        return (propKeys.includes("category") || propKeys.includes("tags")) &&
               (propKeys.includes("status") || propKeys.includes("type") || propKeys.includes("slug"))
      })
    }

    if (target && target.id) {
      console.log(`[PostDb-Discovery] ✅ 成功自动探测并关联文章主数据库: ${target.id} ("${target.title?.[0]?.plain_text || ""}")`)
      global.__notionPostDatabaseId = target.id
      return target.id
    }
  } catch (err) {
    console.warn("[PostDb-Discovery] 自动探测文章主数据库异常:", err.message)
  }

  return cleanId || ""
}
