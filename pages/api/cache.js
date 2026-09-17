import BLOG from '@/blog.config'
import { cleanCache } from '@/lib/cache/local_file_cache'
import { verifyRequestToken } from '@/lib/admin/auth'

/**
 * 清理缓存
 * @param {*} req
 * @param {*} res
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  // 1. 管理员凭据检测：已登录管理员直接放行
  const isAdmin = Boolean(verifyRequestToken(req))

  // 2. Token 校验：统一支持 CACHE_REVALIDATION_TOKEN 与 REVALIDATION_TOKEN
  const token = process.env.CACHE_REVALIDATION_TOKEN || process.env.REVALIDATION_TOKEN || BLOG.REVALIDATION_TOKEN
  const isTokenValid = Boolean(token && req.headers.authorization === `Bearer ${token}`)

  if (!isAdmin && !isTokenValid) {
    return res.status(401).json({
      status: 'error',
      message: '未授权：请先登录管理员后台，或在请求头携带有效的 Bearer Token (REVALIDATION_TOKEN)'
    })
  }

  try {
    cleanCache()
    res.status(200).json({ status: 'success', message: 'Clean cache successful!' })
  } catch (error) {
    console.error('Cache clean error:', error)
    res.status(500).json({ status: 'error', message: 'Clean cache failed!' })
  }
}
