'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Plus, Trash2, Clock, Pill, Utensils, Activity, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Reminder {
  id: string
  type: 'medication' | 'meal' | 'exercise' | 'checkup'
  title: string
  time: string
  days: string[]
  enabled: boolean
}

export default function ReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      type: 'medication',
      title: 'Take insulin',
      time: '08:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: true
    },
    {
      id: '2',
      type: 'meal',
      title: 'Breakfast',
      time: '08:30',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      enabled: true
    },
    {
      id: '3',
      type: 'exercise',
      title: 'Morning walk',
      time: '06:00',
      days: ['Mon', 'Wed', 'Fri'],
      enabled: true
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
    toast.success('Reminder updated')
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
    toast.success('Reminder deleted')
  }

  const getIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-5 h-5 text-blue-600" />
      case 'meal':
        return <Utensils className="w-5 h-5 text-green-600" />
      case 'exercise':
        return <Activity className="w-5 h-5 text-purple-600" />
      case 'checkup':
        return <Check className="w-5 h-5 text-red-600" />
    }
  }

  const getColor = (type: Reminder['type']) => {
    switch (type) {
      case 'medication':
        return 'blue'
      case 'meal':
        return 'green'
      case 'exercise':
        return 'purple'
      case 'checkup':
        return 'red'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Reminders & Habits
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stay on track with personalized reminders
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Reminder
        </Button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No reminders set yet</p>
            <Button onClick={() => setShowAddModal(true)} variant="outline" className="mt-4">
              Create Your First Reminder
            </Button>
          </div>
        ) : (
          reminders.map((reminder) => {
            const color = getColor(reminder.type)
            return (
              <div
                key={reminder.id}
                className={`border-2 ${reminder.enabled ? `border-${color}-200 bg-${color}-50/50` : 'border-gray-200 bg-gray-50'} rounded-lg p-4 transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 p-2 rounded-lg ${reminder.enabled ? `bg-${color}-100` : 'bg-gray-200'}`}>
                      {getIcon(reminder.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{reminder.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {reminder.time}
                        </span>
                        <span className="capitalize">{reminder.type}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {reminder.days.map(day => (
                          <span key={day} className="text-xs bg-white border px-2 py-1 rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reminder.enabled ? `bg-${color}-600` : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          reminder.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <Button
                      onClick={() => deleteReminder(reminder.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add New Reminder</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Full reminder creation form will be implemented here with time picker, day selection, and notification preferences.
            </p>
            <Button onClick={() => setShowAddModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Reminder Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enable notifications in your browser/device settings</li>
          <li>• Set reminders 15-30 minutes before activities</li>
          <li>• Review and adjust reminders weekly based on your routine</li>
          <li>• Use habit stacking: link new habits to existing ones</li>
        </ul>
      </div>
    </div>
  )
}
