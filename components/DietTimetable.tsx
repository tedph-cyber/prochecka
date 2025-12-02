'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Coffee, Sun, Moon, Utensils, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getGuestData, setGuestData, isGuestMode } from '@/lib/guest-session'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Meal {
  time: string
  name: string
  items: string[]
  calories?: number
  icon: React.ReactNode
}

interface DietTimetableProps {
  meals?: Meal[]
  onClose?: () => void
}

const defaultMeals: Meal[] = [
  {
    time: '7:00 AM',
    name: 'Breakfast',
    items: ['Oatmeal with berries', 'Greek yogurt', 'Green tea'],
    calories: 350,
    icon: <Coffee className="w-5 h-5" />
  },
  {
    time: '10:00 AM',
    name: 'Morning Snack',
    items: ['Apple with almond butter', 'Handful of nuts'],
    calories: 200,
    icon: <Sun className="w-5 h-5" />
  },
  {
    time: '1:00 PM',
    name: 'Lunch',
    items: ['Grilled chicken salad', 'Brown rice', 'Steamed vegetables'],
    calories: 500,
    icon: <Utensils className="w-5 h-5" />
  },
  {
    time: '4:00 PM',
    name: 'Afternoon Snack',
    items: ['Carrot sticks with hummus', 'Herbal tea'],
    calories: 150,
    icon: <Clock className="w-5 h-5" />
  },
  {
    time: '7:00 PM',
    name: 'Dinner',
    items: ['Baked salmon', 'Quinoa', 'Mixed green salad'],
    calories: 550,
    icon: <Moon className="w-5 h-5" />
  },
  {
    time: '9:00 PM',
    name: 'Evening Snack',
    items: ['Low-fat milk', 'A few almonds'],
    calories: 100,
    icon: <Moon className="w-5 h-5" />
  }
]

