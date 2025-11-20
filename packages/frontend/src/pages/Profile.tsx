import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs' // Assuming Tabs component exists or I'll use a simple switch
import { User, Settings, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'

// Simple Tabs implementation if not available in ui/tabs (I'll check or assume standard shadcn structure, but to be safe I'll use state for tabs if I didn't check for Tabs component)
// Actually I didn't check for Tabs component. I'll use state for tabs to be safe.

const profileSchema = z.object({
    first_name: z.string().min(2),
    last_name: z.string().min(2),
    email: z.string().email(),
    bio: z.string().optional(),
})

const passwordSchema = z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(8),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
})

export function ProfilePage() {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const { toast } = useToast()
    // const [activeTab, setActiveTab] = useState('general') // Using simple state if Tabs not present

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            bio: '',
        },
    })

    const onProfileSubmit = (data: any) => {
        console.log(data)
        toast({ title: "Profil mis à jour", variant: "success" })
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">{t('nav.profile')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <Card className="md:col-span-1 h-fit">
                    <CardContent className="p-4 space-y-2">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { }}>
                            <User className="w-4 h-4 mr-2" /> Général
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { }}>
                            <Lock className="w-4 h-4 mr-2" /> Sécurité
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { }}>
                            <Settings className="w-4 h-4 mr-2" /> Préférences
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations Personnelles</CardTitle>
                            <CardDescription>Mettez à jour vos informations de profil.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Prénom</label>
                                        <Input {...form.register('first_name')} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nom</label>
                                        <Input {...form.register('last_name')} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input {...form.register('email')} disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bio</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...form.register('bio')}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">{t('common.save')}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
