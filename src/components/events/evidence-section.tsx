"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, Paperclip } from "lucide-react"
import { format } from "date-fns"

interface EvidenceItem {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  createdAt: string | Date
  uploadedBy: { name: string }
}

interface Props {
  eventId: string
  evidence: EvidenceItem[]
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function EvidenceSection({ eventId, evidence }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", files[0])
    formData.append("eventId", eventId)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error()

      toast.success(t("evidence.uploadedToast"))
      router.refresh()
    } catch {
      toast.error(t("evidence.uploadError"))
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Paperclip className="h-5 w-5" />
          {t("evidence.title")} ({evidence.length})
        </CardTitle>
        <div>
          <Input
            type="file"
            id="evidence-upload"
            className="hidden"
            onChange={handleUpload}
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById("evidence-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? t("evidence.uploading") : t("evidence.attach")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {evidence.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {t("evidence.noEvidence")}
          </p>
        ) : (
          <div className="space-y-2">
            {evidence.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(item.fileSize)} - {t("evidence.uploadedBy")} {item.uploadedBy.name} {t("evidence.on")}{" "}
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <a href={`/api/upload/${item.id}`} target="_blank" rel="noopener">
                  <Button size="sm" variant="ghost">{t("common.view")}</Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
