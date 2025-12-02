'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ProfileDropdownProps {
  user: any
  onSignOut: () => void
}

export default function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadProfile = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      if (data.profile) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name
    if (profile?.username) return `@${profile.username}`
    return user?.email || 'User'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
          {getInitials()}
        </div>
        {/* Name - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{getDisplayName()}</div>
          {profile?.username && profile?.display_name && (
            <div className="text-xs text-gray-500">@{profile.username}</div>
          )}
        </div>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform hidden md:block ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* Profile Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <div className="font-medium">My Profile</div>
                <div className="text-xs text-gray-500">Medical info & settings</div>
              </div>
            </Link>

            <Link
              href="/auth/setup-username"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <div>
                <div className="font-medium">Edit Username</div>
                <div className="text-xs text-gray-500">Update username & display name</div>
              </div>
            </Link>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => {
                setIsOpen(false)
                onSignOut()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
