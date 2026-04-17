import api from './api'

export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password })
  const { token, ...user } = res.data.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
