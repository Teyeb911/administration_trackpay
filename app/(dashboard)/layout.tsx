'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context'

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar()
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay sombre mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  )
}
