// Green concentric-circle banner with an icon in the middle (same look as the exam "Start Test" card)
export default function Banner({ icon: Icon, className = 'h-44' }) {
  const rings = [
    { r: 330, o: 0.12 },
    { r: 270, o: 0.22 },
    { r: 210, o: 0.4 },
    { r: 150, o: 0.7 },
  ]
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-emerald-50 ${className}`}>
      <svg viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {rings.map((ring) => (
          <circle key={ring.r} cx="400" cy="100" r={ring.r / 1.6} fill="#2f9e63" opacity={ring.o} />
        ))}
        <circle cx="400" cy="100" r="62" fill="white" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-accent">
        <Icon size={46} strokeWidth={2.2} />
      </div>
    </div>
  )
}
