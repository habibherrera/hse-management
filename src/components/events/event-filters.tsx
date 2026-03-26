"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "@/providers/i18n-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface FilterProps {
  eventTypes: { id: string; name: string }[]
  severities: { id: string; name: string }[]
  eventStatuses: { id: string; name: string }[]
  sites: { id: string; name: string }[]
  areas: { id: string; name: string }[]
}

export function EventFilters({ eventTypes, severities, eventStatuses, sites, areas }: FilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [search, setSearch] = useState(searchParams.get("search") || "")

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/events?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateFilter("search", search)
  }

  function clearFilters() {
    setSearch("")
    router.push("/events")
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={t("events.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-xl border bg-card pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-xl bg-secondary px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
        >
          {t("common.search")}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-xl border px-3 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <Select onValueChange={(v) => updateFilter("eventTypeId", v)} defaultValue={searchParams.get("eventTypeId") || "all"}>
          <SelectTrigger className="h-9 rounded-lg text-xs">
            <SelectValue placeholder={t("events.filterType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allTypes")}</SelectItem>
            {eventTypes.map((tp) => (
              <SelectItem key={tp.id} value={tp.id}>{tp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => updateFilter("severityId", v)} defaultValue={searchParams.get("severityId") || "all"}>
          <SelectTrigger className="h-9 rounded-lg text-xs">
            <SelectValue placeholder={t("events.filterSeverity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allSeverities")}</SelectItem>
            {severities.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => updateFilter("statusId", v)} defaultValue={searchParams.get("statusId") || "all"}>
          <SelectTrigger className="h-9 rounded-lg text-xs">
            <SelectValue placeholder={t("events.filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allStatuses")}</SelectItem>
            {eventStatuses.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => updateFilter("siteId", v)} defaultValue={searchParams.get("siteId") || "all"}>
          <SelectTrigger className="h-9 rounded-lg text-xs">
            <SelectValue placeholder={t("events.filterSite")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allSites")}</SelectItem>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => updateFilter("areaId", v)} defaultValue={searchParams.get("areaId") || "all"}>
          <SelectTrigger className="h-9 rounded-lg text-xs">
            <SelectValue placeholder={t("events.filterArea")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allAreas")}</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
