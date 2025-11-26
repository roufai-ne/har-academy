import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/services/courseService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'
import { Loader2, Plus, Trash2, Edit2, GripVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Schema for basic info
const courseSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    domain: z.string().min(1),
    level: z.string().min(1),
})

export function EditCoursePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info')

    // Fetch course details
    const { data: courseData, isLoading: isLoadingCourse } = useQuery({
        queryKey: ['course', id],
        queryFn: () => courseService.getCourseById(id!),
        enabled: !!id
    })

    const course = courseData?.data

    // Fetch lessons/modules
    const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
        queryKey: ['courseLessons', id],
        queryFn: () => courseService.getCourseLessons(id!),
        enabled: !!id
    })

    const modules = lessonsData?.data || []

    // Mutations
    const updateCourseMutation = useMutation({
        mutationFn: (data: any) => courseService.updateCourse(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', id] })
            toast({ title: "Cours mis à jour", variant: "success" })
        }
    })

    const addModuleMutation = useMutation({
        mutationFn: (title: string) => courseService.addModule(id!, { title }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', id] })
            toast({ title: "Module ajouté", variant: "success" })
        }
    })

    const updateModuleMutation = useMutation({
        mutationFn: ({ moduleId, data }: { moduleId: string, data: any }) =>
            courseService.updateModule(id!, moduleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', id] })
            toast({ title: "Module mis à jour", variant: "success" })
        }
    })

    const deleteModuleMutation = useMutation({
        mutationFn: (moduleId: string) => courseService.deleteModule(id!, moduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', id] })
            toast({ title: "Module supprimé", variant: "success" })
        }
    })

    const addLessonMutation = useMutation({
        mutationFn: ({ moduleId, data }: { moduleId: string, data: any }) =>
            courseService.addLesson(id!, moduleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', id] })
            toast({ title: "Leçon ajoutée", variant: "success" })
        }
    })

    const updateLessonMutation = useMutation({
        mutationFn: ({ moduleId, lessonId, data }: { moduleId: string, lessonId: string, data: any }) =>
            courseService.updateLesson(id!, moduleId, lessonId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', id] })
            toast({ title: "Leçon mise à jour", variant: "success" })
        }
    })

    const deleteLessonMutation = useMutation({
        mutationFn: ({ moduleId, lessonId }: { moduleId: string, lessonId: string }) =>
            courseService.deleteLesson(id!, moduleId, lessonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', id] })
            toast({ title: "Leçon supprimée", variant: "success" })
        }
    })

    const publishMutation = useMutation({
        mutationFn: () => courseService.publishCourse(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course', id] })
            toast({ title: "Cours publié", variant: "success" })
        }
    })

    if (isLoadingCourse || isLoadingLessons) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!course) return <div>Cours non trouvé</div>

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-gray-500">
                        {course.status === 'published' ? 'Publié' : 'Brouillon'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/instructor/dashboard')}>
                        Retour
                    </Button>
                    {course.status !== 'published' && (
                        <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                            {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Publier
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'info' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('info')}
                >
                    Informations
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'curriculum' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('curriculum')}
                >
                    Curriculum
                </button>
            </div>

            {activeTab === 'info' ? (
                <BasicInfoForm course={course} onSubmit={(data) => updateCourseMutation.mutate(data)} />
            ) : (
                <CurriculumBuilder
                    modules={modules}
                    onAddModule={(title) => addModuleMutation.mutate(title)}
                    onUpdateModule={(moduleId, data) => updateModuleMutation.mutate({ moduleId, data })}
                    onDeleteModule={(moduleId) => deleteModuleMutation.mutate(moduleId)}
                    onAddLesson={(moduleId, data) => addLessonMutation.mutate({ moduleId, data })}
                    onUpdateLesson={(moduleId, lessonId, data) => updateLessonMutation.mutate({ moduleId, lessonId, data })}
                    onDeleteLesson={(moduleId, lessonId) => deleteLessonMutation.mutate({ moduleId, lessonId })}
                />
            )}
        </div>
    )
}

function BasicInfoForm({ course, onSubmit }: { course: any, onSubmit: (data: any) => void }) {
    const form = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: course.title || '',
            description: course.description || '',
            price: course.price?.amount?.toString() || '0',
            domain: course.domain || '',
            level: course.level || 'Beginner',
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit((data) => onSubmit({ 
                    title: data.title,
                    description: data.description,
                    domain: data.domain,
                    level: data.level,
                    price: {
                        amount: parseFloat(data.price),
                        currency: 'XAF',
                        pricing_model: 'one-time'
                    }
                }))} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Titre</label>
                        <Input {...form.register('title')} />
                        {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea className="w-full border rounded-md p-2 min-h-[100px]" {...form.register('description')} />
                        {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message as string}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prix (FCFA)</label>
                            <Input {...form.register('price')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Domaine</label>
                            <select className="w-full border rounded-md h-10 px-3" {...form.register('domain')}>
                                <option value="Python">Python</option>
                                <option value="Excel">Excel</option>
                                <option value="R">R</option>
                                <option value="Other">Autre</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Niveau</label>
                            <select className="w-full border rounded-md h-10 px-3" {...form.register('level')}>
                                <option value="Beginner">Débutant</option>
                                <option value="Intermediate">Intermédiaire</option>
                                <option value="Advanced">Avancé</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit">Enregistrer</Button>
                </form>
            </CardContent>
        </Card>
    )
}

