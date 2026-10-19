import { useState } from 'react'
import { Button, Card } from '../components/ui.jsx'

// Three steps, one after another: share screen -> share camera -> full screen
export default function PermissionsScreen({ session, streams, setStreams, onStart }) {
  const [error, setError] = useState('')
  const hasScreen = !!streams.screen
  const hasCamera = !!streams.camera
  const [fullscreen, setFullscreen] = useState(false)

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
      await window.desktop.askCamera()
      const camera = await navigator.mediaDevices.getUserMedia({ video: true })
      setStreams((s) => ({ ...s, camera }))
    } catch {
      setError('Camera access was denied. Allow it in System Settings > Privacy & Security > Camera.')
    }
  }

  async function goFullscreen() {
    await window.desktop.startLockdown()
    setFullscreen(true)
  }

  const steps = [
    { title: 'Share your screen', text: 'We record your screen during the exam to keep it fair.', done: hasScreen, enabled: true, label: 'Share Screen', action: shareScreen },
    { title: 'Share your camera', text: 'Your camera must stay on while you write the exam.', done: hasCamera, enabled: hasScreen, label: 'Allow Camera', action: shareCamera },
    { title: 'Switch to full screen', text: 'The app locks to full screen. Only Cmd + Q can close it.', done: fullscreen, enabled: hasScreen && hasCamera, label: 'Go Full Screen', action: goFullscreen },
  ]

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-2xl font-bold">Hi {session.student.name}!</h1>
        <p className="text-center text-slate-500">Kindly allow the following permissions to start the test:</p>

        <Card className="mt-6 divide-y divide-slate-200 p-0">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start gap-4 p-6">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold ${step.done ? 'bg-accent text-white' : 'bg-brand-light text-brand'}`}>
                {step.done ? '✓' : i + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{step.title}</h2>
                <p className="text-sm text-slate-500">{step.text}</p>
                <Button className="mt-3" variant={step.done ? 'ghost' : 'dark'} disabled={!step.enabled || step.done} onClick={step.action}>
                  {step.done ? 'Done' : step.label}
                </Button>
              </div>
            </div>
          ))}
        </Card>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex items-center gap-3">
          <Button disabled={!(hasScreen && hasCamera && fullscreen)} onClick={onStart}>
            Go To Test
          </Button>
          <span className="text-sm text-slate-500">
            {session.contest.title} · {session.contest.durationMinutes} minutes
          </span>
        </div>
      </div>
    </div>
  )
}
