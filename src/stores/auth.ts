import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { AuthCredentials } from '@/types/auth'

const storageKey = 'account-manager.credentials'

function readCredentials(): AuthCredentials | null {
  const value = localStorage.getItem(storageKey) ?? sessionStorage.getItem(storageKey)
  if (!value) return null

  try {
    const credentials = JSON.parse(value) as Partial<AuthCredentials>
    if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
      return null
    }
    return { email: credentials.email, password: credentials.password }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const credentials = ref<AuthCredentials | null>(readCredentials())
  const isAuthenticated = computed(() => credentials.value !== null)

  function login(value: AuthCredentials, remember: boolean) {
    credentials.value = {
      email: value.email.trim(),
      password: value.password,
    }

    localStorage.removeItem(storageKey)
    sessionStorage.removeItem(storageKey)
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(storageKey, JSON.stringify(credentials.value))
  }

  function logout() {
    credentials.value = null
    localStorage.removeItem(storageKey)
    sessionStorage.removeItem(storageKey)
  }

  return {
    credentials,
    isAuthenticated,
    login,
    logout,
  }
})
