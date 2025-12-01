'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import DietTimetable from './DietTimetable'
import { Calendar, Dumbbell, Heart, Target, TrendingUp, Utensils } from 'lucide-react'

interface Task {
  id: string
  text: string
  completed: boolean
  category: 'exercise' | 'diet' | 'health' | 'lifestyle'
}

interface ActionPlan {
  risk_score: number
  factor: string
  plan_message: string
  tasks: Task[]
  dietPlan?: any
  exercisePlan?: any
}

interface EnhancedActionPlanProps {
  plan: ActionPlan | null
  onUpdate: () => void
  onClose?: () => void
}

export default function EnhancedActionPlan({ plan, onUpdate, onClose }: EnhancedActionPlanProps) {
  const [showDietModal, setShowDietModal] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setUpdatingTask(taskId)
    try {
      const response = await fetch('/api/action-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed: !completed }),
      })
      if (response.ok) onUpdate()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setUpdatingTask(null)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'from-red-500 to-red-600'
    if (score >= 40) return 'from-orange-500 to-orange-600'
    return 'from-green-500 to-green-600'
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk'
    if (score >= 40) return 'Moderate Risk'
    return 'Low Risk'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Dumbbell className="w-4 h-4" />
      case 'diet':
        return <Utensils className="w-4 h-4" />
      case 'health':
        return <Heart className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  if (!plan) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Action Plan Yet</h3>
        <p className="text-sm">Complete the PIMA assessment to generate your personalized plan.</p>
      </div>
    )
  }

  const completedCount = plan.tasks?.filter((t: Task) => t.completed).length || 0
  const totalCount = plan.tasks?.length || 0
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Action Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Personalized health roadmap</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <span className="text-2xl">×</span>
          </Button>
        )}
      </div>

      {/* Risk Score Card */}
      <div className={`relative overflow-hidden rounded-2xl p-6 bg-linear-to-br ${getRiskColor(plan.risk_score)} text-white shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium opacity-90">Risk Assessment</div>
              <div className="text-4xl font-bold mt-1">{plan.risk_score}/100</div>
            </div>
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div className="text-lg font-semibold">{getRiskLevel(plan.risk_score)}</div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      </div>

      {/* Primary Factor */}
      <div className="backdrop-blur-sm bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold text-primary uppercase mb-1">Primary Focus</div>
            <div className="text-sm font-semibold text-foreground">{plan.factor}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowDietModal(true)}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
        >
          <Utensils className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold">Diet Plan</span>
        </Button>
        <Button
          onClick={() => setShowExerciseModal(true)}
          variant="outline"
          className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
        >
          <Dumbbell className="w-6 h-6 text-primary" />
          <span className="text-sm font-semibold">Exercise Plan</span>
        </Button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-foreground">Daily Progress</span>
          <span className="font-bold text-primary">
            {completedCount}/{totalCount} tasks
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h3 className="text-sm font-semibold text-foreground uppercase mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Daily Tasks
        </h3>
        <div className="space-y-2">
          {plan.tasks?.map((task: Task) => (
            <label
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                task.completed
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card/60 border-border/50 hover:border-primary/20'
              } ${updatingTask === task.id ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id, task.completed)}
                disabled={updatingTask === task.id}
                className="mt-0.5 w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-primary ${task.completed ? 'opacity-50' : ''}`}>
                    {getCategoryIcon(task.category)}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💪</span>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Keep Going!</h4>
            <p className="text-xs text-muted-foreground">
              {completedCount === totalCount
                ? "Amazing! You've completed all tasks today!"
                : `${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} remaining.`}
            </p>
          </div>
        </div>
      </div>

      {/* Diet Modal */}
      <Dialog open={showDietModal} onOpenChange={setShowDietModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DietTimetable onClose={() => setShowDietModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Exercise Modal - Placeholder */}
      <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exercise Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Your personalized exercise routine will appear here.
            </p>
            {/* Add ExercisePlan component here */}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
