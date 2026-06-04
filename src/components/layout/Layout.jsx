import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, FileText,
  CreditCard, LogOut, ChevronRight
} from 'lucide-react'

const nav = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transfer',      icon: ArrowLeftRight,  label: 'Transferir' },
  { to: '/transactions',  icon: FileText,        label: 'Movimientos' },
  { to: '/accounts',      icon: CreditCard,      label: 'Cuentas' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-ink-900 border-r border-ink-700 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-ink-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-volt-400 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-ink-950 font-display font-bold text-xs">B</span>
            </div>
            <span className="font-display font-semibold text-silver-100">BancoGT</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-150 group ${
                  isActive
                    ? 'bg-volt-400/10 text-volt-400 border border-volt-400/20'
                    : 'text-silver-400 hover:text-silver-100 hover:bg-ink-800'
                }`
              }>
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-ink-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-volt-400/20 border border-volt-400/30 flex items-center justify-center shrink-0">
              <span className="text-volt-400 font-display font-semibold text-xs">
                {user?.nombre?.[0]}{user?.apellido?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-silver-100 text-xs font-display font-medium truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-silver-500 text-xs font-body truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-silver-500 hover:text-red-400 text-xs font-body rounded-lg hover:bg-red-500/10 transition-all">
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
