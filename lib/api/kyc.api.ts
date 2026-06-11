import { api } from './axios'

export async function validerKyc(userId: number): Promise<void> {
  await api.post(`/kyc/valider/${userId}/`)
}

export async function rejeterKyc(userId: number): Promise<void> {
  await api.post(`/auth/users/${userId}/invalider/`)
}
