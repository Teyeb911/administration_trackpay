"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const jsExample = `const response = await fetch("https://trackpay.mr/api/payments/create/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "sk_live_xxx"
  },
  body: JSON.stringify({
    plan_id: "votre-plan-id",
    callback_url: "https://votre-site.mr/webhook",
    reference: "ID_interne_de_votre_user"
  })
})

const { payment_url } = await response.json()
window.location.href = payment_url`

const pythonExample = `import requests

response = requests.post(
    "https://trackpay.mr/api/payments/create/",
    headers={"X-API-Key": "sk_live_xxx"},
    json={
        "plan_id": "votre-plan-id",
        "callback_url": "https://votre-site.mr/webhook",
        "reference": "ID_interne_de_votre_user",
    },
)

payment_url = response.json()["payment_url"]`

export default function PartnerDocsPage() {
  const [language, setLanguage] = useState<"python" | "javascript">("python")

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Documentation</h1>
        <p className="text-sm text-muted-foreground">Intégration des paiements partenaires TrackPay.</p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Étapes d&apos;intégration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Step
            title="ÉTAPE 1 — Récupérer vos plan_id"
            body='Allez dans "Mes Plans" et copiez le plan_id du plan souhaité.'
          />
          <section className="space-y-3">
            <Step title="ÉTAPE 2 — Créer un paiement" body="Envoyez une requête POST avec votre clé API." />
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-50">
              <code>{`POST https://trackpay.mr/api/payments/create/
Headers: { "X-API-Key": "sk_live_xxx" }
Body:
{
  "plan_id": "votre-plan-id",
  "callback_url": "https://votre-site.mr/webhook",
  "reference": "ID_interne_de_votre_user"
}
Response:
{
  "payment_url": "https://trackpay.mr/pay/xxx"
}`}</code>
            </pre>
          </section>
          <Step title="ÉTAPE 3 — Rediriger votre utilisateur" body="window.location.href = payment_url" />
          <section className="space-y-3">
            <Step title="ÉTAPE 4 — Recevoir le webhook" body="TrackPay envoie le résultat vers votre callback_url." />
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-50">
              <code>{`POST vers votre callback_url:
{
  "status": "COMPLETED",
  "reference": "ID_interne",
  "subscription_type": "Pro",
  "subscription_period": "mensuel",
  "payer_email": "trader@gmail.com",
  "amount": "500.00"
}`}</code>
            </pre>
          </section>
          <Step
            title="ÉTAPE 5 — Vérifier le header webhook"
            body='X-Webhook-Secret doit correspondre à votre Webhook Secret dans "Identifiants API".'
          />
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Exemples de code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={language === "python" ? "default" : "outline"}
              onClick={() => setLanguage("python")}
            >
              Python
            </Button>
            <Button
              type="button"
              variant={language === "javascript" ? "default" : "outline"}
              onClick={() => setLanguage("javascript")}
            >
              JavaScript
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-50">
            <code>{language === "python" ? pythonExample : jsExample}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <section className="space-y-1">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{body}</p>
    </section>
  )
}
