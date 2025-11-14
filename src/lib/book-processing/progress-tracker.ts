interface LearningSession {
  id: string
  userId: string
  documentId: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  chaptersStudied: string[]
  sectionsStudied: string[]
  conceptsCovered: string[]
  pagesRead: number
  notes: string
  productivity: number // 0-100
  engagement: number // 0-100
  difficulty: 'easy' | 'medium' | 'hard'
  mood: 'focused' | 'distracted' | 'tired' | 'motivated' | 'confused'
}

interface ReadingProgress {
  userId: string
  documentId: string
  currentPage: number
  totalPages: number
  progressPercentage: number
  lastPosition: {
    chapter: string
    section: string
    timestamp: Date
  }
  completedChapters: string[]
  completedSections: string[]
  timeSpent: number // total minutes
  sessionsCount: number
  firstAccessed: Date
  lastAccessed: Date
  estimatedRemainingTime: number // in minutes
}

interface ConceptMastery {
  userId: string
  concept: string
  documentId: string
  documentTitle: string
  masteryLevel: number // 0-100
  confidence: number // 0-100
  lastStudied: Date
  studyCount: number
  averageSessionScore: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  relatedConcepts: string[]
  recommendations: string[]
}

interface LearningAnalytics {
  userId: string
  totalStudyTime: number // in minutes
  totalSessions: number
  averageSessionLength: number
  averageProductivity: number
  averageEngagement: number
  documentsCompleted: number
  documentsInProgress: number
  conceptsMastered: number
  conceptsInProgress: number
  studyStreak: number // consecutive days
  preferredStudyTimes: number[]
  learningVelocity: number // concepts mastered per hour
  retentionRate: number // percentage of concepts retained
  weakAreas: string[]
  strongAreas: string[]
  studyEfficiency: number // productivity per time unit
  goalsProgress: Array<{
    goal: string
    target: number
    current: number
    deadline: Date
    completed: boolean
  }>
}

interface StudyGoal {
  id: string
  userId: string
  title: string
  description: string
  type: 'reading' | 'concepts' | 'time' | 'exams'
  target: number
  current: number
  unit: string
  deadline: Date
  documentId?: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
}

interface LearningRecommendation {
  type: 'study_time' | 'concept_review' | 'difficulty_adjustment' | 'break' | 'new_material'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  action: string
  estimatedImpact: number
  confidence: number
}

export class ProgressTracker {
  private sessions: Map<string, LearningSession> = new Map()
  private readingProgress: Map<string, ReadingProgress> = new Map()
  private conceptMastery: Map<string, ConceptMastery> = new Map()
  private studyGoals: Map<string, StudyGoal> = new Map()

  // Session Management
  startSession(
    userId: string,
    documentId: string,
    options: {
      chapter?: string
      section?: string
      mood?: 'focused' | 'distracted' | 'tired' | 'motivated' | 'confused'
    } = {}
  ): LearningSession {
    const session: LearningSession = {
      id: this.generateSessionId(),
      userId,
      documentId,
      startTime: new Date(),
      duration: 0,
      chaptersStudied: options.chapter ? [options.chapter] : [],
      sectionsStudied: options.section ? [options.section] : [],
      conceptsCovered: [],
      pagesRead: 0,
      notes: '',
      productivity: 0,
      engagement: 0,
      difficulty: 'medium',
      mood: options.mood || 'focused'
    }

    this.sessions.set(session.id, session)
    return session
  }

