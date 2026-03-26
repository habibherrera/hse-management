import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!["HSE", "SUPERVISOR", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const { statusId } = await request.json()

  const status = await prisma.eventStatus.findUnique({ where: { id: statusId } })
  if (!status) {
    return NextResponse.json({ error: "Estatus no encontrado" }, { status: 404 })
  }

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      statusId,
      closedAt: status.isClosed ? new Date() : null,
      updatedById: session.user.id,
    },
  })

  return NextResponse.json(event)
}
