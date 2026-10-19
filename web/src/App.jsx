import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth.jsx'
import Navbar from './components/Navbar.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ContestPage from './pages/ContestPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

// Pages that need a logged-in admin share the navbar
function AdminLayout({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return null
  if (!admin) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/c/:slug" element={<RegisterPage />} />
      <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
      <Route path="/contests/:id" element={<AdminLayout><ContestPage /></AdminLayout>} />
    </Routes>
  )
}
