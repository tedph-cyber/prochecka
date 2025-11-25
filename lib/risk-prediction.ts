// PIMA Features for T2D Risk Assessment
export const PIMA_FEATURES = [
  {
    name: 'Pregnancies',
    question: 'How many pregnancies have you had? (Enter 0 if not applicable)',
    min: 0,
    max: 20,
  },
  {
    name: 'Glucose',
    question: 'What is your fasting blood glucose level (mg/dL)?',
    min: 0,
    max: 300,
  },
  {
    name: 'BloodPressure',
    question: 'What is your diastolic blood pressure (mm Hg)?',
    min: 0,
    max: 200,
  },
  {
    name: 'SkinThickness',
    question: 'What is your triceps skin fold thickness (mm)?',
    min: 0,
    max: 100,
  },
  {
    name: 'Insulin',
    question: 'What is your 2-hour serum insulin level (mu U/ml)?',
    min: 0,
    max: 900,
  },
  {
    name: 'BMI',
    question: 'What is your Body Mass Index (BMI)?',
    min: 0,
    max: 70,
  },
  {
    name: 'DiabetesPedigreeFunction',
    question: 'What is your diabetes pedigree function score? (0.0 - 2.5, use 0.5 if unknown)',
    min: 0,
    max: 2.5,
  },
  {
    name: 'Age',
    question: 'What is your age in years?',
    min: 18,
    max: 120,
  },
]

export interface PimaInput {
  Pregnancies: number
  Glucose: number
  BloodPressure: number
  SkinThickness: number
  Insulin: number
  BMI: number
  DiabetesPedigreeFunction: number
  Age: number
}

export interface RiskResult {
  riskScore: number
  topFactor: string
  nudgeMessage: string
  routine: string[]
}

// Risk calculation based on PIMA dataset thresholds
export function calculateRiskAndNudge(inputs: PimaInput): RiskResult {
  const factors: Record<string, number> = {}

  // Glucose risk (most significant)
  if (inputs.Glucose >= 140) {
    factors.Glucose = 35
  } else if (inputs.Glucose >= 126) {
    factors.Glucose = 25
  } else if (inputs.Glucose >= 100) {
    factors.Glucose = 15
  } else {
    factors.Glucose = 0
  }

  // BMI risk
  if (inputs.BMI >= 40) {
    factors.BMI = 30
  } else if (inputs.BMI >= 30) {
    factors.BMI = 20
  } else if (inputs.BMI >= 25) {
    factors.BMI = 10
  } else {
    factors.BMI = 0
  }

  // Blood Pressure risk
  if (inputs.BloodPressure >= 90) {
    factors.BloodPressure = 15
  } else if (inputs.BloodPressure >= 80) {
    factors.BloodPressure = 10
  } else {
    factors.BloodPressure = 0
  }

  // Age risk
  if (inputs.Age >= 60) {
    factors.Age = 15
  } else if (inputs.Age >= 45) {
    factors.Age = 10
  } else if (inputs.Age >= 30) {
    factors.Age = 5
  } else {
    factors.Age = 0
  }

  // Insulin risk
  if (inputs.Insulin >= 200) {
    factors.Insulin = 10
  } else if (inputs.Insulin >= 100) {
    factors.Insulin = 5
  } else {
    factors.Insulin = 0
  }

  // Diabetes Pedigree Function (genetic risk)
  if (inputs.DiabetesPedigreeFunction >= 1.5) {
    factors.DiabetesPedigreeFunction = 10
  } else if (inputs.DiabetesPedigreeFunction >= 0.5) {
    factors.DiabetesPedigreeFunction = 5
  } else {
    factors.DiabetesPedigreeFunction = 0
  }

  // Calculate total risk score
  const totalRisk = Object.values(factors).reduce((sum, val) => sum + val, 0)

  // Find the highest contributing factor
  const topFactor = Object.entries(factors).reduce((max, curr) =>
    curr[1] > max[1] ? curr : max
  )[0]

  // Generate personalized routine based on top factor
  const routine = generateRoutine(topFactor, inputs)
  const nudgeMessage = generateNudgeMessage(topFactor, totalRisk)

  return {
    riskScore: Math.min(totalRisk, 100),
    topFactor,
    nudgeMessage,
    routine,
  }
}

