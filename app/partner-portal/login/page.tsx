"use client"

import { useRouter } from "next/navigation"
import { KeyRound, Loader2 } from "lucide-react"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { partnerRequest, setPartnerKey } from "@/lib/partner-portal/api"

function getLoginErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Impossible de verifier la cle API"
  }

  if (error.name === "401") {
    return "Cle API invalide"
  }

  if (error.name === "404") {
    return "Endpoint partenaire introuvable sur le backend"
  }

  if (error.name === "502") {
    return "Serveur partenaire inaccessible"
  }

  return "Impossible de verifier la cle API"
}

export default function PartnerLoginPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      await partnerRequest("/api/partner/dashboard/", apiKey.trim())
      setPartnerKey(apiKey.trim())
      router.replace("/partner-portal/dashboard")
    } catch (err) {
      setError(getLoginErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="text-xl">Espace Partenaire TrackPay</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="partner-api-key">API Key</Label>
              <Input
                id="partner-api-key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk_live_xxx"
                required
              />
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading || !apiKey.trim()}>
              {loading && <Loader2 className="animate-spin" />}
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
