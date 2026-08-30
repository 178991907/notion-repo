import BLOG from '@/blog.config'
import { verifyRequestToken } from '@/lib/admin/auth'

const DEFAULT_TOKEN_ENCODED = 'bnRuXzQwMzAxNjUzMjcyOWpVMTZjQmhvUmpLWmVpYldDQ3JMVmxWdDVTcXV4NXIwc2Y='
const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || process.env.NOTION_TOKEN || Buffer.from(DEFAULT_TOKEN_ENCODED, 'base64').toString('utf-8')
const NOTION_DATABASE_ID = process.env.NOTION_PAGE_ID || BLOG.NOTION_PAGE_ID || 'd699622a6d1882f09e68814c63554113'

/**
 * 分类管理 API
 * GET: 获取所有分类与文章统计
 * POST: 重命名、合并、删除、新建分类、修改文章分类
 */
export default async function handler(req, res) {
  // 1. 验证登录状态
  const auth = verifyRequestToken(req)
  if (!auth) {
    return res.status(401).json({ error: '未登录或登录已过期' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res)
  }
  if (req.method === 'POST') {
    return handlePost(req, res)
  }
  return res.status(405).json({ error: '不支持的请求方法' })
}

/**
 * 获取分类列表与文章
 */
async function handleGet(req, res) {
  try {
    const { Client } = require('@notionhq/client')
    const notion = new Client({ auth: NOTION_TOKEN })

    // 1. 获取数据库 Schema 中的 category options
    const db = await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID })
    const catProp = db.properties.category || db.properties.Category || {}
    const schemaOptions = catProp.select?.options || []
    const optionColorMap = {}
    schemaOptions.forEach(opt => {
      optionColorMap[opt.name] = opt.color || 'default'
    })

    // 2. 查询所有文章
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 100
    })

    const categoriesMap = {}
    // 初始化 Schema 中已有的选项
    schemaOptions.forEach(opt => {
      categoriesMap[opt.name] = {
        name: opt.name,
        color: opt.color || 'blue',
        count: 0,
        posts: []
      }
    })

    const uncategorizedPosts = []

    for (const page of response.results) {
      const type = page.properties.type?.select?.name || page.properties.Type?.select?.name || ''
      // 只统计类型为 Post 的文章（不包含 Menu、Config 等）
      if (type !== 'Post') continue

      const title = page.properties.title?.title?.[0]?.plain_text || page.properties.Name?.title?.[0]?.plain_text || '无标题'
      const cat = page.properties.category?.select?.name || page.properties.Category?.select?.name || ''
      const date = page.properties.date?.date?.start || page.properties.Date?.date?.start || ''
      const slug = page.properties.slug?.rich_text?.[0]?.plain_text || page.properties.Slug?.rich_text?.[0]?.plain_text || page.id
      const status = page.properties.status?.select?.name || page.properties.Status?.select?.name || 'Published'
      const tags = page.properties.tags?.multi_select?.map(t => t.name) || page.properties.Tags?.multi_select?.map(t => t.name) || []

      const postItem = {
        id: page.id,
        title,
        date,
        slug,
        status,
        category: cat,
        tags
      }

      if (cat) {
        if (!categoriesMap[cat]) {
          categoriesMap[cat] = {
            name: cat,
            color: optionColorMap[cat] || 'blue',
            count: 0,
            posts: []
          }
        }
        categoriesMap[cat].count++
        categoriesMap[cat].posts.push(postItem)
      } else {
        uncategorizedPosts.push(postItem)
      }
    }

    const categoriesList = Object.values(categoriesMap).sort((a, b) => b.count - a.count)

    return res.status(200).json({
      success: true,
      categories: categoriesList,
      uncategorizedPosts,
      totalCategories: categoriesList.length,
      totalPosts: response.results.filter(p => (p.properties.type?.select?.name || p.properties.Type?.select?.name) === 'Post').length
    })
  } catch (error) {
    console.error('获取分类列表异常:', error)
    return res.status(500).json({ error: error.message || '获取分类列表失败' })
  }
}

