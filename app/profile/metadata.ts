import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Health Profile - Medical Information & Settings',
  description: 'Manage your health profile, medical information, diabetes details, medications, allergies, and emergency contacts securely.',
  openGraph: {
    title: 'Health Profile - Prochecka',
    description: 'Secure health profile management for personalized diabetes care.',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export { default } from './page'
