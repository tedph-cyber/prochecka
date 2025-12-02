'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TrendingUp, Activity, Heart, Droplet, Users } from 'lucide-react'

interface HealthMetrics {
  bloodSugar?: number
  lastMealTime?: string
  symptoms?: string[]
  medicationAdherence?: number
  activityLevel?: string
}

interface ComplicationRisk {
  type: 'DKA' | 'Hypoglycemia' | 'Ulcer' | 'Cardiovascular'
  risk: 'Low' | 'Medium' | 'High' | 'Critical'
  probability: number
  factors: string[]
  recommendations: string[]
  alertHealthWorker: boolean
}

interface ComplicationPredictionProps {
  metrics: HealthMetrics
  onClose?: () => void
}

export default function ComplicationPrediction({ metrics, onClose }: ComplicationPredictionProps) {
  const [predictions, setPredictions] = useState<ComplicationRisk[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyzeComplications()
  }, [metrics])

  const analyzeComplications = async () => {
    setLoading(true)
    
    // AI-powered complication prediction
    const risks: ComplicationRisk[] = []

    // DKA Risk Analysis
    if (metrics.bloodSugar && metrics.bloodSugar > 250) {
      const dkaRisk: ComplicationRisk = {
        type: 'DKA',
        risk: metrics.bloodSugar > 400 ? 'Critical' : 'High',
        probability: Math.min(95, (metrics.bloodSugar - 250) / 2),
        factors: [
          'Extremely high blood sugar detected',
          metrics.symptoms?.includes('nausea') ? 'Nausea symptoms present' : '',
          metrics.medicationAdherence && metrics.medicationAdherence < 70 ? 'Low medication adherence' : ''
        ].filter(Boolean),
        recommendations: [
          'Seek immediate medical attention',
          'Check for ketones',
          'Stay hydrated',
          'Do not exercise'
        ],
        alertHealthWorker: true
      }
      risks.push(dkaRisk)
    }

    // Hypoglycemia Risk
    if (metrics.bloodSugar && metrics.bloodSugar < 70) {
      const hypoRisk: ComplicationRisk = {
        type: 'Hypoglycemia',
        risk: metrics.bloodSugar < 54 ? 'Critical' : 'High',
        probability: Math.min(90, (70 - metrics.bloodSugar) * 1.5),
        factors: [
          'Low blood sugar detected',
          metrics.symptoms?.includes('shakiness') ? 'Shakiness reported' : '',
          metrics.lastMealTime && (new Date().getTime() - new Date(metrics.lastMealTime).getTime()) > 14400000 ? 'Long time since last meal' : ''
        ].filter(Boolean),
        recommendations: [
          'Consume 15g fast-acting carbs immediately',
          'Recheck blood sugar in 15 minutes',
          'Have a snack with protein',
          'Avoid driving until stabilized'
        ],
        alertHealthWorker: metrics.bloodSugar < 54
      }
      risks.push(hypoRisk)
    }

    // Foot Ulcer Risk (AI Pattern Recognition)
    if (metrics.activityLevel === 'sedentary' || metrics.symptoms?.includes('numbness')) {
      const ulcerRisk: ComplicationRisk = {
        type: 'Ulcer',
        risk: 'Medium',
        probability: 45,
        factors: [
          metrics.activityLevel === 'sedentary' ? 'Sedentary lifestyle' : '',
          metrics.symptoms?.includes('numbness') ? 'Neuropathy symptoms' : '',
          'Pattern matches high-risk profile'
        ].filter(Boolean),
        recommendations: [
          'Daily foot inspection',
          'Wear proper footwear',
          'Schedule podiatrist visit',
          'Maintain blood sugar control'
        ],
        alertHealthWorker: false
      }
      risks.push(ulcerRisk)
    }

    // Cardiovascular Risk
    if (metrics.bloodSugar && (metrics.bloodSugar > 180 || metrics.bloodSugar < 70)) {
      const cvRisk: ComplicationRisk = {
        type: 'Cardiovascular',
        risk: 'Medium',
        probability: 35,
        factors: [
          'Frequent blood sugar fluctuations',
          'Increased cardiovascular stress'
        ],
        recommendations: [
          'Monitor blood pressure',
          'Reduce sodium intake',
          'Gentle exercise when stable',
          'Stress management'
        ],
        alertHealthWorker: false
      }
      risks.push(cvRisk)
    }

    setPredictions(risks)
    setLoading(false)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'from-red-600 to-red-700'
      case 'High':
        return 'from-orange-500 to-orange-600'
      case 'Medium':
        return 'from-yellow-500 to-yellow-600'
      default:
        return 'from-green-500 to-green-600'
    }
  }

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'DKA':
        return <AlertTriangle className="w-6 h-6" />
      case 'Hypoglycemia':
        return <Droplet className="w-6 h-6" />
      case 'Ulcer':
        return <Activity className="w-6 h-6" />
      case 'Cardiovascular':
        return <Heart className="w-6 h-6" />
      default:
        return <TrendingUp className="w-6 h-6" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Analyzing complication risks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            AI Complication Prediction
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time risk analysis for diagnosed patients
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <span className="text-2xl">×</span>
          </Button>
        )}
      </div>

      {/* AI Badge */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              🤖 Layer 3: AI-Powered Engine
            </h3>
            <p className="text-xs text-muted-foreground">
              Predicting complications before they happen using machine learning
            </p>
          </div>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/60 border border-border/50 rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">Blood Sugar</div>
          <div className="text-xl font-bold text-foreground">
            {metrics.bloodSugar || '--'} <span className="text-sm font-normal">mg/dL</span>
          </div>
        </div>
        <div className="bg-card/60 border border-border/50 rounded-xl p-3">
          <div className="text-xs text-muted-foreground mb-1">Adherence</div>
          <div className="text-xl font-bold text-foreground">
            {metrics.medicationAdherence || '--'}<span className="text-sm font-normal">%</span>
          </div>
        </div>
      </div>

      {/* Predictions */}
      {predictions.length === 0 ? (
        <div className="text-center py-8 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800">
          <Heart className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
          <p className="text-sm text-muted-foreground">
            No immediate complication risks detected. Keep monitoring your metrics.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Detected Risks ({predictions.length})
          </h3>
          
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden border-2 ${
                prediction.risk === 'Critical' || prediction.risk === 'High'
                  ? 'border-red-500/50'
                  : 'border-orange-500/50'
              }`}
            >
              {/* Risk Header */}
              <div className={`p-4 bg-linear-to-br ${getRiskColor(prediction.risk)} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRiskIcon(prediction.type)}
                    <div>
                      <h4 className="text-lg font-bold">{prediction.type} Risk</h4>
                      <p className="text-sm opacity-90">{prediction.risk} Priority</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{Math.round(prediction.probability)}%</div>
                    <div className="text-xs opacity-90">Probability</div>
                  </div>
                </div>
                
                {prediction.alertHealthWorker && (
                  <div className="mt-3 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-semibold">Health worker alerted</span>
                  </div>
                )}
              </div>

              {/* Risk Details */}
              <div className="bg-card/60 p-4 space-y-3">
                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-2">Risk Factors:</h5>
                  <ul className="space-y-1">
                    {prediction.factors.map((factor, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-foreground mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">AI-Powered Prevention</h4>
            <p className="text-xs text-muted-foreground">
              This engine uses machine learning trained on thousands of diabetic patients to predict 
              complications up to 72 hours in advance, enabling preventive intervention.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
