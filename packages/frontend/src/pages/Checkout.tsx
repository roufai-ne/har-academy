import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Loader2, CreditCard, Lock, Check } from 'lucide-react'
import { getCourseById } from '@/services/courseService'
import { createCoursePurchase } from '@/services/paymentService'
import { useAuthStore } from '@/store/authStore'

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')

  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id!),
    enabled: !!id,
  })

  const course = courseData?.data

  const handlePurchase = async () => {
    if (!course || !user) return

    setProcessing(true)
    try {
      const response = await createCoursePurchase({
        courseId: course._id,
        amount: course.price,
        currency: 'EUR',
      })

      if (response.success) {
        // In production, redirect to Stripe checkout or handle payment
        // For now, simulate success
        setTimeout(() => {
          navigate(`/learn/${course._id}`)
        }, 1000)
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      alert(error.response?.data?.error?.message || t('checkout.error'))
    } finally {
      setProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('checkout.courseNotFound')}
          </h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700"
          >
            {t('checkout.browseCourses')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('checkout.title')}
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('checkout.orderSummary')}
              </h2>
              
              <div className="flex gap-4">
                <img
                  src={course.thumbnail || '/placeholder-course.jpg'}
                  alt={course.title}
                  className="w-32 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('common.by')} {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    €{course.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('checkout.paymentMethod')}
              </h2>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <CreditCard className="w-6 h-6 mr-3" />
                    <span className="font-medium">{t('checkout.creditCard')}</span>
                  </div>
                  {paymentMethod === 'card' && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.641h8.538c2.825 0 4.73 1.872 4.73 4.644 0 3.513-2.544 5.935-6.206 5.935H9.766l-1.689 7.68c-.04.18-.21.319-.393.319h-.457a.641.641 0 0 1-.633-.74l1.497-6.815h2.998c3.05 0 5.452-1.968 5.452-4.464 0-2.176-1.467-3.614-3.758-3.614H7.716L5.197 20.597h1.88v.74z"/>
                    </svg>
                    <span className="font-medium">PayPal</span>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>

              {/* Card Form (simplified) */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('checkout.cardNumber')}
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('checkout.expiryDate')}
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('checkout.orderDetails')}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('checkout.subtotal')}</span>
                  <span>€{course.price}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('checkout.tax')}</span>
                  <span>€0.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>{t('checkout.total')}</span>
                    <span>€{course.price}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('checkout.processing')}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    {t('checkout.completePurchase')}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                {t('checkout.securePayment')}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('checkout.moneyBackGuarantee')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('checkout.moneyBackDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
