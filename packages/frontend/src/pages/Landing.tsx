import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Star, Clock, Users, Award, BookOpen } from 'lucide-react'

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/90 to-primary text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth/signup">{t('hero.cta_start')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                <Link to="/courses">{t('hero.cta_explore')}</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background Pattern/Image placeholder */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden lg:block">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cours Populaires</h2>
            <Button variant="link" asChild>
              <Link to="/courses">Voir tout le catalogue &rarr;</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Course Cards */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={`https://images.unsplash.com/photo-1543286386-713df548e9cc?w=800&auto=format&fit=crop&q=60`} 
                    alt="Course thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                    4.8 <Star className="w-3 h-3 inline text-yellow-400 fill-current" />
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="text-xs font-medium text-primary mb-1">DATA SCIENCE</div>
                  <CardTitle className="text-lg line-clamp-2">Analyse de Données avec Python : De Zéro à Héros</CardTitle>
                  <CardDescription className="text-sm">Par Jean Dupont</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-sm text-gray-600 flex gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 12h
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> 1.2k
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t flex justify-between items-center">
                  <span className="font-bold text-lg">19 650 FCFA</span>
                  <Button size="sm" asChild>
                    <Link to={`/courses/${i}`}>Voir détails</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi Har Academy ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Certifications Reconnues</h3>
              <p className="text-gray-600">Validez vos compétences avec des certificats professionnels reconnus par l'industrie.</p>
            </div>
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Instructeurs Experts</h3>
              <p className="text-gray-600">Apprenez auprès de professionnels expérimentés qui utilisent ces outils au quotidien.</p>
            </div>
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Apprentissage Pratique</h3>
              <p className="text-gray-600">Projets réels et exercices interactifs pour maîtriser Excel, R et Python.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Plans Tarifaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Gratuit</CardTitle>
                <CardDescription>Pour découvrir</CardDescription>
                <div className="text-3xl font-bold mt-4">0 FCFA<span className="text-sm font-normal text-gray-500">/mois</span></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Accès aux cours gratuits</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Communauté</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">S'inscrire</Button>
              </CardFooter>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border-primary shadow-lg relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl">Populaire</div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Pour les professionnels</CardDescription>
                <div className="text-3xl font-bold mt-4">19 000 FCFA<span className="text-sm font-normal text-gray-500">/mois</span></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Tout le contenu Gratuit</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Accès illimité aux cours</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Certificats inclus</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Projets guidés</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="default">Commencer l'essai</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Entreprise</CardTitle>
                <CardDescription>Pour les équipes</CardDescription>
                <div className="text-3xl font-bold mt-4">Sur devis</div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Tout le contenu Pro</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Tableau de bord manager</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Support dédié</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Contacter les ventes</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-secondary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à transformer votre carrière ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Rejoignez plus de 10 000 étudiants qui apprennent la Data Science avec Har Academy.</p>
          <Button size="lg" variant="default" className="bg-white text-secondary hover:bg-gray-100" asChild>
            <Link to="/auth/signup">Créer un compte gratuit</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
