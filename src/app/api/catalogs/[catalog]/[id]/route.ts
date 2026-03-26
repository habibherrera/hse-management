import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const catalogModels: Record<string, any> = {
  "event-types": prisma.eventType,
  "severities": prisma.severity,
  "event-statuses": prisma.eventStatus,
  "sites": prisma.site,
  "areas": prisma.area,
  "projects": prisma.project,
  "shifts": prisma.shift,
  "contractors": prisma.contractor,
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { catalog: string; id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const model = catalogModels[params.catalog]
  if (!model) {
    return NextResponse.json({ error: "Catálogo no encontrado" }, { status: 404 })
  }

  const body = await request.json()
  const item = await model.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(item)
}
