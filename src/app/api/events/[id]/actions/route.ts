import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { correctiveActionSchema } from "@/lib/validations"

export async function POST(
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

  const body = await request.json()
  const parsed = correctiveActionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  const action = await prisma.correctiveAction.create({
    data: {
      eventId: params.id,
      title: data.title,
      description: data.description || null,
      ownerUserId: data.ownerUserId,
      dueDate: new Date(data.dueDate),
      createdById: session.user.id,
      updatedById: session.user.id,
    },
  })

  return NextResponse.json(action, { status: 201 })
}
