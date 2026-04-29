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

  const evidence = await prisma.evidence.findUnique({
    where: { id: params.id },
  })

  if (!evidence) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }

  // filePath now stores the Cloudinary URL — redirect directly
  return NextResponse.redirect(evidence.filePath)
}
