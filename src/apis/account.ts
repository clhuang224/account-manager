import axios from 'axios'
import type { AxiosError } from 'axios'
import type { Account } from '@/types/account'
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

export async function getAccounts(credentials: AuthCredentials): Promise<Account[]> {
  const response = await apiClient.get<Account[]>('/accounts', { params: credentials })
  return response.data
}

export async function getAccountById(id: string): Promise<Account> {
  const response = await apiClient.get<Account>(`/account/${id}`)
  return response.data
}

export async function createAccount(data: Omit<Account, 'id'>): Promise<void> {
  await apiClient.post<void>('/create-account', { data })
}

export async function updateAccount(id: string, data: Omit<Account, 'id'>): Promise<void> {
  await apiClient.patch<void>(`/update-account/${id}`, { data })
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.patch<void>(`/delete-account/${id}`)
}
