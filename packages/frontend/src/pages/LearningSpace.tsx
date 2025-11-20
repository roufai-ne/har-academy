import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Menu, X } from 'lucide-react'

// Mock Data
const COURSE_CONTENT = {
    id: 1,
    title: "Analyse de Données avec Python",
    sections: [
        {
            title: "Introduction",
            lessons: [
                { id: 101, title: "Bienvenue dans le cours", type: "video", duration: "2:30", completed: true },
                { id: 102, title: "Installation de Python et Anaconda", type: "video", duration: "15:00", completed: true },
                { id: 103, title: "Ressources du cours", type: "text", duration: "5:00", completed: false }
            ]
        },
        {
            title: "Les Bases de Python",
            lessons: [
                { id: 201, title: "Variables et Types", type: "video", duration: "12:00", completed: false },
                { id: 202, title: "Listes et Dictionnaires", type: "video", duration: "18:00", completed: false },
                { id: 203, title: "Boucles et Conditions", type: "video", duration: "20:00", completed: false },
                { id: 204, title: "Exercice : Calculatrice Simple", type: "quiz", duration: "10:00", completed: false }
            ]
        }
    ]
}

export function LearningSpacePage() {
    const { courseId } = useParams()
    const [activeLesson, setActiveLesson] = useState(COURSE_CONTENT.sections[0].lessons[0])
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:relative md:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Retour
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-4 border-b">
                        <h2 className="font-bold text-lg leading-tight">{COURSE_CONTENT.title}</h2>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full w-[35%]" />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 text-right">35% terminé</div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {COURSE_CONTENT.sections.map((section, sIdx) => (
                            <div key={sIdx}>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 font-medium text-sm border-b">
                                    {section.title}
                                </div>
                                <div>
                                    {section.lessons.map((lesson) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-800 ${activeLesson.id === lesson.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : ''
                                                }`}
                                        >
                                            <div className="mt-0.5">
                                                {lesson.completed ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : lesson.type === 'video' ? (
                                                    <PlayCircle className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={`text-sm ${activeLesson.id === lesson.id ? 'font-medium text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {lesson.title}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{lesson.duration}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-white dark:bg-gray-800 border-b flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold truncate">{COURSE_CONTENT.title}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Video Player Placeholder */}
                        <div className="aspect-video bg-black rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden group">
                            {activeLesson.type === 'video' ? (
                                <>
                                    <img
                                        src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1200&auto=format&fit=crop&q=60"
                                        alt="Video thumbnail"
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer" />
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 w-full h-full flex flex-col items-center justify-center p-8 text-center">
                                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Contenu Textuel</h3>
                                    <p className="text-gray-500">Lisez le contenu ci-dessous pour compléter cette leçon.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
                            <Button variant="outline" onClick={() => { }}>Marquer comme terminé</Button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <h3>À propos de cette leçon</h3>
                            <p>
                                Dans cette leçon, nous allons explorer les concepts fondamentaux nécessaires pour comprendre la suite du cours.
                                Assurez-vous de bien prendre des notes et de pratiquer les exemples donnés.
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
