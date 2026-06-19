<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

import AccountFormDialog from '@/components/AccountFormDialog.vue'
import {
  createAccount,
  deleteAccount,
  getAccounts,
  isApiError,
  updateAccount,
} from '@/apis/account'
import { useAction } from '@/composables/useAction'
import addIcon from '@/assets/icons/add.svg'
import authIcon from '@/assets/icons/auth.svg'
import deleteIcon from '@/assets/icons/delete.svg'
import editIcon from '@/assets/icons/edit.svg'
import emailIcon from '@/assets/icons/email.svg'
import searchIcon from '@/assets/icons/search.svg'
import userIcon from '@/assets/icons/user.svg'
import usersIcon from '@/assets/icons/users.svg'
import type { Account, AccountFormData, RoleLevel } from '@/types/account'

interface SaveAccountPayload {
  account: Account | null
  form: AccountFormData
}

const roleLabels: Record<RoleLevel, string> = {
  ADMIN: '管理員',
  EDITOR: '編輯',
  USER: '用戶',
  CLIENT: '訪客',
}

const router = useRouter()
const $q = useQuasar()
const search = ref('')
const dialogOpen = ref(false)
const editingAccount = ref<Account | null>(null)
const accounts = ref<Account[]>([])

function showError(error: unknown) {
  const message = isApiError(error)
    ? (error.response?.data.message ?? error.message)
    : error instanceof Error
      ? error.message
      : '發生未預期的錯誤'

  $q.notify({ type: 'negative', message })
}

const { dispatch: loadAccounts, loading: accountsLoading } = useAction<Account[], string>({
  debounce: 300,
  concurrency: 'latest',
  action: (keyword) => getAccounts({ name: keyword, email: keyword }),
  onSuccess: (result) => {
    accounts.value = result
  },
  onError: showError,
})

const { dispatch: saveAccount, loading: savingAccount } = useAction<void, SaveAccountPayload>({
  concurrency: 'exhaust',
  action: ({ account, form }) => (account ? updateAccount(account.id, form) : createAccount(form)),
  validators: [
    (payload) => ({
      valid: Boolean(payload?.form.name.trim()),
      key: 'name',
      message: '請輸入姓名',
    }),
    (payload) => ({
      valid: Boolean(payload?.form.email.trim()),
      key: 'email',
      message: '請輸入電子郵件',
    }),
  ],
  onSuccess: async (_, payload) => {
    dialogOpen.value = false
    $q.notify({ type: 'positive', message: payload?.account ? '帳號已更新' : '帳號已新增' })
    await loadAccounts(search.value)
  },
  onError: showError,
})

const {
  dispatch: removeAccount,
  loading: deletingAccount,
  isCurrentPayload: isDeletingAccount,
} = useAction<void, string>({
  concurrency: 'exhaust',
  guards: [(id) => Boolean(id)],
  action: deleteAccount,
  onSuccess: async () => {
    $q.notify({ type: 'positive', message: '帳號已刪除' })
    await loadAccounts(search.value)
  },
  onError: showError,
})

const enabledCount = computed(
  () => accounts.value.filter((account) => account.status === 'ON').length,
)

function openCreateDialog() {
  editingAccount.value = null
  dialogOpen.value = true
}

function openEditDialog(account: Account) {
  editingAccount.value = account
  dialogOpen.value = true
}

function submitAccount(form: AccountFormData) {
  void saveAccount({ account: editingAccount.value, form })
}

function logout() {
  void router.push('/login')
}

watch(search, (keyword) => {
  void loadAccounts(keyword?.trim() ?? '')
})

onMounted(() => {
  void loadAccounts('')
})
</script>

<template>
  <div class="home-page">
    <header class="app-header">
      <div class="brand">
        <div class="brand__icon"><img :src="usersIcon" alt="" /></div>
        <div>
          <h1>帳號管理系統</h1>
          <p>管理您的所有帳號</p>
        </div>
      </div>
      <q-btn class="logout-button" flat no-caps @click="logout">
        <img :src="authIcon" alt="" />
        登出
      </q-btn>
    </header>

    <main class="home-content">
      <section class="home-toolbar">
        <q-input
          v-model="search"
          class="app-input search-input"
          outlined
          clearable
          placeholder="搜尋帳號（姓名、郵件）..."
        >
          <template #prepend><img class="field-icon" :src="searchIcon" alt="" /></template>
          <template #append><q-spinner v-if="accountsLoading" size="20px" /></template>
        </q-input>
        <q-btn class="primary-button add-button" unelevated no-caps @click="openCreateDialog">
          <img :src="addIcon" alt="" />
          新增帳號
        </q-btn>
      </section>

      <section class="summary-grid" aria-label="帳號統計">
        <q-card flat bordered
          ><span>總帳號數</span><strong>{{ accounts.length }}</strong></q-card
        >
        <q-card flat bordered
          ><span>啟用中</span><strong>{{ enabledCount }}</strong></q-card
        >
        <q-card flat bordered
          ><span>已停用</span><strong>{{ accounts.length - enabledCount }}</strong></q-card
        >
      </section>

      <section class="account-grid" aria-label="帳號列表">
        <q-card v-for="account in accounts" :key="account.id" class="account-card" flat bordered>
          <q-card-section>
            <div class="account-card__heading">
              <div class="account-avatar"><img :src="userIcon" alt="" /></div>
              <div>
                <h2>{{ account.name }}</h2>
                <q-badge :class="account.status === 'ON' ? 'status-enabled' : 'status-disabled'">
                  {{ account.status === 'ON' ? '啟用' : '停用' }}
                </q-badge>
              </div>
            </div>

            <div class="account-detail"><img :src="emailIcon" alt="" />{{ account.email }}</div>
            <div class="account-detail">
              <img :src="userIcon" alt="" />{{ roleLabels[account.roleLevel] }}
            </div>

            <q-separator />

            <div class="account-actions">
              <q-btn
                flat
                no-caps
                :disable="savingAccount || deletingAccount"
                @click="openEditDialog(account)"
              >
                <img :src="editIcon" alt="" />編輯
              </q-btn>
              <q-btn
                class="delete-button"
                flat
                no-caps
                :loading="isDeletingAccount(account.id)"
                :disable="savingAccount || (deletingAccount && !isDeletingAccount(account.id))"
                @click="removeAccount(account.id)"
              >
                <img :src="deleteIcon" alt="" />刪除
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <p v-if="!accountsLoading && accounts.length === 0" class="empty-state">
        找不到符合條件的帳號
      </p>
    </main>

    <AccountFormDialog
      v-model="dialogOpen"
      :account="editingAccount"
      :loading="savingAccount"
      @submit="submitAccount"
    />
  </div>
</template>
