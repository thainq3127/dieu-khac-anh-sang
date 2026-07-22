import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Social media / search crawler user-agents that must bypass Basic Auth to generate link previews
const CRAWLER_UA_PATTERNS = [
  'facebookexternalhit', 'facebookcatalog',
  'twitterbot', 'x.com',
  'linkedinbot',
  'slackbot', 'slack-imgproxy',
  'discordbot',
  'telegrambot',
  'whatsapp',
  'googlebot', 'google-inspectiontool', 'googleother',
  'bingbot', 'msnbot',
  'applebot',
  'iframely',
  'embedly',
  'outbrain',
  'pinterest',
  'vkshare',
  'zalo',
  'viber',
]

function isCrawler(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  return CRAWLER_UA_PATTERNS.some((p) => ua.includes(p))
}

export async function proxy(request: NextRequest) {
  // 1. Basic Auth Check — skip for social/search crawlers so link previews work
  const expectedUser = process.env.BASIC_AUTH_USER
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD

  if (expectedUser && expectedPassword && !isCrawler(request)) {
    const basicAuth = request.headers.get('authorization')
    if (basicAuth) {
      try {
        const authValue = basicAuth.split(' ')[1]
        const [user, pwd] = atob(authValue).split(':')
        if (user !== expectedUser || pwd !== expectedPassword) {
          return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
              'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
          })
        }
      } catch {
        return new NextResponse('Invalid Authorization Header', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
          },
        })
      }
    } else {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  }

  // 2. Existing routing/admin logic
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    return handleAdmin(request)
  }

  return intlMiddleware(request)
}

async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'

  const isSecure =
    request.headers.get('x-forwarded-proto') === 'https' ||
    request.nextUrl.protocol === 'https:'
  const cookieName = isSecure
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, cookieName })
  const isAuthenticated = !!token

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next|_vercel|preview-block|preview-new-blocks|favicon\\.ico|images|fonts|.*\\..*).*)',
  ],
}
