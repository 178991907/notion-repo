import BLOG from '@/blog.config'
import { verifyRequestToken } from '@/lib/admin/auth'

/**
 * 管理后台配置读写 API
 * GET  /api/admin/config — 读取当前所有生效的配置
 * POST /api/admin/config — 保存配置并触发缓存刷新
 */

// 全局运行时配置存储（Serverless 环境无法写文件，使用内存缓存）
// 注意：Serverless 冷启动后此对象会被重置，持久化需通过 Notion API 或文件系统
function loadInitialOverrides() {
  let overrides = {}
  try {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
    if (fs.existsSync(configPath)) {
      overrides = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  } catch (e) {}
  try {
    const fs = require('fs')
    const tmpPath = '/tmp/adminConfigOverrides.json'
    if (fs.existsSync(tmpPath)) {
      overrides = { ...overrides, ...JSON.parse(fs.readFileSync(tmpPath, 'utf-8')) }
    }
  } catch (e) {}
  return overrides
}

if (!global.__adminConfigOverrides) {
  global.__adminConfigOverrides = loadInitialOverrides()
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
async function handleGet(req, res) {
  // 验证登录状态
  const auth = verifyRequestToken(req)
  if (!auth) {
    return res.status(401).json({ error: '未登录或登录已过期' })
  }

  // 增量从物理配置文件更新基准底包，但保留当前实例中用户刚修改并保存在内存的覆盖配置，严防旧文件冲刷
  try {
    const fileBase = loadInitialOverrides()
    global.__adminConfigOverrides = { ...fileBase, ...(global.__adminConfigOverrides || {}) }
  } catch (e) {}

  // 如果配置了 Notion 凭据，从 Notion 数据库配置中心拉取并合并最新真实配置（支持自动探测数据库）
  if (NOTION_TOKEN) {
    try {
      const { Client } = require('@notionhq/client')
      const notion = new Client({ auth: NOTION_TOKEN })
      const configDbId = await resolveConfigDatabaseId(notion)
      if (configDbId) {
        let cursor = undefined
        do {
          const resp = await notion.databases.query({
            database_id: configDbId,
            page_size: 100,
            start_cursor: cursor
          })
          resp.results.forEach(r => {
            const name = r.properties['配置名']?.title?.[0]?.plain_text || r.properties['Name']?.title?.[0]?.plain_text
            const val = r.properties['配置值']?.rich_text?.[0]?.plain_text || r.properties['Value']?.rich_text?.[0]?.plain_text
            const enable = r.properties['启用']?.checkbox ?? r.properties['Enable']?.checkbox ?? true
            if (name && enable && val !== undefined && val !== '') {
              let parsedVal = val
              if (val === 'true') parsedVal = true
              else if (val === 'false') parsedVal = false
              else if (val.startsWith('{') || val.startsWith('[')) {
                try { parsedVal = JSON.parse(val) } catch (e) {}
              }
              global.__adminConfigOverrides[name] = parsedVal
            }
          })
          cursor = resp.has_more ? resp.next_cursor : undefined
        } while (cursor)
      }
    } catch (err) {
      console.warn('[handleGet] 从 Notion 同步配置中心失败:', err.message)
    }
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

    // 安全防护：NOTION_PAGE_ID 属于核心数据源基础设施，绝不允许被后台覆盖锁死
    if (key === 'NOTION_PAGE_ID') {
      continue
    }

    // 保护核心元数据：若为默认占位符，不写入内存覆盖，确保无条件回退并读取用户 Notion 原生数据
    const SYSTEM_PLACEHOLDERS = ['NotionNext BLOG', 'Notion Repo BLOG', 'Notion Blog', '基于 Notion 的静态博客', 'NotionNext', 'Notion Next 知识库']
    if (['TITLE', 'DESCRIPTION', 'AUTHOR', 'BIO'].includes(key) && SYSTEM_PLACEHOLDERS.includes(value)) {
      delete global.__adminConfigOverrides[key]
      applied.push(key)
      continue
    }
    
    // 如果值为 null 或 undefined，代表恢复默认值
    if (value === null || value === undefined) {
      delete global.__adminConfigOverrides[key]
    } else if (value === '' && ['TITLE', 'DESCRIPTION', 'AUTHOR', 'BIO'].includes(key)) {
      // 站点核心元数据留空时，删除覆盖以回退至 Notion 真实属性
      delete global.__adminConfigOverrides[key]
    } else {
      global.__adminConfigOverrides[key] = value
    }
    applied.push(key)
  }

  let persistedLocally = false
  // 跨进程持久化：将内存配置写入物理文件（仅在本地开发环境且非 Jest 单测环境执行）
  try {
    if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
      const fs = require('fs')
      const path = require('path')
      const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
      fs.writeFileSync(configPath, JSON.stringify(global.__adminConfigOverrides, null, 2), 'utf-8')
      persistedLocally = true
    }
  } catch (err) {
    // Serverless 只读文件系统回退：写入 /tmp 临时目录
    try {
      const fs = require('fs')
      fs.writeFileSync('/tmp/adminConfigOverrides.json', JSON.stringify(global.__adminConfigOverrides, null, 2), 'utf-8')
      persistedLocally = true
    } catch (tmpErr) {}
    console.warn('持久化配置到文件提示 (Serverless 只读环境正常):', err.message)
  }

  let persistedToNotion = false
  // 云端持久化：并发快速将配置同步写入 Notion 数据库（限制最大执行时间防超时）
  try {
    if (NOTION_TOKEN) {
      const syncPromise = syncConfigsToNotion(configs)
      // 设置 8 秒超时保护，防止 Serverless 触发 10 秒硬限制
      const syncResult = await Promise.race([
        syncPromise,
        new Promise(resolve => setTimeout(() => resolve(false), 8000))
      ])
      if (syncResult === true) {
        persistedToNotion = true
      }
    }
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

  // 尝试刷新首页与核心页面缓存 (ISR 增量静态生成)
  try {
    const revalidatePaths = ['/', '/archive', '/category', '/tag']
    await Promise.allSettled(revalidatePaths.map(p => res.revalidate(p).catch(() => {})))
  } catch (err) {
    console.warn('revalidate 提示:', err.message)
  }

  // 整理供复制到 Notion CONFIG 配置表的数据
  const configsForNotion = configs.map(({ key, value }) => ({
    key,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
  }))

  const isVercel = Boolean(process.env.VERCEL)
  let saveMsg = '配置已在当前实例实时生效！'
  if (persistedToNotion) {
    saveMsg = '配置已成功保存并同步至您的 Notion 数据库（云端持久化已接通），永久生效！'
  } else if (persistedLocally && !isVercel) {
    saveMsg = '配置已成功保存至本地文件，实时生效！'
  } else if (isVercel) {
    saveMsg = '配置已在当前实例生效！提示：当前在 Vercel 生产环境且未检测到 Notion 配置中心，建议确保 Notion 授权并包含 CONFIG-TABLE。'
  }

  return res.status(200).json({
    success: true,
    message: saveMsg,
    applied,
    persistedLocally,
    persistedToNotion,
    notionSyncEnabled: Boolean(NOTION_TOKEN),
    configsForNotion
  })
}

const NOTION_TOKEN = process.env.NOTION_API_TOKEN || process.env.NOTION_ACCESS_TOKEN || process.env.NOTION_TOKEN || ''

/**
 * 智能自动解析并获取配置中心数据库 ID (Auto-Discovery)
 * 1. 优先读取环境变量 NOTION_CONFIG_DB_ID
 * 2. 其次读取进程内全局缓存 global.__notionConfigDatabaseId
 * 3. 智能探测：调用 Notion 官方检索接口，自动匹配 CONFIG-TABLE 或包含「配置」的数据库
 */
export async function resolveConfigDatabaseId(notionClient) {
  // 1. 环境变量优先
  const envDbId = process.env.NOTION_CONFIG_DB_ID
  if (envDbId && envDbId.trim()) {
    return envDbId.trim()
  }

  // 2. 内存全局缓存优先
  if (global.__notionConfigDatabaseId) {
    return global.__notionConfigDatabaseId
  }

  if (!notionClient) {
    return ''
  }

  try {
    // 3. 智能自动探测
    const searchRes = await notionClient.search({
      filter: { value: 'database', property: 'object' },
      page_size: 100
    })

    const databases = searchRes.results || []

    // 规则 A：精准匹配标题为 CONFIG-TABLE / Config-Table 的数据库
    let target = databases.find(db => {
      const title = db.title?.[0]?.plain_text || ''
      return /^(CONFIG-TABLE|Config-Table)$/i.test(title.trim())
    })

    // 规则 B：模糊匹配标题包含「CONFIG」或「配置」且具备配置字段的数据库
    if (!target) {
      target = databases.find(db => {
        const title = db.title?.[0]?.plain_text || ''
        const hasKey = db.properties && (db.properties['配置名'] || db.properties['Name'])
        return /(CONFIG|配置)/i.test(title.trim()) && hasKey
      })
    }

    if (target && target.id) {
      console.log(`[Auto-Discovery] ✅ 成功自动探测并关联 Notion 配置中心: ${target.id} (${target.title?.[0]?.plain_text || ''})`)
      global.__notionConfigDatabaseId = target.id
      return target.id
    }
  } catch (err) {
    console.warn('[Auto-Discovery] 自动探测 Notion 配置数据库异常:', err.message)
  }

  return ''
}

/**
 * 高并发将配置更新写入 Notion 数据库的 CONFIG-TABLE
 */
async function syncConfigsToNotion(configs) {
  if (!NOTION_TOKEN || !Array.isArray(configs) || configs.length === 0) {
    return false
  }
  const { Client } = require('@notionhq/client')
  const notion = new Client({ auth: NOTION_TOKEN })

  const configDbId = await resolveConfigDatabaseId(notion)
  if (!configDbId) {
    console.warn('[syncConfigsToNotion] 未找到任何配置中心数据库，跳过同步到 Notion')
    return false
  }

  // 分页获取当前已有配置项
  const existingMap = new Map()
  let cursor = undefined
  do {
    const resp = await notion.databases.query({
      database_id: configDbId,
      page_size: 100,
      start_cursor: cursor
    })
    resp.results.forEach(r => {
      const name = r.properties['配置名']?.title?.[0]?.plain_text || r.properties['Name']?.title?.[0]?.plain_text
      const val = r.properties['配置值']?.rich_text?.[0]?.plain_text || r.properties['Value']?.rich_text?.[0]?.plain_text || ''
      const enable = r.properties['启用']?.checkbox ?? r.properties['Enable']?.checkbox ?? true
      if (name && !existingMap.has(name)) {
        existingMap.set(name, {
          id: r.id,
          val,
          enable,
          valProp: r.properties['配置值'] ? '配置值' : 'Value',
          enableProp: r.properties['启用'] ? '启用' : 'Enable'
        })
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
            [current.valProp]: { rich_text: [{ text: { content: strVal } }] },
            [current.enableProp]: { checkbox: true }
          }
        })
      })
    } else {
      // 需要新建
      tasks.push(async () => {
        return notion.pages.create({
          parent: { database_id: configDbId },
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
    return true
  }

  console.log(`[syncConfigsToNotion] 正在并发更新 ${tasks.length} 项变更配置至数据库 (${configDbId})...`)

  // 控制并发数为 6，防止撞击 Notion API 速率限制
  const concurrency = 6
  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency)
    await Promise.all(chunk.map(fn => fn().catch(e => console.warn('单项写入失败:', e.message))))
  }

  console.log(`[syncConfigsToNotion] ✅ 并发写入完成！`)
  return true
}
