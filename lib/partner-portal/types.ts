export type PartnerDashboard = {
  partner_name?: string
  name?: string
  balance?: number | string
  solde?: number | string
  wallet_balance?: number | string
  solde_wallet?: number | string
  wallet?: {
    balance?: number | string
    solde?: number | string
  }
  paid_count?: number
  completed_count?: number
  paid_payments?: number
  completed_payments?: number
  successful_count?: number
  success_count?: number
  pending_count?: number
  pending_payments?: number
  total_revenue?: number | string
  revenus_totaux?: number | string
  latest_payments?: PartnerPayment[]
  recent_payments?: PartnerPayment[]
  last_payments?: PartnerPayment[]
  derniers_paiements?: PartnerPayment[]
  payments?: PartnerPayment[]
}

export type PartnerPlan = {
  id?: string | number
  plan_id?: string
  name?: string
  amount?: number | string
  period?: "mensuel" | "trimestriel" | "annuel" | string
  status?: string
  is_active?: boolean
}

export type PartnerPayment = {
  id?: string | number
  date?: string
  created_at?: string
  payer_email?: string
  email?: string
  plan?: string
  plan_name?: string
  amount?: number | string
  reference?: string
  status?: "COMPLETED" | "PENDING" | "FAILED" | string
}

export type PartnerCredentials = {
  api_key?: string
  webhook_secret?: string
  payment_endpoint?: string
  gateway_endpoint?: string
}

export function listFromResponse<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    for (const key of keys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[]
      }
    }

    if (Array.isArray(record.results)) {
      return record.results as T[]
    }
  }

  return []
}

export function getPartnerDashboardBalance(data: PartnerDashboard) {
  return (
    data.balance ??
    data.solde ??
    data.wallet_balance ??
    data.solde_wallet ??
    data.wallet?.balance ??
    data.wallet?.solde
  )
}

export function getPartnerDashboardPayments(data: PartnerDashboard) {
  return (
    data.latest_payments ??
    data.recent_payments ??
    data.last_payments ??
    data.derniers_paiements ??
    data.payments ??
    []
  )
}

export function getPartnerPaidCount(data: PartnerDashboard) {
  return (
    data.paid_count ??
    data.completed_count ??
    data.paid_payments ??
    data.completed_payments ??
    data.successful_count ??
    data.success_count ??
    getPartnerDashboardPayments(data).filter((payment) => payment.status === "COMPLETED").length
  )
}

export function getPartnerPendingCount(data: PartnerDashboard) {
  return (
    data.pending_count ??
    data.pending_payments ??
    getPartnerDashboardPayments(data).filter((payment) => payment.status === "PENDING").length
  )
}

export function formatMru(value: number | string | undefined) {
  const amount = Number(value ?? 0)

  if (Number.isNaN(amount)) {
    return `${value} MRU`
  }

  return `${new Intl.NumberFormat("fr-FR").format(amount)} MRU`
}

export function displayDate(value: string | undefined) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
