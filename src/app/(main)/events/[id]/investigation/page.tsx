"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { useTranslation } from "@/providers/i18n-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function InvestigationPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslation()
  const eventId = params.id as string
  const [loading, setLoading] = useState(false)
  const [investigation, setInvestigation] = useState<any>(null)
  const [method, setMethod] = useState("FIVE_WHYS")
  const [summary, setSummary] = useState("")
  const [rootCause, setRootCause] = useState("")
  const [findings, setFindings] = useState("")

  useEffect(() => {
    fetch(`/api/events/${eventId}/investigation`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setInvestigation(data)
          setMethod(data.method)
          setSummary(data.summary || "")
          setRootCause(data.rootCause || "")
          setFindings(data.findings || "")
        }
      })
      .catch(() => {})
  }, [eventId])

  async function handleSave(status?: string) {
    setLoading(true)
    try {
      const body: any = { method, summary, rootCause, findings }
      if (status) body.status = status

      const res = await fetch(`/api/events/${eventId}/investigation`, {
        method: investigation ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setInvestigation(data)
      toast.success(
        status === "APPROVED"
          ? t("investigation.approvedToast")
          : status === "IN_REVIEW"
          ? t("investigation.reviewToast")
          : t("investigation.savedToast")
      )

      if (status === "APPROVED") {
        router.push(`/events/${eventId}`)
      }
    } catch {
      toast.error(t("investigation.errorToast"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t("investigation.pageTitle")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("investigation.methodTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("investigation.method")}</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIVE_WHYS">{t("investigation.fiveWhys")}</SelectItem>
                <SelectItem value="CAUSE_TREE">{t("investigation.causeTree")}</SelectItem>
                <SelectItem value="OTHER">{t("investigation.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {method === "FIVE_WHYS" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("investigation.fiveWhysTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("investigation.fiveWhysInstruction")}
            </p>
            <div className="space-y-2">
              <Label>{t("investigation.summary")}</Label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t("investigation.analysisPlaceholder")}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("investigation.rootCause")}</Label>
              <Textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder={t("investigation.rootCauseQuestion")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("investigation.findings")}</Label>
              <Textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder={t("investigation.findingsPlaceholder")}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {method !== "FIVE_WHYS" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("investigation.analysisTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("investigation.summary")}</Label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t("investigation.summaryPlaceholder")}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("investigation.rootCause")}</Label>
              <Textarea
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder={t("investigation.rootCausePlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("investigation.findings")}</Label>
              <Textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder={t("investigation.findingsPlaceholder")}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          {t("common.cancel")}
        </Button>
        <Button variant="secondary" onClick={() => handleSave()} disabled={loading}>
          {t("investigation.saveDraft")}
        </Button>
        {(!investigation || investigation.status === "DRAFT") && (
          <Button onClick={() => handleSave("IN_REVIEW")} disabled={loading}>
            {t("investigation.submitReview")}
          </Button>
        )}
        {investigation?.status === "IN_REVIEW" && (
          <Button onClick={() => handleSave("APPROVED")} disabled={loading}>
            {t("investigation.approve")}
          </Button>
        )}
      </div>
    </div>
  )
}
