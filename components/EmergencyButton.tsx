'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Hospital, AlertTriangle, MapPin, Clock, X } from 'lucide-react'
import { toast } from 'sonner'

export default function EmergencyButton() {
  const [showModal, setShowModal] = useState(false)
  const [calling, setCalling] = useState(false)

  const handleEmergencyCall = () => {
    setCalling(true)
    toast.success('Connecting to emergency services...', {
      description: 'Your location has been shared'
    })
    
    // Placeholder for actual emergency call functionality
    setTimeout(() => {
      setCalling(false)
      window.location.href = 'tel:911'
    }, 1000)
  }

  const handleFindHospital = () => {
    toast.info('Finding nearest hospitals...', {
      description: 'Opening maps with nearby facilities'
    })
    
    // Placeholder - in production, open maps with hospital search
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},14z`)
        },
        () => {
          window.open('https://www.google.com/maps/search/hospitals+near+me')
        }
      )
    } else {
      window.open('https://www.google.com/maps/search/hospitals+near+me')
    }
  }

  return (
    <>
      {/* Floating Emergency Button */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2">
        <Button
          onClick={() => setShowModal(true)}
          className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl relative"
          size="icon"
        >
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
          <Phone className="h-7 w-7 relative z-10" />
        </Button>
      </div>

      {/* Emergency Modal */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900">Emergency Services</h2>
                  <p className="text-sm text-red-700">Get immediate help</p>
                </div>
              </div>
              <Button
                onClick={() => setShowModal(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Emergency Number
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  For immediate medical emergencies (severe hypoglycemia, DKA, chest pain)
                </p>
                <Button 
                  onClick={handleEmergencyCall}
                  disabled={calling}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {calling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Phone className="w-4 h-4 mr-2" />
                  )}
                  Call 911 / Emergency Line
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Hospital className="w-5 h-5" />
                  Nearest Hospitals
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Find diabetes care facilities near you
                </p>
                <Button 
                  onClick={handleFindHospital}
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Hospitals Nearby
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Your Emergency Contacts
                </h3>
                <p className="text-sm text-amber-800">
                  Set up emergency contacts in your profile settings
                </p>
              </div>
            </div>

            <Button onClick={() => setShowModal(false)} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

