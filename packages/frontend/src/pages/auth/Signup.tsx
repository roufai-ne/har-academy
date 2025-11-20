import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'

const signupSchema = z.object({
    first_name: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
    last_name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
    confirm_password: z.string(),
    role: z.enum(['learner', 'instructor']),
}).refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            confirm_password: '',
            role: 'learner',
        },
    })

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true)
        try {
            // Remove confirm_password before sending to API
            const { confirm_password, ...apiData } = data

            const response = await api.post('/auth/register', {
                ...apiData,
                language: 'fr' // Default language
            })

            const { user, token } = response.data.data
            setAuth(user, token)

            toast({
                title: "Compte créé avec succès",
                description: `Bienvenue sur Har Academy, ${user.first_name} !`,
                variant: "success",
            })

            navigate('/dashboard')
        } catch (error: any) {
            toast({
                title: "Erreur d'inscription",
                description: error.response?.data?.message || "Une erreur est survenue lors de l'inscription",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{t('auth.signup.title')}</CardTitle>
                    <CardDescription className="text-center">
                        Créez votre compte pour commencer à apprendre
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="first_name" className="text-sm font-medium leading-none">
                                    {t('auth.signup.first_name')}
                                </label>
                                <Input
                                    id="first_name"
                                    {...form.register('first_name')}
                                    disabled={isLoading}
                                />
                                {form.formState.errors.first_name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="last_name" className="text-sm font-medium leading-none">
                                    {t('auth.signup.last_name')}
                                </label>
                                <Input
                                    id="last_name"
                                    {...form.register('last_name')}
                                    disabled={isLoading}
                                />
                                {form.formState.errors.last_name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                {t('auth.signup.email')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                {...form.register('email')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">
                                {t('auth.signup.password')}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                {...form.register('password')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm_password" className="text-sm font-medium leading-none">
                                {t('auth.signup.confirm_password')}
                            </label>
                            <Input
                                id="confirm_password"
                                type="password"
                                {...form.register('confirm_password')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.confirm_password && (
                                <p className="text-sm text-red-500">{form.formState.errors.confirm_password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Rôle</label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 w-full">
                                    <input
                                        type="radio"
                                        value="learner"
                                        {...form.register('role')}
                                        className="h-4 w-4"
                                    />
                                    <span>{t('auth.signup.role_learner')}</span>
                                </label>
                                <label className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 w-full">
                                    <input
                                        type="radio"
                                        value="instructor"
                                        {...form.register('role')}
                                        className="h-4 w-4"
                                    />
                                    <span>{t('auth.signup.role_instructor')}</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="h-4 w-4 rounded border-gray-300"
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-gray-500 leading-none">
                                {t('auth.signup.accept_terms')}
                            </label>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('common.loading') : t('auth.signup.submit')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-gray-500">
                        {t('auth.signup.has_account')}{' '}
                        <Link to="/auth/login" className="font-bold text-primary hover:underline">
                            {t('auth.signup.login_link')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
