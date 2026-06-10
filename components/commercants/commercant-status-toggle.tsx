'use client'

import { useToggleCommercant } from '@/lib/hooks/use-commercants'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Props {
  id: number
  isActive: boolean
  nom: string
}

export function CommercantStatusToggle({ id, isActive, nom }: Props) {
  const { mutate, isPending } = useToggleCommercant()

  const handleToggle = (checked: boolean) => {
    mutate(
      { id, isActive: checked },
      {
        onSuccess: () =>
          toast.success(`${nom} est maintenant ${checked ? 'actif' : 'inactif'}.`),
        onError: () =>
          toast.error('Impossible de modifier le statut.'),
      }
    )
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label={`Activer/désactiver ${nom}`}
    />
  )
}
