/**
 * Gitalk OAuth Token 后端代理
 * 代替前端直接使用 Client Secret 进行 OAuth 令牌交换
 * POST /api/proxy/gitalk-token
 * 请求体：{ code: string }
 */
import { siteConfig } from '@/lib/config'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST' })
  }

  const { code } = req.body || {}
  if (!code) {
    return res.status(400).json({ error: '缺少 code 参数' })
  }

  const clientId = siteConfig('COMMENT_GITALK_CLIENT_ID')
  const clientSecret = siteConfig('COMMENT_GITALK_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Gitalk 未配置' })
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    })

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('[GitalkProxy] Token 交换失败:', error)
    return res.status(500).json({ error: '令牌交换失败' })
  }
}
