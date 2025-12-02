'use client'

import { useState } from 'react'

interface Task {
  id: string
  text: string
  completed: boolean
}

interface ActionPlan {
  risk_score: number
  factor: string
  plan_message: string
  tasks: Task[]
}

interface ActionPlanSidebarProps {
  plan: ActionPlan | null
  onUpdate: () => void
}

export default function ActionPlanSidebar({ plan, onUpdate }: ActionPlanSidebarProps) {
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setUpdatingTask(taskId)

    try {
      const response = await fetch('/api/action-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed: !completed }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setUpdatingTask(null)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200'
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk'
    if (score >= 40) return 'Moderate Risk'
    return 'Low Risk'
  }

  if (!plan) {
    return (
      <aside className="w-96 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Action Plan Yet</h3>
          <p className="text-sm">Complete the health assessment to generate your personalized action plan.</p>
        </div>
      </aside>
    )
  }

  const completedCount = plan.tasks.filter((t) => t.completed).length
  const totalCount = plan.tasks.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Action Plan</h2>

        {/* Risk Score Card */}
        <div className={`rounded-xl border-2 p-4 mb-4 ${getRiskColor(plan.risk_score)}`}>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{plan.risk_score}</div>
            <div className="text-sm font-medium">{getRiskLevel(plan.risk_score)}</div>
          </div>
        </div>

        {/* Primary Factor */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs font-medium text-blue-600 uppercase mb-1">Primary Factor</div>
          <div className="text-lg font-semibold text-blue-900">{plan.factor}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Daily Progress</span>
            <span className="font-medium">
              {completedCount}/{totalCount} tasks
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Daily Routine</h3>
        <div className="space-y-3">
          {plan.tasks.map((task) => (
            <label
              key={task.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                task.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-indigo-300'
              } ${updatingTask === task.id ? 'opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id, task.completed)}
                disabled={updatingTask === task.id}
                className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm ${
                  task.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900'
                }`}
              >
                {task.text}
              </span>
            </label>
          ))}
        </div>

        {/* Motivation Message */}
        <div className="mt-6 p-4 bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💪</div>
            <div>
              <div className="text-sm font-semibold text-purple-900 mb-1">Keep Going!</div>
              <div className="text-xs text-purple-700">
                {completedCount === totalCount
                  ? "Amazing! You've completed all tasks today!"
                  : `${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} remaining for today.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
