/**
 * 会员认证工具模块
 * 使用 Node.js crypto 的 HMAC-SHA256 实现会员安全 Token 签发与鉴权
 * 保持轻量、无第三方外部认证依赖
 */
const crypto = require('crypto')

// 默认会员登录有效时长：7 天（单位：秒）
const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60
// 记住我时有效时长：30 天（单位：秒）
const REMEMBER_ME_EXPIRY_SECONDS = 30 * 24 * 60 * 60

/**
 * 获取会员签名密钥
 * @returns {string}
 */
function getMemberSecret() {
  return (
    process.env.MEMBER_AUTH_SECRET ||
    process.env.NOTION_PAGE_ID ||
    'notion_member_auth_default_secret_key_2026'
  )
}

/**
 * Base64url 编码
 * @param {string} str 原始字符串
 * @returns {string}
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
 * @param {string} str base64url 编码字符串
 * @returns {string}
 */
function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf-8')
}

/**
 * 生成 HMAC-SHA256 签名
 * @param {string} data 待签名数据
 * @returns {string}
 */
function hmacSign(data) {
  return crypto
    .createHmac('sha256', getMemberSecret())
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * 计算字符串的 SHA256 哈希值（用于密码校验）
 * @param {string} str 待计算明文
 * @returns {string}
 */
export function sha256Hex(str) {
  if (!str) return ''
  return crypto.createHash('sha256').update(String(str)).digest('hex')
}

/**
 * 校验密码是否匹配
 * 支持：明文比对、或者输入明文的 SHA256 与 Notion 中存储的哈希比对
 * @param {string} inputPassword 用户输入的密码
 * @param {string} storedPassword Notion 数据库中存储的密码
 * @returns {boolean}
 */
export function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false
  const inputStr = String(inputPassword).trim()
  const storedStr = String(storedPassword).trim()

  // 1. 直接明文比对（方便管理员在后台直观填写初始密码）
  if (inputStr === storedStr) {
    return true
  }

  // 2. SHA256 摘要比对
  const inputHash = sha256Hex(inputStr)
  if (inputHash.toLowerCase() === storedStr.toLowerCase()) {
    return true
  }

  return false
}

/**
 * 检查会员是否已过期
 * @param {string|number|Date|null} expireDate 到期日期
 * @returns {boolean} true 表示已过期，false 表示未过期或永久有效
 */
export function isMemberExpired(expireDate) {
  if (!expireDate) return false // 留空表示永久有效
  const exp = new Date(expireDate).getTime()
  if (isNaN(exp)) return false
  return Date.now() > exp
}

/**
 * 签发会员登录凭证 Token
 * @param {object} payload 负载数据 { username, expireDate, role }
 * @param {boolean} rememberMe 是否记住登录
 * @returns {string}
 */
export function signMemberToken(payload, rememberMe = false) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const expirySeconds = rememberMe ? REMEMBER_ME_EXPIRY_SECONDS : DEFAULT_EXPIRY_SECONDS
  const body = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expirySeconds
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedBody = base64urlEncode(JSON.stringify(body))
  const signature = hmacSign(`${encodedHeader}.${encodedBody}`)

  return `${encodedHeader}.${encodedBody}.${signature}`
}

/**
 * 验证会员登录凭证 Token
 * @param {string} token
 * @returns {object|null} 解码出的 payload，验证失败返回 null
 */
export function verifyMemberToken(token) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedBody, signature] = parts

  // 验证签名
  const expectedSignature = hmacSign(`${encodedHeader}.${encodedBody}`)
  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null
  }

  // 验证过期时间
  try {
    const body = JSON.parse(base64urlDecode(encodedBody))
    const now = Math.floor(Date.now() / 1000)
    if (body.exp && body.exp < now) {
      return null
    }

    // 验证会员业务到期时间
    if (body.expireDate && isMemberExpired(body.expireDate)) {
      return null
    }

    return body
  } catch (err) {
    return null
  }
}

/**
 * 构建设置 HttpOnly Cookie 的头部字符串
 * @param {string} token 凭证
 * @param {boolean} rememberMe 是否记住我
 * @returns {string}
 */
export function buildMemberCookieHeader(token, rememberMe = false) {
  const maxAge = rememberMe ? REMEMBER_ME_EXPIRY_SECONDS : DEFAULT_EXPIRY_SECONDS
  const isSecure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `member_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure}`
}

/**
 * 构建清除 Cookie 的头部字符串
 * @returns {string}
 */
export function buildClearMemberCookieHeader() {
  const isSecure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `member_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isSecure}`
}

const memberAuth = {
  sha256Hex,
  verifyPassword,
  isMemberExpired,
  signMemberToken,
  verifyMemberToken,
  buildMemberCookieHeader,
  buildClearMemberCookieHeader
}

export default memberAuth
