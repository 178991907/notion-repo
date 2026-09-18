// pages/api/auth.js
import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Notion授权返回结果
 */
export interface NotionTokenResponseData {
  access_token: string
  token_type: string
  bot_id: string
  workspace_name: string
  workspace_icon: string
  workspace_id: string
  owner: {
    type: string
    user: {
      object: string
      id: string
      name: string
      avatar_url: string
      type: string
      person: {
        email: string
      }
    }
  }
  duplicated_template_id: string | null
  request_id: string
}

export interface NotionTokenResponse {
  status: number
  statusText: string
  data: NotionTokenResponseData
}

/**
 * Notion授权回调
 * @param req
 * @param res
 * @returns
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const code = Array.isArray(req.query.code)
      ? req.query.code[0]
      : req.query.code

    if (!code) {
      return res.status(400).json({ error: 'Invalid request, code is missing' })
    }

    const params = await fetchToken(code)

    if (params?.status === 200) {
      const redirectQuery = {
        msg: 'success'
      }

      // 将 Token 存储到 HttpOnly Cookie 中（使用 memberAuth 模块的 signMemberToken 或加密）
      const crypto = require('crypto')
      const algorithm = 'aes-256-cbc'
      const secretKey = crypto.createHash('sha256').update(String(process.env.NOTION_PAGE_ID || 'notion_next')).digest('base64').substring(0, 32)
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
      let encrypted = cipher.update(JSON.stringify(params.data), 'utf-8', 'hex')
      encrypted += cipher.final('hex')
      const encryptedToken = `${iv.toString('hex')}:${encrypted}`

      res.setHeader('Set-Cookie', `notion_oauth_token=${encryptedToken}; Path=/; HttpOnly; SameSite=Lax`)

      // 这里将用户数据写入到Notion数据库
      res.redirect(
        302,
        `/auth/result?${new URLSearchParams(redirectQuery).toString()}`
      )
    } else {
      const redirectQuery = { msg: 'fail' }
      res.redirect(
        302,
        `/auth/result?${new URLSearchParams(redirectQuery).toString()}`
      )
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
/**
 * 获取token
 * @param code
 * @returns
 */
const fetchToken = async (code: string): Promise<NotionTokenResponse> => {
  const clientId = process.env.OAUTH_CLIENT_ID
  const clientSecret = process.env.OAUTH_CLIENT_SECRET
  const redirectUri = process.env.OAUTH_REDIRECT_URI
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const response = await axios.post<NotionTokenResponseData>(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${encoded}`
        }
      }
    )
    console.log('OAuth身份信息获取成功，已隐藏详细Token内容')
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    }
  } catch (error) {
    console.error('Error fetching token', error)
    return {
      status: 400,
      statusText: 'failed',
      data: null as unknown as NotionTokenResponseData
    }
  }
}
