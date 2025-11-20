import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react'

export function InstructorDashboard() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Tableau de Bord Instructeur</h1>
                <Button asChild>
                    <Link to="/instructor/create">
                        <PlusCircle className="w-4 h-4 mr-2" /> Créer un nouveau cours
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">1,234</div>
                            <div className="text-sm text-gray-500">Étudiants Totaux</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">12,450 €</div>
                            <div className="text-sm text-gray-500">Revenus Totaux</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">5</div>
                            <div className="text-sm text-gray-500">Cours Actifs</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">4.8</div>
                            <div className="text-sm text-gray-500">Note Moyenne</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Courses List */}
            <Card>
                <CardHeader>
                    <CardTitle>Mes Cours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                                        <img
                                            src={`https://images.unsplash.com/photo-1543286386-713df548e9cc?w=200&auto=format&fit=crop&q=60`}
                                            alt="Course thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Analyse de Données avec Python {i}</h3>
                                        <div className="text-sm text-gray-500">Publié • 450 étudiants • 4.8/5</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Modifier</Button>
                                    <Button variant="outline" size="sm">Analytics</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
