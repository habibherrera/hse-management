"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Download } from "lucide-react"

interface Props {
  format: "excel" | "pdf"
}

export function ReportExporter({ format }: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const inputClass = "flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-card px-4 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"

  async function handleExport() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ format })
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)

      const res = await fetch(`/api/reports/export?${params}`)
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-hse.${format === "excel" ? "xlsx" : "pdf"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(t("reports.downloadedToast"))
    } catch {
      toast.error(t("reports.downloadError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t("reports.dateFrom")}</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t("reports.dateTo")}</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
        </div>
      </div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(220,70%,45%)] text-sm font-semibold text-white transition-all duration-200 hover:bg-[hsl(220,70%,40%)] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Download className="h-4 w-4" />
            {format === "excel" ? t("reports.downloadExcel") : t("reports.downloadPdf")}
          </>
        )}
      </button>
    </div>
  )
}
