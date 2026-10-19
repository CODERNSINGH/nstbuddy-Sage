import { Apple, Download } from 'lucide-react'
import { DOWNLOAD_URL } from '../lib/config.js'
import { Button, Card, Label } from './ui.jsx'

// The exam app is only built for Apple Silicon MacBooks (M1, M2, M3, M4)
export default function DownloadCard() {
  return (
    <div>
      <Label>Download the exam app for Mac</Label>
      <Card className="mt-3 flex flex-wrap items-center gap-4 p-5">
        <Apple size={26} className="text-brand" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">NstBuddy Sage for Mac</p>
          <p className="text-sm text-slate-500">Apple Silicon only (M1, M2, M3, M4 chip)</p>
        </div>
        <a href={DOWNLOAD_URL}>
          <Button variant="dark"><Download size={16} /> Download .dmg</Button>
        </a>
      </Card>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <p><b>Check your Mac:</b> Apple menu, About This Mac. It must say "Chip: Apple M…". Intel Macs are not supported.</p>
        <p className="mt-2"><b>First time opening:</b> drag the app to Applications. If macOS blocks it, right-click the app, choose Open, then Open again (on newer macOS: System Settings, Privacy &amp; Security, Open Anyway).</p>
        <p className="mt-2">If it says the app is "damaged", run this once in Terminal, then open it again:</p>
        <code className="mt-1 block select-all rounded-lg bg-ink px-3 py-2 text-xs text-emerald-300">xattr -cr "/Applications/NstBuddy Sage.app"</code>
        <p className="mt-2">After login, allow Screen Recording and Camera, then quit (Cmd + Q) and reopen the app once.</p>
      </div>
    </div>
  )
}
