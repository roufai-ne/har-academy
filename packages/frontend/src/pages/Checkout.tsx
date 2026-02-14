import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Loader2, CreditCard, Lock, Check } from 'lucide-react'
import { courseService } from '@/services/courseService'
import { createCoursePurchase } from '@/services/paymentService'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Course } from '@/types'

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('courseId')
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [processing, setProcessing] = useState(false)

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: !!courseId,
  })

  const course: Course | undefined = courseData?.data

  const handlePurchase = async () => {
    if (!course || !user) return

    setProcessing(true)
    try {
      const response = await createCoursePurchase({
        courseId: course._id,
        amount: course.price?.amount || 0,
        currency: course.price?.currency || 'XAF',
      })

      if (response.success) {
        navigate(`/learn/${course._id}`)
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      alert(error.response?.data?.error?.message || 'Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cours non trouvé</h2>
          <Button variant="link" onClick={() => navigate('/courses')}>
            Parcourir les cours
          </Button>
        </div>
      </div>
    )
  }

  const price = course.price?.amount || 0
  const currency = course.price?.currency || 'FCFA'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Finaliser l'achat</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>

                <div className="flex gap-4">
                  <img
                    src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Par {course.instructor_name || 'Instructeur'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {price.toLocaleString()} {currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>

                <div className="space-y-3 mb-6">
                  <div className="w-full p-4 border-2 border-primary bg-primary/5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-6 h-6 mr-3" />
                      <span className="font-medium">Carte bancaire</span>
                    </div>
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Card Form (simplified - Stripe Elements would go here) */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Détails</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{price.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>TVA</span>
                    <span>0 {currency}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{price.toLocaleString()} {currency}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="w-full py-6 text-lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Payer {price.toLocaleString()} {currency}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Paiement sécurisé par Stripe
                </p>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold mb-2">
                    Garantie satisfait ou remboursé
                  </h3>
                  <p className="text-xs text-gray-600">
                    14 jours pour changer d'avis. Remboursement intégral sans condition.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
