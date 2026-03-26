import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const evidence = await prisma.evidence.findUnique({
    where: { id: params.id },
  })

  if (!evidence) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  const uploadDir = process.env.UPLOAD_DIR || "./uploads"
  const filePath = path.join(uploadDir, evidence.filePath)

  try {
    const fileBuffer = await readFile(filePath)
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": evidence.mimeType,
        "Content-Disposition": `inline; filename="${evidence.fileName}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado en disco" }, { status: 404 })
  }
}
