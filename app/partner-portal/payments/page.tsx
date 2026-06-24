"use client"

import { Download } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { PageState } from "@/components/partner-portal/page-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPartnerKey, partnerRequest } from "@/lib/partner-portal/api"
import { displayDate, formatMru, listFromResponse, PartnerPayment } from "@/lib/partner-portal/types"

const filters = [
  { label: "Tous", value: "ALL" },
  { label: "Complétés", value: "COMPLETED" },
  { label: "En attente", value: "PENDING" },
  { label: "Échoués", value: "FAILED" },
]

export default function PartnerPaymentsPage() {
  const [payments, setPayments] = useState<PartnerPayment[]>([])
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load(status = filter) {
    const key = getPartnerKey()
    if (!key) return

    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ limit: "20" })

      if (status !== "ALL") {
        params.set("status", status)
      }

      const payload = await partnerRequest<unknown>(`/api/partner/payments/?${params.toString()}`, key)
      setPayments(listFromResponse<PartnerPayment>(payload, ["payments"]))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const key = getPartnerKey()
    if (!key) return

    partnerRequest<unknown>("/api/partner/payments/?limit=20", key)
      .then((payload) => {
        setPayments(listFromResponse<PartnerPayment>(payload, ["payments"]))
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const visiblePayments = useMemo(() => payments, [payments])

  async function selectFilter(status: string) {
    setFilter(status)
    await load(status)
  }

  function exportCsv() {
    const rows = [
      ["Date", "Email payeur", "Plan", "Montant", "Référence", "Statut"],
      ...visiblePayments.map((payment) => [
        displayDate(payment.date ?? payment.created_at),
        payment.payer_email ?? payment.email ?? "",
        payment.plan_name ?? payment.plan ?? "",
        String(payment.amount ?? ""),
        payment.reference ?? "",
        payment.status ?? "",
      ]),
    ]

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "paiements-partenaire.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <PageState title="Chargement des paiements..." />
  if (error) return <PageState title="Impossible de charger les paiements" onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Paiements</h1>
          <p className="text-sm text-muted-foreground">Suivez et exportez les paiements reçus.</p>
        </div>
        <Button type="button" variant="outline" onClick={exportCsv}>
          <Download />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={filter === item.value ? "default" : "outline"}
            onClick={() => selectFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <Card className="rounded-lg">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Email payeur</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visiblePayments.map((payment, index) => (
                <TableRow key={payment.id ?? `${payment.reference}-${index}`}>
                  <TableCell>{displayDate(payment.date ?? payment.created_at)}</TableCell>
                  <TableCell>{payment.payer_email ?? payment.email ?? "-"}</TableCell>
                  <TableCell>{payment.plan_name ?? payment.plan ?? "-"}</TableCell>
                  <TableCell>{formatMru(payment.amount)}</TableCell>
                  <TableCell>{payment.reference ?? "-"}</TableCell>
                  <TableCell>
                    <PaymentStatus status={payment.status} />
                  </TableCell>
                </TableRow>
              ))}
              {visiblePayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    Aucun paiement
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

function PaymentStatus({ status }: { status?: string }) {
  if (status === "COMPLETED") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">COMPLETED</Badge>
  }

  if (status === "FAILED") {
    return <Badge variant="destructive">FAILED</Badge>
  }

  return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{status ?? "PENDING"}</Badge>
}
