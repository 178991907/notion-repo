import { NextRequest, NextResponse } from 'next/server'

// 截取 URL 中最后一个 / 后面的内容
function getLastPartOfUrl(url: string) {
  if (!url) return ''
  const lastSlashIndex = url.lastIndexOf('/')
  return lastSlashIndex === -1 ? url : url.substring(lastSlashIndex + 1)
}

// 检查字符串是否为 32 位 Notion ID
function checkStrIsNotionId(str: string) {
  return /^[a-zA-Z0-9]{32}$/.test(str)
}

// 将 32 位 ID 转换为标准 UUID
function idToUuid(id: string) {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
}

/**
 * 中间件路由匹配规则（排除静态资源）
 */
export const config = {
  matcher: ['/((?!.*\\..*|_next|/sign-in|/auth).*)', '/', '/(api|trpc)(.*)']
}

// Edge Runtime 兼容的 HMAC-SHA256 验证
async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return false
    const [encodedPayload, signature] = parts
    
    // 密钥从环境变量 ADMIN_SECRET 读取
    const secretStr = process.env.ADMIN_SECRET
    if (!secretStr) return false
    
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    // Base64url 解码签名
    let base64 = signature.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) {
      base64 += '='
    }
    const sigBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(encodedPayload)
    )
    
    if (!isValid) return false
    
    // 检查 exp 是否过期
    let payloadBase64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    while (payloadBase64.length % 4 !== 0) {
      payloadBase64 += '='
    }
    const payloadStr = decodeURIComponent(escape(atob(payloadBase64)))
    const payload = JSON.parse(payloadStr)
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false
    }
    
    return true
  } catch (e) {
    return false
  }
}

/**
 * 极简高效纯 Edge 运行时中间件
 * 避免 CommonJS 与 ESM 混用导致的 Node.js 运行时 SyntaxError: Cannot use import statement outside a module 崩溃
 */
export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // --- Admin 后台路由鉴权拦截 ---
  if (
    (pathname.startsWith('/admin') || pathname.startsWith('/api/admin/')) &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const tokenCookie = req.cookies.get('admin_token')
    const hasAdminToken = tokenCookie?.value
    let isAuthorized = false
    
    if (hasAdminToken) {
      isAuthorized = await verifyAdminToken(hasAdminToken)
    }
    
    if (!isAuthorized) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      } else {
        const loginUrl = new URL('/admin/login', req.url)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // --- UUID 重定向逻辑 ---
  if (process.env.UUID_REDIRECT === 'true') {
    let redirectJson: Record<string, string> = {}
    try {
      const response = await fetch(`${req.nextUrl.origin}/redirect.json`)
      if (response.ok) {
        redirectJson = (await response.json()) as Record<string, string>
      }
    } catch (err) {
      console.error('Error fetching static file:', err)
    }
    let lastPart = getLastPartOfUrl(pathname)
    if (checkStrIsNotionId(lastPart)) {
      lastPart = idToUuid(lastPart)
    }
    if (lastPart && redirectJson[lastPart]) {
      const redirectToUrl = req.nextUrl.clone()
      redirectToUrl.pathname = '/' + redirectJson[lastPart]
      return NextResponse.redirect(redirectToUrl, 308)
    }
  }

  return NextResponse.next()
}
