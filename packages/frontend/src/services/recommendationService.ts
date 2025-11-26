import api from '@/lib/axios'
import { Course } from './courseService'

export interface RecommendationResponse {
    recommendations: Course[]
    source: string
}

export const recommendationService = {
    // Get personalized recommendations
    getPersonalized: async (limit: number = 5) => {
        const response = await api.post('/ai/recommendations/personalized', { limit })
        return response.data
    },

    // Get trending courses
    getTrending: async (limit: number = 5) => {
        const response = await api.get('/ai/recommendations/trending', { params: { limit } })
        return response.data
    },

    // Get similar courses
    getSimilar: async (courseId: string, limit: number = 3) => {
        const response = await api.get(`/ai/recommendations/similar/${courseId}`, { params: { limit } })
        return response.data
    }
}
