import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { AuthCredentials } from '@/types/auth'

const credentialsStorageKey = 'account-manager.credentials'
const rememberedEmailStorageKey = 'account-manager.remembered-email'

function readCredentials(): AuthCredentials | null {
  const value = sessionStorage.getItem(credentialsStorageKey)
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
  const rememberedEmail = ref(localStorage.getItem(rememberedEmailStorageKey) ?? '')
  const isAuthenticated = computed(() => credentials.value !== null)

  function login(value: AuthCredentials, remember: boolean) {
    credentials.value = {
      email: value.email.trim(),
      password: value.password,
    }

    sessionStorage.setItem(credentialsStorageKey, JSON.stringify(credentials.value))
    localStorage.removeItem(credentialsStorageKey)

    if (remember) {
      rememberedEmail.value = credentials.value.email
      localStorage.setItem(rememberedEmailStorageKey, credentials.value.email)
    } else {
      rememberedEmail.value = ''
      localStorage.removeItem(rememberedEmailStorageKey)
    }
  }

  function logout() {
    credentials.value = null
    sessionStorage.removeItem(credentialsStorageKey)
    localStorage.removeItem(credentialsStorageKey)
  }

  return {
    credentials,
    rememberedEmail,
    isAuthenticated,
    login,
    logout,
  }
})
