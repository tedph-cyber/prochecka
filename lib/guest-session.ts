// Guest session management utilities

const GUEST_TOKEN_KEY = 't2d_guest_token'
const GUEST_DATA_KEY = 't2d_guest_data'

export interface GuestAssessmentData {
  messages: any[]
  inputs: any
  result?: any
  timestamp: string
  dietProgress?: string[]
  exerciseProgress?: string[]
}

export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GUEST_TOKEN_KEY)
}

export function setGuestToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_TOKEN_KEY, token)
}

export function clearGuestToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_TOKEN_KEY)
  localStorage.removeItem(GUEST_DATA_KEY)
}

export function getGuestData(): GuestAssessmentData | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(GUEST_DATA_KEY)
  return data ? JSON.parse(data) : null
}

export function setGuestData(data: GuestAssessmentData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data))
}

export function isGuestMode(): boolean {
  return !!getGuestToken()
}

export async function createOrGetGuestSession(): Promise<string> {
  const existingToken = getGuestToken()
  
  if (existingToken) {
    // Verify token is still valid
    try {
      const response = await fetch('/api/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: existingToken }),
      })
      
      if (response.ok) {
        const { session } = await response.json()
        return session.session_token
      }
    } catch (error) {
      console.error('Error verifying guest session:', error)
    }
  }
  
  // Create new session
  const response = await fetch('/api/guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  
  const { session } = await response.json()
  setGuestToken(session.session_token)
  return session.session_token
}

export async function convertGuestToUser(): Promise<boolean> {
  const token = getGuestToken()
  if (!token) return false
  
  try {
    const response = await fetch('/api/guest', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: token }),
    })
    
    if (response.ok) {
      clearGuestToken()
      return true
    }
  } catch (error) {
    console.error('Error converting guest to user:', error)
  }
  
  return false
}
