import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const eventId = formData.get("eventId") as string | null
  const correctiveActionId = formData.get("correctiveActionId") as string | null

  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE || "10485760")
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { url } = await uploadToCloudinary(buffer, file.name, file.type)

  const evidence = await prisma.evidence.create({
    data: {
      fileName: file.name,
      filePath: url,
      fileSize: file.size,
      mimeType: file.type,
      eventId: eventId || null,
      correctiveActionId: correctiveActionId || null,
      uploadedById: (session.user as any).id,
    },
  })

  return NextResponse.json(evidence, { status: 201 })
}
