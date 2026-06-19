<script setup lang="ts">
import { ref } from 'vue'
import type { QInput } from 'quasar'
import { useRouter } from 'vue-router'

import { useAction } from '@/composables/useAction'
import { useAuthStore } from '@/stores/auth'
import authIcon from '@/assets/icons/auth.svg'
import emailIcon from '@/assets/icons/email.svg'
import passwordIcon from '@/assets/icons/password.svg'
import type { AuthCredentials } from '@/types/auth'

interface LoginPayload extends AuthCredentials {
  remember: boolean
}

const router = useRouter()
const authStore = useAuthStore()
const email = ref(authStore.rememberedEmail)
const password = ref('')
const rememberMe = ref(Boolean(authStore.rememberedEmail))
const emailInput = ref<QInput | null>(null)

function isEmailValid() {
  return emailInput.value?.nativeEl.checkValidity() ?? false
}

const { dispatch: loginAction, loading } = useAction<void, LoginPayload>({
  action: ({ remember, ...credentials }) => authStore.login(credentials, remember),
  validators: [
    () => ({
      valid: isEmailValid(),
      key: 'email',
      message: '請輸入有效的電子郵件',
    }),
  ],
  onValidateError: () => {
    emailInput.value?.nativeEl.reportValidity()
  },
  onSuccess: async () => {
    await router.push('/home')
  },
})

function login() {
  void loginAction({ email: email.value, password: password.value, remember: rememberMe.value })
}
</script>

<template>
  <main class="login-page">
    <div class="login-shell">
      <q-card class="login-card" flat>
        <q-card-section class="login-heading">
          <div class="login-heading__icon">
            <img :src="authIcon" alt="" />
          </div>
          <h1>歡迎回來</h1>
          <p>請登入您的帳號以繼續</p>
        </q-card-section>

        <q-form class="login-form" @submit.prevent="login">
          <label class="field-label" for="login-email">電子郵件</label>
          <q-input
            id="login-email"
            ref="emailInput"
            v-model="email"
            class="app-input"
            type="email"
            required
            outlined
            placeholder="your@email.com"
          >
            <template #prepend><img class="field-icon" :src="emailIcon" alt="" /></template>
          </q-input>

          <label class="field-label" for="login-password">密碼</label>
          <q-input
            id="login-password"
            v-model="password"
            class="app-input"
            type="password"
            outlined
            placeholder="••••••••"
          >
            <template #prepend><img class="field-icon" :src="passwordIcon" alt="" /></template>
          </q-input>

          <div class="login-options">
            <q-checkbox v-model="rememberMe" dense label="記住我" />
            <a href="#" @click.prevent>忘記密碼？</a>
          </div>

          <q-btn
            class="primary-button login-button"
            type="submit"
            :loading="loading"
            unelevated
            no-caps
          >
            <img :src="authIcon" alt="" />
            登入
          </q-btn>

          <div class="login-hint">
            <q-icon name="lightbulb" size="20px" />
            <span>提示：輸入任意電子郵件和密碼即可登入</span>
          </div>
        </q-form>
      </q-card>

      <p class="register-link">還沒有帳號？ <a href="#" @click.prevent>立即註冊</a></p>
    </div>
  </main>
</template>
