import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'
import { ChevronRight, ChevronLeft, Save } from 'lucide-react'

const courseSchema = z.object({
    title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
    description: z.string().min(20, "La description doit faire au moins 20 caractères"),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix invalide"),
    domain: z.string().min(1, "Sélectionnez un domaine"),
    level: z.string().min(1, "Sélectionnez un niveau"),
})

type CourseFormValues = z.infer<typeof courseSchema>

import { useNavigate } from 'react-router-dom'
import { courseService } from '@/services/courseService'
import { Loader2 } from 'lucide-react'

// ... inside CreateCoursePage

export function CreateCoursePage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            domain: '',
            level: '',
        },
    })

    const onSubmit = async (data: CourseFormValues) => {
        setIsLoading(true)
        try {
            const payload = {
                title: data.title,
                description: data.description,
                domain: data.domain,
                level: data.level,
                price: {
                    amount: parseFloat(data.price),
                    currency: 'XAF',
                    pricing_model: 'one-time'
                },
                status: 'draft'
            }
            await courseService.createCourse(payload)
            toast({ title: "Cours créé avec succès !", variant: "success" })
            navigate('/instructor/dashboard')
        } catch (error) {
            console.error(error)
            toast({ title: "Erreur", description: "Impossible de créer le cours", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const nextStep = async () => {
        let fieldsToValidate: any[] = []
        
        if (step === 1) {
            fieldsToValidate = ['title', 'description', 'domain', 'level']
        } else if (step === 2) {
            // No validation needed for step 2 (curriculum placeholder)
            setStep(step + 1)
            return
        }
        
        const isValid = await form.trigger(fieldsToValidate as any)
        if (isValid) setStep(step + 1)
    }

    const prevStep = () => setStep(step - 1)

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Créer un nouveau cours</h1>

            {/* Progress Steps */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2" />
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                    >
                        {s}
                    </div>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Informations de base"}
                        {step === 2 && "Curriculum"}
                        {step === 3 && "Prix et Publication"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Commencez par donner un titre et une description à votre cours."}
                        {step === 2 && "Structurez votre cours en sections et leçons."}
                        {step === 3 && "Fixez le prix et publiez votre cours."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {step === 1 && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Titre du cours</label>
                                    <Input {...form.register('title')} placeholder="ex: Maîtriser Python pour la Data Science" />
                                    {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        {...form.register('description')}
                                        placeholder="Décrivez ce que les étudiants apprendront..."
                                    />
                                    {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Domaine</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        {...form.register('domain')}
                                    >
                                        <option value="">Sélectionner un domaine</option>
                                        <option value="Python">Python</option>
                                        <option value="Excel">Excel</option>
                                        <option value="R">R</option>
                                        <option value="Other">Autre</option>
                                    </select>
                                    {form.formState.errors.domain && <p className="text-sm text-red-500">{form.formState.errors.domain.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Niveau</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        {...form.register('level')}
                                    >
                                        <option value="">Sélectionner un niveau</option>
                                        <option value="Beginner">Débutant</option>
                                        <option value="Intermediate">Intermédiaire</option>
                                        <option value="Advanced">Avancé</option>
                                    </select>
                                    {form.formState.errors.level && <p className="text-sm text-red-500">{form.formState.errors.level.message}</p>}
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>La configuration du curriculum sera disponible après la création du cours.</p>
                                <p className="text-sm">Vous pourrez ajouter des sections et des leçons dans l'éditeur de cours.</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prix (FCFA)</label>
                                    <Input {...form.register('price')} type="number" step="0.01" placeholder="29.99" />
                                    {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Précédent
                    </Button>

                    {step < 3 ? (
                        <Button onClick={nextStep}>
                            Suivant <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Publier le cours
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
