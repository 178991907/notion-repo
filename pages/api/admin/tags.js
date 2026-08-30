import BLOG from "@/blog.config"
import { verifyRequestToken } from "@/lib/admin/auth"

const DEFAULT_TOKEN_ENCODED = "bnRuXzQwMzAxNjUzMjcyOWpVMTZjQmhvUmpLWmVpYldDQ3JMVmxWdDVTcXV4NXIwc2Y="
const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || process.env.NOTION_TOKEN || Buffer.from(DEFAULT_TOKEN_ENCODED, "base64").toString("utf-8")
const NOTION_DATABASE_ID = process.env.NOTION_PAGE_ID || BLOG.NOTION_PAGE_ID || "d699622a6d1882f09e68814c63554113"

/**
 * 标签管理 API
 * GET: 获取所有标签与文章统计
 * POST: 重命名、合并、删除、新建标签、清理空标签、批量打标
 */
export default async function handler(req, res) {
  const auth = verifyRequestToken(req)
  if (!auth) {
    return res.status(401).json({ error: "未登录或登录已过期" })
  }

  if (req.method === "GET") {
    return handleGet(req, res)
  }
  if (req.method === "POST") {
    return handlePost(req, res)
  }
  return res.status(405).json({ error: "不支持的请求方法" })
}

/**
 * 获取全量标签列表与文章关联
 */
async function handleGet(req, res) {
  try {
    const { Client } = require("@notionhq/client")
    const notion = new Client({ auth: NOTION_TOKEN })

    const db = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID })
    const tagProp = db.properties.tags || db.properties.Tags || {}
    const schemaOptions = tagProp.multi_select?.options || []
    const optionColorMap = {}
    schemaOptions.forEach(opt => {
      optionColorMap[opt.name] = opt.color || "default"
    })

    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    })

    const tagsMap = {}
    schemaOptions.forEach(opt => {
      tagsMap[opt.name] = {
        name: opt.name,
        color: opt.color || "default",
        count: 0,
        posts: []
      }
    })

    const allPosts = []

    for (const page of response.results) {
      const type = page.properties.type?.select?.name || page.properties.Type?.select?.name || ""
      if (type !== "Post") continue

      const title = page.properties.title?.title?.[0]?.plain_text || page.properties.Name?.title?.[0]?.plain_text || "无标题"
      const cat = page.properties.category?.select?.name || page.properties.Category?.select?.name || ""
      const date = page.properties.date?.date?.start || page.properties.Date?.date?.start || ""
      const slug = page.properties.slug?.rich_text?.[0]?.plain_text || page.properties.Slug?.rich_text?.[0]?.plain_text || page.id
      const status = page.properties.status?.select?.name || page.properties.Status?.select?.name || "Published"
      const postTags = page.properties.tags?.multi_select?.map(t => t.name) || page.properties.Tags?.multi_select?.map(t => t.name) || []

      const postItem = {
        id: page.id,
        title,
        date,
        slug,
        status,
        category: cat,
        tags: postTags
      }
      allPosts.push(postItem)

      for (const t of postTags) {
        if (!tagsMap[t]) {
          tagsMap[t] = {
            name: t,
            color: optionColorMap[t] || "default",
            count: 0,
            posts: []
          }
        }
        tagsMap[t].count++
        tagsMap[t].posts.push(postItem)
      }
    }

    const tagsList = Object.values(tagsMap).sort((a, b) => b.count - a.count)

    return res.status(200).json({
      success: true,
      tags: tagsList,
      allPosts,
      totalTags: tagsList.length,
      totalPosts: allPosts.length
    })
  } catch (error) {
    console.error("获取标签列表异常:", error)
    return res.status(500).json({ error: error.message || "获取标签列表失败" })
  }
}

/**
 * 处理标签操作 (create, rename, merge, delete, cleanup_empty, batch_tag_posts)
 */
