"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  CreditCard,
  FileKey2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { clearPartnerKey, getPartnerKey } from "@/lib/partner-portal/api"
import { cn } from "@/lib/utils"

const items = [
  { href: "/partner-portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner-portal/plans", label: "Mes Plans", icon: Package },
  { href: "/partner-portal/payments", label: "Paiements", icon: CreditCard },
  { href: "/partner-portal/credentials", label: "Identifiants API", icon: FileKey2 },
  { href: "/partner-portal/docs", label: "Documentation", icon: BookOpen },
]

export function PartnerPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const isLogin = pathname === "/partner-portal/login"

  useEffect(() => {
    if (!isLogin && !getPartnerKey()) {
      router.replace("/partner-portal/login")
      return
    }

    const timer = window.setTimeout(() => setReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [isLogin, router])

  function logout() {
    clearPartnerKey()
    router.replace("/partner-portal/login")
  }

  if (isLogin) {
    return <>{children}</>
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-muted-foreground">
        Chargement...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div>
            <p className="text-sm font-semibold">TrackPay</p>
            <p className="text-xs text-muted-foreground">Espace Partenaire</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            title="Fermer"
          >
            <X />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-3">
          <Button type="button" variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-white/95 px-4 backdrop-blur lg:hidden">
          <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(true)} title="Menu">
            <Menu />
          </Button>
          <span className="ml-3 text-sm font-semibold">Espace Partenaire</span>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
