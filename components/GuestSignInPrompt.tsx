'use client'

import Link from 'next/link'

interface GuestSignInPromptProps {
  riskScore: number
  onClose?: () => void
}

export default function GuestSignInPrompt({ riskScore, onClose }: GuestSignInPromptProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'High', color: 'red' }
    if (score >= 40) return { level: 'Moderate', color: 'orange' }
    return { level: 'Low', color: 'green' }
  }

  const risk = getRiskLevel(riskScore)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        <div className="text-center">
          {/* Risk Score Display */}
          <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full mb-4 ${
            risk.color === 'red' ? 'bg-red-100' :
            risk.color === 'orange' ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            <div className="text-center">
              <div className={`text-2xl md:text-3xl font-bold ${
                risk.color === 'red' ? 'text-red-600' :
                risk.color === 'orange' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {riskScore}
              </div>
              <div className={`text-xs font-medium ${
                risk.color === 'red' ? 'text-red-600' :
                risk.color === 'orange' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {risk.level} Risk
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Your Assessment is Complete!
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            Create a free account to save your results, track your progress, and access your personalized action plan.
          </p>

          {/* Benefits List */}
          <div className="text-left mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900 text-sm md:text-base">Save Your Results</div>
                <div className="text-xs md:text-sm text-gray-600">Access your assessment anytime, anywhere</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900 text-sm md:text-base">Track Progress</div>
                <div className="text-xs md:text-sm text-gray-600">Monitor your daily task completion</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-gray-900 text-sm md:text-base">Personalized Plan</div>
                <div className="text-xs md:text-sm text-gray-600">Get tailored daily health routines</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/sign-up"
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-medium transition-colors text-sm md:text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/auth/sign-in"
              className="block w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm md:text-base"
            >
              I Already Have an Account
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Your assessment data will be automatically transferred to your account
          </p>
        </div>
      </div>
    </div>
  )
}
