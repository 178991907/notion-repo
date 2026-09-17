/**
 * Twikoo 评论系统 API 服务端引擎
 * 将原先独立的 twikoo-api 抽离并集成到本项目中，实现单项目部署
 * 请求处理逻辑由 twikoo-vercel 库原生接管
 */
const twikoo = require('twikoo-vercel')

export default async function handler(req, res) {
  // CORS 支持配置 (解决前端跨域请求后端)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 安全校验：必须由站长在环境变量中配置独立的 MONGODB_URI，杜绝跨项目混淆与数据污染
  if (!process.env.MONGODB_URI) {
    return res.status(400).json({
      code: 400,
      message: '未配置环境变量 MONGODB_URI。如需使用 Twikoo 评论，请在 Vercel 环境变量中配置独立的 MongoDB 连接串；或开启零配置的 Notion 原生评论（NotionComments）。'
    })
  }

  // 交由 Twikoo 引擎处理核心逻辑
  return twikoo(req, res)
}
