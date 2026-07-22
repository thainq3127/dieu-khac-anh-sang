import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

class InvalidLoginError extends CredentialsSignin {
  code = 'invalid_credentials'
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          throw new InvalidLoginError()
        }

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (!adminEmail || !adminPassword) {
          console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD')
          throw new InvalidLoginError()
        }

        const { email, password } = parsed.data
        const isEmailMatch = email.toLowerCase() === adminEmail.toLowerCase()
        const isPasswordMatch = password === adminPassword
        if (!isEmailMatch || !isPasswordMatch) {
          throw new InvalidLoginError()
        }

        return {
          id: 'admin',
          email,
          name: 'Admin',
          role: 'admin',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = 'admin'
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = 'admin'
        session.user.role = token.role === 'admin' ? 'admin' : undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
})
