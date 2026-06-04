import { useEffect, useState } from 'react'
import { transactionService, accountService } from '../services/api'
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n)
const fmtDate = (d) => new Date(d).toLocaleDateString('es-GT', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const TYPE_LABELS = {
  transferencia: 'Transferencia',
  deposito: 'Depósito',
  retiro: 'Retiro',
  pago: 'Pago',
  cargo: 'Cargo',
}

export default function TransactionsPage() {
  const [txs, setTxs]           = useState([])
  const [accountIds, setIds]    = useState([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [filter, setFilter]     = useState('all')

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const [accs, history] = await Promise.all([
        accountService.getMyAccounts(),
        transactionService.getHistory(p, 20),
      ])
      setIds(accs.map(a => a.id))
      setTxs(history)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? txs
    : filter === 'credit' ? txs.filter(t => accountIds.includes(t.cuenta_destino_id))
    : txs.filter(t => accountIds.includes(t.cuenta_origen_id))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display font-semibold text-2xl text-silver-100">Movimientos</h1>
          <p className="text-silver-500 text-sm font-body mt-1">Historial completo de transacciones</p>
        </div>
        <button onClick={() => load(page)} className="btn-ghost flex items-center gap-2 text-sm py-2">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 animate-fade-up stagger-1">
        {[['all','Todos'],['credit','Entradas'],['debit','Salidas']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-body transition-all ${
              filter === v
                ? 'bg-volt-400/10 text-volt-400 border border-volt-400/20'
                : 'text-silver-400 hover:text-silver-200 border border-ink-700 hover:border-ink-600'
            }`}>
            {l}
          </button>
        ))}
      </div>

      <div className="card animate-fade-up stagger-2">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-volt-400/30 border-t-volt-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-silver-500 font-body">Sin movimientos en esta categoría</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-700">
            {filtered.map(tx => {
              const isCredit = accountIds.includes(tx.cuenta_destino_id)
              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-ink-800/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isCredit ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {isCredit
                      ? <ArrowDownLeft size={15} className="text-green-400" />
                      : <ArrowUpRight  size={15} className="text-red-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-silver-100 text-sm font-body font-medium">
                        {TYPE_LABELS[tx.tipo] || tx.tipo}
                      </p>
                      <span className={`badge text-xs ${
                        tx.estado === 'completada' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>{tx.estado}</span>
                    </div>
                    <p className="text-silver-500 text-xs font-mono mt-0.5 truncate">{tx.referencia}</p>
                    {tx.descripcion && (
                      <p className="text-silver-500 text-xs font-body mt-0.5 truncate">{tx.descripcion}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`amount text-sm font-semibold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                      {isCredit ? '+' : '-'}{fmt(tx.monto)}
                    </p>
                    <p className="text-silver-500 text-xs font-body mt-0.5">{fmtDate(tx.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 animate-fade-up stagger-3">
        <button disabled={page === 1} onClick={() => load(page - 1)}
          className="btn-ghost text-sm py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed">
          ← Anterior
        </button>
        <span className="text-silver-500 text-sm font-body">Página {page}</span>
        <button disabled={txs.length < 20} onClick={() => load(page + 1)}
          className="btn-ghost text-sm py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
