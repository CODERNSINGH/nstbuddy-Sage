export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    green: 'bg-accent text-white hover:bg-green-700',
    dark: 'bg-ink text-white hover:bg-slate-800',
    ghost: 'bg-white text-ink border border-slate-300 hover:bg-slate-100',
  }
  return (
    <button
      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export const Card = ({ className = '', ...props }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`} {...props} />
)

export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand font-black text-accent">N</div>
    <span className="text-lg font-bold">
      NstBuddy <span className="text-brand">Sage</span>
    </span>
  </div>
)
