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

  return res.status(200).json({ success: true, config: fullConfig })
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

  // 高级面板：移除硬编码白名单限制，只要是管理员，允许覆写任意环境变量/配置
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

  // 跨进程持久化：将内存配置写入物理文件（因为开发环境下 API 与前台在不同进程，且用户需要上传 Github）
  try {
    const fs = require('fs')
    const path = require('path')
    const configPath = path.resolve(process.cwd(), 'lib/adminConfigOverrides.json')
    fs.writeFileSync(configPath, JSON.stringify(global.__adminConfigOverrides, null, 2), 'utf-8')
  } catch (err) {
    console.warn('持久化配置到文件失败:', err.message)
  }

  // 尝试强制刷新首页 ISR 缓存
  try {
    await res.revalidate('/')
  } catch (err) {
    console.warn('revalidate(/) failed:', err.message)
  }

  return res.status(200).json({
    success: true,
    message: '配置已更新',
    applied
  })
}
