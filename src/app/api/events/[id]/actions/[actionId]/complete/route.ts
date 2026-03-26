import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string; actionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!["HSE", "SUPERVISOR", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const action = await prisma.correctiveAction.update({
    where: { id: params.actionId },
    data: {
      status: "COMPLETED",
      closedAt: new Date(),
      updatedById: session.user.id,
    },
  })

  return NextResponse.json(action)
}
