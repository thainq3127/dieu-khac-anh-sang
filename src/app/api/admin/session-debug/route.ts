import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  const cookieStore = await cookies()
  const headerStore = await headers()

  const cookieNames = cookieStore.getAll().map((cookie) => cookie.name)

  return NextResponse.json({
    hasSession: Boolean(session?.user),
    user: session?.user
      ? {
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        }
      : null,
    cookieNames,
    hasAuthjsSessionCookie: cookieNames.some((name) => name.includes('authjs.session-token')),
    host: headerStore.get('host'),
    forwardedHost: headerStore.get('x-forwarded-host'),
    forwardedProto: headerStore.get('x-forwarded-proto'),
  })
}
