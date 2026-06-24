"use client"

import { CheckCircle2, Clock3, LogOut, WalletCards } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { PageState } from "@/components/partner-portal/page-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { clearPartnerKey, getPartnerKey, partnerRequest } from "@/lib/partner-portal/api"
import {
  displayDate,
  formatMru,
  getPartnerDashboardBalance,
  getPartnerDashboardPayments,
  getPartnerPaidCount,
  getPartnerPendingCount,
  PartnerDashboard,
  PartnerPayment,
} from "@/lib/partner-portal/types"

export default function PartnerDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<PartnerDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    const key = getPartnerKey()
    if (!key) return

    setLoading(true)
    setError(false)
    try {
      setData(await partnerRequest<PartnerDashboard>("/api/partner/dashboard/", key))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const key = getPartnerKey()
    if (!key) return

    partnerRequest<PartnerDashboard>("/api/partner/dashboard/", key)
      .then((payload) => {
        setData(payload)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    clearPartnerKey()
    router.replace("/partner-portal/login")
  }

  if (loading) return <PageState title="Chargement du dashboard..." />
  if (error || !data) return <PageState title="Impossible de charger le dashboard" onRetry={load} />

  const latestPayments: PartnerPayment[] = getPartnerDashboardPayments(data)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bonjour, {data.partner_name ?? data.name ?? "Partenaire"}</h1>
          <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de votre activité TrackPay</p>
        </div>
        <Button type="button" variant="outline" onClick={logout}>
          <LogOut />
          Déconnexion
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={WalletCards} label="Solde" value={formatMru(getPartnerDashboardBalance(data))} />
        <StatCard icon={CheckCircle2} label="Payé" value={String(getPartnerPaidCount(data))} />
        <StatCard icon={Clock3} label="En attente" value={String(getPartnerPendingCount(data))} />
      </div>

      <Card className="rounded-lg">
        <CardContent className="py-2">
          <p className="text-sm text-muted-foreground">Revenus totaux</p>
          <p className="mt-1 text-2xl font-semibold">{formatMru(data.total_revenue ?? data.revenus_totaux)}</p>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Derniers paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payeur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestPayments.map((payment, index) => (
                <TableRow key={payment.id ?? `${payment.reference}-${index}`}>
                  <TableCell>{payment.payer_email ?? payment.email ?? "-"}</TableCell>
                  <TableCell>{payment.plan_name ?? payment.plan ?? "-"}</TableCell>
                  <TableCell>{formatMru(payment.amount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{displayDate(payment.date ?? payment.created_at)}</TableCell>
                </TableRow>
              ))}
              {latestPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                    Aucun paiement récent
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center gap-4 py-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (status === "COMPLETED") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">COMPLETED</Badge>
  }

  if (status === "FAILED") {
    return <Badge variant="destructive">FAILED</Badge>
  }

  return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status ?? "PENDING"}</Badge>
}
