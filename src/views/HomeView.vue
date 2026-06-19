<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AccountFormDialog from '@/components/AccountFormDialog.vue'
import addIcon from '@/assets/icons/add.svg'
import authIcon from '@/assets/icons/auth.svg'
import calendarIcon from '@/assets/icons/calendar.svg'
import deleteIcon from '@/assets/icons/delete.svg'
import editIcon from '@/assets/icons/edit.svg'
import emailIcon from '@/assets/icons/email.svg'
import searchIcon from '@/assets/icons/search.svg'
import userIcon from '@/assets/icons/user.svg'
import usersIcon from '@/assets/icons/users.svg'
import type { Account, AccountFormData } from '@/types/account'

const router = useRouter()
const search = ref('')
const dialogOpen = ref(false)
const editingAccount = ref<Account | null>(null)
const accounts = ref<Account[]>([
  {
    id: 1,
    name: '張小明',
    email: 'ming.chang@example.com',
    role: '管理員',
    status: '啟用',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: '李美麗',
    email: 'meili.li@example.com',
    role: '用戶',
    status: '啟用',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    name: '王大寶',
    email: 'dabao.wang@example.com',
    role: '編輯',
    status: '停用',
    createdAt: '2024-03-10',
  },
])

const filteredAccounts = computed(() => {
  const keyword = search.value.trim().toLocaleLowerCase()
  if (!keyword) return accounts.value
  return accounts.value.filter((account) =>
    [account.name, account.email, account.role].some((value) =>
      value.toLocaleLowerCase().includes(keyword),
    ),
  )
})

const enabledCount = computed(
  () => accounts.value.filter((account) => account.status === '啟用').length,
)

function openCreateDialog() {
  editingAccount.value = null
  dialogOpen.value = true
}

function openEditDialog(account: Account) {
  editingAccount.value = account
  dialogOpen.value = true
}

function saveAccount(form: AccountFormData) {
  if (editingAccount.value) {
    accounts.value = accounts.value.map((account) =>
      account.id === editingAccount.value?.id ? { ...account, ...form } : account,
    )
    return
  }

  accounts.value.push({
    id: Date.now(),
    ...form,
    createdAt: new Date().toISOString().slice(0, 10),
  })
}

function removeAccount(id: number) {
  accounts.value = accounts.value.filter((account) => account.id !== id)
}

function logout() {
  void router.push('/login')
}
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
          placeholder="搜尋帳號（姓名、郵件、角色）..."
        >
          <template #prepend><img class="field-icon" :src="searchIcon" alt="" /></template>
        </q-input>
        <q-btn class="primary-button add-button" unelevated no-caps @click="openCreateDialog">
          <img :src="addIcon" alt="" />
          新增帳號
        </q-btn>
      </section>

      <section class="summary-grid" aria-label="帳號統計">
        <q-card flat bordered><span>總帳號數</span><strong>{{ accounts.length }}</strong></q-card>
        <q-card flat bordered><span>啟用中</span><strong>{{ enabledCount }}</strong></q-card>
        <q-card flat bordered><span>已停用</span><strong>{{ accounts.length - enabledCount }}</strong></q-card>
      </section>

      <section class="account-grid" aria-label="帳號列表">
        <q-card v-for="account in filteredAccounts" :key="account.id" class="account-card" flat bordered>
          <q-card-section>
            <div class="account-card__heading">
              <div class="account-avatar"><img :src="userIcon" alt="" /></div>
              <div>
                <h2>{{ account.name }}</h2>
                <q-badge :class="account.status === '啟用' ? 'status-enabled' : 'status-disabled'">
                  {{ account.status }}
                </q-badge>
              </div>
            </div>

            <div class="account-detail"><img :src="emailIcon" alt="" />{{ account.email }}</div>
            <div class="account-detail"><img :src="userIcon" alt="" />{{ account.role }}</div>
            <div class="account-detail"><img :src="calendarIcon" alt="" />{{ account.createdAt }}</div>

            <q-separator />

            <div class="account-actions">
              <q-btn flat no-caps @click="openEditDialog(account)">
                <img :src="editIcon" alt="" />編輯
              </q-btn>
              <q-btn class="delete-button" flat no-caps @click="removeAccount(account.id)">
                <img :src="deleteIcon" alt="" />刪除
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <p v-if="filteredAccounts.length === 0" class="empty-state">找不到符合條件的帳號</p>
    </main>

    <AccountFormDialog
      v-model="dialogOpen"
      :account="editingAccount"
      @submit="saveAccount"
    />
  </div>
</template>
