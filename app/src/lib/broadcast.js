import { API_URL, getToken } from './api.js'

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]
const MAX_BITRATE = { screen: 700_000, camera: 250_000 } // keep the live feed light

/*
  Live monitoring, student side.
  The teacher's browser asks to watch -> we open a WebRTC connection and send
  our screen + camera straight to them. Nothing is recorded or stored.
  The backend only passes the small connect messages between us (signaling).
*/
export function startBroadcast(streams) {
  const wsUrl = `${API_URL.replace(/^http/, 'ws')}/ws?token=${getToken()}`
  const peers = new Map() // adminConnId -> { pc, queue }
  let socket
  let stopped = false

  const send = (to, data) => socket?.readyState === 1 && socket.send(JSON.stringify({ type: 'signal', to, data }))

  function closePeer(adminId) {
    peers.get(adminId)?.pc.close()
    peers.delete(adminId)
  }

  async function onWatch(adminId) {
    closePeer(adminId)
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    peers.set(adminId, { pc, queue: Promise.resolve() })

    for (const kind of ['screen', 'camera']) {
      const track = streams[kind].getVideoTracks()[0]
      const sender = pc.addTrack(track, streams[kind])
      const params = sender.getParameters()
      if (params.encodings?.length) {
        params.encodings[0].maxBitrate = MAX_BITRATE[kind]
        sender.setParameters(params).catch(() => {})
      }
    }

    pc.onicecandidate = (e) => e.candidate && send(adminId, { kind: 'ice', candidate: e.candidate })
    await pc.setLocalDescription(await pc.createOffer())
    // `meta` tells the teacher which incoming stream is the screen and which is the camera
    send(adminId, { kind: 'offer', sdp: pc.localDescription, meta: { screen: streams.screen.id, camera: streams.camera.id } })
  }

  // Messages for one teacher are handled one after another, so ICE never beats the answer
  function onSignal(adminId, data) {
    if (data.kind === 'watch') return onWatch(adminId)
    const peer = peers.get(adminId)
    if (!peer) return
    peer.queue = peer.queue.then(async () => {
      if (data.kind === 'answer') await peer.pc.setRemoteDescription(data.sdp)
      if (data.kind === 'ice') await peer.pc.addIceCandidate(data.candidate)
      if (data.kind === 'stop') closePeer(adminId)
    }).catch(() => {})
  }

  function connect() {
    socket = new WebSocket(wsUrl)
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'signal') onSignal(msg.from, msg.data)
    }
    socket.onclose = () => !stopped && setTimeout(connect, 2000) // reconnect if the network blips
  }
  connect()

  return function stop() {
    stopped = true
    peers.forEach((_, id) => closePeer(id))
    socket?.close()
  }
}
