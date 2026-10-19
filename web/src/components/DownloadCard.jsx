import { Apple, Cpu, Download } from 'lucide-react'
import { Button, Card, Label } from './ui.jsx'

// Two installers: Apple Silicon (M1/M2/M3/M4) and Intel Macs
export default function DownloadCard({ downloads }) {
  const options = [
    { key: 'arm64', icon: Apple, title: 'Apple Silicon', text: 'MacBooks with M1, M2, M3 or M4 chip', url: downloads.arm64 },
    { key: 'intel', icon: Cpu, title: 'Intel Mac', text: 'Older MacBooks with an Intel chip', url: downloads.intel },
  ]
  return (
    <div>
      <Label>Download the exam app for Mac</Label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map(({ key, icon: Icon, title, text, url }) => (
          <Card key={key} className="flex flex-col p-5">
            <Icon size={22} className="text-brand" />
            <p className="mt-3 font-bold">{title}</p>
            <p className="text-sm text-slate-500">{text}</p>
            <a href={url} className="mt-4">
              <Button variant="dark" className="w-full"><Download size={16} /> Download .dmg</Button>
            </a>
          </Card>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p><b>Not sure which one?</b> Click the Apple menu, then About This Mac. If it says "Chip: Apple M…" pick Apple Silicon, otherwise pick Intel.</p>
        <p className="mt-2"><b>First time opening:</b> if macOS blocks the app, right-click it, choose Open, then Open again. After login, allow Screen Recording and Camera, then quit (Cmd + Q) and reopen the app once.</p>
      </div>
    </div>
  )
}
