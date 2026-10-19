import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { config } from './config.js'
import { query } from './db/pool.js'

/*
  Live monitoring = WebRTC video straight from student -> admin (nothing is stored).
  This file is ONLY the "signaling" middleman: it forwards small connect messages.

  Messages (JSON):
    admin   -> { type: 'subscribe', contestId }     start watching a contest's online students
    server  -> { type: 'online', students: [{ id, name }] }
    admin   -> { type: 'signal', to, data }         relay to one connection (offer/answer/ICE/watch)
    server  -> { type: 'signal', from, data }
*/
const clients = new Map() // connId -> { ws, role, adminId?, contestId?, studentId?, name? }

const send = (ws, message) => ws.readyState === 1 && ws.send(JSON.stringify(message))

function onlineStudents(contestId) {
  return [...clients.entries()]
    .filter(([, c]) => c.role === 'student' && c.contestId === contestId)
    .map(([connId, c]) => ({ id: connId, name: c.name, studentId: c.studentId }))
}

// Tell every admin watching this contest who is online right now
function broadcastOnline(contestId) {
  for (const c of clients.values()) {
    if (c.role === 'admin' && c.subscribed === contestId) {
      send(c.ws, { type: 'online', students: onlineStudents(contestId) })
    }
  }
}

export function attachLive(server) {
  const wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', async (ws, req) => {
    let user
    try {
      const token = new URL(req.url, 'http://x').searchParams.get('token')
      user = jwt.verify(token, config.jwtSecret)
    } catch {
      return ws.close(4001, 'Please login again')
    }

    const connId = crypto.randomUUID()
    const client = { ws, role: user.role }

    if (user.role === 'student') {
      const [reg] = await query('SELECT name FROM registrations WHERE id = $1', [user.id])
      if (!reg) return ws.close(4001, 'Unknown student')
      Object.assign(client, { contestId: user.contestId, studentId: user.id, name: reg.name })
    } else {
      client.adminId = user.id
    }
    clients.set(connId, client)
    if (client.role === 'student') broadcastOnline(client.contestId)

    ws.on('message', async (raw) => {
      let msg
      try {
        msg = JSON.parse(raw)
      } catch {
        return
      }

      if (msg.type === 'subscribe' && client.role === 'admin') {
        // Only the admin who owns the contest may watch it
        const [owned] = await query('SELECT id FROM contests WHERE id = $1 AND admin_id = $2', [
          msg.contestId,
          client.adminId,
        ])
        if (!owned) return
        client.subscribed = owned.id
        send(ws, { type: 'online', students: onlineStudents(owned.id) })
      }

      if (msg.type === 'signal') {
        const target = clients.get(msg.to)
        if (!target) return
        // admin -> students of the contest they watch; student -> admins only
        const allowed =
          client.role === 'admin' ? target.role === 'student' && target.contestId === client.subscribed
          : target.role === 'admin' && target.subscribed === client.contestId
        if (allowed) send(target.ws, { type: 'signal', from: connId, data: msg.data })
      }
    })

    ws.on('close', () => {
      clients.delete(connId)
      if (client.role === 'student') broadcastOnline(client.contestId)
    })
  })
}
