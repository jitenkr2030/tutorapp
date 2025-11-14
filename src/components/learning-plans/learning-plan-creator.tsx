'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Target, 
  Calendar, 
  Clock, 
  BookOpen,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface LearningGoal {
  id: string
  title: string
  description: string
  subject: string
  targetDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
  milestones: Milestone[]
}

interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  completed: boolean
  resources: string[]
}

interface LearningPlan {
  id: string
  title: string
  description: string
  subject: string
  studentId: string
  tutorId: string
  goals: LearningGoal[]
  createdAt: string
  updatedAt: string
}

interface LearningPlanCreatorProps {
  studentId: string
  tutorId?: string
  existingPlan?: LearningPlan
  onSave?: (plan: LearningPlan) => void
}

export default function LearningPlanCreator({ 
  studentId, 
  tutorId, 
  existingPlan, 
  onSave 
}: LearningPlanCreatorProps) {
  const [plan, setPlan] = useState<Partial<LearningPlan>>({
    title: '',
    description: '',
    subject: '',
    goals: []
  })
  const [isEditing, setIsEditing] = useState(!existingPlan)
  const [newGoal, setNewGoal] = useState<Partial<LearningGoal>>({
    title: '',
    description: '',
    subject: '',
    targetDate: '',
    priority: 'medium',
    status: 'not_started',
    progress: 0,
    milestones: []
  })
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: '',
    description: '',
    targetDate: '',
    completed: false,
    resources: []
  })
  const [showMilestoneForm, setShowMilestoneForm] = useState<string | null>(null)

  useEffect(() => {
    if (existingPlan) {
      setPlan(existingPlan)
    }
  }, [existingPlan])

  const savePlan = async () => {
    try {
      const planData = {
        ...plan,
        studentId,
        tutorId,
        goals: plan.goals || []
      }

      const response = await fetch('/api/learning-plans', {
        method: existingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        const savedPlan = await response.json()
        setIsEditing(false)
        onSave?.(savedPlan)
      }
    } catch (error) {
      console.error('Error saving learning plan:', error)
    }
  }

  const addGoal = () => {
    if (!newGoal.title || !newGoal.subject) return

    const goal: LearningGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      subject: newGoal.subject,
      targetDate: newGoal.targetDate || '',
      priority: newGoal.priority || 'medium',
      status: 'not_started',
      progress: 0,
      milestones: []
    }

    setPlan(prev => ({
      ...prev,
      goals: [...(prev.goals || []), goal]
    }))

    setNewGoal({
      title: '',
      description: '',
      subject: '',
      targetDate: '',
      priority: 'medium',
      status: 'not_started',
      progress: 0,
      milestones: []
    })
    setShowGoalForm(false)
  }

  const addMilestone = (goalId: string) => {
    if (!newMilestone.title) return

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description || '',
      targetDate: newMilestone.targetDate || '',
      completed: false,
      resources: newMilestone.resources || []
    }

    setPlan(prev => ({
      ...prev,
      goals: prev.goals?.map(goal =>
        goal.id === goalId
          ? { ...goal, milestones: [...goal.milestones, milestone] }
          : goal
      ) || []
    }))

    setNewMilestone({
      title: '',
      description: '',
      targetDate: '',
      completed: false,
      resources: []
    })
    setShowMilestoneForm(null)
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setPlan(prev => ({
      ...prev,
      goals: prev.goals?.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map(milestone =>
                milestone.id === milestoneId
                  ? { ...milestone, completed: !milestone.completed }
                  : milestone
              )
            }
          : goal
      ) || []
    }))

    // Update goal progress
    updateGoalProgress(goalId)
  }

  const updateGoalProgress = (goalId: string) => {
    setPlan(prev => ({
      ...prev,
      goals: prev.goals?.map(goal => {
        if (goal.id === goalId) {
          const completedMilestones = goal.milestones.filter(m => m.completed).length
          const totalMilestones = goal.milestones.length
          const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
          
          return {
            ...goal,
            progress,
            status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
          }
        }
        return goal
      }) || []
    }))
  }

  const deleteGoal = (goalId: string) => {
    setPlan(prev => ({
      ...prev,
      goals: prev.goals?.filter(goal => goal.id !== goalId) || []
    }))
  }

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    setPlan(prev => ({
      ...prev,
      goals: prev.goals?.map(goal =>
        goal.id === goalId
          ? { ...goal, milestones: goal.milestones.filter(m => m.id !== milestoneId) }
          : goal
      ) || []
    }))
    
    updateGoalProgress(goalId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'not_started': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Plan
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={savePlan} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)} 
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals & Milestones</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan-title">Plan Title</Label>
                  <Input
                    id="plan-title"
                    value={plan.title || ''}
                    onChange={(e) => setPlan(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter learning plan title"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-description">Description</Label>
                  <Textarea
                    id="plan-description"
                    value={plan.description || ''}
                    onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the learning plan objectives"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="plan-subject">Subject</Label>
                  <Input
                    id="plan-subject"
                    value={plan.subject || ''}
                    onChange={(e) => setPlan(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject area"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan.title}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{plan.subject}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Not set'}</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Learning Goals</h3>
              {isEditing && (
                <Button onClick={() => setShowGoalForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              )}
            </div>

            {showGoalForm && isEditing && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label>Goal Title</Label>
                    <Input
                      value={newGoal.title || ''}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newGoal.description || ''}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this learning goal"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={newGoal.subject || ''}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Subject"
                      />
                    </div>
                    <div>
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={newGoal.targetDate || ''}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addGoal} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowGoalForm(false)} 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {plan.goals?.map((goal) => (
                <Card key={goal.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(goal.status)}>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {goal.progress}% complete
                          </span>
                        </div>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">Milestones</h5>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMilestoneForm(goal.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {showMilestoneForm === goal.id && (
                        <Card className="p-3">
                          <div className="space-y-3">
                            <Input
                              placeholder="Milestone title"
                              value={newMilestone.title || ''}
                              onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <Textarea
                              placeholder="Milestone description"
                              value={newMilestone.description || ''}
                              onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                              rows={2}
                            />
                            <Input
                              type="date"
                              value={newMilestone.targetDate || ''}
                              onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => addMilestone(goal.id)} size="sm">
                                Add
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowMilestoneForm(null)} 
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}

                      <div className="space-y-2">
                        {goal.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-2 p-2 border rounded">
                            <button
                              onClick={() => toggleMilestone(goal.id, milestone.id)}
                              className="flex-shrink-0"
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.title}
                              </p>
                              {milestone.targetDate && (
                                <p className="text-xs text-muted-foreground">
                                  Target: {new Date(milestone.targetDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMilestone(goal.id, milestone.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {(!plan.goals || plan.goals.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No learning goals yet. Add your first goal to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {plan.goals?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Goals</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {plan.goals?.filter(g => g.status === 'completed').length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {plan.goals?.filter(g => g.status === 'in_progress').length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.goals?.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}