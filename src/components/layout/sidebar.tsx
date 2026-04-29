"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { hasPermission } from "@/types"
import { useTranslation } from "@/providers/i18n-provider"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Role } from "@prisma/client"
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  LogOut,
  Shield,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { key: "events", href: "/events", icon: AlertTriangle, permission: null },
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, permission: null },
  { key: "reports", href: "/reports", icon: FileText, permission: "report:export" },
  { key: "catalogs", href: "/admin/catalogs", icon: Settings, permission: "catalog:manage" },
  { key: "users", href: "/admin/users", icon: Users, permission: "user:manage" },
]

const roleColors: Record<Role, string> = {
  REPORTER: "bg-slate-500",
  SUPERVISOR: "bg-blue-500",
  HSE: "bg-amber-500",
  MANAGER: "bg-emerald-500",
  ADMIN: "bg-violet-500",
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const userRole = session?.user?.role as Role | undefined

  return (
    <div className="sidebar-dark flex h-full w-[260px] flex-col">
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 px-6 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white tracking-tight">HSE Platform</h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">{t("common.appSubtitle")}</p>
        </div>
      </div>

      {/* Settings bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase px-3 mb-2">
          {t("nav.navigation")}
        </p>
        {navItems.map((item) => {
          if (item.permission && userRole && !hasPermission(userRole, item.permission)) return null
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.06] group-hover:text-slate-400"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="flex-1">{t(`nav.${item.key}`)}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-3 mb-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0",
            userRole ? roleColors[userRole] : "bg-slate-600"
          )}>
            {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {userRole ? t(`roles.${userRole}`) : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.signOut")}
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 bg-[hsl(224,30%,10%)] border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">HSE Platform</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer */}
          <div
            className="relative flex h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-44px] flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
