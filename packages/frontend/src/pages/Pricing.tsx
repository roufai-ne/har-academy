import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'
import { createSubscription, PRICING_PLANS } from '@/services/paymentService'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'

type BillingCycle = 'monthly' | 'yearly'
type Plan = 'basic' | 'pro' | 'enterprise'

export function PricingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired'))
      navigate('/auth/login')
      return
    }

    setLoading(plan)
    try {
      const response = await createSubscription({ plan, billingCycle })
      
      if (response.success) {
        toast.success(t('pricing.subscriptionSuccess'))
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || t('pricing.subscriptionError')
      )
    } finally {
      setLoading(null)
    }
  }

  const getPrice = (plan: keyof typeof PRICING_PLANS) => {
    return PRICING_PLANS[plan][billingCycle]
  }

  const getSavings = (plan: keyof typeof PRICING_PLANS) => {
    if (billingCycle === 'monthly') return null
    const monthly = PRICING_PLANS[plan].monthly * 12
    const yearly = PRICING_PLANS[plan].yearly
    const savings = ((monthly - yearly) / monthly * 100).toFixed(0)
    return `${t('pricing.save')} ${savings}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {t('pricing.yearly')}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(Object.keys(PRICING_PLANS) as Plan[]).map((planKey) => {
            const plan = PRICING_PLANS[planKey]
            const isPopular = planKey === 'pro'

            return (
              <div
                key={planKey}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${
                  isPopular ? 'ring-2 ring-blue-600 scale-105' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    {t('pricing.popular')}
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      €{getPrice(planKey)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{billingCycle === 'monthly' ? t('pricing.month') : t('pricing.year')}
                    </span>
                    {billingCycle === 'yearly' && (
                      <div className="mt-2">
                        <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-semibold px-2 py-1 rounded">
                          {getSavings(planKey)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={loading === planKey}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {loading === planKey ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('pricing.subscribing')}
                      </>
                    ) : (
                      t('pricing.subscribe')
                    )}
                  </button>

                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('pricing.freeTrialInfo')}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('pricing.cancelAnytime')}
          </p>
        </div>
      </div>
    </div>
  )
}
