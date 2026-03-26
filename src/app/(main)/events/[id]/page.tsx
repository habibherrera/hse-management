import { notFound } from "next/navigation"
import Link from "next/link"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions"
import { getMessages, t, type Locale } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { ArrowLeft, FileText, ClipboardCheck, Search } from "lucide-react"
import { EventStatusChanger } from "@/components/events/event-status-changer"
import { CorrectiveActionsList } from "@/components/events/corrective-actions-list"
import { EvidenceSection } from "@/components/events/evidence-section"
import { getSlaForEvent, calculateSlaStatus, getSlaColor } from "@/lib/sla"

interface Props {
  params: { id: string }
}

export default async function EventDetailPage({ params }: Props) {
  const session = await requireAuth()
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"
  const msgs = getMessages(locale)
  const dateLocale = locale === "en" ? enUS : es

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      eventType: true,
      severity: true,
      status: true,
      site: true,
      area: true,
      project: true,
      shift: true,
      contractor: true,
      ownerUser: { select: { id: true, name: true, email: true } },
      reporterUser: { select: { name: true } },
      createdBy: { select: { name: true } },
      correctiveActions: {
        include: {
          ownerUser: { select: { name: true } },
          evidence: true,
        },
        orderBy: { createdAt: "desc" },
      },
      investigation: {
        include: {
          completedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
        },
      },
      evidence: {
        include: { uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!event) notFound()

  const slaRule = await getSlaForEvent(event.eventTypeId, event.severityId)
  let slaStatus = null
  if (slaRule) {
    slaStatus = calculateSlaStatus(event.reportedAt, slaRule.maxDaysToClose, event.closedAt)
  }

  const statuses = await prisma.eventStatus.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  })

  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, role: true },
  })

  const isAccident = event.eventType.code === "ACCIDENTE"
  const canChangeStatus = ["HSE", "SUPERVISOR", "ADMIN"].includes(session.user.role)
  const canManageActions = ["HSE", "SUPERVISOR", "ADMIN"].includes(session.user.role)
  const canInvestigate = ["HSE", "ADMIN"].includes(session.user.role)

  const invMethodLabels: Record<string, string> = {
    FIVE_WHYS: t(msgs, "investigation.fiveWhys"),
    CAUSE_TREE: t(msgs, "investigation.causeTree"),
    OTHER: t(msgs, "investigation.other"),
  }

  const invStatusLabels: Record<string, string> = {
    DRAFT: t(msgs, "investigation.statusDraft"),
    IN_REVIEW: t(msgs, "investigation.statusInReview"),
    APPROVED: t(msgs, "investigation.statusApproved"),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{event.eventNumber}</h1>
              <Badge variant={event.status.isClosed ? "success" : "warning"}>
                {event.status.name}
              </Badge>
              {slaStatus && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getSlaColor(slaStatus) }}
                  title={`SLA: ${slaStatus}`}
                />
              )}
            </div>
            <p className="text-muted-foreground">{event.eventType.name}</p>
          </div>
        </div>

        {canChangeStatus && !event.status.isClosed && (
          <EventStatusChanger
            eventId={event.id}
            currentStatusId={event.statusId}
            statuses={statuses}
          />
        )}
      </div>

      {/* Event info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t(msgs, "eventDetail.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.description")}</span>
              <p className="mt-1">{event.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.severity")}</span>
                <p>
                  <Badge style={{ backgroundColor: event.severity.color, color: "#fff" }}>
                    {event.severity.name}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.eventDate")}</span>
                <p>{format(event.eventDateTime, "dd/MM/yyyy HH:mm", { locale: dateLocale })}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.reportDate")}</span>
                <p>{format(event.reportedAt, "dd/MM/yyyy HH:mm", { locale: dateLocale })}</p>
              </div>
              {event.dueDate && (
                <div>
                  <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.dueDate")}</span>
                  <p>{format(event.dueDate, "dd/MM/yyyy", { locale: dateLocale })}</p>
                </div>
              )}
              {event.closedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.closeDate")}</span>
                  <p>{format(event.closedAt, "dd/MM/yyyy HH:mm", { locale: dateLocale })}</p>
                </div>
              )}
            </div>
            {event.isAnonymous && <Badge variant="secondary">{t(msgs, "eventDetail.anonymous")}</Badge>}
            {event.isConfidential && <Badge variant="secondary">{t(msgs, "eventDetail.confidential")}</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t(msgs, "eventDetail.locationAndResponsible")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.site")}</span>
                <p>{event.site.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.area")}</span>
                <p>{event.area.name}</p>
              </div>
              {event.project && (
                <div>
                  <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.project")}</span>
                  <p>{event.project.name}</p>
                </div>
              )}
              {event.shift && (
                <div>
                  <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.shift")}</span>
                  <p>{event.shift.name}</p>
                </div>
              )}
              {event.contractor && (
                <div>
                  <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.contractor")}</span>
                  <p>{event.contractor.name}</p>
                </div>
              )}
            </div>
            <div className="border-t pt-3">
              <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.responsible")}</span>
              <p className="font-medium">{event.ownerUser.name}</p>
              <p className="text-sm text-muted-foreground">{event.ownerUser.email}</p>
            </div>
            {event.reporterUser && (
              <div>
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.reportedBy")}</span>
                <p>{event.reporterUser.name}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.registeredBy")}</span>
              <p>{event.createdBy.name}</p>
            </div>
            {slaRule && (
              <div className="border-t pt-3">
                <span className="text-sm text-muted-foreground">{t(msgs, "eventDetail.sla")}</span>
                <p>{slaRule.maxDaysToClose} {t(msgs, "common.daysToClose")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evidence */}
      <EvidenceSection eventId={event.id} evidence={event.evidence} />

      {/* Corrective Actions */}
      <CorrectiveActionsList
        eventId={event.id}
        actions={event.correctiveActions}
        users={users}
        canManage={canManageActions}
      />

      {/* Investigation (only for accidents) */}
      {isAccident && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              {t(msgs, "investigation.title")}
            </CardTitle>
            {!event.investigation && canInvestigate && (
              <Link href={`/events/${event.id}/investigation`}>
                <Button size="sm">{t(msgs, "investigation.startInvestigation")}</Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {event.investigation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      event.investigation.status === "APPROVED"
                        ? "success"
                        : event.investigation.status === "IN_REVIEW"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {invStatusLabels[event.investigation.status]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t(msgs, "investigation.method")}: {invMethodLabels[event.investigation.method]}
                  </span>
                </div>
                {event.investigation.summary && (
                  <div>
                    <span className="text-sm font-medium">{t(msgs, "investigation.summary")}</span>
                    <p className="text-sm mt-1">{event.investigation.summary}</p>
                  </div>
                )}
                {event.investigation.rootCause && (
                  <div>
                    <span className="text-sm font-medium">{t(msgs, "investigation.rootCause")}</span>
                    <p className="text-sm mt-1">{event.investigation.rootCause}</p>
                  </div>
                )}
                {event.investigation.findings && (
                  <div>
                    <span className="text-sm font-medium">{t(msgs, "investigation.findings")}</span>
                    <p className="text-sm mt-1">{event.investigation.findings}</p>
                  </div>
                )}
                {canInvestigate && (
                  <Link href={`/events/${event.id}/investigation`}>
                    <Button variant="outline" size="sm">{t(msgs, "investigation.editInvestigation")}</Button>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {t(msgs, "investigation.noInvestigation")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
