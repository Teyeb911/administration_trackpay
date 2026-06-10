export interface User {
  id: number
  email: string
  nom: string
  telephone: string
  adresse: string
  role: 'commercant' | 'admin'
  kyc_status?: 'pending' | 'verified' | 'failed'
  kyc?: { status: 'pending' | 'verified' | 'failed' } | null
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export function resolveKycStatus(user: User): 'pending' | 'verified' | 'failed' {
  return user.kyc_status ?? user.kyc?.status ?? 'pending'
}

export interface CommercantDetail extends User {
  wallet: {
    balance: string
    currency: string
    is_active: boolean
  } | null
  abonnement: {
    plan: 'gratuit' | 'basic' | 'pro' | 'enterprise'
    statut: 'actif' | 'expiré' | 'résilié'
    date_expiration: string
    auto_renouvellement: boolean
  } | null
  kyc: {
    kyc_id: string
    nni: string
    nom_fr: string
    prenom_fr: string
    status: 'pending' | 'verified' | 'failed'
    face_verified: boolean
    confidence: number
    created_at: string
  } | null
  nb_comptes: number
  nb_transactions: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
