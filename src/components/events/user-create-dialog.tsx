"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function UserCreateDialog() {
  const router = useRouter()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputClass = "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-card px-4 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          role: formData.get("role"),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error")
      }

      toast.success(t("users.createdToast"))
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || t("users.createError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-[hsl(220,70%,45%)] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[hsl(220,70%,40%)] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          {t("users.newUser")}
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">{t("users.createUser")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("users.nameLabel")}</label>
            <input name="name" required className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("users.emailLabel")}</label>
            <input name="email" type="email" required className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("users.passwordLabel")}</label>
            <input name="password" type="password" required minLength={6} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">{t("users.roleLabel")}</label>
            <Select name="role" required>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={t("users.rolePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REPORTER">{t("roles.REPORTER")}</SelectItem>
                <SelectItem value="SUPERVISOR">{t("roles.SUPERVISOR")}</SelectItem>
                <SelectItem value="HSE">{t("roles.HSE")}</SelectItem>
                <SelectItem value="MANAGER">{t("roles.MANAGER")}</SelectItem>
                <SelectItem value="ADMIN">{t("roles.ADMIN")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[hsl(220,70%,45%)] px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-[hsl(220,70%,40%)] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? t("common.creating") : t("users.createUser")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
