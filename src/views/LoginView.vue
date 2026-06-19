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
  <main :class="$style.loginPage">
    <div :class="$style.loginShell">
      <q-card :class="$style.loginCard" flat>
        <q-card-section :class="$style.loginHeading">
          <div :class="$style.loginHeadingIcon">
            <img :src="authIcon" alt="" />
          </div>
          <h1>歡迎回來</h1>
          <p>請登入您的帳號以繼續</p>
        </q-card-section>

        <q-form :class="$style.loginForm" @submit.prevent="login">
          <label :class="$style.fieldLabel" for="login-email">電子郵件</label>
          <q-input
            id="login-email"
            ref="emailInput"
            v-model="email"
            :class="$style.appInput"
            type="email"
            required
            outlined
            placeholder="your@email.com"
          >
            <template #prepend><img :class="$style.fieldIcon" :src="emailIcon" alt="" /></template>
          </q-input>

          <label :class="$style.fieldLabel" for="login-password">密碼</label>
          <q-input
            id="login-password"
            v-model="password"
            :class="$style.appInput"
            type="password"
            outlined
            placeholder="••••••••"
          >
            <template #prepend
              ><img :class="$style.fieldIcon" :src="passwordIcon" alt=""
            /></template>
          </q-input>

          <div :class="$style.loginOptions">
            <q-checkbox v-model="rememberMe" dense label="記住我" />
            <a href="#" @click.prevent>忘記密碼？</a>
          </div>

          <q-btn
            :class="[$style.primaryButton, $style.loginButton]"
            type="submit"
            :loading="loading"
            unelevated
            no-caps
          >
            <img :src="authIcon" alt="" />
            登入
          </q-btn>

          <div :class="$style.loginHint">
            <q-icon name="lightbulb" size="20px" />
            <span>提示：輸入任意電子郵件和密碼即可登入</span>
          </div>
        </q-form>
      </q-card>

      <p :class="$style.registerLink">還沒有帳號？ <a href="#" @click.prevent>立即註冊</a></p>
    </div>
  </main>
</template>

<style module lang="scss">
$primary: #5538f6;
$primary-dark: #4327ea;
$muted: #526077;

.primaryButton {
  min-height: 50px;
  border-radius: 10px;
  color: #fff;
  background: $primary;
  font-size: 16px;
  font-weight: 500;

  &:hover {
    background: $primary-dark;
  }

  img {
    width: 21px;
    height: 21px;
    margin-right: 8px;
    filter: brightness(0) invert(1);
  }
}

.fieldLabel {
  display: block;
  margin: 0 0 8px;
  color: #354158;
  font-size: 16px;
}

.fieldIcon {
  width: 20px;
  height: 20px;
  opacity: 0.5;
}

.appInput {
  :global(.q-field__control) {
    min-height: 50px;
    border-radius: 10px;
    background: #fff;
  }

  :global(.q-field__native),
  :global(.q-field__input) {
    font-size: 16px;
  }

  &:global(.q-field--outlined) :global(.q-field__control)::before {
    border-color: #ccd3df;
  }

  &:global(.q-field--focused) :global(.q-field__control)::after {
    border-color: $primary;
  }
}

.loginPage {
  display: grid;
  min-height: 100vh;
  padding: 48px 20px;
  place-items: center;
  background: linear-gradient(135deg, #f0f5ff 0%, #e4ebff 100%);
}

.loginShell {
  width: min(448px, 100%);
}

.loginCard {
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 18px 35px rgb(50 65 105 / 14%);
}

.loginHeading {
  padding: 0 0 34px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: $muted;
    font-size: 16px;
  }
}

.loginHeadingIcon {
  display: grid;
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: $primary;
  place-items: center;

  img {
    width: 30px;
    filter: brightness(0) invert(1);
    transform: rotate(180deg);
  }
}

.loginForm .appInput {
  margin-bottom: 24px;
}

.loginOptions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -2px 0 24px;
  font-size: 15px;
}

.loginButton {
  width: 100%;

  img {
    transform: rotate(180deg);
  }
}

.loginHint {
  display: flex;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #aad0ff;
  border-radius: 10px;
  color: #2254c7;
  background: #f0f6ff;
  gap: 7px;
  font-size: 15px;

  :global(.q-icon) {
    color: #ffc83d;
  }
}

.registerLink {
  margin: 25px 0 0;
  text-align: center;
}

@media (max-width: 560px) {
  .loginPage {
    padding: 24px 16px;
  }

  .loginCard {
    padding: 28px 22px;
  }

  .loginHint {
    align-items: flex-start;
  }
}
</style>
