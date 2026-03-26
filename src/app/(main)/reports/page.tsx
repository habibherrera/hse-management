import { requirePermission } from "@/lib/permissions"
import { cookies } from "next/headers"
import { getMessages, t, type Locale } from "@/lib/i18n"
import { ReportExporter } from "@/components/events/report-exporter"
import { FileSpreadsheet, FileText } from "lucide-react"

export default async function ReportsPage() {
  await requirePermission("report:export")
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value as Locale) || "es"
  const msgs = getMessages(locale)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t(msgs, "reports.title")}</h1>
        <p className="text-muted-foreground mt-1">{t(msgs, "reports.subtitle")}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold">{t(msgs, "reports.exportExcel")}</h3>
              <p className="text-xs text-muted-foreground">{t(msgs, "reports.excelSubtitle")}</p>
            </div>
          </div>
          <ReportExporter format="excel" />
        </div>

        <div className="rounded-xl border bg-card p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold">{t(msgs, "reports.exportPdf")}</h3>
              <p className="text-xs text-muted-foreground">{t(msgs, "reports.pdfSubtitle")}</p>
            </div>
          </div>
          <ReportExporter format="pdf" />
        </div>
      </div>
    </div>
  )
}
