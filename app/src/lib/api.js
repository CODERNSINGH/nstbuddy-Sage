export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let token = null // kept in memory only: closing the app logs the student out
export const setToken = (value) => (token = value)
export const getToken = () => token

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}/api/exam${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