async function handlePost(req, res) {
  if (!req.headers["x-admin-csrf"]) {
    return res.status(403).json({ error: "缺少 CSRF 验证头" })
  }

  const { action, oldName, newName, sourceNames, targetName, name, color, pageIds, addTags, removeTags } = req.body || {}
  const { Client } = require("@notionhq/client")
  const notion = new Client({ auth: NOTION_TOKEN })

  try {
    let affectedCount = 0

    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    })

    // 1. 新建标签 (Create)
    if (action === "create") {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "标签名称不能为空" })
      }
      const newTagName = name.trim()

      await safeUpdateTagSchemaOptions(notion, "create", { name: newTagName, color })
      affectedCount = 1
    }

    // 2. 重命名标签 (Rename)
    else if (action === "rename") {
      if (!oldName || !newName || oldName === newName) {
        return res.status(400).json({ error: "请提供有效的原标签名称与新标签名称" })
      }
      const targetNameTrim = newName.trim()

      // 更新所有文章中的标签
      for (const page of response.results) {
        const propName = page.properties.tags ? "tags" : (page.properties.Tags ? "Tags" : null)
        if (!propName) continue

        const currentTags = page.properties[propName]?.multi_select?.map(t => t.name) || []
        if (currentTags.includes(oldName)) {
          const newTags = currentTags.map(t => (t === oldName ? targetNameTrim : t))
          const uniqueTags = Array.from(new Set(newTags))
          await notion.pages.update({
            page_id: page.id,
            properties: {
              [propName]: {
                multi_select: uniqueTags.map(n => ({ name: n }))
              }
            }
          })
          affectedCount++
        }
      }

      // 安全同步更新 Schema options
      await safeUpdateTagSchemaOptions(notion, "rename", { oldName, newName: targetNameTrim, color })
    }

    // 3. 合并标签 (Merge)
    else if (action === "merge") {
      const sources = Array.isArray(sourceNames) ? sourceNames : [sourceNames].filter(Boolean)
      if (sources.length === 0 || !targetName) {
        return res.status(400).json({ error: "请提供有效的源标签列表与合并目标标签" })
      }
      const targetTrim = targetName.trim()

      for (const page of response.results) {
        const propName = page.properties.tags ? "tags" : (page.properties.Tags ? "Tags" : null)
        if (!propName) continue

        const currentTags = page.properties[propName]?.multi_select?.map(t => t.name) || []
        const hasSource = currentTags.some(t => sources.includes(t))
        if (hasSource) {
          const filtered = currentTags.filter(t => !sources.includes(t))
          filtered.push(targetTrim)
          const uniqueTags = Array.from(new Set(filtered))
          await notion.pages.update({
            page_id: page.id,
            properties: {
              [propName]: {
                multi_select: uniqueTags.map(name => ({ name }))
              }
            }
          })
          affectedCount++
        }
      }

      await safeUpdateTagSchemaOptions(notion, "merge", { sourceNames: sources, targetName: targetTrim })
    }

    // 4. 删除标签 (Delete)
    else if (action === "delete") {
      if (!name) {
        return res.status(400).json({ error: "请提供要删除的标签名称" })
      }

      for (const page of response.results) {
        const propName = page.properties.tags ? "tags" : (page.properties.Tags ? "Tags" : null)
        if (!propName) continue

        const currentTags = page.properties[propName]?.multi_select?.map(t => t.name) || []
        if (currentTags.includes(name)) {
          const newTags = currentTags.filter(t => t !== name)
          await notion.pages.update({
            page_id: page.id,
            properties: {
              [propName]: {
                multi_select: newTags.map(tName => ({ name: tName }))
              }
            }
          })
          affectedCount++
        }
      }

      await safeUpdateTagSchemaOptions(notion, "delete", { name })
    }

    // 5. 一键清理空标签 (Cleanup Empty)
    else if (action === "cleanup_empty") {
      const usedTags = new Set()
      for (const page of response.results) {
        const propName = page.properties.tags ? "tags" : (page.properties.Tags ? "Tags" : null)
        if (!propName) continue
        const pageTags = page.properties[propName]?.multi_select?.map(t => t.name) || []
        pageTags.forEach(t => usedTags.add(t))
      }

      await safeUpdateTagSchemaOptions(notion, "cleanup_empty", { usedTags })
    }

    // 6. 批量文章打标
    else if (action === "batch_tag_posts") {
      if (!Array.isArray(pageIds) || pageIds.length === 0) {
        return res.status(400).json({ error: "请选择至少一篇文章" })
      }

      const toAdd = Array.isArray(addTags) ? addTags.map(t => t.trim()).filter(Boolean) : []
      const toRemove = Array.isArray(removeTags) ? removeTags.map(t => t.trim()).filter(Boolean) : []

      for (const pId of pageIds) {
        const page = response.results.find(p => p.id === pId)
        if (!page) continue

        const propName = page.properties.tags ? "tags" : (page.properties.Tags ? "Tags" : "tags")
        const currentTags = page.properties[propName]?.multi_select?.map(t => t.name) || []
        
        let nextTags = currentTags.filter(t => !toRemove.includes(t))
        nextTags = Array.from(new Set([...nextTags, ...toAdd]))

        await notion.pages.update({
          page_id: pId,
          properties: {
            [propName]: {
              multi_select: nextTags.map(name => ({ name }))
            }
          }
        })
        affectedCount++
      }

      if (toAdd.length > 0) {
        for (const t of toAdd) {
          await safeUpdateTagSchemaOptions(notion, "create", { name: t })
        }
      }
    } else {
      return res.status(400).json({ error: "未知的操作类型: " + action })
    }

    await clearSiteCache(res)

    return res.status(200).json({
      success: true,
      message: "标签操作执行成功",
      affectedCount
    })
  } catch (error) {
    console.error("标签操作失败:", error)
    return res.status(500).json({ error: error.message || "操作失败" })
  }
}

