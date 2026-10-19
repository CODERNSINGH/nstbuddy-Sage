import { Apple, Download } from 'lucide-react'
import { Button, Card, Label } from './ui.jsx'

// The exam app is only built for Apple Silicon MacBooks (M1, M2, M3, M4)
export default function DownloadCard({ url }) {
  return (
    <div>
      <Label>Download the exam app for Mac</Label>
      <Card className="mt-3 flex flex-wrap items-center gap-4 p-5">
        <Apple size={26} className="text-brand" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">NstBuddy Sage for Mac</p>
          <p className="text-sm text-slate-500">Apple Silicon only (M1, M2, M3, M4 chip)</p>
        </div>
        <a href={url}>
          <Button variant="dark"><Download size={16} /> Download .dmg</Button>
        </a>
      </Card>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p><b>Check your Mac:</b> Apple menu, About This Mac. It must say "Chip: Apple M…". Intel Macs are not supported.</p>
        <p className="mt-2"><b>First time opening:</b> if macOS blocks the app, right-click it, choose Open, then Open again. After login, allow Screen Recording and Camera, then quit (Cmd + Q) and reopen the app once.</p>
      </div>
    </div>
  )
}
