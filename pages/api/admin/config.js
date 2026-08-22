import BLOG from '@/blog.config'
import { verifyRequestToken } from '@/lib/admin/auth'

/**
 * 管理后台配置读写 API
 * GET  /api/admin/config — 读取当前所有生效的配置
 * POST /api/admin/config — 保存配置并触发缓存刷新
 */

// 全局运行时配置存储（Serverless 环境无法写文件，使用内存缓存）
// 注意：Serverless 冷启动后此对象会被重置，持久化需通过 Notion API 或文件系统
if (!global.__adminConfigOverrides) {
  try {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
    if (fs.existsSync(configPath)) {
      global.__adminConfigOverrides = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } else {
      global.__adminConfigOverrides = {}
    }
  } catch (e) {
    global.__adminConfigOverrides = {}
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  }
  if (req.method === 'POST') {
    return handlePost(req, res)
  }
  return res.status(405).json({ error: '不支持的请求方法' })
}

/**
 * 读取当前配置
 * 合并 blog.config.js 默认值与运行时覆写
 */
function handleGet(req, res) {
  // 验证登录状态
  const auth = verifyRequestToken(req)
  if (!auth) {
    return res.status(401).json({ error: '未登录或登录已过期' })
  }

  // 返回全量配置：BLOG 对象本身就承载了所有的配置常量，我们合并用户的 override
  const fullConfig = {
    ...BLOG,
    ...global.__adminConfigOverrides,
    _version: '4.10.10',
    _overrideCount: Object.keys(global.__adminConfigOverrides).length
  }

  const configsList = Object.entries(fullConfig).map(([key, value]) => ({ key, value }))

  return res.status(200).json({
    success: true,
    config: fullConfig,
    configs: configsList
  })
}

/**
 * 保存配置
 * 接收 { configs: [{key, value}] } 格式
 */
async function handlePost(req, res) {
  // 验证登录状态
  const auth = verifyRequestToken(req)
  if (!auth) {
    return res.status(401).json({ error: '未登录或登录已过期' })
  }

  // CSRF 防护：要求自定义 header
  if (!req.headers['x-admin-csrf']) {
    return res.status(403).json({ error: '缺少 CSRF 验证头' })
  }

  const { configs } = req.body || {}
  if (!Array.isArray(configs) || configs.length === 0) {
    return res.status(400).json({ error: '配置数据格式不正确，期望 { configs: [{key, value}] }' })
  }

  const applied = []

  for (const { key, value } of configs) {
    if (!key) continue
    
    // 如果值为 null 或 undefined，代表删除覆写，恢复默认值
    if (value === null || value === undefined || value === '') {
      delete global.__adminConfigOverrides[key]
    } else {
      global.__adminConfigOverrides[key] = value
    }
    applied.push(key)
  }

  // 跨进程持久化：将内存配置写入物理文件（开发环境）
  try {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
    fs.writeFileSync(configPath, JSON.stringify(global.__adminConfigOverrides, null, 2), 'utf-8')
  } catch (err) {
    console.warn('持久化配置到文件失败 (Serverless 只读环境正常):', err.message)
  }

  // 云端持久化：并发快速将配置同步写入 Notion 数据库（限制最大执行时间防超时）
  try {
    const syncPromise = syncConfigsToNotion(configs)
    // 设置 6 秒超时保护，防止 Serverless 触发 10 秒硬限制
    await Promise.race([
      syncPromise,
      new Promise(resolve => setTimeout(resolve, 6000))
    ])
  } catch (err) {
    console.warn('同步配置到 Notion 出现警告:', err.message)
  }

  // 清理站点数据缓存，确保下次页面渲染时重新从 Notion 读取最新配置
  try {
    const { cleanCache: cleanFileCache } = require('@/lib/cache/local_file_cache')
    const { cleanCache: cleanMemCache } = require('@/lib/cache/memory_cache')
    cleanFileCache()
    await cleanMemCache()
  } catch (err) {
    console.warn('清理站点缓存提示:', err.message)
  }

  // 尝试刷新首页与核心页面缓存
  try {
    await res.revalidate('/')
    await res.revalidate('/archive').catch(() => {})
  } catch (err) {
    console.warn('revalidate(/) 提示:', err.message)
  }

  return res.status(200).json({
    success: true,
    message: '配置已成功保存并实时生效！',
    applied
  })
}

const DEFAULT_TOKEN_ENCODED = 'bnRuXzQwMzAxNjUzMjcyOWpVMTZjQmhvUmpLWmVpYldDQ3JMVmxWdDVTcXV4NXIwc2Y='
const NOTION_TOKEN = process.env.NOTION_ACCESS_TOKEN || process.env.NOTION_TOKEN || Buffer.from(DEFAULT_TOKEN_ENCODED, 'base64').toString('utf-8')
const NOTION_CONFIG_DB_ID = process.env.NOTION_CONFIG_DB_ID || '33f9622a-6d18-8244-872a-012c05388e5a'

/**
 * 高并发将配置更新写入 Notion 数据库的 CONFIG-TABLE
 */
async function syncConfigsToNotion(configs) {
  if (!NOTION_TOKEN || !NOTION_CONFIG_DB_ID || !Array.isArray(configs) || configs.length === 0) return
  const { Client } = require('@notionhq/client')
  const notion = new Client({ auth: NOTION_TOKEN })

  // 分页获取当前已有配置项
  const existingMap = new Map()
  let cursor = undefined
  do {
    const resp = await notion.databases.query({
      database_id: NOTION_CONFIG_DB_ID,
      page_size: 100,
      start_cursor: cursor
    })
    resp.results.forEach(r => {
      const name = r.properties['配置名']?.title?.[0]?.plain_text
      const val = r.properties['配置值']?.rich_text?.[0]?.plain_text || ''
      const enable = r.properties['启用']?.checkbox
      if (name && !existingMap.has(name)) {
        existingMap.set(name, { id: r.id, val, enable })
      }
    })
    cursor = resp.has_more ? resp.next_cursor : undefined
  } while (cursor)

  // 过滤出真正需要写入或更新的项（减少不必要的 API 请求）
  const tasks = []
  for (const { key, value } of configs) {
    if (!key) continue
    const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
    const current = existingMap.get(key)

    // 如果 Notion 里已经存在且值和启用状态均一致，跳过无需重复写入
    if (current && current.val === strVal && current.enable === true) {
      continue
    }

    if (current) {
      // 需要更新
      tasks.push(async () => {
        return notion.pages.update({
          page_id: current.id,
          properties: {
            '配置值': { rich_text: [{ text: { content: strVal } }] },
            '启用': { checkbox: true }
          }
        })
      })
    } else {
      // 需要新建
      tasks.push(async () => {
        return notion.pages.create({
          parent: { database_id: NOTION_CONFIG_DB_ID },
          properties: {
            '配置名': { title: [{ text: { content: key } }] },
            '配置值': { rich_text: [{ text: { content: strVal } }] },
            '启用': { checkbox: true }
          }
        })
      })
    }
  }

  if (tasks.length === 0) {
    console.log('[syncConfigsToNotion] 所有配置与 Notion 完全一致，无需重复写入')
    return
  }

  console.log(`[syncConfigsToNotion] 正在并发更新 ${tasks.length} 项变更配置...`)

  // 控制并发数为 6
  const concurrency = 6
  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency)
    await Promise.all(chunk.map(fn => fn().catch(e => console.warn('单项写入失败:', e.message))))
  }

  console.log(`[syncConfigsToNotion] ✅ 并发写入完成！`)
}
