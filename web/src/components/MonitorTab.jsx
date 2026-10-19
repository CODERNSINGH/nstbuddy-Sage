import { Eye, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'
import { connectLive } from '../lib/live.js'
import LiveViewer from './LiveViewer.jsx'
import { Button, Card, IconBox } from './ui.jsx'

// Shows students who are inside the exam app right now. "Watch" opens their live screen + camera.
export default function MonitorTab({ contestId }) {
  const [live, setLive] = useState(null)
  const [online, setOnline] = useState([])
  const [watching, setWatching] = useState(null) // student object

  useEffect(() => {
    const connection = connectLive(contestId, setOnline)
    setLive(connection)
    return () => connection.close()
  }, [contestId])

  const watchedStillOnline = watching && online.some((s) => s.id === watching.id)

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconBox icon={Radio} className="bg-accent-soft text-accent" />
          <div>
            <h3 className="text-lg font-bold">{online.length} student{online.length === 1 ? '' : 's'} online</h3>
            <p className="text-sm text-slate-500">Students appear here once they start the exam in the app.</p>
          </div>
        </div>
      </Card>

      {!online.length && <Card className="py-14 text-center text-slate-500">Nobody is taking the exam right now.</Card>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {online.map((student) => (
          <Card key={student.id} className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="truncate font-semibold">{student.name}</p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" /> In exam
              </p>
            </div>
            <Button size="sm" variant="dark" onClick={() => setWatching(student)}><Eye size={14} /> Watch live</Button>
          </Card>
        ))}
      </div>

      {watching && live && (
        <LiveViewer live={live} student={watching} online={watchedStillOnline} onClose={() => setWatching(null)} />
      )}
    </div>
  )
}