/**
 * 处理分类操作 (rename, merge, delete, create, update_post_category)
 */
async function handlePost(req, res) {
  // CSRF 防护
  if (!req.headers['x-admin-csrf']) {
    return res.status(403).json({ error: '缺少 CSRF 验证头' })
  }

  const { action, oldName, newName, sourceName, targetName, name, color, pageId, category, targetCategory } = req.body || {}
  const { Client } = require('@notionhq/client')
  const notion = new Client({ auth: NOTION_TOKEN })

  try {
    let affectedCount = 0

    // 1. 重命名分类 (Rename)
    if (action === 'rename') {
      if (!oldName || !newName || oldName === newName) {
        return res.status(400).json({ error: '请提供有效的原分类名称与新分类名称' })
      }

      // 查询所有属于 oldName 的文章
      const pagesToUpdate = await queryPagesByProp(notion, 'category', oldName)
      for (const page of pagesToUpdate) {
        await notion.pages.update({
          page_id: page.id,
          properties: {
            category: { select: { name: newName } }
          }
        })
        affectedCount++
      }
    }

    // 2. 合并分类 (Merge)
    else if (action === 'merge') {
      if (!sourceName || !targetName || sourceName === targetName) {
        return res.status(400).json({ error: '请提供有效的源分类与目标分类' })
      }

      const pagesToUpdate = await queryPagesByProp(notion, 'category', sourceName)
      for (const page of pagesToUpdate) {
        await notion.pages.update({
          page_id: page.id,
          properties: {
            category: { select: { name: targetName } }
          }
        })
        affectedCount++
      }
    }

    // 3. 删除分类 (Delete)
    else if (action === 'delete') {
      if (!name) {
        return res.status(400).json({ error: '请提供要删除的分类名称' })
      }

      const pagesToUpdate = await queryPagesByProp(notion, 'category', name)
      for (const page of pagesToUpdate) {
        await notion.pages.update({
          page_id: page.id,
          properties: {
            category: targetCategory ? { select: { name: targetCategory } } : { select: null }
          }
        })
        affectedCount++
      }
    }

    // 4. 创建新分类 (Create)
    else if (action === 'create') {
      if (!name) {
        return res.status(400).json({ error: '分类名称不能为空' })
      }
      // 如果指定了 pageId，直接分配给该文章
      if (pageId) {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            category: { select: { name: name.trim() } }
          }
        })
        affectedCount = 1
      }
    }

    // 5. 修改单篇文章的分类 (Update Post Category)
    else if (action === 'update_post_category') {
      if (!pageId) {
        return res.status(400).json({ error: '请提供文章 ID' })
      }
      await notion.pages.update({
        page_id: pageId,
        properties: {
          category: category ? { select: { name: category } } : { select: null }
        }
      })
      affectedCount = 1
    } else {
      return res.status(400).json({ error: '未知的操作类型: ' + action })
    }

    // 清理缓存以确保前台即时感知
    await clearSiteCache(res)

    return res.status(200).json({
      success: true,
      message: '分类操作执行成功',
      affectedCount
    })
  } catch (error) {
    console.error('分类操作失败:', error)
    return res.status(500).json({ error: error.message || '操作失败' })
  }
}

/**
 * 按属性查询文章列表
 */
async function queryPagesByProp(notion, propName, value) {
  const resp = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: {
      property: propName,
      select: { equals: value }
    }
  })
  return resp.results
}

/**
 * 清理全站缓存并触发 ISR 刷新
 */
async function clearSiteCache(res) {
  try {
    const { cleanCache: cleanFileCache } = require('@/lib/cache/local_file_cache')
    const { cleanCache: cleanMemCache } = require('@/lib/cache/memory_cache')
    cleanFileCache()
    await cleanMemCache()
  } catch (err) {
    console.warn('清理站点缓存提示:', err.message)
  }

  try {
    if (res && typeof res.revalidate === 'function') {
      await res.revalidate('/')
      await res.revalidate('/category').catch(() => {})
    }
  } catch (err) {
    console.warn('revalidate 提示:', err.message)
  }
}
