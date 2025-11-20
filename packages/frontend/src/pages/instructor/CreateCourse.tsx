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
    category: z.string().min(1, "Sélectionnez une catégorie"),
})

type CourseFormValues = z.infer<typeof courseSchema>

export function CreateCoursePage() {
    const { toast } = useToast()
    const [step, setStep] = useState(1)

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            price: '',
            category: '',
        },
    })

    const onSubmit = (data: CourseFormValues) => {
        console.log(data)
        toast({ title: "Cours créé avec succès !", variant: "success" })
    }

    const nextStep = async () => {
        const isValid = await form.trigger()
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
                                    <label className="text-sm font-medium">Catégorie</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        {...form.register('category')}
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        <option value="python">Python</option>
                                        <option value="excel">Excel</option>
                                        <option value="r">R</option>
                                        <option value="bi">Business Intelligence</option>
                                    </select>
                                    {form.formState.errors.category && <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>}
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>Constructeur de curriculum (À implémenter)</p>
                                <p className="text-sm">Ici, l'instructeur pourra ajouter des sections et des leçons.</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prix (€)</label>
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
                        <Button onClick={form.handleSubmit(onSubmit)}>
                            <Save className="w-4 h-4 mr-2" /> Publier le cours
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
