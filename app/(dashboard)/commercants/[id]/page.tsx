'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCommercantDetail, useSuspendreCommercant, useActiverCommercant, useDeleteCommercant } from '@/lib/hooks/use-commercants'
import { useValiderKyc } from '@/lib/hooks/use-kyc'
import { EditCommercantModal } from '@/components/commercants/edit-commercant-modal'
import { ErrorState } from '@/components/shared/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateShort, formatMontant } from '@/lib/utils/format'
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar,
  Wallet, CreditCard, ShieldCheck, ShieldX,
  UserX, UserCheck, Trash2, AlertTriangle, Pencil,
} from 'lucide-react'
import { toast } from 'sonner'

const planConfig: Record<string, { label: string; className: string }> = {
  gratuit:    { label: 'Gratuit',    className: 'bg-gray-100 text-gray-600' },
  basic:      { label: 'Basic',      className: 'bg-blue-100 text-blue-700' },
  pro:        { label: 'Pro',        className: 'bg-purple-100 text-purple-700' },
  enterprise: { label: 'Enterprise', className: 'bg-orange-100 text-orange-700' },
}

const statutAboConfig: Record<string, { label: string; className: string }> = {
  'actif':   { label: 'Actif',    className: 'bg-green-100 text-green-700' },
  'expiré':  { label: 'Expiré',   className: 'bg-yellow-100 text-yellow-700' },
  'résilié': { label: 'Résilié',  className: 'bg-red-100 text-red-700' },
}

