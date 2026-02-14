import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Clock, Award, PlayCircle, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/services/courseService'
import { recommendationService } from '@/services/recommendationService'
import { Loader2 } from 'lucide-react'
import type { Enrollment, Course } from '@/types'

export function DashboardPage() {
    const { t } = useTranslation()
    const { user } = useAuthStore()

    const { data: enrollmentsResponse, isLoading: isLoadingEnrollments } = useQuery({
        queryKey: ['enrollments'],
        queryFn: courseService.getMyEnrollments,
        retry: false,
    })

    const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
        queryKey: ['recommendations'],
        queryFn: () => recommendationService.getPersonalized(3),
        retry: false,
    })

    const enrollments: Enrollment[] = enrollmentsResponse?.data || []

    // Helper to get the course object from enrollment (populated or fallback)
    const getCourse = (enrollment: Enrollment): Course | undefined => {
        if (enrollment.course && typeof enrollment.course === 'object') return enrollment.course as Course
        return undefined
    }

    const completedCourses = enrollments?.filter((e) => e.progress_percentage >= 100).length || 0
    const totalStudyHours = enrollments?.reduce((acc, e) => {
        const course = getCourse(e)
        return acc + (course?.total_duration_hours || 0) * (e.progress_percentage / 100)
    }, 0).toFixed(1) || "0"

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user?.first_name || 'Apprenant'} !</h1>
                    <p className="text-gray-500">{t('dashboard.ready_to_learn')}</p>
                </div>
                <Button asChild>
                    <Link to="/courses">{t('courses.explore')}</Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.enrolled_courses')}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{completedCourses}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.completed_courses')}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{totalStudyHours}h</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.study_hours')}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('dashboard.continue_learning')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoadingEnrollments ? (
                        <div className="col-span-2 flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : enrollments?.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                            {t('courses.no_enrollments')}
                        </div>
                    ) : (
                        enrollments?.map((enrollment) => {
                            const course = getCourse(enrollment)
                            if (!course) return null
                            return (
                                <Card key={enrollment._id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="w-full md:w-48 h-32 md:h-auto bg-gray-200 shrink-0">
                                        <img
                                            src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {enrollment.progress_percentage >= 100 ? "Terminé" : "En cours"}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Progression</span>
                                                <span>{Math.round(enrollment.progress_percentage)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${enrollment.progress_percentage}%` }}
                                                />
                                            </div>
                                            <div className="pt-2">
                                                <Button size="sm" className="w-full md:w-auto" asChild>
                                                    <Link to={`/learn/${course._id}`}>
                                                        <PlayCircle className="w-4 h-4 mr-2" />
                                                        {enrollment.progress_percentage === 0 ? "Commencer" : "Reprendre"}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </section>

            {/* Recommended Section (AI) */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Recommandé pour vous</h2>
                {isLoadingRecommendations ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : recommendations?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((rec: any) => (
                            <Card key={rec.courseId} className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 h-full">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
                                            <BookOpen className="w-8 h-8 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-indigo-900 line-clamp-2">{rec.title}</h3>
                                            <p className="text-xs text-indigo-600 mt-1">{rec.reason}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                            Score: {(rec.score * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100 mt-auto" asChild>
                                        <Link to={`/courses/${rec.courseId}`}>Voir le cours</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="p-4 bg-white rounded-full shadow-sm">
                                    <BookOpen className="w-12 h-12 text-indigo-600" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-lg text-indigo-900">Boostez vos compétences</h3>
                                    <p className="text-indigo-700 mb-4">Complétez plus de cours pour obtenir des recommandations personnalisées !</p>
                                    <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100" asChild>
                                        <Link to="/courses">Explorer le catalogue</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    )
}
