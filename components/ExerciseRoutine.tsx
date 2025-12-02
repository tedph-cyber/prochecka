'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Dumbbell, Clock, CheckCircle2, Circle, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getGuestData, setGuestData, isGuestMode } from '@/lib/guest-session'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Exercise {
  id: string
  name: string
  duration: string
  sets?: string
  reps?: string
  calories: number
  completed: boolean
}

interface ExerciseRoutineProps {
  exercises?: Exercise[]
  onClose: () => void
}

const defaultExercises: Exercise[] = [
  {
    id: '1',
    name: 'Brisk Walking',
    duration: '30 minutes',
    calories: 150,
    completed: false
  },
  {
    id: '2',
    name: 'Bodyweight Squats',
    duration: '10 minutes',
    sets: '3 sets',
    reps: '15 reps',
    calories: 80,
    completed: false
  },
  {
    id: '3',
    name: 'Push-ups',
    duration: '5 minutes',
    sets: '3 sets',
    reps: '10 reps',
    calories: 50,
    completed: false
  },
  {
    id: '4',
    name: 'Planks',
    duration: '5 minutes',
    sets: '3 sets',
    reps: '30 seconds hold',
    calories: 40,
    completed: false
  },
  {
    id: '5',
    name: 'Yoga/Stretching',
    duration: '15 minutes',
    calories: 60,
    completed: false
  },
  {
    id: '6',
    name: 'Cycling (Light)',
    duration: '20 minutes',
    calories: 120,
    completed: false
  }
]

