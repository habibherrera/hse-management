import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { catalogSchema } from "@/lib/validations"

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { catalog: string } }
) {
  const model = catalogModels[params.catalog]
  if (!model) {
    return NextResponse.json({ error: "Catálogo no encontrado" }, { status: 404 })
  }

  const items = await model.findMany({ orderBy: { sortOrder: "asc" } })
  return NextResponse.json(items)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { catalog: string } }
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
  const parsed = catalogSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const item = await model.create({ data: parsed.data })
    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Nombre o código duplicado" }, { status: 409 })
    }
    throw error
  }
}
