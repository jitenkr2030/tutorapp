'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProgressAnalytics from '@/components/progress/progress-analytics'
import LearningPlanCreator from '@/components/learning-plans/learning-plan-creator'
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  BookOpen,
  Award,
  Plus,
  Clock
} from 'lucide-react'

interface LearningPlan {
  id: string
  title: string
  description: string
  subject: string
  studentId: string
  tutorId: string
  goals: any[]
  createdAt: string
  updatedAt: string
}

export default function StudentProgressPage() {
  const { data: session } = useSession()
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPlanCreator, setShowPlanCreator] = useState(false)

  useEffect(() => {
    if (session) {
      fetchLearningPlans()
    }
  }, [session])

  const fetchLearningPlans = async () => {
    try {
      const response = await fetch('/api/learning-plans')
      if (response.ok) {
        const plans = await response.json()
        setLearningPlans(plans)
        if (plans.length > 0) {
          setSelectedPlan(plans[0])
        }
      }
    } catch (error) {
      console.error('Error fetching learning plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSave = (plan: LearningPlan) => {
    fetchLearningPlans()
    setShowPlanCreator(false)
    setSelectedPlan(plan)
  }

  const getOverallProgress = () => {
    if (!learningPlans.length) return 0
    
    const totalGoals = learningPlans.reduce((sum, plan) => sum + plan.goals.length, 0)
    const completedGoals = learningPlans.reduce((sum, plan) => 
      sum + plan.goals.filter((goal: any) => goal.status === 'completed').length, 0
    )
    
    return totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
  }

  const getUpcomingMilestones = () => {
    const milestones: any[] = []
    const today = new Date()
    
    learningPlans.forEach(plan => {
      plan.goals.forEach((goal: any) => {
        goal.milestones.forEach((milestone: any) => {
          if (!milestone.completed && milestone.targetDate) {
            const targetDate = new Date(milestone.targetDate)
            const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            
            if (daysUntil >= 0 && daysUntil <= 7) {
              milestones.push({
                ...milestone,
                goalTitle: goal.title,
                planTitle: plan.title,
                daysUntil
              })
            }
          }
        })
      })
    })
    
    return milestones.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading progress data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Learning Progress</h1>
            <p className="text-muted-foreground">Track your educational journey and achievements</p>
          </div>
          <Button onClick={() => setShowPlanCreator(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Learning Plan
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Learning Plans</p>
                  <p className="text-2xl font-bold">{learningPlans.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{getOverallProgress()}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                  <p className="text-2xl font-bold">
                    {learningPlans.reduce((sum, plan) => 
                      sum + plan.goals.filter((goal: any) => goal.status === 'in_progress').length, 0
                    )}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Goals</p>
                  <p className="text-2xl font-bold">
                    {learningPlans.reduce((sum, plan) => 
                      sum + plan.goals.filter((goal: any) => goal.status === 'completed').length, 0
                    )}
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analytics">Progress Analytics</TabsTrigger>
                <TabsTrigger value="plans">Learning Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                {session && (
                  <ProgressAnalytics userId={session.user.id} userType="student" />
                )}
              </TabsContent>

              <TabsContent value="plans" className="space-y-4">
                {showPlanCreator ? (
                  <LearningPlanCreator
                    studentId={session?.user.id || ''}
                    onSave={handlePlanSave}
                  />
                ) : selectedPlan ? (
                  <LearningPlanCreator
                    studentId={session?.user.id || ''}
                    existingPlan={selectedPlan}
                    onSave={handlePlanSave}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Learning Plans Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first learning plan to start tracking your educational goals
                        </p>
                        <Button onClick={() => setShowPlanCreator(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Learning Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {learningPlans.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Learning Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {learningPlans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedPlan?.id === plan.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedPlan(plan)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{plan.title}</h4>
                                <p className="text-sm text-muted-foreground">{plan.subject}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {plan.goals.length} goals
                                </Badge>
                                <Badge variant="outline">
                                  {plan.goals.filter((g: any) => g.status === 'completed').length} completed
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getUpcomingMilestones().length > 0 ? (
                  <div className="space-y-3">
                    {getUpcomingMilestones().slice(0, 5).map((milestone, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{milestone.title}</h4>
                          <Badge variant={milestone.daysUntil <= 3 ? 'destructive' : 'outline'}>
                            {milestone.daysUntil === 0 ? 'Today' : `${milestone.daysUntil}d`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{milestone.goalTitle}</p>
                        <p className="text-xs text-muted-foreground">{milestone.planTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No upcoming milestones</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningPlans.slice(0, 3).map((plan) => (
                    <div key={plan.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{plan.title}</h4>
                        <Badge variant="outline">
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.goals.filter((g: any) => g.status === 'in_progress').length} goals in progress
                      </p>
                    </div>
                  ))}
                  
                  {learningPlans.length === 0 && (
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Learning Time</span>
                  <span className="font-medium">-- hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sessions Completed</span>
                  <span className="font-medium">-- sessions</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Rating</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Subjects Studied</span>
                  <span className="font-medium">
                    {new Set(learningPlans.map(p => p.subject)).size}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}