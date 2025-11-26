import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Users, DollarSign, BookOpen, TrendingUp, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/services/courseService'
import { useTranslation } from 'react-i18next'

export function InstructorDashboard() {
    const { t } = useTranslation()
    const { data: coursesData, isLoading } = useQuery({
        queryKey: ['instructorCourses'],
        queryFn: courseService.getInstructorCourses
    })

    const courses = coursesData?.data || []

    // Calculate stats
    const totalStudents = courses.reduce((acc: number, course: any) => acc + (course.enrollmentsCount || 0), 0)
    // Assuming revenue is price * students (simplified)
    const totalRevenue = courses.reduce((acc: number, course: any) => acc + ((course.price || 0) * (course.enrollmentsCount || 0)), 0)
    const activeCourses = courses.filter((c: any) => c.status === 'published').length
    const averageRating = courses.length > 0
        ? (courses.reduce((acc: number, c: any) => acc + (c.averageRating || 0), 0) / courses.length).toFixed(1)
        : '0.0'

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('instructor.dashboard.title')}</h1>
                <Button asChild>
                    <Link to="/instructor/create">
                        <PlusCircle className="w-4 h-4 mr-2" /> {t('instructor.dashboard.create_course')}
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{totalStudents}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.total_students')}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} FCFA</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.estimated_revenue')}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{activeCourses}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.published_courses')}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{averageRating}</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.average_rating')}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Courses List */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('instructor.dashboard.my_courses')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {courses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {t('instructor.dashboard.no_courses')}
                            </div>
                        ) : (
                            courses.map((course: any) => (
                                <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                                            {course.image_url ? (
                                                <img
                                                    src={course.image_url}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{course.title}</h3>
                                            <div className="text-sm text-gray-500">
                                                {course.status === 'published' ? t('instructor.dashboard.published') : t('instructor.dashboard.draft')} • {course.enrollmentsCount || 0} {t('instructor.dashboard.students')} • {course.averageRating?.toFixed(1) || 'N/A'}/5
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/instructor/courses/${course._id}/edit`}>{t('instructor.dashboard.edit')}</Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to={`/instructor/courses/${course._id}/analytics`}>{t('instructor.dashboard.view_analytics')}</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
