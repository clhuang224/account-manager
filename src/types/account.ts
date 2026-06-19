export type RoleLevel = 'ADMIN' | 'EDITOR' | 'USER' | 'CLIENT'
export type AccountStatus = 'ON' | 'OFF'

export interface AccountData {
  name: string
  email: string
  roleLevel: RoleLevel
  status: AccountStatus
}

export interface AccountResponse {
  id: string
  createdAt: string
  data: AccountData
}

export interface UpdateAccountResponse {
  message: string
  account: AccountResponse
}

export interface Account extends AccountData {
  id: string
  createdAt: string
}

export interface UpdateAccountResult {
  message: string
  account: Account
}

export type AccountFormData = AccountData
