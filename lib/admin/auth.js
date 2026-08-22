/**
 * 管理后台鉴权模块
 * 使用 Node.js crypto 的 HMAC-SHA256 实现轻量级 token 签发与验证
 * 不依赖外部 JWT 库，保持最小依赖
 */
const crypto = require('crypto')

// Token 有效期：24 小时
const TOKEN_EXPIRY_SECONDS = 86400

/**
 * 获取管理员密码（从环境变量读取）
 * @returns {string|null} 密码字符串或 null
 */
function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || null
}

/**
 * 获取签名密钥
 * @returns {string}
 */
function getSecret() {
  return process.env.ADMIN_SECRET || (getAdminPassword() || 'default') + '_notion_repo_secret'
}

/**
 * Base64url 编码
 * @param {string} str 原始字符串
 * @returns {string} base64url 编码后的字符串
 */
function base64urlEncode(str) {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Base64url 解码
 * @param {string} str base64url 编码的字符串
 * @returns {string} 解码后的原始字符串
 */
function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // 补齐 padding
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf-8')
}

/**
 * 生成 HMAC-SHA256 签名
 * @param {string} data 待签名数据
 * @returns {string} base64url 格式的签名
 */
function hmacSign(data) {
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return signature
}

/**
 * 签发 token
 * @param {object} payload 载荷数据
 * @returns {string} 签名后的 token 字符串
 */
function signToken(payload = {}) {
  const data = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS
  }
  const encodedPayload = base64urlEncode(JSON.stringify(data))
  const signature = hmacSign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

/**
 * 验证 token
 * @param {string} token token 字符串
 * @returns {object|null} 验证通过返回 payload，否则返回 null
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encodedPayload, signature] = parts
  // 验证签名
  const expectedSig = hmacSign(encodedPayload)
  if (signature !== expectedSig) return null

  try {
    const payload = JSON.parse(base64urlDecode(encodedPayload))
    // 验证有效期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

/**
 * 从请求的 cookie 中提取并验证 admin token
 * @param {import('next').NextApiRequest} req
 * @returns {object|null} 验证通过返回 payload，否则返回 null
 */
function verifyRequestToken(req) {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.match(/admin_token=([^;]+)/)
  if (!match) return null
  return verifyToken(match[1])
}

module.exports = {
  getAdminPassword,
  signToken,
  verifyToken,
  verifyRequestToken
}
