import { useEffect, useState } from 'react'
import { accountService, transactionService } from '../services/api'
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n)

export default function TransferPage() {
  const [accounts, setAccounts]   = useState([])
  const [form, setForm]           = useState({ cuenta_destino_numero: '', monto: '', descripcion: '' })
  const [status, setStatus]       = useState(null) // null | 'success' | 'error'
  const [message, setMessage]     = useState('')
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    accountService.getMyAccounts().then(setAccounts)
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const tx = await transactionService.transfer({
        cuenta_destino_numero: form.cuenta_destino_numero,
        monto: parseFloat(form.monto),
        descripcion: form.descripcion || null,
      })
      setStatus('success')
      setMessage(`Transferencia completada. Ref: ${tx.referencia}`)
      setForm({ cuenta_destino_numero: '', monto: '', descripcion: '' })
      accountService.getMyAccounts().then(setAccounts)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.detail || 'Error al procesar la transferencia')
    } finally {
      setLoading(false)
    }
  }

  const saldoTotal = accounts.reduce((s, a) => s + parseFloat(a.saldo), 0)

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-display font-semibold text-2xl text-silver-100">Transferir fondos</h1>
        <p className="text-silver-500 text-sm font-body mt-1">Enviá dinero a otra cuenta del sistema</p>
      </div>

      {/* Balance chip */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-ink-800 border border-ink-600 rounded-xl animate-fade-up stagger-1">
        <div className="w-2 h-2 rounded-full bg-volt-400 pulse-slow" />
        <span className="text-silver-400 text-sm font-body">Saldo disponible:</span>
        <span className="amount text-volt-400 font-medium">{fmt(saldoTotal)}</span>
      </div>

      <div className="gradient-border p-8 animate-fade-up stagger-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="label">Cuenta destino</label>
            <input className="input font-mono" placeholder="GT2026XXXXXXXX"
              value={form.cuenta_destino_numero} onChange={set('cuenta_destino_numero')} required />
            <p className="text-silver-500 text-xs mt-1.5 font-body">Número de cuenta del destinatario</p>
          </div>

          <div>
            <label className="label">Monto (GTQ)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-400 font-mono text-sm">Q</span>
              <input className="input pl-8 font-mono" type="number" step="0.01" min="0.01"
                placeholder="0.00" value={form.monto} onChange={set('monto')} required />
            </div>
          </div>

          <div>
            <label className="label">Descripción <span className="normal-case text-silver-500 tracking-normal">(opcional)</span></label>
            <input className="input" placeholder="Ej. Pago de servicios"
              value={form.descripcion} onChange={set('descripcion')} maxLength={255} />
          </div>

          {status && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-body ${
              status === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {status === 'success'
                ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              : <ArrowRight size={16} />}
            {loading ? 'Procesando...' : 'Confirmar transferencia'}
          </button>
        </form>
      </div>

      {/* Own accounts reference */}
      {accounts.length > 0 && (
        <div className="card p-5 mt-6 animate-fade-up stagger-3">
          <p className="label mb-3">Mis números de cuenta</p>
          {accounts.map(a => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-ink-700 last:border-0">
              <span className="font-mono text-xs text-silver-400">{a.numero_cuenta}</span>
              <div className="flex items-center gap-3">
                <span className="text-silver-500 text-xs font-body capitalize">{a.tipo_cuenta}</span>
                <span className="amount text-xs text-volt-400">{fmt(a.saldo)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
