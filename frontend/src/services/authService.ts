import api from './api'
import type { LoginCredentials, OtpLoginCredentials, RegisterData, User } from '@/types'

export const authService = {
  login: (data: LoginCredentials) =>
    api.post<{ user: User }>('/auth/login', data),

  loginWithOtp: (data: OtpLoginCredentials) =>
    api.post<{ user: User }>('/auth/login/otp', data),

  sendOtp: (data: { username: string; contactInfo: string }) =>
    api.post('/auth/otp/send', data),

  verifyOtp: (data: { type: string; otp: string; identifier: string }) =>
    api.post('/auth/otp/verify', data),

  register: (data: RegisterData) =>
    api.post<{ user: User; planId: string }>('/auth/register', data),

  registerFamily: (data: { members: Partial<RegisterData>[] }) =>
    api.post('/auth/register/family', data),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post('/auth/refresh'),

  me: () => api.get<User>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
}
