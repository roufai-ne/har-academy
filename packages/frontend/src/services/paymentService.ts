import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Payment API endpoints
const paymentApi = axios.create({
  baseURL: `${API_URL}/api/v1/payments`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
paymentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export interface PurchaseRequest {
  courseId: string
  amount: number
  currency?: string
}

export interface SubscriptionRequest {
  plan: 'basic' | 'pro' | 'enterprise'
  billingCycle?: 'monthly' | 'yearly'
}

export interface Transaction {
  _id: string
  user: string
  course?: string
  type: 'course_purchase' | 'subscription' | 'refund'
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: {
    type: string
    last4: string
    brand: string
  }
  createdAt: string
  completedAt?: string
}

export interface Subscription {
  _id: string
  user: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing'
  billingCycle: 'monthly' | 'yearly'
  price: number
  currency: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
  cancelledAt?: string
  autoRenew: boolean
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
  const response = await paymentApi.post('/purchase', data)
  return response.data
}

// Create subscription
export const createSubscription = async (data: SubscriptionRequest) => {
  const response = await paymentApi.post('/subscriptions', data)
  return response.data
}

// Get user transactions
export const getTransactions = async (params?: {
  page?: number
  limit?: number
  status?: string
}) => {
  const response = await paymentApi.get('/transactions', { params })
  return response.data
}

// Get user subscription
export const getSubscription = async () => {
  const response = await paymentApi.get('/subscription')
  return response.data
}

// Cancel subscription
export const cancelSubscription = async (reason?: string) => {
  const response = await paymentApi.post('/subscription/cancel', { reason })
  return response.data
}

// Get user entitlements
export const getUserEntitlements = async (userId: string) => {
  const response = await paymentApi.get(`/user/${userId}/entitlements`)
  return response.data
}

// Request refund
export const requestRefund = async (transactionId: string, reason?: string) => {
  const response = await paymentApi.post(`/transactions/${transactionId}/refund`, {
    reason,
  })
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
  getUserEntitlements,
  requestRefund,
  PRICING_PLANS,
}
