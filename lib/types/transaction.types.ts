export type TransactionType = 'interne' | 'externe' | 'chargement'
export type TransactionStatut = 'success' | 'pending' | 'failed' | 'cancelled'

export interface Transaction {
  id: number
  reference: string
  commercant?: { id: number; nom: string } | string
  commercant_email?: string
  expediteur_email?: string
  recepteur_email?: string
  montant: number | string
  frais?: number | string
  montant_total?: number | string
  type: TransactionType
  statut: TransactionStatut
  description?: string
  created_at: string
}
