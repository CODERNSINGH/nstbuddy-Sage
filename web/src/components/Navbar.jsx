import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Button, Logo } from './ui.jsx'

export default function Navbar() {
  const { admin, logout } = useAuth()
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-600 sm:inline">
            {admin.name} · <b>{admin.clubName}</b>
          </span>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
