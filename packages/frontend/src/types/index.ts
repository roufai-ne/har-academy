// User Types
export interface User {
  _id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: 'learner' | 'instructor' | 'admin'
  status: 'active' | 'suspended' | 'deleted'
  language: string
  created_at: string
  updated_at: string
  last_login_at?: string
  is_verified: boolean
  instructor_info?: InstructorInfo
  notification_settings?: NotificationSettings
}

export interface InstructorInfo {
  bio: string
  expertise_tags: string[]
  total_courses: number
  rating: number
  verification_status: 'unverified' | 'verified' | 'rejected'
}

export interface NotificationSettings {
  email_notifications: boolean
  marketing_emails: boolean
  newsletter: boolean
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  first_name: string
  last_name: string
  role?: 'learner' | 'instructor'
  language?: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
    refreshToken?: string
  }
}

// Course Types
export interface Course {
  _id: string
  title: string
  description: string
  short_description?: string
  domain: string
  stack?: string[]
  price: {
    amount: number
    currency: string
    pricing_model: 'one-time' | 'subscription'
  }
  instructor_id: string
  instructor_name?: string
  status: 'draft' | 'published' | 'archived'
  modules: string[]
  total_lessons: number
  total_duration_hours: number
  enrollments_count: number
  average_rating: number
  reviews_count: number
  keywords?: string[]
  image_url?: string
  category?: string
  language?: string
  created_at: string
  updated_at: string
  published_at?: string
}

export interface Module {
  _id: string
  course_id: string
  title: string
  description?: string
  order: number
  lessons: Lesson[] | string[]
  created_at: string
}

export interface Lesson {
  _id: string
  module_id: string
  course_id: string
  title: string
  description?: string
  type: 'video' | 'text' | 'quiz' | 'exercise'
  order: number
  video?: {
    url: string
    duration_seconds: number
    transcript?: string
    thumbnail_url?: string
  }
  content?: string
  quiz_id?: string
  duration_seconds?: number
  created_at: string
  updated_at: string
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  timeSpent: number
}

export interface ModuleProgress {
  moduleId: string
  lessonsProgress: LessonProgress[]
  completedLessons: number
  totalLessons: number
}

export interface Enrollment {
  _id: string
  user_id: string
  course_id: string | Course
  course?: Course
  status: 'active' | 'completed' | 'dropped' | 'refunded'
  progress_percentage: number
  modulesProgress?: ModuleProgress[]
  enrolled_at: string
  completed_at?: string
  last_accessed_at?: string
  certificate_id?: string
}

// Review Types
export interface Review {
  _id: string
  user_id: string
  course_id: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  user?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

// Transaction Types
export interface Transaction {
  _id: string
  user_id: string
  course_id?: string
  type: 'course_purchase' | 'subscription' | 'refund'
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: {
    type: string
    last4: string
    brand: string
  }
  created_at: string
  completed_at?: string
  course?: Course
}

export interface Subscription {
  _id: string
  user_id: string
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Filter Types
export interface CourseFilters {
  page?: number
  limit?: number
  domain?: string
  search?: string
  sort_by?: 'popular' | 'newest' | 'rating'
  min_price?: number
  max_price?: number
  min_rating?: number
}