export default function DietTimetable({ meals: customMeals, onClose }: DietTimetableProps) {
  const [checkedMeals, setCheckedMeals] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [meals, setMeals] = useState<Meal[]>(customMeals || defaultMeals)
  const hasCustomMeals = customMeals && customMeals.length > 0
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [showAddMealForm, setShowAddMealForm] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name: '',
    time: '12:00',
    items: [''],
    calories: 0
  })
  const supabase = createClient()
  const router = useRouter()

  // Update meals if custom ones are provided
  useEffect(() => {
    if (customMeals) {
      setMeals(customMeals)
    }
  }, [customMeals])

  // Load saved progress on mount
  useEffect(() => {
    loadProgress()
  }, [])

  // Save progress whenever checkedMeals changes
  useEffect(() => {
    if (!loading) {
      saveProgress()
    }
  }, [checkedMeals, loading])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
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
        const response = await fetch('/api/diet-progress')
        if (response.ok) {
          const data = await response.json()
          setCheckedMeals(new Set(data.checkedMeals || []))
        }
      } else {
        setIsGuest(true)
        if (isGuestMode()) {
          // Guest mode - load from localStorage
          const guestData = getGuestData()
          if (guestData?.dietProgress) {
            setCheckedMeals(new Set(guestData.dietProgress))
          }
        }
      }
    } catch (error) {
      console.error('Error loading diet progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async () => {
    try {
      const checkedArray = Array.from(checkedMeals)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Authenticated user - save to DB
        await fetch('/api/diet-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkedMeals: checkedArray })
        })
      } else if (isGuestMode()) {
        // Guest mode - save to localStorage
        const guestData = getGuestData() || {}
        setGuestData({
          ...guestData,
          dietProgress: checkedArray
        } as any)
      }
    } catch (error) {
      console.error('Error saving diet progress:', error)
    }
  }

  const handleToggleMeal = (mealName: string) => {
    const newChecked = new Set(checkedMeals)
    if (newChecked.has(mealName)) {
      newChecked.delete(mealName)
    } else {
      newChecked.add(mealName)
      
      // Show guest prompt after checking 3 meals
      if (isGuest && newChecked.size === 3) {
        setShowGuestPrompt(true)
      }
    }
    setCheckedMeals(newChecked)
  }

  const addNewMeal = () => {
    if (newMeal.name && newMeal.items.filter(i => i.trim()).length > 0) {
      const meal: Meal = {
        time: newMeal.time,
        name: newMeal.name,
        items: newMeal.items.filter(i => i.trim()),
        calories: newMeal.calories || 0,
        icon: <Utensils className="w-5 h-5" />
      }
      setMeals([...meals, meal])
      setNewMeal({ name: '', time: '12:00', items: [''], calories: 0 })
      setShowAddMealForm(false)
      toast.success('Meal added successfully!')
    }
  }

  const updateMealItem = (index: number, value: string) => {
    const items = [...newMeal.items]
    items[index] = value
    setNewMeal({ ...newMeal, items })
  }

  const addMealItem = () => {
    setNewMeal({ ...newMeal, items: [...newMeal.items, ''] })
  }

  const removeMealItem = (index: number) => {
    const items = newMeal.items.filter((_, i) => i !== index)
    setNewMeal({ ...newMeal, items })
  }

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const consumedCalories = meals
    .filter(meal => checkedMeals.has(meal.name))
    .reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const progress = (consumedCalories / totalCalories) * 100

  return (
    <div className="space-y-6">
      {/* Empty State Prompt */}
      {!hasCustomMeals && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">No personalized plan yet</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                These are sample meals. To get a personalized African diet plan:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                <li>Complete the <strong>PIMA Risk Assessment</strong> for a full action plan</li>
                <li>Or ask the chatbot: "Create a diet plan for me"</li>
                <li>Or manually add your own meals using the button below</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Daily Diet Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">Track your meals and stay healthy</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMealForm(!showAddMealForm)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <span className="text-2xl">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* Add Meal Form */}
      {showAddMealForm && (
        <div className="bg-muted rounded-xl p-4 border border-border">
          <h4 className="font-semibold mb-3">Add Custom Meal</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Meal Name</label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="e.g., Mid-Morning Snack"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Time</label>
                <input
                  type="time"
                  value={newMeal.time}
                  onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Food Items</label>
              {newMeal.items.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateMealItem(index, e.target.value)}
                    placeholder="e.g., Grilled chicken breast"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background"
                  />
                  {newMeal.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMealItem(index)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addMealItem}
                className="w-full mt-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div>
              <label className="block text-sm mb-1">Calories (optional)</label>
              <input
                type="number"
                value={newMeal.calories || ''}
                onChange={(e) => setNewMeal({ ...newMeal, calories: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addNewMeal} className="flex-1">
                Add Meal
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMealForm(false)
                  setNewMeal({ name: '', time: '12:00', items: [''], calories: 0 })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calorie Progress */}
      <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Daily Calories</span>
          <span className="text-sm font-bold text-primary">
            {consumedCalories} / {totalCalories} kcal
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Meals Timeline */}
      <div className="space-y-3">
        {meals.map((meal, index) => (
          <div
            key={index}
            className={`relative backdrop-blur-sm rounded-xl p-4 border-2 transition-all ${
              checkedMeals.has(meal.name)
                ? 'bg-primary/10 border-primary/30'
                : 'bg-card/60 border-border/50 hover:border-primary/20'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Time & Icon */}
              <div className="flex flex-col items-center gap-2 min-w-20">
                <div className={`p-2 rounded-lg ${
                  checkedMeals.has(meal.name) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {meal.icon}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{meal.time}</span>
              </div>

              {/* Meal Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-foreground">{meal.name}</h4>
                  {meal.calories && (
                    <span className="text-sm font-bold text-primary">{meal.calories} kcal</span>
                  )}
                </div>
                <ul className="space-y-1">
                  {meal.items.map((item, idx) => (
                    <li
                      key={idx}
                      className={`text-sm flex items-center gap-2 ${
                        checkedMeals.has(meal.name) 
                          ? 'text-muted-foreground line-through' 
                          : 'text-foreground'
                      }`}
                    >
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkedMeals.has(meal.name)}
                  onChange={() => handleToggleMeal(meal.name)}
                  className="w-6 h-6 text-primary rounded-md focus:ring-2 focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hydration Reminder */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💧</span>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Hydration Reminder</h4>
            <p className="text-xs text-muted-foreground">
              Drink at least 8 glasses of water throughout the day
            </p>
          </div>
        </div>
      </div>

      {/* Guest Sign-Up Prompt Dialog */}
      <Dialog open={showGuestPrompt} onOpenChange={setShowGuestPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Great Progress!</DialogTitle>
            <DialogDescription>
              Save your progress and unlock premium features
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-foreground mb-3">
                By creating a free account, you'll get:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Saved progress across devices</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Personalized health insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Track your health metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Access from any device</span>
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
