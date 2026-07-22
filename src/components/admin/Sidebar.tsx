'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, FileText, MapPin, Settings, LogOut, ExternalLink, BookOpen, Users, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Props = {
  userEmail?: string
  userRole?: 'admin' | 'edit'
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ userEmail, userRole, open = false, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const visibleNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/pages', label: 'Nội dung trang', icon: FileText },
    { href: '/admin/blogs', label: 'Quản lý Blog', icon: BookOpen },
    { href: '/admin/map', label: 'Địa điểm di sản', icon: MapPin },
    ...(userRole === 'admin'
      ? [{ href: '/admin/accounts', label: 'Quản lý tài khoản', icon: Users }]
      : []),
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
  ]

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.refresh()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-sidebar border-r transition-transform duration-300 ease-in-out md:static md:w-56 md:translate-x-0 shrink-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 text-sm font-semibold hover:text-amber-500 transition-colors"
              onClick={onClose}
            >
              <span className="text-gold text-base leading-none">✦</span>
              Văn Hóa Chăm
              <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
            </Link>
            <p className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase pl-5">
              Admin CMS
            </p>
          </div>
          {/* Close button inside sidebar on mobile */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="md:hidden text-muted-foreground hover:text-foreground shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {visibleNavItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="px-2 py-3 space-y-1">
          {userEmail && (
            <p className="text-xs text-muted-foreground px-3 py-1 truncate">{userEmail}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>
    </>
  )
}