  updateSession(
    sessionId: string,
    updates: {
      chaptersStudied?: string[]
      sectionsStudied?: string[]
      conceptsCovered?: string[]
      pagesRead?: number
      notes?: string
      productivity?: number
      engagement?: number
      difficulty?: 'easy' | 'medium' | 'hard'
      mood?: 'focused' | 'distracted' | 'tired' | 'motivated' | 'confused'
    }
  ): LearningSession | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const updatedSession = { ...session, ...updates }
    this.sessions.set(sessionId, updatedSession)
    return updatedSession
  }

  endSession(sessionId: string): LearningSession | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    session.endTime = new Date()
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000)

    // Update reading progress
    this.updateReadingProgress(session)

    // Update concept mastery
    this.updateConceptMastery(session)

    return session
  }

  // Reading Progress Management
  updateReadingProgress(session: LearningSession): void {
    const key = `${session.userId}_${session.documentId}`
    let progress = this.readingProgress.get(key)

    if (!progress) {
      progress = {
        userId: session.userId,
        documentId: session.documentId,
        currentPage: 0,
        totalPages: 0, // This should be set when document is processed
        progressPercentage: 0,
        lastPosition: {
          chapter: session.chaptersStudied[0] || '',
          section: session.sectionsStudied[0] || '',
          timestamp: new Date()
        },
        completedChapters: [],
        completedSections: [],
        timeSpent: 0,
        sessionsCount: 0,
        firstAccessed: new Date(),
        lastAccessed: new Date(),
        estimatedRemainingTime: 0
      }
    }

    // Update progress
    progress.timeSpent += session.duration
    progress.sessionsCount += 1
    progress.lastAccessed = new Date()
    
    // Update completed chapters and sections
    session.chaptersStudied.forEach(chapter => {
      if (!progress.completedChapters.includes(chapter)) {
        progress.completedChapters.push(chapter)
      }
    })

    session.sectionsStudied.forEach(section => {
      if (!progress.completedSections.includes(section)) {
        progress.completedSections.push(section)
      }
    })

    // Update current position
    if (session.chaptersStudied.length > 0) {
      progress.lastPosition.chapter = session.chaptersStudied[session.chaptersStudied.length - 1]
    }
    if (session.sectionsStudied.length > 0) {
      progress.lastPosition.section = session.sectionsStudied[session.sectionsStudied.length - 1]
    }

    // Calculate progress percentage (simplified)
    if (progress.totalPages > 0) {
      progress.progressPercentage = Math.min(100, (progress.currentPage / progress.totalPages) * 100)
    }

    // Estimate remaining time
    const avgTimePerPage = progress.timeSpent / Math.max(progress.currentPage, 1)
    progress.estimatedRemainingTime = Math.ceil((progress.totalPages - progress.currentPage) * avgTimePerPage)

    this.readingProgress.set(key, progress)
  }

  // Concept Mastery Management
  updateConceptMastery(session: LearningSession): void {
    session.conceptsCovered.forEach(concept => {
      const key = `${session.userId}_${concept}`
      let mastery = this.conceptMastery.get(key)

      if (!mastery) {
        mastery = {
          userId: session.userId,
          concept,
          documentId: session.documentId,
          documentTitle: '', // This should be set when document is processed
          masteryLevel: 0,
          confidence: 0,
          lastStudied: new Date(),
          studyCount: 0,
          averageSessionScore: 0,
          difficulty: 'beginner',
          prerequisites: [],
          relatedConcepts: [],
          recommendations: []
        }
      }

      // Update mastery based on session performance
      const sessionScore = (session.productivity + session.engagement) / 2
      mastery.studyCount += 1
      mastery.lastStudied = new Date()
      
      // Calculate new mastery level (simplified)
      const previousWeight = mastery.studyCount > 1 ? 0.7 : 0
      const currentWeight = 1 - previousWeight
      mastery.averageSessionScore = (mastery.averageSessionScore * previousWeight) + (sessionScore * currentWeight)
      
      // Mastery level increases with study count and performance
      mastery.masteryLevel = Math.min(100, mastery.studyCount * 15 + mastery.averageSessionScore * 0.7)
      mastery.confidence = Math.min(100, mastery.studyCount * 10 + session.engagement)

      // Update difficulty based on performance
      if (mastery.averageSessionScore > 80) {
        mastery.difficulty = 'advanced'
      } else if (mastery.averageSessionScore > 60) {
        mastery.difficulty = 'intermediate'
      } else {
        mastery.difficulty = 'beginner'
      }

      this.conceptMastery.set(key, mastery)
    })
  }

  // Analytics Generation
  generateLearningAnalytics(userId: string): LearningAnalytics {
    const userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId)
    const userProgress = Array.from(this.readingProgress.values()).filter(p => p.userId === userId)
    const userMastery = Array.from(this.conceptMastery.values()).filter(m => m.userId === userId)
    const userGoals = Array.from(this.studyGoals.values()).filter(g => g.userId === userId)

    const totalStudyTime = userSessions.reduce((sum, session) => sum + session.duration, 0)
    const totalSessions = userSessions.length
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0
    const averageProductivity = totalSessions > 0 ? 
      userSessions.reduce((sum, session) => sum + session.productivity, 0) / totalSessions : 0
    const averageEngagement = totalSessions > 0 ? 
      userSessions.reduce((sum, session) => sum + session.engagement, 0) / totalSessions : 0

    const documentsCompleted = userProgress.filter(p => p.progressPercentage === 100).length
    const documentsInProgress = userProgress.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length

    const conceptsMastered = userMastery.filter(m => m.masteryLevel >= 80).length
    const conceptsInProgress = userMastery.filter(m => m.masteryLevel > 0 && m.masteryLevel < 80).length

    const studyStreak = this.calculateStudyStreak(userId)
    const preferredStudyTimes = this.calculatePreferredStudyTimes(userId)
    const learningVelocity = totalStudyTime > 0 ? (conceptsMastered / totalStudyTime) * 60 : 0 // concepts per hour
    const retentionRate = this.calculateRetentionRate(userId)
    const weakAreas = this.identifyWeakAreas(userId)
    const strongAreas = this.identifyStrongAreas(userId)
    const studyEfficiency = totalStudyTime > 0 ? averageProductivity / (totalStudyTime / 60) : 0

    const goalsProgress = userGoals.map(goal => ({
      goal: goal.title,
      target: goal.target,
      current: goal.current,
      deadline: goal.deadline,
      completed: goal.completed
    }))

    return {
      userId,
      totalStudyTime,
      totalSessions,
      averageSessionLength,
      averageProductivity,
      averageEngagement,
      documentsCompleted,
      documentsInProgress,
      conceptsMastered,
      conceptsInProgress,
      studyStreak,
      preferredStudyTimes,
      learningVelocity,
      retentionRate,
      weakAreas,
      strongAreas,
      studyEfficiency,
      goalsProgress
    }
  }

  // Study Goals Management
  createStudyGoal(goal: Omit<StudyGoal, 'id' | 'createdAt' | 'completed'>): StudyGoal {
    const newGoal: StudyGoal = {
      ...goal,
      id: this.generateGoalId(),
      createdAt: new Date(),
      completed: false
    }

    this.studyGoals.set(newGoal.id, newGoal)
    return newGoal
  }

  updateStudyGoal(goalId: string, updates: Partial<StudyGoal>): StudyGoal | null {
    const goal = this.studyGoals.get(goalId)
    if (!goal) return null

    const updatedGoal = { ...goal, ...updates }
    
    // Check if goal is completed
    if (updatedGoal.current >= updatedGoal.target && !updatedGoal.completed) {
      updatedGoal.completed = true
      updatedGoal.completedAt = new Date()
    }

    this.studyGoals.set(goalId, updatedGoal)
    return updatedGoal
  }

  // Learning Recommendations
  generateRecommendations(userId: string): LearningRecommendation[] {
    const analytics = this.generateLearningAnalytics(userId)
    const recommendations: LearningRecommendation[] = []

    // Study time recommendations
    if (analytics.averageSessionLength < 30) {
      recommendations.push({
        type: 'study_time',
        priority: 'high',
        title: 'Increase Study Session Length',
        description: 'Your average session length is shorter than recommended for optimal learning.',
        action: 'Try to study for at least 30-45 minutes per session.',
        estimatedImpact: 25,
        confidence: 85
      })
    }

    // Concept review recommendations
    if (analytics.retentionRate < 70) {
      recommendations.push({
        type: 'concept_review',
        priority: 'high',
        title: 'Review Weak Concepts',
        description: 'Your retention rate suggests some concepts need reinforcement.',
        action: 'Schedule review sessions for concepts with low mastery levels.',
        estimatedImpact: 30,
        confidence: 90
      })
    }

    // Difficulty adjustment recommendations
    if (analytics.weakAreas.length > 3) {
      recommendations.push({
        type: 'difficulty_adjustment',
        priority: 'medium',
        title: 'Adjust Difficulty Level',
        description: 'You may be struggling with multiple concepts simultaneously.',
        action: 'Focus on one weak area at a time or seek additional resources.',
        estimatedImpact: 20,
        confidence: 75
      })
    }

    // Break recommendations
    if (analytics.averageProductivity < 60 && analytics.averageSessionLength > 60) {
      recommendations.push({
        type: 'break',
        priority: 'medium',
        title: 'Take More Breaks',
        description: 'Your productivity decreases during longer sessions.',
        action: 'Use the Pomodoro technique: 25 minutes study, 5 minutes break.',
        estimatedImpact: 15,
        confidence: 80
      })
    }

    // New material recommendations
    if (analytics.conceptsMastered > 10 && analytics.weakAreas.length === 0) {
      recommendations.push({
        type: 'new_material',
        priority: 'low',
        title: 'Explore New Material',
        description: 'You have mastered current concepts and are ready for new challenges.',
        action: 'Consider moving to the next chapter or more advanced topics.',
        estimatedImpact: 10,
        confidence: 70
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Helper Methods
  private calculateStudyStreak(userId: number): number {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .map(s => s.startTime.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort()

    if (userSessions.length === 0) return 0

    let streak = 1
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // Check if studied today or yesterday
    if (userSessions[userSessions.length - 1] !== today && userSessions[userSessions.length - 1] !== yesterday) {
      return 0
    }

    // Calculate consecutive days
    for (let i = userSessions.length - 2; i >= 0; i--) {
      const currentDate = new Date(userSessions[i])
      const previousDate = new Date(userSessions[i + 1])
      
      const diffDays = Math.floor((previousDate.getTime() - currentDate.getTime()) / 86400000)
      
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  private calculatePreferredStudyTimes(userId: string): number[] {
    const userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId)
    const hourCounts: number[] = new Array(24).fill(0)

    userSessions.forEach(session => {
      const hour = session.startTime.getHours()
      hourCounts[hour]++
    })

    // Find top 3 study times
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour)
  }

  private calculateRetentionRate(userId: string): number {
    const userMastery = Array.from(this.conceptMastery.values()).filter(m => m.userId === userId)
    
    if (userMastery.length === 0) return 0

    const totalMastery = userMastery.reduce((sum, m) => sum + m.masteryLevel, 0)
    return totalMastery / userMastery.length
  }

  private identifyWeakAreas(userId: string): string[] {
    const userMastery = Array.from(this.conceptMastery.values())
      .filter(m => m.userId === userId && m.masteryLevel < 60)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)

    return userMastery.slice(0, 5).map(m => m.concept)
  }

  private identifyStrongAreas(userId: string): string[] {
    const userMastery = Array.from(this.conceptMastery.values())
      .filter(m => m.userId === userId && m.masteryLevel >= 80)
      .sort((a, b) => b.masteryLevel - a.masteryLevel)

    return userMastery.slice(0, 5).map(m => m.concept)
  }

  // Utility Methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateGoalId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Getters
  getUserSessions(userId: string): LearningSession[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId)
  }

  getUserProgress(userId: string): ReadingProgress[] {
    return Array.from(this.readingProgress.values()).filter(p => p.userId === userId)
  }

  getUserConceptMastery(userId: string): ConceptMastery[] {
    return Array.from(this.conceptMastery.values()).filter(m => m.userId === userId)
  }

  getUserGoals(userId: string): StudyGoal[] {
    return Array.from(this.studyGoals.values()).filter(g => g.userId === userId)
  }

  getSession(sessionId: string): LearningSession | undefined {
    return this.sessions.get(sessionId)
  }

  getProgress(userId: string, documentId: string): ReadingProgress | undefined {
    return this.readingProgress.get(`${userId}_${documentId}`)
  }

  getConceptMastery(userId: string, concept: string): ConceptMastery | undefined {
    return this.conceptMastery.get(`${userId}_${concept}`)
  }

  // Data Export
  exportUserData(userId: string): {
    sessions: LearningSession[]
    progress: ReadingProgress[]
    mastery: ConceptMastery[]
    goals: StudyGoal[]
    analytics: LearningAnalytics
  } {
    return {
      sessions: this.getUserSessions(userId),
      progress: this.getUserProgress(userId),
      mastery: this.getUserConceptMastery(userId),
      goals: this.getUserGoals(userId),
      analytics: this.generateLearningAnalytics(userId)
    }
  }

  // Clear user data (for privacy/deletion)
  clearUserData(userId: string): void {
    // Remove sessions
    const sessionsToRemove = Array.from(this.sessions.keys()).filter(key => {
      const session = this.sessions.get(key)
      return session?.userId === userId
    })
    sessionsToRemove.forEach(key => this.sessions.delete(key))

    // Remove progress
    const progressToRemove = Array.from(this.readingProgress.keys()).filter(key => 
      key.startsWith(`${userId}_`)
    )
    progressToRemove.forEach(key => this.readingProgress.delete(key))

    // Remove mastery
    const masteryToRemove = Array.from(this.conceptMastery.keys()).filter(key => 
      key.startsWith(`${userId}_`)
    )
    masteryToRemove.forEach(key => this.conceptMastery.delete(key))

    // Remove goals
    const goalsToRemove = Array.from(this.studyGoals.keys()).filter(key => {
      const goal = this.studyGoals.get(key)
      return goal?.userId === userId
    })
    goalsToRemove.forEach(key => this.studyGoals.delete(key))
  }
}

export const progressTracker = new ProgressTracker()