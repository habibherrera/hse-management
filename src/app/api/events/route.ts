import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { eventCreateSchema } from "@/lib/validations"
import { sendEmail, eventCreatedEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const eventTypeId = searchParams.get("eventTypeId")
  const severityId = searchParams.get("severityId")
  const statusId = searchParams.get("statusId")
  const siteId = searchParams.get("siteId")
  const areaId = searchParams.get("areaId")
  const ownerUserId = searchParams.get("ownerUserId")
  const shiftId = searchParams.get("shiftId")
  const contractorId = searchParams.get("contractorId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const search = searchParams.get("search")

  const where: any = {}

  // Role-based filtering
  if (session.user.role === "REPORTER") {
    where.OR = [
      { createdById: session.user.id },
      { reporterUserId: session.user.id },
    ]
  }

  if (eventTypeId) where.eventTypeId = eventTypeId
  if (severityId) where.severityId = severityId
  if (statusId) where.statusId = statusId
  if (siteId) where.siteId = siteId
  if (areaId) where.areaId = areaId
  if (ownerUserId) where.ownerUserId = ownerUserId
  if (shiftId) where.shiftId = shiftId
  if (contractorId) where.contractorId = contractorId
  if (dateFrom || dateTo) {
    where.eventDateTime = {}
    if (dateFrom) where.eventDateTime.gte = new Date(dateFrom)
    if (dateTo) where.eventDateTime.lte = new Date(dateTo)
  }
  if (search) {
    where.OR = [
      { eventNumber: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        eventType: true,
        severity: true,
        status: true,
        site: true,
        area: true,
        ownerUser: { select: { id: true, name: true, email: true } },
        _count: { select: { correctiveActions: true } },
      },
      orderBy: { reportedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = eventCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Generate event number
  const sequence = await prisma.eventSequence.findUnique({
    where: { id: "singleton" },
  })

  const currentYear = new Date().getFullYear()
  let counter = 1

  if (sequence) {
    if (sequence.year === currentYear) {
      counter = sequence.counter + 1
    }
    await prisma.eventSequence.update({
      where: { id: "singleton" },
      data: { year: currentYear, counter },
    })
  } else {
    await prisma.eventSequence.create({
      data: { id: "singleton", year: currentYear, counter: 1 },
    })
  }

  const eventNumber = `EVT-${currentYear}-${String(counter).padStart(4, "0")}`

  const event = await prisma.event.create({
    data: {
      eventNumber,
      eventTypeId: data.eventTypeId,
      severityId: data.severityId,
      statusId: data.statusId,
      siteId: data.siteId,
      areaId: data.areaId,
      projectId: data.projectId || null,
      shiftId: data.shiftId || null,
      contractorId: data.contractorId || null,
      description: data.description,
      eventDateTime: new Date(data.eventDateTime),
      ownerUserId: data.ownerUserId,
      isAnonymous: data.isAnonymous,
      isConfidential: data.isConfidential,
      reporterUserId: data.isAnonymous ? null : session.user.id,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdById: session.user.id,
      updatedById: session.user.id,
    },
    include: {
      ownerUser: true,
      eventType: true,
      severity: true,
    },
  })

  // Send email notification
  try {
    const emailData = eventCreatedEmail(
      event.eventNumber,
      event.description,
      event.ownerUser.name
    )

    // Notify owner
    await sendEmail({
      to: event.ownerUser.email,
      ...emailData,
    })

    // Notify HSE users
    const hseUsers = await prisma.user.findMany({
      where: { role: "HSE", active: true },
      select: { email: true },
    })
    if (hseUsers.length > 0) {
      await sendEmail({
        to: hseUsers.map((u) => u.email),
        ...emailData,
      })
    }
  } catch {
    // Don't fail the request if email fails
  }

  return NextResponse.json(event, { status: 201 })
}
