import { Header } from '@/components/layout/header'
import { TransactionsTable } from '@/components/transactions/transactions-table'

export default function TransactionsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Transactions"
        subtitle="Historique complet de toutes les transactions"
      />
      <div className="flex-1 p-6">
        <TransactionsTable />
      </div>
    </div>
  )
}
