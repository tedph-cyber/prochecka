import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Your Diabetes Health Assistant',
  description: 'Access your personalized diabetes action plan, chat with AI health assistant, track meals and exercises. Complete PIMA risk assessment for customized recommendations.',
  openGraph: {
    title: 'Prochecka Dashboard - AI Health Assistant',
    description: 'Personalized diabetes prevention dashboard with AI chatbot, meal tracking, and exercise routines.',
  },
}

export { default } from './page'
