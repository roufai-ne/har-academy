import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Award, PlayCircle, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// Mock data
const ENROLLED_COURSES = [
    {
        id: 1,
        title: "Analyse de Données avec Python",
        progress: 35,
        nextLesson: "Nettoyage de Données",
        image: "https://images.unsplash.com/photo-1543286386-713df548e9cc?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        title: "Maîtriser Excel pour la Finance",
        progress: 80,
        nextLesson: "Tableaux Croisés Dynamiques",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60"
    }
]

export function DashboardPage() {
    const { t } = useTranslation()
    const { user } = useAuthStore()

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user?.first_name || 'Apprenant'} !</h1>
                    <p className="text-gray-500">Prêt à continuer votre apprentissage aujourd'hui ?</p>
                </div>
                <Button asChild>
                    <Link to="/courses">Explorer de nouveaux cours</Link>
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
                            <div className="text-2xl font-bold">2</div>
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
                            <div className="text-2xl font-bold">0</div>
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
                            <div className="text-2xl font-bold">4.5h</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.study_hours')}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">0</div>
                            <div className="text-sm text-gray-500">{t('dashboard.stats.certificates')}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Continue Learning Section */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('dashboard.continue_learning')}</h2>
                    <Link to="/my-courses" className="text-primary hover:underline flex items-center gap-1">
                        {t('dashboard.all_courses')} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ENROLLED_COURSES.map(course => (
                        <Card key={course.id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
                            <div className="w-full md:w-48 h-32 md:h-auto bg-gray-200 shrink-0">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3">Prochaine leçon : {course.nextLesson}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Progression</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <Button size="sm" className="w-full md:w-auto" asChild>
                                            <Link to={`/learn/${course.id}`}>
                                                <PlayCircle className="w-4 h-4 mr-2" /> Reprendre
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Recommended Section (Placeholder for AI) */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Recommandé pour vous (IA)</h2>
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="p-4 bg-white rounded-full shadow-sm">
                                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" alt="AI" className="w-12 h-12" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-lg text-indigo-900">Boostez vos compétences en Python</h3>
                                <p className="text-indigo-700 mb-4">Basé sur vos récents progrès, nous pensons que ce module avancé vous plaira.</p>
                                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100">Voir la recommandation</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
