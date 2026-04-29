"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

interface Catalog {
  id: string
  name: string
  code?: string
}

interface EventFormProps {
  catalogs: {
    eventTypes: Catalog[]
    severities: Catalog[]
    statuses: Catalog[]
    sites: Catalog[]
    areas: Catalog[]
    projects: Catalog[]
    shifts: Catalog[]
    contractors: Catalog[]
    users: { id: string; name: string; role: string }[]
  }
  defaultEventTypeId?: string
}

export function EventForm({ catalogs, defaultEventTypeId }: EventFormProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isConfidential, setIsConfidential] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      eventTypeId: formData.get("eventTypeId"),
      severityId: formData.get("severityId"),
      statusId: formData.get("statusId"),
      siteId: formData.get("siteId"),
      areaId: formData.get("areaId"),
      projectId: formData.get("projectId") || undefined,
      shiftId: formData.get("shiftId") || undefined,
      contractorId: formData.get("contractorId") || undefined,
      description: formData.get("description"),
      eventDateTime: formData.get("eventDateTime"),
      ownerUserId: formData.get("ownerUserId"),
      dueDate: formData.get("dueDate") || undefined,
      isAnonymous,
      isConfidential,
    }

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || t("eventForm.errorToast"))
      }

      const event = await response.json()
      toast.success(t("eventForm.successToast", { eventNumber: event.eventNumber }))
      router.push(`/events/${event.id}`)
    } catch (error: any) {
      toast.error(error.message || t("eventForm.errorToast"))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-card px-4 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/events" className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted/50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("eventForm.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("eventForm.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("eventForm.sectionEvent")}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.eventType")}</label>
              <Select name="eventTypeId" required defaultValue={defaultEventTypeId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.eventTypes.map((tp) => (<SelectItem key={tp.id} value={tp.id}>{tp.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.severity")}</label>
              <Select name="severityId" required>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.severities.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("eventForm.description")}</label>
            <textarea
              name="description"
              placeholder={t("eventForm.descriptionPlaceholder")}
              required
              minLength={10}
              rows={4}
              className="flex w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-card px-4 py-3 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.dateTime")}</label>
              <input type="datetime-local" name="eventDateTime" required className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.status")}</label>
              <Select name="statusId" required>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.statuses.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("eventForm.sectionLocation")}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.site")}</label>
              <Select name="siteId" required>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.sites.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.area")}</label>
              <Select name="areaId" required>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.areas.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("eventForm.project")}</label>
              <Select name="projectId">
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.optional")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("eventForm.shift")}</label>
              <Select name="shiftId">
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.optional")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.shifts.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("eventForm.contractor")}</label>
              <Select name="contractorId">
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.optional")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.contractors.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("eventForm.sectionResponsibility")}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("eventForm.responsible")}</label>
              <Select name="ownerUserId" required>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={t("common.selectPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {catalogs.users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">{t("eventForm.dueDate")}</label>
              <input type="date" name="dueDate" className={inputClass} />
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{t("eventForm.anonymous")}</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{t("eventForm.confidential")}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-11 rounded-xl border px-6 text-sm font-semibold transition-colors hover:bg-muted/50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[hsl(220,70%,45%)] px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-[hsl(220,70%,40%)] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t("eventForm.submit")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
