"use client"

import { Check, Copy, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"

import { PageState } from "@/components/partner-portal/page-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPartnerKey, partnerRequest } from "@/lib/partner-portal/api"
import { formatMru, listFromResponse, PartnerPlan } from "@/lib/partner-portal/types"

type PlanForm = {
  name: string
  amount: string
  period: string
}

const emptyForm: PlanForm = {
  name: "",
  amount: "",
  period: "mensuel",
}

export default function PartnerPlansPage() {
  const [plans, setPlans] = useState<PartnerPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PartnerPlan | null>(null)
  const [form, setForm] = useState<PlanForm>(emptyForm)
  const [copied, setCopied] = useState<string | null>(null)

  async function load() {
    const key = getPartnerKey()
    if (!key) return

    setLoading(true)
    setError(false)
    try {
      const payload = await partnerRequest<unknown>("/api/partner/plans/", key)
      setPlans(listFromResponse<PartnerPlan>(payload, ["plans"]))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const key = getPartnerKey()
    if (!key) return

    partnerRequest<unknown>("/api/partner/plans/", key)
      .then((payload) => {
        setPlans(listFromResponse<PartnerPlan>(payload, ["plans"]))
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  function startCreate() {
    setEditingPlan(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function startEdit(plan: PartnerPlan) {
    setEditingPlan(plan)
    setForm({
      name: plan.name ?? "",
      amount: String(plan.amount ?? ""),
      period: plan.period ?? "mensuel",
    })
    setOpen(true)
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const key = getPartnerKey()
    if (!key) return

    setSaving(true)
    const id = editingPlan?.id ?? editingPlan?.plan_id

    try {
      await partnerRequest(
        editingPlan ? `/api/partner/plans/${id}/` : "/api/partner/plans/",
        key,
        {
          method: editingPlan ? "PUT" : "POST",
          body: {
            name: form.name,
            amount: form.amount,
            period: form.period,
          },
        }
      )
      setOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function deletePlan(plan: PartnerPlan) {
    const key = getPartnerKey()
    const id = plan.id ?? plan.plan_id
    if (!key || !id) return

    await partnerRequest(`/api/partner/plans/${id}/`, key, { method: "DELETE" })
    await load()
  }

  async function copyPlanId(planId: string) {
    await navigator.clipboard.writeText(planId)
    setCopied(planId)
    window.setTimeout(() => setCopied(null), 1500)
  }

  if (loading) return <PageState title="Chargement des plans..." />
  if (error) return <PageState title="Impossible de charger les plans" onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mes Plans</h1>
          <p className="text-sm text-muted-foreground">Gérez les offres utilisées par vos appels API.</p>
        </div>
        <Button type="button" onClick={startCreate}>
          <Plus />
          Nouveau plan
        </Button>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Plans existants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                const planId = plan.plan_id ?? String(plan.id ?? "")
                return (
                  <TableRow key={planId || plan.name}>
                    <TableCell className="font-medium">{plan.name ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">{planId || "-"}</code>
                        {planId && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => copyPlanId(planId)}
                            title="Copier le plan_id"
                          >
                            {copied === planId ? <Check /> : <Copy />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatMru(plan.amount)}</TableCell>
                    <TableCell>{plan.period ?? "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          plan.status === "inactive" || plan.is_active === false
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        }
                      >
                        {plan.status ?? (plan.is_active === false ? "inactif" : "actif")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(plan)}>
                          <Pencil />
                          Edit
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => deletePlan(plan)}>
                          <Trash2 />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    Aucun plan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Modifier le plan" : "Nouveau plan"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={savePlan}>
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-amount">Amount</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="plan-amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  required
                />
                <span className="text-sm text-muted-foreground">MRU</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-period">Period</Label>
              <select
                id="plan-period"
                value={form.period}
                onChange={(event) => setForm((current) => ({ ...current, period: event.target.value }))}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="mensuel">mensuel</option>
                <option value="trimestriel">trimestriel</option>
                <option value="annuel">annuel</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                {editingPlan ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
