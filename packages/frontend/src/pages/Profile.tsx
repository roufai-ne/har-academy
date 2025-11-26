import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Settings, Lock, Camera } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'
import { api } from '@/lib/axios'
import { useState, useEffect } from 'react'

const profileSchema = z.object({
    first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    bio: z.string().optional(),
})

const passwordSchema = z.object({
    old_password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    new_password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
})

const preferencesSchema = z.object({
    language: z.enum(['fr', 'en']),
})

export function ProfilePage() {
    const { t, i18n } = useTranslation()
    const { user, setAuth } = useAuthStore()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'preferences'>('general')
    const [isLoading, setIsLoading] = useState(false)

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            bio: user?.instructor_info?.bio || '',
        },
    })

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            old_password: '',
            new_password: '',
            confirm_password: '',
        },
    })

    const preferencesForm = useForm({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            language: user?.language || 'fr',
        },
    })

    // Load user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile')
                const userData = response.data.data
                profileForm.reset({
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                    bio: userData.instructor_info?.bio || '',
                })
                preferencesForm.reset({
                    language: userData.language || 'fr',
                })
            } catch (error) {
                console.error('Failed to load profile:', error)
            }
        }
        fetchProfile()
    }, [])

    const onProfileSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            const payload: any = {
                first_name: data.first_name,
                last_name: data.last_name,
            }

            // Only add bio for instructors
            if (user?.role === 'instructor' && data.bio) {
                payload.instructor_info = {
                    bio: data.bio
                }
            }

            const response = await api.patch('/auth/profile', payload)

            // Update local user state
            const token = localStorage.getItem('token')
            if (token && response.data.data) {
                setAuth(response.data.data, token)
            }

            toast({ 
                title: "Profil mis à jour", 
                description: "Vos informations ont été enregistrées avec succès",
                variant: "success" 
            })
        } catch (error: any) {
            console.error(error)
            toast({ 
                title: "Erreur", 
                description: error.response?.data?.error?.message || "Impossible de mettre à jour le profil", 
                variant: "destructive" 
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onPasswordSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            await api.post('/auth/change-password', {
                old_password: data.old_password,
                new_password: data.new_password,
            })

            toast({ 
                title: "Mot de passe changé", 
                description: "Votre mot de passe a été mis à jour avec succès",
                variant: "success" 
            })
            
            passwordForm.reset()
        } catch (error: any) {
            console.error(error)
            toast({ 
                title: "Erreur", 
                description: error.response?.data?.error?.message || "Impossible de changer le mot de passe", 
                variant: "destructive" 
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onPreferencesSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            const response = await api.patch('/auth/profile', {
                language: data.language,
            })

            // Update local user state
            const token = localStorage.getItem('token')
            if (token && response.data.data) {
                setAuth(response.data.data, token)
            }

            // Change i18n language
            i18n.changeLanguage(data.language)

            toast({ 
                title: "Préférences mises à jour", 
                description: "Vos préférences ont été enregistrées",
                variant: "success" 
            })
        } catch (error: any) {
            console.error(error)
            toast({ 
                title: "Erreur", 
                description: error.response?.data?.error?.message || "Impossible de mettre à jour les préférences", 
                variant: "destructive" 
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">{t('profile.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <Card className="md:col-span-1 h-fit">
                    <CardContent className="p-4 space-y-2">
                        <Button 
                            variant={activeTab === 'general' ? 'default' : 'ghost'} 
                            className="w-full justify-start" 
                            onClick={() => setActiveTab('general')}
                        >
                            <User className="w-4 h-4 mr-2" /> {t('profile.personal_info')}
                        </Button>
                        <Button 
                            variant={activeTab === 'security' ? 'default' : 'ghost'} 
                            className="w-full justify-start" 
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock className="w-4 h-4 mr-2" /> {t('profile.security')}
                        </Button>
                        <Button 
                            variant={activeTab === 'preferences' ? 'default' : 'ghost'} 
                            className="w-full justify-start" 
                            onClick={() => setActiveTab('preferences')}
                        >
                            <Settings className="w-4 h-4 mr-2" /> {t('profile.preferences')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-3 space-y-6">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('profile.personal_info')}</CardTitle>
                                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{user?.first_name} {user?.last_name}</h3>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                        <p className="text-sm text-gray-500 capitalize">{user?.role === 'instructor' ? 'Instructeur' : 'Apprenant'}</p>
                                    </div>
                                </div>

                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Prénom</label>
                                            <Input {...profileForm.register('first_name')} />
                                            {profileForm.formState.errors.first_name && (
                                                <p className="text-sm text-red-500">{profileForm.formState.errors.first_name.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nom</label>
                                            <Input {...profileForm.register('last_name')} />
                                            {profileForm.formState.errors.last_name && (
                                                <p className="text-sm text-red-500">{profileForm.formState.errors.last_name.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input {...profileForm.register('email')} disabled />
                                        <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
                                    </div>
                                    {user?.role === 'instructor' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Bio</label>
                                            <textarea
                                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Parlez de vous, de votre expertise..."
                                                {...profileForm.register('bio')}
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Enregistrement...' : t('common.save')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('profile.security')}</CardTitle>
                                <CardDescription>Gérez la sécurité de votre compte</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mot de passe actuel</label>
                                        <Input 
                                            type="password" 
                                            {...passwordForm.register('old_password')} 
                                        />
                                        {passwordForm.formState.errors.old_password && (
                                            <p className="text-sm text-red-500">{passwordForm.formState.errors.old_password.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nouveau mot de passe</label>
                                        <Input 
                                            type="password" 
                                            {...passwordForm.register('new_password')} 
                                        />
                                        {passwordForm.formState.errors.new_password && (
                                            <p className="text-sm text-red-500">{passwordForm.formState.errors.new_password.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                                        <Input 
                                            type="password" 
                                            {...passwordForm.register('confirm_password')} 
                                        />
                                        {passwordForm.formState.errors.confirm_password && (
                                            <p className="text-sm text-red-500">{passwordForm.formState.errors.confirm_password.message}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('profile.preferences')}</CardTitle>
                                <CardDescription>Personnalisez votre expérience</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Langue</label>
                                        <select 
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            {...preferencesForm.register('language')}
                                        >
                                            <option value="fr">Français</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Enregistrement...' : t('common.save')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
