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

/**
 * 极简高效纯 Edge 运行时中间件
 * 避免 CommonJS 与 ESM 混用导致的 Node.js 运行时 SyntaxError: Cannot use import statement outside a module 崩溃
 */
export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // --- Admin 后台路由鉴权拦截 ---
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const hasAdminToken = req.cookies.has('admin_token')
    if (!hasAdminToken) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
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
