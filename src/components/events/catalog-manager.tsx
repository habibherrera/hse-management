"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Settings } from "lucide-react"

interface CatalogItem {
  id: string
  name: string
  code: string
  description?: string | null
  active: boolean
  sortOrder: number
}

interface CatalogSection {
  key: string
  label: string
  items: CatalogItem[]
}

interface Props {
  catalogs: CatalogSection[]
}

export function CatalogManager({ catalogs }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(catalogs[0]?.key || "")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const activeCatalog = catalogs.find((c) => c.key === activeTab)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch(`/api/catalogs/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          code: formData.get("code"),
          description: formData.get("description") || undefined,
          sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error")
      }

      toast.success(t("catalogs.createdToast"))
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || t("catalogs.createError"))
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const res = await fetch(`/api/catalogs/${activeTab}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      })
      if (!res.ok) throw new Error()
      toast.success(active ? t("catalogs.deactivatedToast") : t("catalogs.activatedToast"))
      router.refresh()
    } catch {
      toast.error(t("catalogs.updateError"))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[250px_1fr]">
      <Card>
        <CardContent className="p-2">
          <nav className="space-y-1">
            {catalogs.map((catalog) => (
              <button
                key={catalog.key}
                onClick={() => setActiveTab(catalog.key)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === catalog.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {catalog.label} ({catalog.items.length})
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {activeCatalog?.label}
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("catalogs.add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("catalogs.dialogTitle")} {activeCatalog?.label}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("catalogs.nameLabel")}</Label>
                  <Input name="name" required />
                </div>
                <div className="space-y-2">
                  <Label>{t("catalogs.codeLabel")}</Label>
                  <Input
                    name="code"
                    required
                    placeholder={t("catalogs.codePlaceholder")}
                    pattern="[A-Z0-9_-]+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("catalogs.descriptionLabel")}</Label>
                  <Input name="description" />
                </div>
                <div className="space-y-2">
                  <Label>{t("catalogs.orderLabel")}</Label>
                  <Input name="sortOrder" type="number" defaultValue="0" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? t("common.creating") : t("common.create")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("catalogs.tableHeaders.name")}</TableHead>
                <TableHead>{t("catalogs.tableHeaders.code")}</TableHead>
                <TableHead>{t("catalogs.tableHeaders.description")}</TableHead>
                <TableHead>{t("catalogs.tableHeaders.order")}</TableHead>
                <TableHead>{t("catalogs.tableHeaders.status")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCatalog?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{item.code}</code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.description || "-"}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={item.active ? "success" : "secondary"}>
                      {item.active ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(item.id, item.active)}
                    >
                      {item.active ? t("common.deactivate") : t("common.activate")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
