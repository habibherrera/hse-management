import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const investigation = await prisma.investigation.findUnique({
    where: { eventId: params.id },
    include: {
      completedBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  })

  return NextResponse.json(investigation || {})
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!["HSE", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const body = await request.json()

  const investigation = await prisma.investigation.create({
    data: {
      eventId: params.id,
      method: body.method || "FIVE_WHYS",
      summary: body.summary || null,
      rootCause: body.rootCause || null,
      findings: body.findings || null,
      status: body.status || "DRAFT",
      completedById: body.status === "IN_REVIEW" ? session.user.id : null,
      completedAt: body.status === "IN_REVIEW" ? new Date() : null,
    },
  })

  return NextResponse.json(investigation, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (!["HSE", "ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const body = await request.json()
  const data: any = {
    method: body.method,
    summary: body.summary || null,
    rootCause: body.rootCause || null,
    findings: body.findings || null,
  }

  if (body.status) {
    data.status = body.status
    if (body.status === "IN_REVIEW") {
      data.completedById = session.user.id
      data.completedAt = new Date()
    }
    if (body.status === "APPROVED") {
      data.approvedById = session.user.id
      data.approvedAt = new Date()
    }
  }

  const investigation = await prisma.investigation.update({
    where: { eventId: params.id },
    data,
  })

  return NextResponse.json(investigation)
}
