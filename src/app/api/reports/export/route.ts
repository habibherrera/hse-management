import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const exportFormat = searchParams.get("format") || "excel"
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  const where: any = {}
  if (dateFrom || dateTo) {
    where.eventDateTime = {}
    if (dateFrom) where.eventDateTime.gte = new Date(dateFrom)
    if (dateTo) where.eventDateTime.lte = new Date(dateTo)
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      eventType: true,
      severity: true,
      status: true,
      site: true,
      area: true,
      ownerUser: { select: { name: true } },
      _count: { select: { correctiveActions: true } },
    },
    orderBy: { reportedAt: "desc" },
  })

  if (exportFormat === "excel") {
    const data = events.map((e) => ({
      "Número": e.eventNumber,
      "Tipo": e.eventType.name,
      "Severidad": e.severity.name,
      "Estatus": e.status.name,
      "Descripción": e.description,
      "Sitio": e.site.name,
      "Área": e.area.name,
      "Responsable": e.ownerUser.name,
      "Fecha Evento": format(e.eventDateTime, "dd/MM/yyyy HH:mm", { locale: es }),
      "Fecha Registro": format(e.reportedAt, "dd/MM/yyyy HH:mm", { locale: es }),
      "Acciones Correctivas": e._count.correctiveActions,
      "Cerrado": e.closedAt ? format(e.closedAt, "dd/MM/yyyy", { locale: es }) : "",
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, "Eventos")

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="reporte-hse.xlsx"',
      },
    })
  }

  // PDF
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Reporte HSE", 14, 22)
  doc.setFontSize(10)
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, 14, 30)
  doc.text(`Total de eventos: ${events.length}`, 14, 36)

  const tableData = events.map((e) => [
    e.eventNumber,
    e.eventType.name,
    e.severity.name,
    e.status.name,
    e.site.name,
    e.ownerUser.name,
    format(e.eventDateTime, "dd/MM/yy", { locale: es }),
  ])

  autoTable(doc, {
    startY: 42,
    head: [["Número", "Tipo", "Severidad", "Estatus", "Sitio", "Responsable", "Fecha"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reporte-hse.pdf"',
    },
  })
}
