<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import { useAuthStore } from '@/stores/auth'
import addIcon from '@/assets/icons/add.svg'
import authIcon from '@/assets/icons/auth.svg'
import calendarIcon from '@/assets/icons/calendar.svg'
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

interface SaveAccountResult {
  message: string
}

const roleLabels: Record<RoleLevel, string> = {
  ADMIN: '管理員',
  EDITOR: '編輯',
  USER: '用戶',
  CLIENT: '訪客',
}

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
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

const { dispatch: loadAccounts, loading: accountsLoading } = useAction<Account[]>({
  action: () => {
    if (!authStore.credentials) throw new Error('尚未登入')
    return getAccounts(authStore.credentials)
  },
  onSuccess: (result) => {
    accounts.value = result
  },
  onError: showError,
})

const { dispatch: saveAccount, loading: savingAccount } = useAction<
  SaveAccountResult,
  SaveAccountPayload
>({
  concurrency: 'exhaust',
  action: async ({ account, form }) => {
    if (account) return updateAccount(account.id, form)
    await createAccount(form)
    return { message: '帳號已新增' }
  },
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
  onSuccess: async (result) => {
    dialogOpen.value = false
    $q.notify({ type: 'positive', message: result.message })
    await loadAccounts()
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
    await loadAccounts()
  },
  onError: showError,
})

const enabledCount = computed(
  () => accounts.value.filter((account) => account.status === 'ON').length,
)

const filteredAccounts = computed(() => {
  const keyword = search.value?.trim().toLocaleLowerCase() ?? ''
  if (!keyword) return accounts.value

  return accounts.value.filter((account) =>
    [account.name, account.email, roleLabels[account.roleLevel]].some((value) =>
      value.toLocaleLowerCase().includes(keyword),
    ),
  )
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium' }).format(new Date(value))
}

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
  authStore.logout()
  void router.push('/login')
}

onMounted(() => {
  void loadAccounts()
})
</script>

<template>
  <div :class="$style.homePage">
    <header :class="$style.appHeader">
      <div :class="$style.brand">
        <div :class="$style.brandIcon"><img :src="usersIcon" alt="" /></div>
        <div>
          <h1>帳號管理系統</h1>
          <p>管理您的所有帳號</p>
        </div>
      </div>
      <q-btn :class="$style.logoutButton" flat no-caps @click="logout">
        <img :src="authIcon" alt="" />
        登出
      </q-btn>
    </header>

    <main :class="$style.homeContent">
      <section :class="$style.homeToolbar">
        <q-input
          v-model="search"
          :class="[$style.appInput, $style.searchInput]"
          outlined
          clearable
          placeholder="搜尋帳號（姓名、郵件）..."
        >
          <template #prepend><img :class="$style.fieldIcon" :src="searchIcon" alt="" /></template>
          <template #append><q-spinner v-if="accountsLoading" size="20px" /></template>
        </q-input>
        <q-btn
          :class="[$style.primaryButton, $style.addButton]"
          unelevated
          no-caps
          @click="openCreateDialog"
        >
          <img :src="addIcon" alt="" />
          新增帳號
        </q-btn>
      </section>

      <section :class="$style.summaryGrid" aria-label="帳號統計">
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

      <section :class="$style.accountGrid" aria-label="帳號列表">
        <q-card
          v-for="account in filteredAccounts"
          :key="account.id"
          :class="$style.accountCard"
          flat
          bordered
        >
          <q-card-section>
            <div :class="$style.accountCardHeading">
              <div :class="$style.accountAvatar"><img :src="userIcon" alt="" /></div>
              <div>
                <h2>{{ account.name }}</h2>
                <q-badge
                  :class="account.status === 'ON' ? $style.statusEnabled : $style.statusDisabled"
                >
                  {{ account.status === 'ON' ? '啟用' : '停用' }}
                </q-badge>
              </div>
            </div>

            <div :class="$style.accountDetail">
              <img :src="emailIcon" alt="" />{{ account.email }}
            </div>
            <div :class="$style.accountDetail">
              <img :src="userIcon" alt="" />{{ roleLabels[account.roleLevel] }}
            </div>
            <div :class="$style.accountDetail">
              <img :src="calendarIcon" alt="" />{{ formatDate(account.createdAt) }}
            </div>

            <q-separator />

            <div :class="$style.accountActions">
              <q-btn
                flat
                no-caps
                :disable="savingAccount || deletingAccount"
                @click="openEditDialog(account)"
              >
                <img :src="editIcon" alt="" />編輯
              </q-btn>
              <q-btn
                :class="$style.deleteButton"
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

      <p v-if="!accountsLoading && filteredAccounts.length === 0" :class="$style.emptyState">
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

