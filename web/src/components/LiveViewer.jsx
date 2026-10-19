import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ICE_SERVERS } from '../lib/live.js'

// Plays a MediaStream in a <video>
function Video({ stream, className }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream || null
  }, [stream])
  return <video ref={ref} autoPlay muted playsInline className={className} />
}

// Opens a WebRTC connection to ONE student and shows their screen + camera
export default function LiveViewer({ live, student, online, onClose }) {
  const [streams, setStreams] = useState({ screen: null, camera: null })
  const [status, setStatus] = useState('Connecting...')

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    let meta = {}
    let queue = Promise.resolve() // handle messages one by one, in order

    pc.ontrack = (e) => {
      const stream = e.streams[0]
      const kind = stream.id === meta.screen ? 'screen' : 'camera'
      setStreams((s) => ({ ...s, [kind]: stream }))
      setStatus('')
    }
    pc.onicecandidate = (e) => e.candidate && live.send(student.id, { kind: 'ice', candidate: e.candidate })
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') setStatus('Connection failed. Is the student on a strict network?')
    }

    const unlisten = live.listen(student.id, (data) => {
      queue = queue
        .then(async () => {
          if (data.kind === 'offer') {
            meta = data.meta
            await pc.setRemoteDescription(data.sdp)
            await pc.setLocalDescription(await pc.createAnswer())
            live.send(student.id, { kind: 'answer', sdp: pc.localDescription })
          }
          if (data.kind === 'ice') await pc.addIceCandidate(data.candidate)
        })
        .catch(() => {})
    })

    live.send(student.id, { kind: 'watch' }) // ask the student's app to start sending

    return () => {
      live.send(student.id, { kind: 'stop' })
      unlisten()
      pc.close()
    }
  }, [live, student.id])

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink/70 p-4" onClick={onClose}>
      <div className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">{student.name}</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Live
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl bg-ink">
          <Video stream={streams.screen} className="h-full w-full object-contain" />
          {streams.camera && (
            <Video stream={streams.camera} className="absolute bottom-3 right-3 h-32 w-44 rounded-xl border-2 border-white object-cover shadow-lg" />
          )}
          {(status || !online) && (
            <div className="absolute inset-0 grid place-items-center text-sm font-medium text-white/80">
              {online ? status : 'Student went offline'}
            </div>
          )}
        </div>
        <p className="mt-3 px-1 text-xs text-slate-500">Live feed only. Nothing is recorded or stored.</p>
      </div>
    </div>
  )
}
