import { api } from './axios'

export async function validerKyc(userId: number): Promise<void> {
  await api.post(`/kyc/valider/${userId}/`)
}
