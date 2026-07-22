import { auth } from '@/auth'
import { AdminAuthProvider, type UserRole } from '@/components/admin/AdminAuthProvider'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    return <div>Admin login required. Open /admin/login.</div>
  }

  const userEmail = session.user.email ?? undefined
  const userRole: UserRole = 'admin'

  return (
    <AdminAuthProvider initialRole={userRole} initialEmail={userEmail || ''}>
      <AdminLayoutClient userEmail={userEmail} userRole={userRole}>
        {children}
      </AdminLayoutClient>
    </AdminAuthProvider>
  )
}
