import { Header } from '@/components/layout/header'
import { CommercantsTable } from '@/components/commercants/commercants-table'

export default function CommercantsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Marchands"
        subtitle="Gestion et supervision de tous les marchands"
      />
      <div className="flex-1 p-4 sm:p-6">
        <CommercantsTable />
      </div>
    </div>
  )
}
