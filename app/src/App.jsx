import { useState } from 'react'
import { desktop } from './lib/desktop.js'
import IntroScreen from './pages/IntroScreen.jsx'
import LoginScreen from './pages/LoginScreen.jsx'
import PermissionsScreen from './pages/PermissionsScreen.jsx'
import QuizScreen from './pages/QuizScreen.jsx'
import ResultScreen from './pages/ResultScreen.jsx'

// The whole exam is one straight line: login -> permissions -> intro -> quiz -> result
export default function App() {
  const [stage, setStage] = useState('login')
  const [session, setSession] = useState(null) // { student, contest }
  const [streams, setStreams] = useState({ screen: null, camera: null })
  const [result, setResult] = useState(null)

  const stopStreams = () => Object.values(streams).forEach((s) => s?.getTracks().forEach((t) => t.stop()))

  async function finishExam(data) {
    stopStreams()
    await desktop.stopLockdown()
    setResult(data)
    setStage('result')
  }

  // Screen sharing was stopped mid-exam: send the student back to give permissions again
  async function screenLost() {
    await desktop.stopLockdown()
    setStreams({ screen: null, camera: streams.camera })
    setStage('permissions')
  }

  if (stage === 'login')
    return <LoginScreen onLogin={(data) => { setSession(data); setStage('permissions') }} />

  if (stage === 'permissions')
    return <PermissionsScreen session={session} streams={streams} setStreams={setStreams} onContinue={() => setStage('intro')} />

  if (stage === 'intro') return <IntroScreen session={session} onStart={() => setStage('quiz')} />

  if (stage === 'quiz')
    return <QuizScreen session={session} streams={streams} onFinish={finishExam} onScreenLost={screenLost} />

  return <ResultScreen result={result} onExit={() => desktop.quit()} />
}
