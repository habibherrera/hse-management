import { differenceInDays } from "date-fns"
import { prisma } from "./prisma"

export type SlaStatus = "green" | "yellow" | "red"

export async function getSlaForEvent(eventTypeId: string, severityId: string) {
  // Try specific rule first (both type and severity)
  let rule = await prisma.slaRule.findFirst({
    where: { eventTypeId, severityId, active: true },
  })

  // Fallback to severity-only rule
  if (!rule) {
    rule = await prisma.slaRule.findFirst({
      where: { severityId, eventTypeId: null, active: true },
    })
  }

  // Fallback to type-only rule
  if (!rule) {
    rule = await prisma.slaRule.findFirst({
      where: { eventTypeId, severityId: null, active: true },
    })
  }

  return rule
}

export function calculateSlaStatus(
  createdAt: Date,
  maxDaysToClose: number,
  closedAt: Date | null
): SlaStatus {
  const now = closedAt || new Date()
  const elapsed = differenceInDays(now, createdAt)
  const remaining = maxDaysToClose - elapsed

  if (closedAt && elapsed <= maxDaysToClose) return "green"
  if (remaining < 0) return "red"
  if (remaining <= Math.ceil(maxDaysToClose * 0.25)) return "yellow"
  return "green"
}

export function getSlaColor(status: SlaStatus): string {
  switch (status) {
    case "green": return "#22C55E"
    case "yellow": return "#EAB308"
    case "red": return "#EF4444"
  }
}