function generateNudgeMessage(factor: string, riskScore: number): string {
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'moderate' : 'low'

  const messages: Record<string, string> = {
    Glucose: `Your glucose level is the primary concern. With ${riskLevel} risk, it's crucial to monitor your blood sugar regularly and follow a diabetes-friendly diet.`,
    BMI: `Your BMI indicates the need for lifestyle changes. With ${riskLevel} risk, focusing on weight management through diet and exercise is essential.`,
    BloodPressure: `Your blood pressure needs attention. With ${riskLevel} risk, managing stress and monitoring BP regularly is important.`,
    Age: `Age-related risk factors require proactive management. With ${riskLevel} risk, regular health screenings are recommended.`,
    Insulin: `Your insulin levels suggest metabolic concerns. With ${riskLevel} risk, working with healthcare providers on insulin management is key.`,
    DiabetesPedigreeFunction: `Family history increases your risk. With ${riskLevel} risk, preventive measures and regular screening are crucial.`,
  }

  return messages[factor] || `With ${riskLevel} risk, focusing on overall lifestyle improvements is recommended.`
}

function generateRoutine(factor: string, inputs: PimaInput): string[] {
  const routines: Record<string, string[]> = {
    Glucose: [
      'Check fasting blood glucose every morning',
      'Eat a low-glycemic breakfast (oats, eggs, vegetables)',
      'Take a 15-minute walk after each meal',
      'Avoid sugary drinks and processed foods',
      'Track carbohydrate intake at each meal',
      'Stay hydrated with 8 glasses of water daily',
    ],
    BMI: [
      'Start your day with 20 minutes of exercise',
      'Eat portion-controlled meals (use smaller plates)',
      'Include protein in every meal for satiety',
      'Walk 10,000 steps daily',
      'Prepare healthy meals at home',
      'Get 7-8 hours of quality sleep',
    ],
    BloodPressure: [
      'Practice deep breathing exercises twice daily',
      'Reduce sodium intake (less than 2,300mg/day)',
      'Monitor blood pressure morning and evening',
      'Engage in 30 minutes of cardio exercise',
      'Limit caffeine and alcohol consumption',
      'Practice stress-reduction techniques (meditation/yoga)',
    ],
    Age: [
      'Schedule annual comprehensive health screenings',
      'Take prescribed medications on schedule',
      'Engage in balance and flexibility exercises',
      'Maintain social connections and mental activity',
      'Follow up with healthcare provider quarterly',
      'Monitor all vital signs regularly',
    ],
    Insulin: [
      'Monitor blood sugar before and after meals',
      'Time meals consistently throughout the day',
      'Coordinate exercise with medication schedule',
      'Keep healthy snacks available for blood sugar management',
      'Work with dietitian on meal planning',
      'Track insulin sensitivity patterns',
    ],
    DiabetesPedigreeFunction: [
      'Schedule genetic counseling if available',
      'Get comprehensive diabetes screening annually',
      'Maintain detailed family health history',
      'Focus on modifiable risk factors (diet, exercise)',
      'Educate family members about diabetes prevention',
      'Monitor blood glucose monthly even if normal',
    ],
  }

  return routines[factor] || [
    'Maintain a balanced, nutritious diet',
    'Exercise for at least 30 minutes daily',
    'Get regular health check-ups',
    'Manage stress effectively',
    'Stay hydrated throughout the day',
    'Maintain a healthy sleep schedule',
  ]
}

export function validateInput(featureIndex: number, value: number): boolean {
  const feature = PIMA_FEATURES[featureIndex]
  return value >= feature.min && value <= feature.max
}
