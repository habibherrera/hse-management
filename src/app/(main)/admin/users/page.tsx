import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/permissions"
import { cookies } from "next/headers"
import { getMessages, t, type Locale } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { UserCreateDialog } from "@/components/events/user-create-dialog"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

const roleColors: Record<string, string> = {
  REPORTER: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  SUPERVISOR: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  HSE: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
  MANAGER: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
  ADMIN: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400",
}

export default async function UsersPage() {
  await requireRole("ADMIN")
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"
  const msgs = getMessages(locale)
  const dateLocale = locale === "en" ? enUS : es

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t(msgs, "users.title")}</h1>
          <p className="text-muted-foreground mt-1">{users.length} {t(msgs, "users.registered")}</p>
        </div>
        <UserCreateDialog />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "users.tableHeaders.name")}</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "users.tableHeaders.email")}</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "users.tableHeaders.role")}</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "users.tableHeaders.status")}</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "users.tableHeaders.registered")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="table-row-hover">
                <td className="px-5 py-3.5 font-semibold">{user.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{user.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${roleColors[user.role] || ""}`}>
                    {t(msgs, `roles.${user.role}`)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={user.active ? "success" : "secondary"}>
                    {user.active ? t(msgs, "common.active") : t(msgs, "common.inactive")}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground text-xs">
                  {format(user.createdAt, "dd MMM yyyy", { locale: dateLocale })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
