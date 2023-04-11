import { STORAGE_PREFIX } from '@/constant'

const TOKEN = `${STORAGE_PREFIX}TOKEN`

export function getToken (): string {
  return localStorage.getItem(TOKEN) || ''
}

export function setToken (token: string) {
  return localStorage.setItem(TOKEN, token)
}

export function removeToken () {
  localStorage.removeItem(TOKEN)
}
