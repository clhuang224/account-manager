<script setup lang="ts">
import { reactive, watch } from 'vue'

import closeIcon from '@/assets/icons/close.svg'
import type { Account, AccountFormData } from '@/types/account'

const props = defineProps<{
  modelValue: boolean
  account?: Account | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [value: AccountFormData]
}>()

const emptyForm: AccountFormData = {
  name: '',
  email: '',
  roleLevel: 'USER',
  status: 'ON',
}

const form = reactive<AccountFormData>({ ...emptyForm })
const roleOptions = [
  { label: '管理員', value: 'ADMIN' },
  { label: '編輯', value: 'EDITOR' },
  { label: '用戶', value: 'USER' },
  { label: '訪客', value: 'CLIENT' },
]
const statusOptions = [
  { label: '啟用', value: 'ON' },
  { label: '停用', value: 'OFF' },
]

watch(
  () => [props.modelValue, props.account] as const,
  ([isOpen, account]) => {
    if (!isOpen) return
    Object.assign(
      form,
      account
        ? {
            name: account.name,
            email: account.email,
            roleLevel: account.roleLevel,
            status: account.status,
          }
        : emptyForm,
    )
  },
  { immediate: true },
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="loading"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="account-dialog">
      <q-card-section class="account-dialog__header">
        <h2>{{ account ? '編輯帳號' : '新增帳號' }}</h2>
        <q-btn flat round dense :disable="loading" aria-label="關閉" @click="close">
          <img :src="closeIcon" alt="" />
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-form class="account-form" @submit.prevent="submit">
        <q-card-section class="account-dialog__body">
          <label class="field-label required" for="account-name">姓名</label>
          <q-input
            id="account-name"
            v-model="form.name"
            class="app-input"
            outlined
            placeholder="請輸入姓名"
            :rules="[(value) => Boolean(value) || '請輸入姓名']"
            lazy-rules
          />

          <label class="field-label required" for="account-email">電子郵件</label>
          <q-input
            id="account-email"
            v-model="form.email"
            class="app-input"
            type="email"
            outlined
            placeholder="email@example.com"
            :rules="[(value) => Boolean(value) || '請輸入電子郵件']"
            lazy-rules
          />

          <label class="field-label required" for="account-role">角色</label>
          <q-select
            id="account-role"
            v-model="form.roleLevel"
            class="app-input"
            :options="roleOptions"
            emit-value
            map-options
            outlined
          />

          <label class="field-label required" for="account-status">狀態</label>
          <q-select
            id="account-status"
            v-model="form.status"
            class="app-input"
            :options="statusOptions"
            emit-value
            map-options
            outlined
          />
        </q-card-section>

        <q-card-actions class="account-dialog__actions">
          <q-btn
            class="cancel-button"
            flat
            no-caps
            :disable="loading"
            label="取消"
            @click="close"
          />
          <q-btn
            class="primary-button"
            type="submit"
            unelevated
            no-caps
            :loading="loading"
            :label="account ? '儲存變更' : '新增帳號'"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
