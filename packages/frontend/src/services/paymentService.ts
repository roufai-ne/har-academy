import api from '@/lib/axios'
import type { Transaction, Subscription } from '@/types'

export type { Transaction, Subscription }

export interface PurchaseRequest {
  courseId: string
  amount: number
  currency?: string
}

export interface SubscriptionRequest {
  plan: 'basic' | 'pro' | 'enterprise'
  billingCycle?: 'monthly' | 'yearly'
}

export interface Entitlements {
  subscription: {
    plan: string
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
  purchasedCourses: string[]
  transactions: Transaction[]
  hasActiveSubscription: boolean
}

// Create course purchase
export const createCoursePurchase = async (data: PurchaseRequest) => {
  const response = await api.post('/payments/purchase', data)
  return response.data
}

// Create subscription
export const createSubscription = async (data: SubscriptionRequest) => {
  const response = await api.post('/payments/subscriptions', data)
  return response.data
}

// Get user transactions
export const getTransactions = async (params?: {
  page?: number
  limit?: number
  status?: string
  type?: string
  startDate?: string
  endDate?: string
}) => {
  const response = await api.get('/payments/transactions', { params })
  return response.data
}

// Get user subscription
export const getSubscription = async () => {
  const response = await api.get('/payments/subscription')
  return response.data
}

// Cancel subscription
export const cancelSubscription = async (reason?: string) => {
  const response = await api.post('/payments/subscription/cancel', { reason })
  return response.data
}

// Change subscription
export const changeSubscription = async (data: { plan: string; billingCycle?: string }) => {
  const response = await api.put('/payments/subscription/change', data)
  return response.data
}

// Reactivate subscription
export const reactivateSubscription = async () => {
  const response = await api.post('/payments/subscription/reactivate')
  return response.data
}

// Get user entitlements
export const getUserEntitlements = async (userId: string) => {
  const response = await api.get(`/payments/user/${userId}/entitlements`)
  return response.data
}

// Request refund
export const requestRefund = async (transactionId: string, reason?: string) => {
  const response = await api.post(`/payments/transactions/${transactionId}/refund`, { reason })
  return response.data
}

// Pricing plans
export const PRICING_PLANS = {
  basic: {
    name: 'Basic',
    monthly: 9.99,
    yearly: 99.99,
    features: [
      'Access to 100+ courses',
      'Basic support',
      'Course completion certificates',
      'Mobile app access',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: 19.99,
    yearly: 199.99,
    features: [
      'Access to ALL courses',
      'Priority support',
      'Advanced certificates',
      'Downloadable resources',
      'Offline access',
      'AI-powered recommendations',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthly: 49.99,
    yearly: 499.99,
    features: [
      'Everything in Pro',
      'Team management',
      'Custom learning paths',
      'Analytics dashboard',
      'Dedicated account manager',
      'API access',
    ],
  },
}

export default {
  createCoursePurchase,
  createSubscription,
  getTransactions,
  getSubscription,
  cancelSubscription,
  changeSubscription,
  reactivateSubscription,
  getUserEntitlements,
  requestRefund,
  PRICING_PLANS,
}
