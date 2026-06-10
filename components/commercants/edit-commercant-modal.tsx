'use client'

import { useState, useEffect } from 'react'
import { useUpdateCommercant } from '@/lib/hooks/use-commercants'
import type { CommercantDetail } from '@/lib/types/user.types'
import { X, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface Props {
  commercant: CommercantDetail
  open: boolean
  onClose: () => void
}

export function EditCommercantModal({ commercant, open, onClose }: Props) {
  const { mutate, isPending } = useUpdateCommercant()

  const [nom, setNom] = useState(commercant.nom)
  const [telephone, setTelephone] = useState(commercant.telephone)
  const [adresse, setAdresse] = useState(commercant.adresse)

  useEffect(() => {
    if (open) {
      setNom(commercant.nom)
      setTelephone(commercant.telephone)
      setAdresse(commercant.adresse)
    }
  }, [open, commercant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(
      { id: commercant.id, payload: { nom, telephone, adresse } },
      {
        onSuccess: () => { toast.success('Marchand mis à jour.'); onClose() },
        onError: () => toast.error('Impossible de modifier ce marchand.'),
      }
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Modifier le marchand</h2>
            <p className="text-xs text-slate-400 mt-0.5">{commercant.email}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Field label="Nom complet" value={nom} onChange={setNom} placeholder="Nom du marchand" />
          <Field label="Téléphone" value={telephone} onChange={setTelephone} placeholder="+222 XX XX XX XX" type="tel" />
          <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="Ville, quartier…" />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
      />
    </div>
  )
}
