import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, Star, Clock, Users, BookOpen } from 'lucide-react'

// Mock data for development
const MOCK_COURSES = [
    {
        id: 1,
        title: "Analyse de Données avec Python",
        instructor: "Jean Dupont",
        rating: 4.8,
        reviews: 124,
        duration: "12h",
        students: 1200,
        price: 29.99,
        level: "Débutant",
        domain: "Python",
        image: "https://images.unsplash.com/photo-1543286386-713df548e9cc?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        title: "Maîtriser Excel pour la Finance",
        instructor: "Marie Martin",
        rating: 4.9,
        reviews: 89,
        duration: "8h",
        students: 850,
        price: 19.99,
        level: "Intermédiaire",
        domain: "Excel",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        title: "R pour les Data Scientists",
        instructor: "Pierre Durand",
        rating: 4.7,
        reviews: 56,
        duration: "15h",
        students: 600,
        price: 34.99,
        level: "Avancé",
        domain: "R",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 4,
        title: "Visualisation de Données avec Tableau",
        instructor: "Sophie Bernard",
        rating: 4.6,
        reviews: 42,
        duration: "10h",
        students: 400,
        price: 24.99,
        level: "Débutant",
        domain: "Data Viz",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
    }
]

export function CoursesPage() {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

    // Filter logic
    const filteredCourses = MOCK_COURSES.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDomain = selectedDomain ? course.domain === selectedDomain : true
        const matchesLevel = selectedLevel ? course.level === selectedLevel : true

        return matchesSearch && matchesDomain && matchesLevel
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            {t('courses.filters.filter')}
                        </h3>

                        {/* Search Mobile (visible only on small screens if needed, but here we keep it in main area) */}

                        {/* Domain Filter */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-500 uppercase">{t('courses.filters.domain')}</h4>
                            <div className="space-y-1">
                                {['Excel', 'Python', 'R', 'Data Viz'].map(domain => (
                                    <label key={domain} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedDomain === domain}
                                            onChange={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{domain}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Level Filter */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-500 uppercase">{t('courses.filters.level')}</h4>
                            <div className="space-y-1">
                                {['Débutant', 'Intermédiaire', 'Avancé'].map(level => (
                                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLevel === level}
                                            onChange={() => setSelectedLevel(selectedLevel === level ? null : level)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="mb-8 space-y-4">
                        <h1 className="text-3xl font-bold">{t('courses.title')}</h1>
                        <div className="relative max-w-xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder={t('common.search') + "..."}
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => (
                            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                <div className="h-48 bg-gray-200 relative">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                                        {course.rating} <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="text-gray-400 font-normal">({course.reviews})</span>
                                    </div>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="text-xs font-medium text-primary mb-1 uppercase">{course.domain}</div>
                                        <div className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{course.level}</div>
                                    </div>
                                    <CardTitle className="text-lg line-clamp-2 h-14">{course.title}</CardTitle>
                                    <CardDescription className="text-sm line-clamp-1">{t('courses.card.by')} {course.instructor}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 text-sm text-gray-600 flex gap-4 mt-auto">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {course.duration}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {course.students}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 border-t flex justify-between items-center">
                                    <span className="font-bold text-lg">{course.price} €</span>
                                    <Button size="sm" asChild>
                                        <Link to={`/courses/${course.id}`}>{t('courses.card.view_details')}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
                            <p className="text-gray-500">Essayez de modifier vos filtres ou votre recherche.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
