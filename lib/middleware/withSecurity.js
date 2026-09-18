import { securityMiddleware } from './security'

/**
 * API 安全包装器高阶函数
 * 为 API 处理函数自动注入安全中间件（速率限制、安全头、CORS）
 * @param {function} handler - 原始的 Next.js API handler
 * @param {object} options - 安全中间件配置选项
 * @returns {function} 包装后的 handler
 */
export function withSecurity(handler, options = {}) {
  const middleware = securityMiddleware(options)
  
  return async (req, res) => {
    return new Promise((resolve, reject) => {
      middleware(req, res, async () => {
        try {
          const result = await handler(req, res)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}

export default withSecurity
