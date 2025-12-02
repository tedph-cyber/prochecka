// PIMA Diabetes Risk Calculator
// Based on the Pima Indian Diabetes Dataset

export interface PimaInput {
  pregnancies: number
  glucose: number
  bloodPressure: number
  skinThickness: number
  insulin: number
  bmi: number
  diabetesPedigree: number
  age: number
}

export interface PimaResult {
  riskScore: number // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High'
  probability: number // 0-1
  factors: string[]
  recommendations: string[]
}

// Logistic regression coefficients based on PIMA dataset
const COEFFICIENTS = {
  intercept: -8.4047,
  pregnancies: 0.1232,
  glucose: 0.0352,
  bloodPressure: -0.0132,
  skinThickness: 0.0006,
  insulin: -0.0012,
  bmi: 0.0897,
  diabetesPedigree: 0.9452,
  age: 0.0149
}

export function calculatePimaRisk(input: PimaInput): PimaResult {
  // Calculate logit (log-odds)
  const logit = 
    COEFFICIENTS.intercept +
    COEFFICIENTS.pregnancies * input.pregnancies +
    COEFFICIENTS.glucose * input.glucose +
    COEFFICIENTS.bloodPressure * input.bloodPressure +
    COEFFICIENTS.skinThickness * input.skinThickness +
    COEFFICIENTS.insulin * input.insulin +
    COEFFICIENTS.bmi * input.bmi +
    COEFFICIENTS.diabetesPedigree * input.diabetesPedigree +
    COEFFICIENTS.age * input.age

  // Convert to probability using sigmoid function
  const probability = 1 / (1 + Math.exp(-logit))
  
  // Convert to risk score (0-100)
  const riskScore = Math.round(probability * 100)

  // Determine risk level
  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High'
  if (riskScore < 30) riskLevel = 'Low'
  else if (riskScore < 50) riskLevel = 'Moderate'
  else if (riskScore < 75) riskLevel = 'High'
  else riskLevel = 'Very High'

  // Identify key risk factors
  const factors: string[] = []
  if (input.glucose > 140) factors.push('High glucose levels')
  if (input.bmi > 30) factors.push('Elevated BMI (obesity)')
  if (input.age > 45) factors.push('Age over 45')
  if (input.diabetesPedigree > 0.5) factors.push('Strong family history')
  if (input.bloodPressure > 80) factors.push('High blood pressure')
  if (input.insulin > 150) factors.push('High insulin levels')

  // Generate personalized recommendations
  const recommendations: string[] = []
  
  if (input.glucose > 100) {
    recommendations.push('Monitor blood glucose regularly and maintain levels below 100 mg/dL fasting')
  }
  
  if (input.bmi > 25) {
    recommendations.push('Work towards a healthy BMI (18.5-24.9) through diet and exercise')
  }
  
  if (input.bloodPressure > 80) {
    recommendations.push('Manage blood pressure through reduced sodium intake and regular exercise')
  }
  
  recommendations.push('Adopt a balanced diet rich in whole grains, vegetables, and lean proteins')
  recommendations.push('Engage in at least 150 minutes of moderate exercise per week')
  
  if (riskLevel === 'High' || riskLevel === 'Very High') {
    recommendations.push('⚠️ Consult with a healthcare provider for professional assessment and guidance')
  }

  return {
    riskScore,
    riskLevel,
    probability,
    factors: factors.length > 0 ? factors : ['Based on your overall health profile'],
    recommendations
  }
}

// Helper to validate PIMA inputs
export function validatePimaInput(input: Partial<PimaInput>): { valid: boolean; missing: string[] } {
  const required = ['pregnancies', 'glucose', 'bloodPressure', 'skinThickness', 'insulin', 'bmi', 'diabetesPedigree', 'age']
  const missing = required.filter(field => input[field as keyof PimaInput] === undefined || input[field as keyof PimaInput] === null)
  
  return {
    valid: missing.length === 0,
    missing
  }
}
