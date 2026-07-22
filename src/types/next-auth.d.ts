import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: 'admin'
  }

  interface Session {
    user?: {
      id?: string
      role?: 'admin'
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin'
  }
}
