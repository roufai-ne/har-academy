import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, Star, CheckCircle, PlayCircle, FileText, Award } from 'lucide-react'

// Mock data - in real app, fetch based on ID
const COURSE_DATA = {
    id: 1,
    title: "Analyse de Données avec Python : De Zéro à Héros",
    description: "Apprenez à analyser des données complexes, créer des visualisations époustouflantes et utiliser des algorithmes de Machine Learning avec Python. Ce cours complet vous guidera à travers toutes les étapes, de l'installation de l'environnement à la création de modèles prédictifs.",
    instructor: {
        name: "Jean Dupont",
        role: "Senior Data Scientist",
        bio: "Jean est un expert en Data Science avec plus de 10 ans d'expérience. Il a travaillé pour des grandes entreprises tech et enseigne Python depuis 5 ans.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60"
    },
    rating: 4.8,
    reviews: 124,
    duration: "12h 30m",
    students: 1200,
    price: 29.99,
    level: "Débutant",
    lastUpdated: "Novembre 2023",
    language: "Français",
    curriculum: [
        {
            title: "Introduction à Python",
            lessons: [
                { title: "Installation et Configuration", duration: "10m", type: "video" },
                { title: "Variables et Types de Données", duration: "15m", type: "video" },
                { title: "Quiz : Les bases", duration: "5m", type: "quiz" }
            ]
        },
        {
            title: "Manipulation de Données avec Pandas",
            lessons: [
                { title: "Introduction aux DataFrames", duration: "20m", type: "video" },
                { title: "Nettoyage de Données", duration: "25m", type: "video" },
                { title: "Exercice Pratique", duration: "30m", type: "exercise" }
            ]
        }
    ],
    whatYouWillLearn: [
        "Maîtriser la syntaxe Python",
        "Utiliser Pandas pour l'analyse de données",
        "Créer des visualisations avec Matplotlib et Seaborn",
        "Comprendre les bases du Machine Learning"
    ]
}

export function CourseDetailPage() {
    const { id } = useParams()
    // In a real app, useQuery to fetch course by id
    const course = COURSE_DATA

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Header Section */}
            <div className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span className="text-primary font-bold">DATA SCIENCE</span>
                                <span>&gt;</span>
                                <span>Python</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                            <p className="text-lg text-gray-300 max-w-2xl">{course.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-sm pt-4">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <span className="font-bold text-lg">{course.rating}</span>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${star <= Math.round(course.rating) ? 'fill-current' : 'text-gray-600'}`} />
                                        ))}
                                    </div>
                                    <span className="text-gray-400 ml-1">({course.reviews} avis)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" /> {course.students} apprenants
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> {course.duration}
                                </div>
                                <div className="text-gray-300">
                                    Mis à jour : {course.lastUpdated}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">

                        {/* What you will learn */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ce que vous apprendrez</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {course.whatYouWillLearn.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Curriculum */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contenu du cours</CardTitle>
                                <CardDescription>{course.curriculum.length} sections • {course.curriculum.reduce((acc, sec) => acc + sec.lessons.length, 0)} leçons</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {course.curriculum.map((section, idx) => (
                                    <div key={idx} className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 font-medium flex justify-between items-center">
                                            <span>{section.title}</span>
                                            <span className="text-xs text-gray-500">{section.lessons.length} leçons</span>
                                        </div>
                                        <div className="divide-y">
                                            {section.lessons.map((lesson, lIdx) => (
                                                <div key={lIdx} className="p-3 pl-6 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    {lesson.type === 'video' ? <PlayCircle className="w-4 h-4 text-gray-400" /> : <FileText className="w-4 h-4 text-gray-400" />}
                                                    <span className="text-sm">{lesson.title}</span>
                                                    <span className="text-xs text-gray-400 ml-auto">{lesson.duration}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Instructor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Votre Instructeur</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <img src={course.instructor.avatar} alt={course.instructor.name} className="w-24 h-24 rounded-full object-cover" />
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg">{course.instructor.name}</h3>
                                        <div className="text-primary text-sm">{course.instructor.role}</div>
                                        <p className="text-sm text-gray-600">{course.instructor.bio}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar (Sticky) */}
                    <div className="lg:w-80 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <Card className="overflow-hidden shadow-xl border-t-4 border-t-primary">
                                <div className="h-48 bg-gray-200 relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1543286386-713df548e9cc?w=800&auto=format&fit=crop&q=60"
                                        alt="Course preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group cursor-pointer hover:bg-black/40 transition-colors">
                                        <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <div className="text-3xl font-bold text-center">{course.price} €</div>
                                    <Button className="w-full text-lg py-6" size="lg">Ajouter au panier</Button>
                                    <Button variant="outline" className="w-full">Acheter maintenant</Button>

                                    <div className="space-y-3 text-sm text-gray-600 pt-4 border-t">
                                        <div className="font-medium text-gray-900 mb-2">Ce cours inclut :</div>
                                        <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> 12.5 heures de vidéo</div>
                                        <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> 5 articles</div>
                                        <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> 15 ressources téléchargeables</div>
                                        <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Certificat de fin de formation</div>
                                        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Accès illimité</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
