import logo from '../assets/logo.png'

// Small reusable pieces so every screen looks the same.

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    green: 'bg-accent text-white hover:bg-accent-dark',
    dark: 'bg-ink text-white hover:bg-black',
    ghost: 'bg-white text-ink border border-line hover:bg-slate-50',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export function Field({ label, as: Tag = 'input', className = '', ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
      <Tag
        className={`mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10 ${className}`}
        {...props}
      />
    </label>
  )
}

// Default padding p-6, unless the caller passes its own p-* (e.g. p-0 for flush images)
export const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-2xl border border-line bg-white shadow-[0_1px_3px_rgba(15,17,21,0.04)] ${/(^| )p-\d/.test(className) ? '' : 'p-6'} ${className}`}
    {...props}
  />
)

// Small uppercase label used above values (matches the exam screens)
export const Label = ({ children }) => (
  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{children}</p>
)

export const Pill = ({ tone = 'blue', children }) => {
  const tones = {
    blue: 'bg-brand-soft text-brand',
    green: 'bg-accent-soft text-accent-dark',
    gray: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-50 text-amber-700',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export const ErrorText = ({ children }) =>
  children ? <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{children}</p> : null

export const Logo = ({ className = 'h-7' }) => <img src={logo} alt="nstbuddy" className={className} />

// Icon in a soft grey square, like "Scheduled for / Number of questions" in the exam app
export const IconBox = ({ icon: Icon, className = '' }) => (
  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-ink ${className}`}>
    <Icon size={20} />
  </div>
)
