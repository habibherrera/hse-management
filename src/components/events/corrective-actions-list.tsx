"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, ClipboardCheck, CheckCircle } from "lucide-react"
import { format } from "date-fns"

interface Action {
  id: string
  title: string
  description: string | null
  dueDate: string | Date
  status: string
  closedAt: string | Date | null
  ownerUser: { name: string }
  evidence: any[]
}

interface Props {
  eventId: string
  actions: Action[]
  users: { id: string; name: string; role: string }[]
  canManage: boolean
}

const statusVariants: Record<string, "warning" | "default" | "success" | "danger"> = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  OVERDUE: "danger",
}

export function CorrectiveActionsList({ eventId, actions, users, canManage }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const statusLabels: Record<string, string> = {
    OPEN: t("actions.statusOpen"),
    IN_PROGRESS: t("actions.statusInProgress"),
    COMPLETED: t("actions.statusCompleted"),
    OVERDUE: t("actions.statusOverdue"),
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch(`/api/events/${eventId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description") || undefined,
          ownerUserId: formData.get("ownerUserId"),
          dueDate: formData.get("dueDate"),
        }),
      })

      if (!res.ok) throw new Error()

      toast.success(t("actions.createdToast"))
      setOpen(false)
      router.refresh()
    } catch {
      toast.error(t("actions.createError"))
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(actionId: string) {
    try {
      const res = await fetch(`/api/events/${eventId}/actions/${actionId}/complete`, {
        method: "PATCH",
      })
      if (!res.ok) throw new Error()
      toast.success(t("actions.completedToast"))
      router.refresh()
    } catch {
      toast.error(t("actions.completeError"))
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5" />
          {t("actions.title")} ({actions.length})
        </CardTitle>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.newAction")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("actions.dialogTitle")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("actions.actionTitle")}</Label>
                  <Input name="title" required />
                </div>
                <div className="space-y-2">
                  <Label>{t("actions.description")}</Label>
                  <Textarea name="description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("actions.responsible")}</Label>
                    <Select name="ownerUserId" required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.selectPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("actions.dueDate")}</Label>
                    <Input type="date" name="dueDate" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? t("common.creating") : t("common.create")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {t("actions.noActions")}
          </p>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => {
              const isOverdue = !action.closedAt && new Date(action.dueDate) < new Date()
              const displayStatus = isOverdue && action.status !== "COMPLETED" ? "OVERDUE" : action.status
              return (
                <div key={action.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.title}</span>
                      <Badge variant={statusVariants[displayStatus]}>
                        {statusLabels[displayStatus]}
                      </Badge>
                    </div>
                    {action.description && (
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{t("actions.responsibleLabel")} {action.ownerUser.name}</span>
                      <span>
                        {t("actions.dueLabel")} {format(new Date(action.dueDate), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                  {canManage && action.status !== "COMPLETED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(action.id)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      {t("actions.complete")}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
