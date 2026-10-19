import { ClipboardList, Clock, HelpCircle } from 'lucide-react'
import Banner from '../components/Banner.jsx'
import { Button, Card, IconBox, Label } from '../components/ui.jsx'

// The "Start Test" card: what the exam is, how long, how many questions
export default function IntroScreen({ session, onStart }) {
  const { contest } = session
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-2xl p-8 shadow-xl shadow-slate-200/60">
        <Banner icon={ClipboardList} className="h-52" />

        <div className="mt-8 space-y-6">
          <div>
            <Label>Contest title</Label>
            <p className="mt-1.5 text-2xl font-semibold">{contest.title}</p>
          </div>
          {contest.description && (
            <div>
              <Label>About this test</Label>
              <p className="mt-1.5 text-lg text-slate-700">{contest.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 items-center gap-6">
            <div className="flex items-center gap-4">
              <IconBox icon={Clock} className="h-12 w-12" />
              <div>
                <Label>Duration</Label>
                <p className="text-xl font-bold">{contest.durationMinutes} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 border-l border-line pl-6">
              <IconBox icon={HelpCircle} className="h-12 w-12" />
              <div>
                <Label>Number of questions</Label>
                <p className="text-xl font-bold">{contest.questionCount} Questions</p>
              </div>
            </div>
          </div>
        </div>

        <Button variant="green" size="lg" className="mt-8 w-full !rounded-2xl !py-4" onClick={onStart}>
          Start Test
        </Button>
        <p className="mt-3 text-center text-xs text-slate-400">The timer starts as soon as you press Start Test.</p>
      </Card>
    </div>
  )
}
