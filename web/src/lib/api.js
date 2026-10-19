export const API_URL = import.meta.env.VITE_API_URL || 'https://nstbuddy-sage.onrender.com'

export const getToken = () => localStorage.getItem('token')
export const setToken = (token) =>
  token ? localStorage.setItem('token', token) : localStorage.removeItem('token')

// One function for every backend call. Throws Error(message) when the server says no.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}
