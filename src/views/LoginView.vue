<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import authIcon from '@/assets/icons/auth.svg'
import emailIcon from '@/assets/icons/email.svg'
import passwordIcon from '@/assets/icons/password.svg'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

function login() {
  void router.push('/home')
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
            v-model="email"
            class="app-input"
            type="email"
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

          <q-btn class="primary-button login-button" type="submit" unelevated no-caps>
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
