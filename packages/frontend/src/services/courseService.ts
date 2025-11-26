import api from '@/lib/axios'

export interface Course {
  _id: string
  title: string
  slug: string
  description: string
  price: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  thumbnail: string
  instructor: {
    _id: string
    firstName: string
    lastName: string
  }
  rating: number
  totalStudents: number
  duration: number
  lessonsCount: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  _id: string
  user: string
  course: Course
  progress: number
  completedLessons: string[]
  isCompleted: boolean
  enrolledAt: string
  lastAccessedAt: string
}

export const courseService = {
  // Get all courses with optional filters
  getAllCourses: async (params?: any) => {
    const response = await api.get('/courses', { params })
    return response.data
  },

  // Get course by slug
  getCourseBySlug: async (slug: string) => {
    const response = await api.get(`/courses/slug/${slug}`)
    return response.data
  },

  // Get course by ID
  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },

  // Get my enrollments
  getMyEnrollments: async () => {
    const response = await api.get('/enrollments/my')
    return response.data
  },

  // Enroll in a course
  enrollInCourse: async (courseId: string) => {
    const response = await api.post('/enrollments', { courseId })
    return response.data
  },

  // Update progress
  updateProgress: async (enrollmentId: string, lessonId: string) => {
    const response = await api.put(`/enrollments/${enrollmentId}/progress`, { lessonId })
    return response.data
  },

  // Get course lessons
  getCourseLessons: async (id: string) => {
    const response = await api.get(`/courses/${id}/lessons`)
    return response.data
  },

  // Get course progress
  getCourseProgress: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/progress`)
    return response.data
  },

  // --- Instructor Methods ---

  // Get instructor courses
  getInstructorCourses: async () => {
    const response = await api.get('/courses/instructor')
    return response.data
  },

  // Create course
  createCourse: async (data: any) => {
    const response = await api.post('/courses', data)
    return response.data
  },

  // Update course
  updateCourse: async (id: string, data: any) => {
    const response = await api.put(`/courses/${id}`, data)
    return response.data
  },

  // Publish course
  publishCourse: async (id: string) => {
    const response = await api.post(`/courses/${id}/publish`)
    return response.data
  },

  // Get course analytics
  getCourseAnalytics: async (id: string) => {
    const response = await api.get(`/courses/${id}/analytics`)
    return response.data
  },

  // Add module
  addModule: async (courseId: string, data: any) => {
    const response = await api.post(`/courses/${courseId}/modules`, data)
    return response.data
  },

  // Add lesson
  addLesson: async (courseId: string, moduleId: string, data: any) => {
    const response = await api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data)
    return response.data
  },

  // Update module
  updateModule: async (courseId: string, moduleId: string, data: any) => {
    const response = await api.patch(`/courses/${courseId}/modules/${moduleId}`, data)
    return response.data
  },

  // Delete module
  deleteModule: async (courseId: string, moduleId: string) => {
    const response = await api.delete(`/courses/${courseId}/modules/${moduleId}`)
    return response.data
  },

  // Update lesson
  updateLesson: async (courseId: string, moduleId: string, lessonId: string, data: any) => {
    const response = await api.patch(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data)
    return response.data
  },

  // Delete lesson
  deleteLesson: async (courseId: string, moduleId: string, lessonId: string) => {
    const response = await api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
    return response.data
  }
}
