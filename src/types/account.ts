export type RoleLevel = 'ADMIN' | 'EDITOR' | 'USER' | 'CLIENT'
export type AccountStatus = 'ON' | 'OFF'

export interface Account {
  id: string
  name: string
  email: string
  roleLevel: RoleLevel
  status: AccountStatus
}

export type AccountFormData = Omit<Account, 'id'>
