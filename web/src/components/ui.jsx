// Small reusable pieces so pages stay short and every screen looks the same.

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    green: 'bg-accent text-white hover:bg-green-700',
    dark: 'bg-ink text-white hover:bg-slate-800',
    ghost: 'bg-white text-ink border border-slate-300 hover:bg-slate-100',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export function Field({ label, as: Tag = 'input', className = '', ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <Tag
        className={`mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
        {...props}
      />
    </label>
  )
}

export const Card = ({ className = '', ...props }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`} {...props} />
)

export const ErrorText = ({ children }) =>
  children ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{children}</p> : null

export const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand font-black text-accent">N</div>
    <span className="text-lg font-bold">
      NstBuddy <span className="text-brand">Sage</span>
    </span>
  </div>
)
