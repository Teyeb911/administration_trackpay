export interface PlanDisponible {
  type: 'gratuit' | 'basic' | 'pro' | 'enterprise'
  prix_mensuel: string
  nb_comptes_max: number
}

export interface Abonnement {
  id: number
  commercant_email: string
  commercant_nom: string
  plan: PlanDisponible
  statut: 'actif' | 'expiré' | 'résilié'
  date_debut: string
  date_expiration: string | null
  auto_renouvellement: boolean
  created_at: string
}
