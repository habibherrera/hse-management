import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/permissions"
import { cookies } from "next/headers"
import { getMessages, t, type Locale } from "@/lib/i18n"
import { CatalogManager } from "@/components/events/catalog-manager"

export default async function CatalogsPage() {
  await requireRole("ADMIN")
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"
  const msgs = getMessages(locale)

  const [eventTypes, severities, eventStatuses, sites, areas, projects, shifts, contractors] =
    await Promise.all([
      prisma.eventType.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.severity.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.eventStatus.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.site.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.area.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.shift.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.contractor.findMany({ orderBy: { sortOrder: "asc" } }),
    ])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t(msgs, "catalogs.title")}</h1>

      <CatalogManager
        catalogs={[
          { key: "event-types", label: t(msgs, "catalogs.tabs.eventTypes"), items: eventTypes },
          { key: "severities", label: t(msgs, "catalogs.tabs.severities"), items: severities },
          { key: "event-statuses", label: t(msgs, "catalogs.tabs.eventStatuses"), items: eventStatuses },
          { key: "sites", label: t(msgs, "catalogs.tabs.sites"), items: sites },
          { key: "areas", label: t(msgs, "catalogs.tabs.areas"), items: areas },
          { key: "projects", label: t(msgs, "catalogs.tabs.projects"), items: projects },
          { key: "shifts", label: t(msgs, "catalogs.tabs.shifts"), items: shifts },
          { key: "contractors", label: t(msgs, "catalogs.tabs.contractors"), items: contractors },
        ]}
      />
    </div>
  )
}
