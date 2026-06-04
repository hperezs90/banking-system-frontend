import { useEffect, useState } from 'react'
import { accountService, statementService } from '../services/api'
import { Plus, FileDown, CheckCircle, AlertCircle } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n)

export default function AccountsPage() {
  const [accounts, setAccounts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [creating, setCreating]   = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ tipo_cuenta: 'monetaria', moneda: 'GTQ' })
  const [genStatus, setGenStatus] = useState({})
  const [msg, setMsg]             = useState(null)

  const load = async () => {
    setLoading(true)
    try { setAccounts(await accountService.getMyAccounts()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await accountService.createAccount({ ...form, saldo_inicial: 0 })
      setShowForm(false)
      setMsg({ type: 'success', text: 'Cuenta creada exitosamente' })
      await load()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Error al crear cuenta' })
    } finally {
      setCreating(false)
    }
  }

  const generateStatement = async (accountId) => {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    setGenStatus(s => ({ ...s, [accountId]: 'loading' }))
    try {
      await statementService.generateStatement(accountId, mes, anio)
      setGenStatus(s => ({ ...s, [accountId]: 'done' }))
      setMsg({ type: 'success', text: `Estado de cuenta ${mes}/${anio} generado` })
    } catch (err) {
      setGenStatus(s => ({ ...s, [accountId]: 'error' }))
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Error al generar estado' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display font-semibold text-2xl text-silver-100">Mis cuentas</h1>
          <p className="text-silver-500 text-sm font-body mt-1">Administrá tus cuentas bancarias</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={14} /> Nueva cuenta
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-4 text-sm font-body animate-fade-in ${
          msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {showForm && (
        <div className="gradient-border p-6 mb-6 animate-fade-up">
          <h2 className="font-display font-medium text-silver-100 mb-4">Nueva cuenta</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="label">Tipo de cuenta</label>
              <select className="input" value={form.tipo_cuenta} onChange={e => setForm(f => ({ ...f, tipo_cuenta: e.target.value }))}>
                <option value="monetaria">Monetaria</option>
                <option value="ahorro">Ahorro</option>
                <option value="corriente">Corriente</option>
              </select>
            </div>
            <div>
              <label className="label">Moneda</label>
              <select className="input" value={form.moneda} onChange={e => setForm(f => ({ ...f, moneda: e.target.value }))}>
                <option value="GTQ">GTQ — Quetzal</option>
                <option value="USD">USD — Dólar</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary text-sm py-2">
                {creating ? 'Creando...' : 'Crear cuenta'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm py-2">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-volt-400/30 border-t-volt-400 rounded-full animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-silver-500 font-body mb-4">No tenés cuentas aún</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-6">
            Crear primera cuenta
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {accounts.map((acc, i) => (
            <div key={acc.id} className={`card p-6 animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-medium text-silver-100 capitalize">{acc.tipo_cuenta}</span>
                    <span className={`badge text-xs ${
                      acc.estado === 'activa' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>{acc.estado}</span>
                    <span className="badge bg-ink-700 text-silver-400 text-xs">{acc.moneda}</span>
                  </div>
                  <p className="font-mono text-sm text-silver-400">{acc.numero_cuenta}</p>
                </div>
                <p className="amount text-2xl font-semibold text-volt-400">{fmt(acc.saldo)}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-ink-700">
                <p className="text-silver-500 text-xs font-body">
                  Creada {new Date(acc.created_at).toLocaleDateString('es-GT')}
                </p>
                <button onClick={() => generateStatement(acc.id)}
                  disabled={genStatus[acc.id] === 'loading'}
                  className="flex items-center gap-1.5 text-silver-400 hover:text-volt-400 text-xs font-body transition-colors">
                  <FileDown size={13} />
                  {genStatus[acc.id] === 'loading' ? 'Generando...' :
                   genStatus[acc.id] === 'done' ? 'Generado ✓' : 'Estado de cuenta'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
