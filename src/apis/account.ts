import axios from 'axios'
import type { AxiosError } from 'axios'
import type {
  Account,
  AccountFormData,
  AccountResponse,
  UpdateAccountResponse,
  UpdateAccountResult,
} from '@/types/account'
import type { AuthCredentials } from '@/types/auth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    interviewerName: import.meta.env.VITE_INTERVIEWER_NAME,
  },
})

export interface ErrorResponse {
  message: string
  error: string
  statusCode: number
}

export type ApiError = AxiosError<ErrorResponse>

export function isApiError(error: unknown): error is ApiError {
  return axios.isAxiosError<ErrorResponse>(error)
}

function normalizeAccount({ id, createdAt, data }: AccountResponse): Account {
  return { id, createdAt, ...data }
}

export async function getAccounts(credentials: AuthCredentials): Promise<Account[]> {
  const response = await apiClient.get<AccountResponse[]>('/accounts', { params: credentials })
  return response.data.map(normalizeAccount)
}

export async function getAccountById(id: string): Promise<Account> {
  const response = await apiClient.get<AccountResponse>(`/account/${id}`)
  return normalizeAccount(response.data)
}

export async function createAccount(data: AccountFormData): Promise<void> {
  await apiClient.post<void>('/create-account', { data })
}

export async function updateAccount(
  id: string,
  data: AccountFormData,
): Promise<UpdateAccountResult> {
  const response = await apiClient.patch<UpdateAccountResponse>(`/update-account/${id}`, { data })
  return {
    message: response.data.message,
    account: normalizeAccount(response.data.account),
  }
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.patch<void>(`/delete-account/${id}`)
}
