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
import { Github, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

const loginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true)
        try {
            const response = await api.post('/auth/login', data)
            const { user, token } = response.data.data
            setAuth(user, token)
            toast({
                title: "Connexion réussie",
                description: `Bienvenue, ${user.first_name} !`,
                variant: "success",
            })
            navigate('/dashboard')
        } catch (error: any) {
            toast({
                title: "Erreur de connexion",
                description: error.response?.data?.message || "Email ou mot de passe incorrect",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{t('auth.login.title')}</CardTitle>
                    <CardDescription className="text-center">
                        Entrez vos identifiants pour accéder à votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.login.email')}
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
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t('auth.login.password')}
                                </label>
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    {t('auth.login.forgot')}
                                </Link>
                            </div>
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('common.loading') : t('auth.login.submit')}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {t('auth.login.social_divider')}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" disabled={isLoading}>
                            <Github className="mr-2 h-4 w-4" />
                            Github
                        </Button>
                        <Button variant="outline" disabled={isLoading}>
                            <Mail className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-500">
                    <div>
                        {t('auth.login.no_account')}{' '}
                        <Link to="/auth/signup" className="font-bold text-primary hover:underline">
                            {t('auth.login.signup_link')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