function CurriculumBuilder({ 
    modules, 
    onAddModule, 
    onUpdateModule,
    onDeleteModule,
    onAddLesson,
    onUpdateLesson,
    onDeleteLesson
}: { 
    modules: any[], 
    onAddModule: (t: string) => void, 
    onUpdateModule: (mid: string, data: any) => void,
    onDeleteModule: (mid: string) => void,
    onAddLesson: (mid: string, d: any) => void,
    onUpdateLesson: (mid: string, lid: string, data: any) => void,
    onDeleteLesson: (mid: string, lid: string) => void
}) {
    const [newModuleTitle, setNewModuleTitle] = useState('')
    const [editingModule, setEditingModule] = useState<string | null>(null)
    const [editModuleTitle, setEditModuleTitle] = useState('')
    const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
    const [editingLesson, setEditingLesson] = useState<{ moduleId: string, lessonId: string } | null>(null)
    const [editLessonTitle, setEditLessonTitle] = useState('')
    const [newLessonTitle, setNewLessonTitle] = useState('')

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Modules et Leçons</CardTitle>
                    <CardDescription>Gérez le contenu de votre cours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {modules.map((module: any, idx: number) => (
                        <div key={module._id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex justify-between items-center mb-4">
                                {editingModule === module._id ? (
                                    <div className="flex gap-2 items-center flex-1">
                                        <Input
                                            value={editModuleTitle}
                                            onChange={(e) => setEditModuleTitle(e.target.value)}
                                            className="bg-white"
                                        />
                                        <Button size="sm" onClick={() => {
                                            if (editModuleTitle) {
                                                onUpdateModule(module._id, { title: editModuleTitle })
                                                setEditingModule(null)
                                            }
                                        }}>Enregistrer</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingModule(null)}>Annuler</Button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold flex items-center gap-2">
                                            <span className="bg-gray-200 dark:bg-gray-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                                {idx + 1}
                                            </span>
                                            {module.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setEditingModule(module._id)
                                                setEditModuleTitle(module.title)
                                            }}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500"
                                                onClick={() => {
                                                    if (confirm('Supprimer ce module et toutes ses leçons ?')) {
                                                        onDeleteModule(module._id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Lessons List */}
                            <div className="space-y-2 ml-8">
                                {module.lessons?.map((lesson: any) => (
                                    <div key={lesson._id} className="bg-white dark:bg-gray-800 p-3 rounded border">
                                        {editingLesson?.moduleId === module._id && editingLesson?.lessonId === lesson._id ? (
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    value={editLessonTitle}
                                                    onChange={(e) => setEditLessonTitle(e.target.value)}
                                                />
                                                <Button size="sm" onClick={() => {
                                                    if (editLessonTitle) {
                                                        onUpdateLesson(module._id, lesson._id, { title: editLessonTitle })
                                                        setEditingLesson(null)
                                                    }
                                                }}>Enregistrer</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingLesson(null)}>Annuler</Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                                    <span>{lesson.title}</span>
                                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                        {lesson.type}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingLesson({ moduleId: module._id, lessonId: lesson._id })
                                                            setEditLessonTitle(lesson.title)
                                                        }}
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500"
                                                        onClick={() => {
                                                            if (confirm('Supprimer cette leçon ?')) {
                                                                onDeleteLesson(module._id, lesson._id)
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Lesson Form */}
                                {addingLessonTo === module._id ? (
                                    <div className="flex gap-2 items-center mt-2">
                                        <Input
                                            placeholder="Titre de la leçon"
                                            value={newLessonTitle}
                                            onChange={(e) => setNewLessonTitle(e.target.value)}
                                            className="bg-white"
                                        />
                                        <Button size="sm" onClick={() => {
                                            if (newLessonTitle) {
                                                onAddLesson(module._id, { title: newLessonTitle, type: 'video', content: '' })
                                                setNewLessonTitle('')
                                                setAddingLessonTo(null)
                                            }
                                        }}>Ajouter</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setAddingLessonTo(null)}>Annuler</Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 border-dashed"
                                        onClick={() => setAddingLessonTo(module._id)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Ajouter une leçon
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add Module Form */}
                    <div className="flex gap-2 items-center mt-6 pt-6 border-t">
                        <Input
                            placeholder="Titre du nouveau module"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                        />
                        <Button onClick={() => {
                            if (newModuleTitle) {
                                onAddModule(newModuleTitle)
                                setNewModuleTitle('')
                            }
                        }}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter un module
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
