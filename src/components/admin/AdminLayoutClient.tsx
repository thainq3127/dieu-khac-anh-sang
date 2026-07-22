'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  children: React.ReactNode
  userEmail?: string
  userRole?: 'admin' | 'edit'
}

export default function AdminLayoutClient({ children, userEmail, userRole }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for Desktop (static) & Mobile (drawer) */}
      <Sidebar
        userEmail={userEmail}
        userRole={userRole}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center gap-4 border-b bg-sidebar px-4 md:hidden shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Mở Menu</span>
          </Button>
          <div className="flex-1 font-semibold text-sm text-sidebar-foreground/90">
            ✦ Văn Hóa Chăm
          </div>
        </header>

        {/* Scrollable Main Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