export default function CommercantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const numId = Number(id)

  const { data: c, isLoading, isError, refetch } = useCommercantDetail(numId)
  const { mutate: suspendre, isPending: suspending } = useSuspendreCommercant()
  const { mutate: activer, isPending: activating } = useActiverCommercant()
  const { mutate: supprimer, isPending: deleting } = useDeleteCommercant()
  const { mutate: validerKyc, isPending: validatingKyc } = useValiderKyc()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const handleToggleStatus = () => {
    if (!c) return
    if (c.is_active) {
      suspendre(numId, {
        onSuccess: () => toast.success(`${c.nom} suspendu.`),
        onError: () => toast.error('Impossible de suspendre ce marchand.'),
      })
    } else {
      activer(numId, {
        onSuccess: () => toast.success(`${c.nom} activé.`),
        onError: () => toast.error("Impossible d'activer ce marchand."),
      })
    }
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    supprimer(numId, {
      onSuccess: () => { toast.success('Marchand supprimé.'); router.push('/commercants') },
      onError: () => { toast.error('Impossible de supprimer ce marchand.'); setConfirmDelete(false) },
    })
  }

  const handleValiderKyc = () => {
    validerKyc(numId, {
      onSuccess: () => toast.success('KYC validé.'),
      onError: () => toast.error('Impossible de valider le KYC.'),
    })
  }

  return (
    <div className="flex flex-col">
      <Header title="Détail marchand" />
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <Link
          href="/commercants"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux marchands
        </Link>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        )}

        {isError && <ErrorState message="Impossible de charger ce marchand." onRetry={refetch} />}

        {c && (
          <div className="space-y-6">
            {/* Infos principales + actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border bg-white p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{c.nom || 'Sans nom'}</h2>
                    <p className="text-sm text-gray-400">ID #{c.id}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />Modifier
                    </Button>
                  <Button
                      size="sm"
                      variant={c.is_active ? 'outline' : 'default'}
                      className={c.is_active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : ''}
                      onClick={handleToggleStatus}
                      disabled={suspending || activating}
                    >
                      {c.is_active
                        ? <><UserX className="h-3.5 w-3.5 mr-1.5" />Suspendre</>
                        : <><UserCheck className="h-3.5 w-3.5 mr-1.5" />Activer</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={confirmDelete
                        ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-red-200 text-red-500 hover:bg-red-50'}
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {confirmDelete
                        ? <><AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Confirmer</>
                        : <><Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer</>}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    {c.email}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    {c.telephone || 'Non renseigné'}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    {c.adresse || 'Non renseignée'}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    Inscrit le {formatDateShort(c.created_at)}
                  </div>
                </div>

                <div className="flex gap-4 pt-1 border-t">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{c.nb_comptes ?? 0}</p>
                    <p className="text-xs text-gray-500">Comptes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{c.nb_transactions ?? 0}</p>
                    <p className="text-xs text-gray-500">Transactions</p>
                  </div>
                </div>
              </div>

              {/* Statuts */}
              <div className="rounded-xl border bg-white p-4 sm:p-6 space-y-4">
                <h3 className="font-semibold text-gray-700 text-sm">Statuts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Compte</span>
                    <Badge variant="secondary" className={c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {c.is_active ? 'Actif' : 'Suspendu'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">KYC</span>
                    <Badge variant="secondary" className={
                      c.kyc_status === 'verified' ? 'bg-green-100 text-green-700' :
                      c.kyc_status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }>
                      {c.kyc_status === 'verified' ? 'Vérifié' : c.kyc_status === 'failed' ? 'Échoué' : 'En attente'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Identité</span>
                    <Badge variant="secondary" className={c.is_verified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {c.is_verified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet + Abonnement + KYC */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Wallet */}
              <div className="rounded-xl border bg-white p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-green-50 p-2">
                    <Wallet className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm">Wallet</h3>
                </div>
                {c.wallet ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatMontant(parseFloat(c.wallet.balance))}
                      </p>
                    </div>
                    <Badge variant="secondary" className={c.wallet.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {c.wallet.is_active ? 'Actif' : 'Bloqué'}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucun wallet</p>
                )}
              </div>

              {/* Abonnement */}
              <div className="rounded-xl border bg-white p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-sm">Abonnement</h3>
                </div>
                {c.abonnement ? (
                  <div className="space-y-2">
                    <Badge className={(planConfig[c.abonnement.plan] ?? planConfig.gratuit).className} variant="secondary">
                      {(planConfig[c.abonnement.plan] ?? { label: c.abonnement.plan }).label}
                    </Badge>
                    <div className="space-y-1">
                      <Badge variant="secondary" className={(statutAboConfig[c.abonnement.statut] ?? {className: ''}).className}>
                        {c.abonnement.statut}
                      </Badge>
                      {c.abonnement.date_expiration && (
                        <p className="text-xs text-gray-500">
                          Expire le {formatDateShort(c.abonnement.date_expiration)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Renouvellement auto : {c.abonnement.auto_renouvellement ? 'Oui' : 'Non'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucun abonnement</p>
                )}
              </div>

              {/* KYC détail */}
              <div className="rounded-xl border bg-white p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${c.kyc?.status === 'verified' ? 'bg-green-50' : 'bg-orange-50'}`}>
                      {c.kyc?.status === 'verified'
                        ? <ShieldCheck className="h-4 w-4 text-green-600" />
                        : <ShieldX className="h-4 w-4 text-orange-600" />}
                    </div>
                    <h3 className="font-semibold text-gray-700 text-sm">KYC</h3>
                  </div>
                  {c.kyc?.status === 'pending' && (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-green-600 hover:bg-green-700"
                      onClick={handleValiderKyc}
                      disabled={validatingKyc}
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Valider
                    </Button>
                  )}
                </div>
                {c.kyc ? (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nom</span>
                      <span className="font-medium">{c.kyc.nom_fr} {c.kyc.prenom_fr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">NNI</span>
                      <span className="font-mono text-xs">{c.kyc.nni}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Face</span>
                      <Badge variant="secondary" className={c.kyc.face_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {c.kyc.face_verified ? 'Validée' : 'Non validée'}
                      </Badge>
                    </div>
                    {c.kyc.confidence > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Confiance</span>
                        <span className="font-medium">{(c.kyc.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Soumis le</span>
                      <span className="text-xs text-gray-500">{formatDateShort(c.kyc.created_at)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucun KYC soumis</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {c && (
        <EditCommercantModal
          commercant={c}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}
