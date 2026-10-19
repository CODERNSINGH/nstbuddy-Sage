import { Camera, Check, Maximize, Monitor } from 'lucide-react'
import { useState } from 'react'
import { desktop } from '../lib/desktop.js'
import { Button, Card, ErrorText, IconBox } from '../components/ui.jsx'

// Three steps, one after another: share screen -> share camera -> full screen
export default function PermissionsScreen({ session, streams, setStreams, onContinue }) {
  const [error, setError] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const hasScreen = !!streams.screen
  const hasCamera = !!streams.camera

  async function shareScreen() {
    setError('')
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true })
      setStreams((s) => ({ ...s, screen }))
    } catch {
      setError('Screen sharing failed. Allow "Screen Recording" for this app in System Settings > Privacy & Security, then restart the app.')
    }
  }

  async function shareCamera() {
    setError('')
    try {
      await desktop.askCamera()
      const camera = await navigator.mediaDevices.getUserMedia({ video: true })
      setStreams((s) => ({ ...s, camera }))
    } catch {
      setError('Camera access was denied. Allow it in System Settings > Privacy & Security > Camera.')
    }
  }

  async function goFullscreen() {
    await desktop.startLockdown()
    setFullscreen(true)
  }

  const steps = [
    { icon: Monitor, title: 'Share your screen', text: 'Kindly share your entire screen. We use it to keep the exam fair.', done: hasScreen, enabled: true, label: 'Share Screen', action: shareScreen },
    { icon: Camera, title: 'Share your camera', text: 'Your camera must stay on while you write the exam.', done: hasCamera, enabled: hasScreen, label: 'Allow Camera', action: shareCamera },
    { icon: Maximize, title: 'Switch to full screen', text: 'The app locks to full screen. Only Cmd + Q can close it.', done: fullscreen, enabled: hasScreen && hasCamera, label: 'Give Full Screen Permissions', action: goFullscreen },
  ]
  const ready = hasScreen && hasCamera && fullscreen

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-2xl font-extrabold tracking-tight">Hi {session.student.name}!</h1>
        <p className="mt-1 text-center text-slate-500">Kindly allow the following permissions to start the test:</p>

        <Card className="mt-8 divide-y divide-line p-0">
          {steps.map((step) => (
            <div key={step.title} className="flex items-start gap-5 p-7">
              <IconBox icon={step.done ? Check : step.icon} className={step.done ? '!bg-accent-soft text-accent' : ''} />
              <div className="flex-1">
                <h2 className="text-lg font-bold">{step.title}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{step.text}</p>
                <Button className="mt-4" variant={step.done ? 'ghost' : 'dark'} disabled={!step.enabled || step.done} onClick={step.action}>
                  {step.done ? 'Done' : step.label}
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <div className="mt-4"><ErrorText>{error}</ErrorText></div>

        <div className="mt-6 flex items-center gap-3">
          <Button size="lg" disabled={!ready} onClick={onContinue}>Go To Test</Button>
          <Button size="lg" variant="ghost" onClick={() => setError('Ask your teacher for help. They can see your warnings on their dashboard.')}>
            Need Help?
          </Button>
        </div>
      </div>
    </div>
  )
}
