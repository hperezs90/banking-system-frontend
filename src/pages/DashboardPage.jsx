import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { accountService, transactionService } from '../services/api'
import { TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n)
const fmtDate = (d) => new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

function TxRow({ tx, accountIds }) {
  const isCredit = accountIds.includes(tx.cuenta_destino_id)
  return (
    <div className="flex items-center gap-4 py-3 border-b border-ink-700 last:border-0 group">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isCredit ? 'bg-green-500/10' : 'bg-red-500/10'
      }`}>
        {isCredit
          ? <ArrowDownLeft size={14} className="text-green-400" />
          : <ArrowUpRight  size={14} className="text-red-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-silver-100 text-sm font-body truncate capitalize">{tx.tipo}</p>
        <p className="text-silver-500 text-xs font-mono truncate">{tx.referencia}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`amount text-sm font-medium ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
          {isCredit ? '+' : '-'}{fmt(tx.monto)}
        </p>
        <p className="text-silver-500 text-xs font-body">{fmtDate(tx.created_at)}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user }                    = useAuth()
  const navigate                    = useNavigate()
  const [accounts, setAccounts]     = useState([])
  const [txs, setTxs]               = useState([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [accs, history] = await Promise.all([
        accountService.getMyAccounts(),
        transactionService.getHistory(1, 5),
      ])
      setAccounts(accs)
      setTxs(history)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createFirstAccount = async () => {
    setCreating(true)
    try {
      await accountService.createAccount({ tipo_cuenta: 'monetaria', moneda: 'GTQ', saldo_inicial: 0 })
      await load()
    } finally {
      setCreating(false)
    }
  }

  const totalSaldo = accounts.reduce((s, a) => s + parseFloat(a.saldo), 0)
  const accountIds = accounts.map(a => a.id)

  const credits = txs.filter(t => accountIds.includes(t.cuenta_destino_id)).reduce((s, t) => s + parseFloat(t.monto), 0)
  const debits  = txs.filter(t => accountIds.includes(t.cuenta_origen_id)).reduce((s, t) => s + parseFloat(t.monto), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-volt-400/30 border-t-volt-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display font-semibold text-2xl text-silver-100">
            Hola, {user?.nombre} 👋
          </h1>
          <p className="text-silver-500 text-sm font-body mt-0.5">Aquí está el resumen de tus cuentas</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm py-2">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Total balance hero */}
      <div className="gradient-border p-8 mb-6 animate-fade-up stagger-1">
        <p className="label mb-3">Saldo total</p>
        <p className="amount text-5xl font-semibold text-silver-100 mb-1">{fmt(totalSaldo)}</p>
        <p className="text-silver-500 text-sm font-body">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Ingresos recientes', value: fmt(credits), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Egresos recientes',  value: fmt(debits),  icon: TrendingDown, color: 'text-red-400',   bg: 'bg-red-500/10' },
          { label: 'Movimientos',         value: txs.length,   icon: RefreshCw,   color: 'text-volt-400',  bg: 'bg-volt-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={i} className={`stat-card animate-fade-up stagger-${i + 2}`}>
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <p className="label mt-2">{label}</p>
            <p className={`amount text-xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Accounts */}
        <div className="card p-6 animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-medium text-silver-100">Mis cuentas</h2>
            <button onClick={createFirstAccount} disabled={creating}
              className="flex items-center gap-1 text-volt-400 text-xs font-body hover:text-volt-500 transition-colors">
              <Plus size={12} /> Nueva
            </button>
          </div>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-silver-500 text-sm font-body mb-4">No tenés cuentas aún</p>
              <button onClick={createFirstAccount} disabled={creating} className="btn-primary text-sm py-2 px-4">
                {creating ? 'Creando...' : 'Crear cuenta monetaria'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-ink-800 rounded-xl border border-ink-600">
                  <div>
                    <p className="font-mono text-xs text-silver-400">{acc.numero_cuenta}</p>
                    <p className="text-silver-200 text-sm font-body capitalize mt-0.5">{acc.tipo_cuenta}</p>
                  </div>
                  <div className="text-right">
                    <p className="amount text-sm font-medium text-volt-400">{fmt(acc.saldo)}</p>
                    <span className={`badge text-xs mt-1 ${
                      acc.estado === 'activa' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>{acc.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card p-6 animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-medium text-silver-100">Últimos movimientos</h2>
            <button onClick={() => navigate('/transactions')}
              className="text-volt-400 text-xs font-body hover:text-volt-500 transition-colors">
              Ver todos →
            </button>
          </div>
          {txs.length === 0 ? (
            <p className="text-silver-500 text-sm font-body text-center py-8">Sin movimientos aún</p>
          ) : (
            txs.map(tx => <TxRow key={tx.id} tx={tx} accountIds={accountIds} />)
          )}
        </div>
      </div>
    </div>
  )
}
