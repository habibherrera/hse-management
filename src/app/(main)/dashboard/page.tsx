import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions"
import { cookies } from "next/headers"
import { getMessages, t, type Locale } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, AlertCircle, TrendingUp, ArrowUpRight, Plus, Zap, HardHat, Eye, ShieldAlert, Activity } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { format, subDays } from "date-fns"
import { es, enUS } from "date-fns/locale"
import Link from "next/link"

async function getDashboardData(dateLocale: typeof es) {
  const [
    totalEvents,
    openEvents,
    closedEvents,
    overdueActions,
    eventsByType,
    eventsBySeverity,
    eventsBySite,
    eventsByArea,
    recentEvents,
    weeklyTrend,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: { isClosed: false } } }),
    prisma.event.count({ where: { status: { isClosed: true } } }),
    prisma.correctiveAction.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] }, dueDate: { lt: new Date() } },
    }),
    prisma.event.groupBy({ by: ["eventTypeId"], _count: true }),
    prisma.event.groupBy({ by: ["severityId"], _count: true }),
    prisma.event.groupBy({ by: ["siteId"], _count: true }),
    prisma.event.groupBy({ by: ["areaId"], _count: true }),
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { eventType: true, severity: true, status: true, ownerUser: true },
    }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('week', "reportedAt") as week, COUNT(*)::int as count
      FROM events WHERE "reportedAt" >= ${subDays(new Date(), 56)}
      GROUP BY DATE_TRUNC('week', "reportedAt") ORDER BY week
    ` as Promise<{ week: Date; count: number }[]>,
  ])

  const [eventTypes, severities, sites, areas] = await Promise.all([
    prisma.eventType.findMany(),
    prisma.severity.findMany(),
    prisma.site.findMany(),
    prisma.area.findMany(),
  ])

  const eventTypeMap = Object.fromEntries(eventTypes.map((t) => [t.id, t]))
  const severityMap = Object.fromEntries(severities.map((s) => [s.id, s]))
  const siteMap = Object.fromEntries(sites.map((s) => [s.id, s]))
  const areaMap = Object.fromEntries(areas.map((a) => [a.id, a]))

  const closedEventsData = await prisma.event.findMany({
    where: { closedAt: { not: null } },
    select: { reportedAt: true, closedAt: true },
  })

  let avgCloseTime = 0
  if (closedEventsData.length > 0) {
    const totalDays = closedEventsData.reduce((sum, e) => {
      return sum + (e.closedAt!.getTime() - e.reportedAt.getTime()) / (1000 * 60 * 60 * 24)
    }, 0)
    avgCloseTime = Math.round(totalDays / closedEventsData.length)
  }

  return {
    totalEvents, openEvents, closedEvents, overdueActions, avgCloseTime,
    eventsByType: eventsByType.map((e) => ({
      name: eventTypeMap[e.eventTypeId]?.name || "N/A", count: e._count,
    })),
    eventsBySeverity: eventsBySeverity.map((e) => ({
      name: severityMap[e.severityId]?.name || "N/A",
      color: severityMap[e.severityId]?.color || "#6B7280",
      count: e._count,
    })),
    eventsBySite: eventsBySite.map((e) => ({
      name: siteMap[e.siteId]?.name || "N/A", count: e._count,
    })),
    eventsByArea: eventsByArea.map((e) => ({
      name: areaMap[e.areaId]?.name || "N/A", count: e._count,
    })),
    recentEvents: recentEvents.map((e) => ({
      id: e.id,
      eventNumber: e.eventNumber,
      description: e.description.substring(0, 80),
      eventType: e.eventType.name,
      severity: e.severity.name,
      severityColor: e.severity.color,
      status: e.status.name,
      statusClosed: e.status.isClosed,
      owner: e.ownerUser.name,
      reportedAt: format(e.reportedAt, "dd MMM yyyy", { locale: dateLocale }),
    })),
    weeklyTrend: (weeklyTrend || []).map((w) => ({
      week: format(w.week, "dd MMM", { locale: dateLocale }), count: w.count,
    })),
  }
}

export default async function DashboardPage() {
  await requireAuth()
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"
  const msgs = getMessages(locale)
  const dateLocale = locale === "en" ? enUS : es
  const data = await getDashboardData(dateLocale)

  const kpis = [
    {
      label: t(msgs, "dashboard.totalEvents"),
      value: data.totalEvents,
      icon: AlertTriangle,
      color: "hsl(220 70% 45%)",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t(msgs, "dashboard.openEvents"),
      value: data.openEvents,
      icon: Clock,
      color: "hsl(36 95% 52%)",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: t(msgs, "dashboard.closedEvents"),
      value: data.closedEvents,
      icon: CheckCircle,
      color: "hsl(152 69% 41%)",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: t(msgs, "dashboard.overdueActions"),
      value: data.overdueActions,
      icon: AlertCircle,
      color: "hsl(0 72% 51%)",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ]

  const quickActions = [
    { code: "ACCIDENTE",         label: "Accidente",          icon: AlertTriangle, color: "text-red-600 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-950/40",    border: "border-red-200 dark:border-red-900/50",    hover: "hover:bg-red-100 dark:hover:bg-red-950/60" },
    { code: "CUASI_ACCIDENTE",   label: "Cuasi-accidente",    icon: Zap,           color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-900/50", hover: "hover:bg-amber-100 dark:hover:bg-amber-950/60" },
    { code: "INCIDENTE",         label: "Incidente",          icon: Activity,      color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-900/50", hover: "hover:bg-orange-100 dark:hover:bg-orange-950/60" },
    { code: "CONDICION_INSEGURA",label: "Condición Insegura", icon: Eye,           color: "text-blue-600 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-950/40",   border: "border-blue-200 dark:border-blue-900/50",   hover: "hover:bg-blue-100 dark:hover:bg-blue-950/60" },
    { code: "ACTO_INSEGURO",     label: "Acto Inseguro",      icon: ShieldAlert,   color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-900/50", hover: "hover:bg-purple-100 dark:hover:bg-purple-950/60" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t(msgs, "dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t(msgs, "dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          {t(msgs, "dashboard.avgCloseTime")} <span className="font-bold text-foreground">{data.avgCloseTime} {t(msgs, "common.days")}</span>
        </div>
      </div>

      {/* Quick Report Actions */}
      <div className="rounded-xl border bg-card p-5 fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-[15px] font-bold">Nuevo Reporte</h3>
          </div>
          <Link href="/events/new" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            Formulario completo <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={action.code}
              href={`/events/new?type=${action.code}`}
              className={`flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all duration-200 active:scale-[0.97] fade-in ${action.bg} ${action.border} ${action.hover}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 dark:bg-black/20 shadow-sm`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className={`text-xs font-bold leading-tight ${action.color}`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="kpi-card card-hover rounded-xl border bg-card p-5 fade-in"
            style={{
              animationDelay: `${i * 80}ms`,
              "--kpi-color": kpi.color,
            } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-muted-foreground">{kpi.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        eventsByType={data.eventsByType}
        eventsBySeverity={data.eventsBySeverity}
        eventsBySite={data.eventsBySite}
        eventsByArea={data.eventsByArea}
        weeklyTrend={data.weeklyTrend}
        openEvents={data.openEvents}
        closedEvents={data.closedEvents}
      />

      {/* Recent Events */}
      <div className="rounded-xl border bg-card fade-in" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-[15px] font-bold">{t(msgs, "dashboard.recentEvents")}</h3>
          <Link href="/events" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            {t(msgs, "common.viewAll")} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y">
          {data.recentEvents.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">{t(msgs, "dashboard.noEvents")}</p>
            </div>
          ) : (
            data.recentEvents.map((event, i) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between px-6 py-4 table-row-hover fade-in"
                style={{ animationDelay: `${400 + i * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: event.severityColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono">{event.eventNumber}</span>
                      <Badge variant={event.statusClosed ? "success" : "warning"} className="text-[10px] px-2 py-0">
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-md truncate">{event.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs font-semibold" style={{ color: event.severityColor }}>{event.severity}</p>
                  <p className="text-[11px] text-muted-foreground">{event.reportedAt}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
