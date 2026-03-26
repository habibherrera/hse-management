import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userCreateSchema } from "@/lib/validations"
import { hash } from "bcryptjs"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = userCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return NextResponse.json({ error: "Email ya registrado" }, { status: 409 })
  }

  const passwordHash = await hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: passwordHash,
      role: data.role,
    },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user, { status: 201 })
}
