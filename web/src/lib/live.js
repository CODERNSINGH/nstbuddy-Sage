import { API_URL, getToken } from './api.js'

export const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]

/*
  Teacher side of live monitoring.
  Keeps one WebSocket to the backend that tells us which students are online
  and passes the WebRTC connect messages (signaling). The video itself goes
  directly from the student's app to this browser and is never stored.
*/
export function connectLive(contestId, onOnline) {
  const listeners = new Map() // studentConnId -> function(data)
  let socket
  let closed = false

  const send = (to, data) => socket?.readyState === 1 && socket.send(JSON.stringify({ type: 'signal', to, data }))

  function connect() {
    socket = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws?token=${getToken()}`)
    socket.onopen = () => socket.send(JSON.stringify({ type: 'subscribe', contestId: Number(contestId) }))
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'online') onOnline(msg.students)
      if (msg.type === 'signal') listeners.get(msg.from)?.(msg.data)
    }
    socket.onclose = () => !closed && setTimeout(connect, 2000)
  }
  connect()

  return {
    send,
    // Listen to messages from one student; returns an "unlisten" function
    listen(studentId, handler) {
      listeners.set(studentId, handler)
      return () => listeners.delete(studentId)
    },
    close() {
      closed = true
      socket?.close()
    },
  }
}
