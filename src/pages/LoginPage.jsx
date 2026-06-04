import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [mode, setMode]       = useState('login') // 'login' | 'register'
  const [form, setForm]       = useState({ nombre:'', apellido:'', email:'', password:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register }   = useAuth()
  const navigate              = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        navigate('/dashboard')
      } else {
        await register({ nombre: form.nombre, apellido: form.apellido, email: form.email, password: form.password })
        await login(form.email, form.password)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#C8FF00 1px, transparent 1px), linear-gradient(90deg, #C8FF00 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Glow orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #C8FF00 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-volt-400 rounded-lg flex items-center justify-center">
              <span className="text-ink-950 font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-semibold text-xl text-silver-100">BancoGT</span>
          </div>
          <p className="text-silver-400 text-sm font-body">Sistema de Transacciones Bancarias</p>
        </div>

        <div className="gradient-border p-8">
          {/* Tabs */}
          <div className="flex gap-1 bg-ink-800 rounded-xl p-1 mb-8">
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
                  mode === m ? 'bg-volt-400 text-ink-950' : 'text-silver-400 hover:text-silver-200'
                }`}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Nombre</label>
                  <input className="input" placeholder="Juan" value={form.nombre} onChange={set('nombre')} required />
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input className="input" placeholder="García" value={form.apellido} onChange={set('apellido')} required />
                </div>
              </div>
            )}

            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" placeholder="correo@ejemplo.com"
                value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')} required />
              {mode === 'register' && (
                <p className="text-silver-500 text-xs mt-1.5 font-body">Mínimo 8 caracteres, una mayúscula y un número</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 font-body">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              ) : null}
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-silver-500 text-xs mt-6 font-body">
          Equipo 4 · Ingeniería de Software · UMG 2026
        </p>
      </div>
    </div>
  )
}
