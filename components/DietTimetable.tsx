'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Coffee, Sun, Moon, Utensils } from 'lucide-react'

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

export default function DietTimetable({ meals = defaultMeals, onClose }: DietTimetableProps) {
  const [checkedMeals, setCheckedMeals] = useState<Set<string>>(new Set())

  const handleToggleMeal = (mealName: string) => {
    const newChecked = new Set(checkedMeals)
    if (newChecked.has(mealName)) {
      newChecked.delete(mealName)
    } else {
      newChecked.add(mealName)
    }
    setCheckedMeals(newChecked)
  }

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const consumedCalories = meals
    .filter(meal => checkedMeals.has(meal.name))
    .reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const progress = (consumedCalories / totalCalories) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Daily Diet Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">Track your meals and stay healthy</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <span className="text-2xl">×</span>
          </Button>
        )}
      </div>

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
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
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
    </div>
  )
}
