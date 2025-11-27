import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CreditCard, Download, Loader2, XCircle } from 'lucide-react'
import {
  getTransactions,
  getSubscription,
  cancelSubscription,
  type Transaction,
  type Subscription,
} from '@/services/paymentService'

export function TransactionsPage() {
  const { t } = useTranslation()
  const [cancellingSubscription, setCancellingSubscription] = useState(false)

  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactions(),
  })

  const {
    data: subscriptionData,
    isLoading: loadingSubscription,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getSubscription(),
    retry: false,
  })

  const transactions = transactionsData?.data || []
  const subscription: Subscription | null = subscriptionData?.data || null

  const handleCancelSubscription = async () => {
    if (!confirm(t('transactions.confirmCancel'))) return

    setCancellingSubscription(true)
    try {
      await cancelSubscription()
      await refetchSubscription()
      alert(t('transactions.cancelSuccess'))
    } catch (error) {
      alert(t('transactions.cancelError'))
    } finally {
      setCancellingSubscription(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('transactions.title')}
      </h1>

      {/* Active Subscription */}
      {subscription && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('transactions.activeSubscription')}
              </h2>
              <div className="flex items-center gap-3">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {subscription.plan.toUpperCase()}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    subscription.status
                  )}`}
                >
                  {subscription.status}
                </span>
              </div>
            </div>
            <button
              onClick={handleCancelSubscription}
              disabled={cancellingSubscription || subscription.cancelAtPeriodEnd}
              className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {cancellingSubscription ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('transactions.cancelling')}
                </>
              ) : subscription.cancelAtPeriodEnd ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('transactions.willCancel')}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('transactions.cancel')}
                </>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('transactions.billingCycle')}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {subscription.billingCycle === 'monthly'
                  ? t('transactions.monthly')
                  : t('transactions.yearly')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('transactions.amount')}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                €{subscription.price} / {subscription.billingCycle === 'monthly' ? t('transactions.month') : t('transactions.year')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('transactions.nextBilling')}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('transactions.subscriptionEndsOn')} {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('transactions.history')}
          </h2>
        </div>

        {loadingTransactions ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('transactions.noTransactions')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction: Transaction) => (
              <div
                key={transaction._id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {transaction.type === 'course_purchase'
                          ? t('transactions.coursePurchase')
                          : transaction.type === 'subscription'
                          ? t('transactions.subscription')
                          : t('transactions.refund')}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(transaction.createdAt)}
                      </span>
                      {transaction.paymentMethod && (
                        <span className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {transaction.paymentMethod.brand} ****
                          {transaction.paymentMethod.last4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      €{transaction.amount.toFixed(2)}
                    </p>
                    {transaction.status === 'completed' && (
                      <button className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {t('transactions.invoice')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
