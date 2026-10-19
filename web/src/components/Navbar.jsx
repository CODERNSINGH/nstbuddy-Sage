import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Logo, Pill } from './ui.jsx'

export default function Navbar() {
  const { admin, logout } = useAuth()
  const initials = admin.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">SAGE</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <Pill tone="green">{admin.clubName}</Pill>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">{initials}</div>
            <span className="hidden text-sm font-medium sm:inline">{admin.name}</span>
          </div>
          <button onClick={logout} title="Logout" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-ink">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
