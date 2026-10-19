import { ClipboardList, Link2, Trophy } from 'lucide-react'

// Three tilted, stacked cards (same idea as the nstbuddy home page)
const cards = [
  { title: 'Create', text: 'Add questions with a form or paste JSON.', icon: ClipboardList, bg: 'from-brand to-blue-800', pos: 'top-0 right-4 rotate-[4deg]' },
  { title: 'Share', text: 'One link. Students register in seconds.', icon: Link2, bg: 'from-accent to-emerald-700', pos: 'top-[9.5rem] left-0 -rotate-[4deg]' },
  { title: 'Leaderboard', text: 'Scores and ranks, live.', icon: Trophy, bg: 'from-slate-700 to-ink', pos: 'top-[19rem] right-0 rotate-[3deg]' },
]

export default function HeroCards() {
  return (
    <div className="relative hidden h-[30rem] w-full max-w-md lg:block">
      {cards.map(({ title, text, icon: Icon, bg, pos }) => (
        <div key={title} className={`absolute w-72 rounded-2xl bg-gradient-to-br p-5 text-white shadow-xl ${bg} ${pos}`}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
            <Icon size={20} />
          </div>
          <p className="mt-6 text-lg font-bold">{title}</p>
          <p className="text-sm text-white/80">{text}</p>
        </div>
      ))}
    </div>
  )
}
