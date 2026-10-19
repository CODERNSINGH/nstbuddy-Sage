import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export const signToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, config.jwtSecret, { expiresIn })

// Reads "Authorization: Bearer <token>" and checks the token role
function requireRole(role) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    try {
      const payload = jwt.verify(token, config.jwtSecret)
      if (payload.role !== role) throw new Error('wrong role')
      req.user = payload
      next()
    } catch {
      res.status(401).json({ error: 'Please login again' })
    }
  }
}

export const requireAdmin = requireRole('admin')     // req.user = { id, role }
export const requireStudent = requireRole('student') // req.user = { id (registration), contestId, role }
