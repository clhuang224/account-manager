export type AccountRole = '管理員' | '用戶' | '編輯'
export type AccountStatus = '啟用' | '停用'

export interface Account {
  id: number
  name: string
  email: string
  role: AccountRole
  status: AccountStatus
  createdAt: string
}

export type AccountFormData = Pick<Account, 'name' | 'email' | 'role' | 'status'>