<style module lang="scss">
$primary: #5538f6;
$primary-dark: #4327ea;
$muted: #526077;
$page: #f8f9fb;

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

.homePage {
  min-height: 100vh;
  background: $page;
}

.appHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 94px;
  padding: 16px 30px;
  border-bottom: 1px solid #e1e4e9;
  background: #fff;
  box-shadow: 0 2px 4px rgb(25 35 55 / 5%);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;

  h1 {
    margin: 0 0 2px;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: $muted;
    font-size: 14px;
  }
}

.brandIcon {
  display: grid;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: $primary;
  place-items: center;

  img {
    width: 24px;
    filter: brightness(0) invert(1);
  }
}

.logoutButton {
  color: #354158;
  font-size: 16px;

  img {
    width: 20px;
    margin-right: 7px;
  }
}

.homeContent {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 30px 56px;
}

.homeToolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  margin-bottom: 24px;
  gap: 16px;
}

.searchInput :global(.q-field__control),
.addButton {
  height: 50px;
}

.addButton {
  min-width: 140px;
}

.summaryGrid,
.accountGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summaryGrid {
  margin-bottom: 32px;

  :global(.q-card) {
    display: flex;
    min-height: 102px;
    padding: 24px;
    border-color: #dde1e7;
    border-radius: 10px;
    flex-direction: column;
    box-shadow: 0 2px 4px rgb(25 35 55 / 7%);
  }

  span {
    margin-bottom: 4px;
    color: $muted;
  }

  strong {
    font-size: 17px;
    font-weight: 500;
  }
}

.accountCard {
  border-color: #dde1e7;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgb(25 35 55 / 7%);

  :global(.q-card__section) {
    padding: 24px;
  }

  :global(.q-separator) {
    margin: 10px 0 16px;
  }
}

.accountCardHeading {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;

  h2 {
    display: inline-block;
    margin: 0 8px 5px 0;
    font-size: 17px;
    font-weight: 500;
  }
}

.accountAvatar {
  display: grid;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6548ff, #8b2cff);
  flex: 0 0 auto;
  place-items: center;

  img {
    width: 24px;
    filter: brightness(0) invert(1);
  }
}

.statusEnabled,
.statusDisabled {
  padding: 5px 9px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
}

.statusEnabled {
  background: #00bf54;
}

.statusDisabled {
  background: #9ca3af;
}

.accountDetail {
  display: flex;
  align-items: center;
  min-height: 36px;
  color: #425069;
  gap: 10px;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.82;
  }
}

.accountActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  :global(.q-btn) {
    min-height: 40px;
    border-radius: 9px;
    color: $primary;
    background: #eef1ff;

    img {
      width: 16px;
      margin-right: 8px;
      filter: invert(32%) sepia(87%) saturate(6035%) hue-rotate(246deg) brightness(97%);
    }
  }

  .deleteButton {
    color: #f20b2e;
    background: #fff0f2;

    img {
      filter: invert(16%) sepia(96%) saturate(5495%) hue-rotate(344deg) brightness(101%);
    }
  }
}

.emptyState {
  padding: 50px 0;
  color: $muted;
  text-align: center;
}

@media (max-width: 800px) {
  .summaryGrid,
  .accountGrid {
    grid-template-columns: 1fr;
  }

  .summaryGrid {
    gap: 12px;
  }
}

@media (max-width: 560px) {
  .appHeader {
    min-height: 80px;
    padding: 14px 16px;
  }

  .brand h1 {
    font-size: 19px;
  }

  .brand p {
    display: none;
  }

  .logoutButton {
    padding: 8px;
  }

  .homeContent {
    padding: 24px 16px 40px;
  }

  .homeToolbar {
    grid-template-columns: 1fr;
  }

  .addButton {
    width: 100%;
  }
}
</style>
