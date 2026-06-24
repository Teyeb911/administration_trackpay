"use client"

import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react"
import { useEffect, useState } from "react"

import { PageState } from "@/components/partner-portal/page-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPartnerKey, PARTNER_API_BASE_URL, partnerRequest } from "@/lib/partner-portal/api"
import { PartnerCredentials } from "@/lib/partner-portal/types"

export default function PartnerCredentialsPage() {
  const [credentials, setCredentials] = useState<PartnerCredentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  async function load() {
    const key = getPartnerKey()
    if (!key) return

    setLoading(true)
    setError(false)
    try {
      setCredentials(await partnerRequest<PartnerCredentials>("/api/partner/credentials/", key))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const key = getPartnerKey()
    if (!key) return

    partnerRequest<PartnerCredentials>("/api/partner/credentials/", key)
      .then((payload) => {
        setCredentials(payload)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1500)
  }

  if (loading) return <PageState title="Chargement des identifiants..." />
  if (error || !credentials) return <PageState title="Impossible de charger les identifiants" onRetry={load} />

  const endpoint =
    credentials.gateway_endpoint ??
    credentials.payment_endpoint ??
    `${PARTNER_API_BASE_URL}/api/payments/create/`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Identifiants API</h1>
        <p className="text-sm text-muted-foreground">Copiez vos clés pour intégrer TrackPay à votre service.</p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Identifiants API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SecretRow
            label="API Key"
            value={credentials.api_key ?? ""}
            visible={visible.api_key}
            copied={copied === "api_key"}
            onToggle={() => setVisible((current) => ({ ...current, api_key: !current.api_key }))}
            onCopy={() => copy("api_key", credentials.api_key ?? "")}
          />
          <SecretRow
            label="Webhook Secret"
            value={credentials.webhook_secret ?? ""}
            visible={visible.webhook_secret}
            copied={copied === "webhook_secret"}
            onToggle={() =>
              setVisible((current) => ({ ...current, webhook_secret: !current.webhook_secret }))
            }
            onCopy={() => copy("webhook_secret", credentials.webhook_secret ?? "")}
          />
          <SecretRow
            label="Endpoint de paiement"
            value={endpoint}
            visible
            copied={copied === "endpoint"}
            onCopy={() => copy("endpoint", endpoint)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function mask(value: string) {
  if (!value) {
    return "-"
  }

  if (value.length <= 12) {
    return "••••••••"
  }

  return `${value.slice(0, 8)}••••••••${value.slice(-4)}`
}

function SecretRow({
  label,
  value,
  visible,
  copied,
  onToggle,
  onCopy,
}: {
  label: string
  value: string
  visible?: boolean
  copied: boolean
  onToggle?: () => void
  onCopy: () => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-h-9 flex-1 overflow-x-auto rounded-lg border bg-muted px-3 py-2 text-sm">
          {visible ? value || "-" : mask(value)}
        </code>
        <div className="flex gap-2">
          {onToggle && (
            <Button type="button" variant="outline" size="icon" onClick={onToggle} title="Afficher ou masquer">
              {visible ? <EyeOff /> : <Eye />}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onCopy} disabled={!value}>
            {copied ? <Check /> : <Copy />}
            Copier
          </Button>
        </div>
      </div>
    </div>
  )
}
