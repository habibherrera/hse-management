import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions"
import { cookies } from "next/headers"
import { getMessages, t, type Locale } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { EventFilters } from "@/components/events/event-filters"

interface Props {
  searchParams: {
    page?: string
    eventTypeId?: string
    severityId?: string
    statusId?: string
    siteId?: string
    areaId?: string
    search?: string
  }
}

export default async function EventsPage({ searchParams }: Props) {
  await requireAuth()
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"
  const msgs = getMessages(locale)
  const dateLocale = locale === "en" ? enUS : es

  const page = parseInt(searchParams.page || "1")
  const limit = 20
  const where: any = {}

  if (searchParams.eventTypeId) where.eventTypeId = searchParams.eventTypeId
  if (searchParams.severityId) where.severityId = searchParams.severityId
  if (searchParams.statusId) where.statusId = searchParams.statusId
  if (searchParams.siteId) where.siteId = searchParams.siteId
  if (searchParams.areaId) where.areaId = searchParams.areaId
  if (searchParams.search) {
    where.OR = [
      { eventNumber: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  const [events, total, eventTypes, severities, eventStatuses, sites, areas] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        eventType: true, severity: true, status: true, site: true, area: true,
        ownerUser: { select: { name: true } },
        _count: { select: { correctiveActions: true } },
      },
      orderBy: { reportedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
    prisma.eventType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.severity.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.eventStatus.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.site.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.area.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t(msgs, "events.title")}</h1>
          <p className="text-muted-foreground mt-1">{total} {t(msgs, "events.registered")}</p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[hsl(220,70%,45%)] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[hsl(220,70%,40%)] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          {t(msgs, "events.newEvent")}
        </Link>
      </div>

      <EventFilters
        eventTypes={eventTypes}
        severities={severities}
        eventStatuses={eventStatuses}
        sites={sites}
        areas={areas}
      />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "events.number")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "events.type")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "events.severity")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "common.description")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "events.site")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "events.responsible")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "common.status")}</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t(msgs, "events.dateCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">{t(msgs, "events.noEventsFound")}</p>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="table-row-hover">
                    <td className="px-5 py-3.5">
                      <Link href={`/events/${event.id}`} className="font-bold font-mono text-primary hover:underline">
                        {event.eventNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{event.eventType.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: event.severity.color }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.severity.color }} />
                        {event.severity.name}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px] truncate text-muted-foreground">{event.description}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{event.site.name}</td>
                    <td className="px-5 py-3.5 font-medium">{event.ownerUser.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={event.status.isClosed ? "success" : "warning"} className="text-[10px]">
                        {event.status.name}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {format(event.eventDateTime, "dd MMM yyyy", { locale: dateLocale })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/events?page=${page - 1}`}
              className="inline-flex h-9 items-center rounded-lg border px-4 text-xs font-semibold transition-colors hover:bg-muted/50"
            >
              {t(msgs, "common.previous")}
            </Link>
          )}
          <span className="text-xs text-muted-foreground">
            {t(msgs, "common.page")} <span className="font-bold text-foreground">{page}</span> {t(msgs, "common.of")} {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/events?page=${page + 1}`}
              className="inline-flex h-9 items-center rounded-lg border px-4 text-xs font-semibold transition-colors hover:bg-muted/50"
            >
              {t(msgs, "common.next")}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
