import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions"
import { EventForm } from "@/components/events/event-form"

export default async function NewEventPage() {
  await requireAuth()

  const [eventTypes, severities, statuses, sites, areas, projects, shifts, contractors, users] =
    await Promise.all([
      prisma.eventType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.severity.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.eventStatus.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.site.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.area.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.project.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.shift.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.contractor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      }),
    ])

  return (
    <div className="mx-auto max-w-3xl">
      <EventForm
        catalogs={{ eventTypes, severities, statuses, sites, areas, projects, shifts, contractors, users }}
      />
    </div>
  )
}
