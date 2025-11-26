import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Menu, X, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/courseService'

export function LearningSpacePage() {
    const { courseId } = useParams()
    const queryClient = useQueryClient()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeLesson, setActiveLesson] = useState<any>(null)

    // Fetch course lessons (curriculum)
    const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
        queryKey: ['courseLessons', courseId],
        queryFn: () => courseService.getCourseLessons(courseId!),
        enabled: !!courseId
    })

    // Fetch user progress
    const { data: progressData, isLoading: isLoadingProgress } = useQuery({
        queryKey: ['courseProgress', courseId],
        queryFn: () => courseService.getCourseProgress(courseId!),
        enabled: !!courseId
    })

    const modules = lessonsData?.data?.modules || []
    const course = lessonsData?.data?.course
    const enrollment = progressData?.data?.enrollment
    const progress = progressData?.data?.progress || 0

    // Set initial active lesson
    useEffect(() => {
        if (modules.length > 0 && !activeLesson) {
            // Try to find the first incomplete lesson or just the first lesson
            const firstLesson = modules[0]?.lessons?.[0]
            if (firstLesson) {
                setActiveLesson(firstLesson)
            }
        }
    }, [modules, activeLesson])

    // Update progress mutation
    const updateProgressMutation = useMutation({
        mutationFn: (lessonId: string) => courseService.updateProgress(enrollment._id, lessonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseProgress', courseId] })
        }
    })

    const handleLessonComplete = () => {
        if (activeLesson && enrollment) {
            updateProgressMutation.mutate(activeLesson._id)
        }
    }

    const isLessonCompleted = (lessonId: string) => {
        if (!enrollment?.modulesProgress) return false
        for (const mod of enrollment.modulesProgress) {
            const lessonProg = mod.lessonsProgress.find((l: any) => l.lessonId === lessonId)
            if (lessonProg?.completed) return true
        }
        return false
    }

    if (isLoadingLessons || isLoadingProgress) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!course || !activeLesson) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Cours non trouvé</h1>
                    <Link to="/dashboard">
                        <Button>Retour au tableau de bord</Button>
                    </Link>
                </div>
            </div>
        )
    }


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
                        <h2 className="font-bold text-lg leading-tight">{course.title}</h2>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 text-right">{Math.round(progress)}% terminé</div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {modules.map((section: any, sIdx: number) => (
                            <div key={sIdx}>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 font-medium text-sm border-b">
                                    {section.title}
                                </div>
                                <div>
                                    {section.lessons?.map((lesson: any) => {
                                        const completed = isLessonCompleted(lesson._id)
                                        return (
                                            <button
                                                key={lesson._id}
                                                onClick={() => setActiveLesson(lesson)}
                                                className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-800 ${activeLesson._id === lesson._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary' : ''
                                                    }`}
                                            >
                                                <div className="mt-0.5">
                                                    {completed ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : lesson.type === 'video' ? (
                                                        <PlayCircle className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={`text-sm ${activeLesson._id === lesson._id ? 'font-medium text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {lesson.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{lesson.duration_seconds ? Math.round(lesson.duration_seconds / 60) + 'm' : ''}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
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
                    <span className="font-bold truncate">{course.title}</span>
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
                            <Button
                                variant={isLessonCompleted(activeLesson._id) ? "secondary" : "default"}
                                onClick={handleLessonComplete}
                                disabled={updateProgressMutation.isPending}
                            >
                                {updateProgressMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : isLessonCompleted(activeLesson._id) ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Terminé
                                    </>
                                ) : (
                                    "Marquer comme terminé"
                                )}
                            </Button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <h3>À propos de cette leçon</h3>
                            <p>{activeLesson.description}</p>
                            <div dangerouslySetInnerHTML={{ __html: activeLesson.content || '' }} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
