"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props {
  eventId: string
  currentStatusId: string
  statuses: { id: string; name: string; code: string; isClosed: boolean }[]
}

export function EventStatusChanger({ eventId, currentStatusId, statuses }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const [statusId, setStatusId] = useState(currentStatusId)
  const [loading, setLoading] = useState(false)

  async function handleChange() {
    if (statusId === currentStatusId) return
    setLoading(true)

    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId }),
      })

      if (!res.ok) throw new Error()

      toast.success(t("eventDetail.statusUpdated"))
      router.refresh()
    } catch {
      toast.error(t("eventDetail.statusError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={statusId} onValueChange={setStatusId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleChange}
        disabled={loading || statusId === currentStatusId}
        size="sm"
      >
        {loading ? "..." : t("eventDetail.changeStatus")}
      </Button>
    </div>
  )
}
