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
    <q-card :class="$style.accountDialog">
      <q-card-section :class="$style.accountDialogHeader">
        <h2>{{ account ? '編輯帳號' : '新增帳號' }}</h2>
        <q-btn flat round dense :disable="loading" aria-label="關閉" @click="close">
          <img :src="closeIcon" alt="" />
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-form @submit.prevent="submit">
        <q-card-section :class="$style.accountDialogBody">
          <label :class="[$style.fieldLabel, $style.required]" for="account-name">姓名</label>
          <q-input
            id="account-name"
            v-model="form.name"
            :class="$style.appInput"
            outlined
            placeholder="請輸入姓名"
            :rules="[(value) => Boolean(value) || '請輸入姓名']"
            lazy-rules
          />

          <label :class="[$style.fieldLabel, $style.required]" for="account-email">
            電子郵件
          </label>
          <q-input
            id="account-email"
            v-model="form.email"
            :class="$style.appInput"
            type="email"
            outlined
            placeholder="email@example.com"
            :rules="[(value) => Boolean(value) || '請輸入電子郵件']"
            lazy-rules
          />

          <label :class="[$style.fieldLabel, $style.required]" for="account-role">角色</label>
          <q-select
            id="account-role"
            v-model="form.roleLevel"
            :class="$style.appInput"
            :options="roleOptions"
            emit-value
            map-options
            outlined
          />

          <label :class="[$style.fieldLabel, $style.required]" for="account-status">狀態</label>
          <q-select
            id="account-status"
            v-model="form.status"
            :class="$style.appInput"
            :options="statusOptions"
            emit-value
            map-options
            outlined
          />
        </q-card-section>

        <q-card-actions :class="$style.accountDialogActions">
          <q-btn
            :class="$style.cancelButton"
            flat
            no-caps
            :disable="loading"
            label="取消"
            @click="close"
          />
          <q-btn
            :class="$style.primaryButton"
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

<style module lang="scss">
$primary: #5538f6;
$primary-dark: #4327ea;

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
}

.fieldLabel {
  display: block;
  margin: 0 0 8px;
  color: #354158;
  font-size: 16px;
}

.required::after {
  margin-left: 4px;
  color: #e11d48;
  content: '*';
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

.accountDialog {
  width: min(448px, calc(100vw - 32px));
  max-width: none;
  border-radius: 16px;
}

.accountDialogHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 68px;
  padding: 20px 24px;

  h2 {
    margin: 0;
    font-size: 17px;
    font-weight: 500;
  }

  img {
    width: 20px;
    opacity: 0.55;
  }
}

.accountDialogBody {
  padding: 26px 24px 8px;

  .appInput {
    margin-bottom: 16px;
  }
}

.accountDialogActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px 24px 24px;
  gap: 12px;

  :global(.q-btn) {
    min-height: 48px;
    border-radius: 10px;
  }
}

.cancelButton {
  color: #445066;
  background: #f1f2f5;
}

@media (max-width: 560px) {
  .accountDialogActions {
    grid-template-columns: 1fr;
  }
}
</style>
