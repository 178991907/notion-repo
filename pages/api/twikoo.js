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

  // 确保 MONGODB_URI 正确注入
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('vsh9c')) {
    process.env.MONGODB_URI = 'mongodb+srv://terrylaoshi:zou92324@cluster0.zbikr5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  }

  // 交由 Twikoo 引擎处理核心逻辑
  return twikoo(req, res)
}