/**
 * 健壮更新 Notion 数据库 Schema 中的 tags options (防 color 冲突报错)
 */
async function safeUpdateTagSchemaOptions(notion, action, params = {}) {
  try {
    const db = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID })
    const tagPropName = db.properties.tags ? "tags" : "Tags"
    const currentOptions = db.properties[tagPropName]?.multi_select?.options || []
    
    let nextOptions = []
    
    if (action === "create") {
      const trimName = params.name.trim()
      if (currentOptions.some(o => o.name === trimName)) return
      nextOptions = [...currentOptions, { name: trimName, color: params.color || "default" }]
    } else if (action === "rename") {
      const trimNew = params.newName.trim()
      const existingTarget = currentOptions.find(o => o.name === trimNew)
      if (existingTarget) {
        nextOptions = currentOptions.filter(o => o.name !== params.oldName)
      } else {
        nextOptions = currentOptions.map(o => {
          if (o.name === params.oldName) {
            return { id: o.id, name: trimNew }
          }
          return { id: o.id, name: o.name, color: o.color }
        })
      }
    } else if (action === "delete") {
      nextOptions = currentOptions.filter(o => o.name !== params.name)
    } else if (action === "merge") {
      const sources = Array.isArray(params.sourceNames) ? params.sourceNames : [params.sourceNames]
      nextOptions = currentOptions.filter(o => !sources.includes(o.name))
    } else if (action === "cleanup_empty") {
      nextOptions = currentOptions.filter(o => params.usedTags.has(o.name))
    }

    await notion.databases.update({
      database_id: NOTION_DATABASE_ID,
      properties: {
        [tagPropName]: {
          multi_select: {
            options: nextOptions
          }
        }
      }
    })
  } catch (err) {
    console.warn("⚠️ 同步 Schema 选项提示 (文章数据已完成更新):", err.message)
  }
}

async function clearSiteCache(res) {
  try {
    const { cleanCache: cleanFileCache } = require("@/lib/cache/local_file_cache")
    const { cleanCache: cleanMemCache } = require("@/lib/cache/memory_cache")
    cleanFileCache()
    await cleanMemCache()
  } catch (err) {
    console.warn("清理站点缓存提示:", err.message)
  }

  try {
    if (res && typeof res.revalidate === "function") {
      await res.revalidate("/")
      await res.revalidate("/tag").catch(() => {})
    }
  } catch (err) {
    console.warn("revalidate 提示:", err.message)
  }
}