export default function ExerciseRoutine({ exercises: customExercises, onClose }: ExerciseRoutineProps) {
  const [exercises, setExercises] = useState<Exercise[]>(customExercises || defaultExercises)
  const hasCustomExercises = customExercises && customExercises.length > 0
  const [loading, setLoading] = useState(true)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    duration: '',
    sets: '',
    reps: '',
    calories: 0
  })
  const supabase = createClient()
  const router = useRouter()

  // Update exercises if custom ones are provided
  useEffect(() => {
    if (customExercises) {
      setExercises(customExercises.map((ex, idx) => ({
        ...ex,
        id: ex.id || (idx + 1).toString(),
        completed: false
      })))
    }
  }, [customExercises])

  // Load saved progress on mount
  useEffect(() => {
    loadProgress()
  }, [])

  // Save progress whenever exercises change
  useEffect(() => {
    if (!loading) {
      saveProgress()
    }
  }, [exercises, loading])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsGuest(false)
        // Authenticated user - load from DB
        const response = await fetch('/api/exercise-progress')
        if (response.ok) {
          const data = await response.json()
          const completedIds = new Set(data.completedExercises || [])
          setExercises(prev =>
            prev.map(ex => ({ ...ex, completed: completedIds.has(ex.id) }))
          )
        }
      } else {
        setIsGuest(true)
        if (isGuestMode()) {
          // Guest mode - load from localStorage
          const guestData = getGuestData()
          if (guestData?.exerciseProgress) {
            const completedIds = new Set(guestData.exerciseProgress)
            setExercises(prev =>
              prev.map(ex => ({ ...ex, completed: completedIds.has(ex.id) }))
            )
          }
        }
      }
    } catch (error) {
      console.error('Error loading exercise progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async () => {
    try {
      const completedIds = exercises.filter(ex => ex.completed).map(ex => ex.id)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Authenticated user - save to DB
        await fetch('/api/exercise-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedExercises: completedIds })
        })
      } else if (isGuestMode()) {
        // Guest mode - save to localStorage
        const guestData = getGuestData() || {}
        setGuestData({
          ...guestData,
          exerciseProgress: completedIds
        } as any)
      }
    } catch (error) {
      console.error('Error saving exercise progress:', error)
    }
  }

  const toggleExercise = (id: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === id) {
          const newCompleted = !ex.completed
          
          // Show guest prompt after completing 2 exercises
          if (isGuest && newCompleted) {
            const completedCount = prev.filter(e => e.completed).length + 1
            if (completedCount === 2) {
              setTimeout(() => setShowGuestPrompt(true), 500)
            }
          }
          
          return { ...ex, completed: newCompleted }
        }
        return ex
      })
    )
  }

  const addNewExercise = () => {
    if (newExercise.name && newExercise.duration) {
      const exercise: Exercise = {
        id: (exercises.length + 1).toString(),
        name: newExercise.name,
        duration: newExercise.duration,
        sets: newExercise.sets || undefined,
        reps: newExercise.reps || undefined,
        calories: newExercise.calories || 100,
        completed: false
      }
      setExercises([...exercises, exercise])
      setNewExercise({ name: '', duration: '', sets: '', reps: '', calories: 0 })
      setShowAddForm(false)
      toast.success('Exercise added successfully!')
    }
  }

  const completedCount = exercises.filter(ex => ex.completed).length
  const totalCalories = exercises
    .filter(ex => ex.completed)
    .reduce((sum, ex) => sum + ex.calories, 0)
  const progress = Math.round((completedCount / exercises.length) * 100)

  return (
    <div className="space-y-6">
      {/* Empty State Prompt */}
      {!hasCustomExercises && (
        <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">No personalized routine yet</h4>
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                These are sample exercises. To get a personalized exercise routine:
              </p>
              <ul className="text-xs text-purple-700 dark:text-purple-300 list-disc list-inside space-y-1">
                <li>Complete the <strong>PIMA Risk Assessment</strong> for a full action plan</li>
                <li>Or ask the chatbot: "Create an exercise routine for me"</li>
                <li>Or manually add your own exercises using the button below</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-purple-600" />
            Exercise Routine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these exercises daily for optimal diabetes management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Add Exercise Form */}
      {showAddForm && (
        <div className="bg-muted rounded-xl p-4 border border-border">
          <h4 className="font-semibold mb-3">Add Custom Exercise</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Exercise Name</label>
              <input
                type="text"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g., Jogging"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Duration</label>
                <input
                  type="text"
                  value={newExercise.duration}
                  onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
                  placeholder="e.g., 20 minutes"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Calories</label>
                <input
                  type="number"
                  value={newExercise.calories || ''}
                  onChange={(e) => setNewExercise({ ...newExercise, calories: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Sets (optional)</label>
                <input
                  type="text"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                  placeholder="e.g., 3 sets"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Reps (optional)</label>
                <input
                  type="text"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                  placeholder="e.g., 15 reps"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addNewExercise} className="flex-1">
                Add Exercise
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setNewExercise({ name: '', duration: '', sets: '', reps: '', calories: 0 })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-900">Today's Progress</span>
          <span className="text-2xl font-bold text-purple-600">{progress}%</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-3 mb-3">
          <div
            className="bg-linear-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-700">
            {completedCount} / {exercises.length} exercises
          </span>
          <span className="text-purple-700 font-semibold">
            🔥 {totalCalories} calories burned
          </span>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Exercise Schedule
        </h3>
        
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className={`border rounded-lg p-4 transition-all duration-300 ${
              exercise.completed
                ? 'bg-green-50 border-green-300'
                : 'bg-card hover:border-purple-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleExercise(exercise.id)}
                className="mt-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
              >
                {exercise.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground hover:text-purple-600" />
                )}
              </button>

              <div className="flex-1">
                <h4
                  className={`font-semibold ${
                    exercise.completed ? 'text-green-900 line-through' : 'text-foreground'
                  }`}
                >
                  {exercise.name}
                </h4>
                
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {exercise.duration}
                  </span>
                  {exercise.sets && (
                    <span className="text-purple-600 font-medium">
                      {exercise.sets}
                    </span>
                  )}
                  {exercise.reps && (
                    <span className="text-blue-600 font-medium">
                      {exercise.reps}
                    </span>
                  )}
                  <span className="text-orange-600 font-medium">
                    🔥 {exercise.calories} cal
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Exercise Tips</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Start slow and gradually increase intensity</li>
          <li>• Stay hydrated before, during, and after exercise</li>
          <li>• Check blood sugar before and after workouts</li>
          <li>• Listen to your body and rest when needed</li>
          <li>• Aim for at least 150 minutes of moderate activity per week</li>
        </ul>
      </div>

      {/* Guest Sign-Up Prompt Dialog */}
      <Dialog open={showGuestPrompt} onOpenChange={setShowGuestPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>💪 You're Doing Great!</DialogTitle>
            <DialogDescription>
              Keep your streak going by creating an account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-foreground mb-3">
                Create a free account to:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Track your workout history</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Get personalized exercise plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Monitor calories burned over time</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Sync across all your devices</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push('/auth/sign-up')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/sign-in')}
                className="w-full"
              >
                I Already Have an Account
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowGuestPrompt(false)}
                className="w-full text-sm"
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
