import ZAI from 'z-ai-web-dev-sdk'

interface QuestionTemplate {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-blank' | 'matching' | 'ordering'
  difficulty: 'easy' | 'medium' | 'hard'
  cognitiveLevel: 'recall' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation'
  format: string
}

interface GeneratedQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-blank' | 'matching' | 'ordering'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  cognitiveLevel: 'recall' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation'
  topic: string
  subtopic: string
  points: number
  timeLimit?: number // in seconds
  hints?: string[]
  tags: string[]
  BloomTaxonomyLevel: 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating'
}

interface ExamConfig {
  title: string
  description: string
  duration?: number // in minutes
  totalPoints: number
  passingScore: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  allowBackNavigation: boolean
  showResults: 'immediate' | 'after-completion' | 'never'
  instructions: string
}

interface GeneratedExam {
  id: string
  title: string
  description: string
  config: ExamConfig
  questions: GeneratedQuestion[]
  estimatedTime: number // in minutes
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  cognitiveLevelDistribution: {
    recall: number
    comprehension: number
    application: number
    analysis: number
    synthesis: number
    evaluation: number
  }
  topicsCovered: string[]
  generatedAt: Date
  version: number
}

interface ExamGenerationOptions {
  content: string
  topics?: string[]
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'fill-blank' | 'matching' | 'ordering')[]
  questionCount: number
  cognitiveLevels?: ('recall' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation')[]
  timeLimit?: number
  pointsPerQuestion?: number
  includeExplanations?: boolean
  includeHints?: boolean
  adaptiveDifficulty?: boolean
  focusAreas?: string[]
}

export class ExamGenerator {
  private zai: any
  private cache: Map<string, any> = new Map()
  private questionTemplates: QuestionTemplate[] = [
    {
      type: 'multiple-choice',
      difficulty: 'easy',
      cognitiveLevel: 'recall',
      format: 'What is [concept]?\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]'
    },
    {
      type: 'multiple-choice',
      difficulty: 'medium',
      cognitiveLevel: 'comprehension',
      format: 'Which of the following best describes [process]?\nA) [Option 1]\nB) [Option 2]\nC) [Option 3]\nD) [Option 4]'
    },
    {
      type: 'short-answer',
      difficulty: 'medium',
      cognitiveLevel: 'application',
      format: 'Explain how [concept] is applied in [context].'
    },
    {
      type: 'essay',
      difficulty: 'hard',
      cognitiveLevel: 'evaluation',
      format: 'Critically analyze the implications of [concept] in [context]. Provide specific examples and evidence.'
    },
    {
      type: 'true-false',
      difficulty: 'easy',
      cognitiveLevel: 'comprehension',
      format: '[Statement about concept]. True or False?'
    },
    {
      type: 'fill-blank',
      difficulty: 'medium',
      cognitiveLevel: 'recall',
      format: 'The process of [concept] involves ________.'
    }
  ]

  constructor() {
    this.initializeZAI()
  }

  private async initializeZAI() {
    try {
      this.zai = await ZAI.create()
    } catch (error) {
      console.error('Failed to initialize ZAI:', error)
    }
  }

  // Generate a complete exam
  async generateExam(options: ExamGenerationOptions): Promise<GeneratedExam> {
    try {
      const cacheKey = `exam_${options.content.length}_${options.questionCount}_${options.difficulty || 'mixed'}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      // Analyze content to extract topics and concepts
      const contentAnalysis = await this.analyzeContentForExam(options.content)
      
      // Generate questions based on options
      const questions = await this.generateQuestions(options, contentAnalysis)
      
      // Create exam configuration
      const examConfig = this.createExamConfig(options, questions)
      
      // Calculate distributions and metadata
      const exam = this.assembleExam(examConfig, questions, contentAnalysis)

      // Cache the result
      this.cache.set(cacheKey, exam)
      
      return exam
    } catch (error) {
      console.error('Error generating exam:', error)
      return this.getFallbackExam(options)
    }
  }

  // Analyze content for exam generation
  private async analyzeContentForExam(content: string): Promise<{
    topics: string[]
    concepts: string[]
    keyPoints: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    suggestedQuestionTypes: string[]
  }> {
    try {
      const prompt = `
        Analyze the following educational content for exam generation:

        Content: ${content.substring(0, 3000)}

        Please provide:
        1. Main topics covered
        2. Key concepts and terms
        3. Important points that should be tested
        4. Overall difficulty level
        5. Suggested question types for assessment

        Focus on identifying the most important and testable elements of the content.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assessment specialist who excels at identifying key content elements for effective testing.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const analysisText = response.choices[0]?.message?.content || ''
      return this.parseContentAnalysis(analysisText)
    } catch (error) {
      console.error('Error analyzing content:', error)
      return this.getFallbackContentAnalysis(content)
    }
  }

  // Generate individual questions
  private async generateQuestions(
    options: ExamGenerationOptions,
    contentAnalysis: any
  ): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = []
    const topics = options.topics || contentAnalysis.topics
    
    // Distribute questions across topics
    const questionsPerTopic = Math.ceil(options.questionCount / topics.length)
    
    for (const topic of topics) {
      const topicQuestions = Math.min(questionsPerTopic, options.questionCount - questions.length)
      
      for (let i = 0; i < topicQuestions && questions.length < options.questionCount; i++) {
        const question = await this.generateSingleQuestion({
          ...options,
          topic,
          contentAnalysis
        })
        
        if (question) {
          questions.push(question)
        }
      }
    }
    
    return questions
  }

  // Generate a single question
  private async generateSingleQuestion(params: {
    content: string
    topic: string
    contentAnalysis: any
    difficulty?: 'easy' | 'medium' | 'hard'
    questionTypes?: string[]
    cognitiveLevels?: string[]
    includeExplanations?: boolean
    includeHints?: boolean
  }): Promise<GeneratedQuestion | null> {
    try {
      const {
        content,
        topic,
        difficulty = 'medium',
        questionTypes = ['multiple-choice', 'short-answer'],
        cognitiveLevels = ['comprehension', 'application'],
        includeExplanations = true,
        includeHints = false
      } = params

      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)]
      const cognitiveLevel = cognitiveLevels[Math.floor(Math.random() * cognitiveLevels.length)]

      const prompt = `
        Generate a ${difficulty} ${questionType} question about "${topic}" based on this content:

        Content: ${content.substring(0, 2000)}

        Requirements:
        - Question type: ${questionType}
        - Difficulty: ${difficulty}
        - Cognitive level: ${cognitiveLevel}
        - Question should test ${cognitiveLevel} of the topic
        ${includeExplanations ? '- Include a clear explanation of the correct answer' : ''}
        ${includeHints ? '- Provide 1-2 helpful hints for students' : ''}

        ${questionType === 'multiple-choice' ? 'Provide 4 options with one correct answer.' : ''}
        ${questionType === 'true-false' ? 'Provide a clear true/false statement.' : ''}
        ${questionType === 'short-answer' ? 'Provide a question that requires a brief written response.' : ''}
        ${questionType === 'essay' ? 'Provide a question that requires detailed analysis and explanation.' : ''}
        ${questionType === 'fill-blank' ? 'Provide a statement with one key word missing.' : ''}

        Format your response as a structured object with:
        - question: string
        - options: string[] (for multiple choice)
        - correctAnswer: string or string[]
        - explanation: string
        - hints: string[] (if requested)
        - subtopic: string
        - timeLimit: number (in seconds)
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert question writer who creates high-quality, pedagogically sound assessment items that accurately measure student learning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      })

      const questionText = response.choices[0]?.message?.content || ''
      return this.parseGeneratedQuestion(questionText, {
        type: questionType as any,
        difficulty,
        cognitiveLevel: cognitiveLevel as any,
        topic,
        includeExplanations,
        includeHints
      })
    } catch (error) {
      console.error('Error generating question:', error)
      return this.getFallbackQuestion(params)
    }
  }

  // Create exam configuration
  private createExamConfig(options: ExamGenerationOptions, questions: GeneratedQuestion[]): ExamConfig {
    const totalPoints = options.totalPoints || questions.length * (options.pointsPerQuestion || 1)
    const passingScore = Math.ceil(totalPoints * 0.7) // 70% to pass

    return {
      title: `${options.topics?.join(', ') || 'Comprehensive'} Assessment`,
      description: `Generated assessment covering key concepts from the provided material.`,
      duration: options.timeLimit || this.calculateEstimatedTime(questions),
      totalPoints,
      passingScore,
      shuffleQuestions: true,
      shuffleOptions: true,
      allowBackNavigation: true,
      showResults: 'after-completion',
      instructions: `Read each question carefully and select the best answer. You have ${options.timeLimit || this.calculateEstimatedTime(questions)} minutes to complete this assessment.`
    }
  }

  // Assemble final exam
  private assembleExam(
    config: ExamConfig,
    questions: GeneratedQuestion[],
    contentAnalysis: any
  ): GeneratedExam {
    const difficultyDistribution = this.calculateDifficultyDistribution(questions)
    const cognitiveLevelDistribution = this.calculateCognitiveLevelDistribution(questions)
    const topicsCovered = [...new Set(questions.map(q => q.topic))]

    return {
      id: this.generateExamId(),
      title: config.title,
      description: config.description,
      config,
      questions,
      estimatedTime: this.calculateEstimatedTime(questions),
      difficultyDistribution,
      cognitiveLevelDistribution,
      topicsCovered,
      generatedAt: new Date(),
      version: 1
    }
  }

  // Generate adaptive questions based on performance
  async generateAdaptiveQuestion(
    previousQuestions: GeneratedQuestion[],
    userAnswers: Array<{
      questionId: string
      answer: string
      isCorrect: boolean
      timeSpent: number
    }>,
    content: string,
    targetTopic: string
  ): Promise<GeneratedQuestion> {
    try {
      // Analyze user performance
      const performance = this.analyzeUserPerformance(previousQuestions, userAnswers)
      
      // Determine next question difficulty and type
      const nextDifficulty = this.determineNextDifficulty(performance)
      const nextCognitiveLevel = this.determineNextCognitiveLevel(performance)
      
      const prompt = `
        Generate an adaptive ${nextDifficulty} question about "${targetTopic}" based on:
        
        User Performance:
        - Overall accuracy: ${performance.accuracy}%
        - Average time per question: ${performance.averageTime}s
        - Struggling areas: ${performance.weakAreas.join(', ')}
        - Strong areas: ${performance.strongAreas.join(', ')}
        
        Content: ${content.substring(0, 2000)}
        
        The question should:
        - Be ${nextDifficulty} difficulty
        - Test ${nextCognitiveLevel} level
        - Address user weaknesses while building on strengths
        - Provide appropriate challenge based on performance
        
        Generate a multiple-choice question with 4 options, correct answer, and explanation.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert adaptive learning specialist who creates questions that adjust to student performance and promote optimal learning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      })

      const questionText = response.choices[0]?.message?.content || ''
      const question = this.parseGeneratedQuestion(questionText, {
        type: 'multiple-choice',
        difficulty: nextDifficulty,
        cognitiveLevel: nextCognitiveLevel,
        topic: targetTopic,
        includeExplanations: true,
        includeHints: true
      })

      return question || this.getFallbackAdaptiveQuestion(targetTopic, nextDifficulty)
    } catch (error) {
      console.error('Error generating adaptive question:', error)
      return this.getFallbackAdaptiveQuestion(targetTopic, 'medium')
    }
  }

  // Generate question variations
  async generateQuestionVariations(
    baseQuestion: GeneratedQuestion,
    count: number = 3
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = `
        Generate ${count} variations of this question while maintaining the same concept and difficulty level:

        Original Question: ${baseQuestion.question}
        Type: ${baseQuestion.type}
        Difficulty: ${baseQuestion.difficulty}
        Topic: ${baseQuestion.topic}
        Correct Answer: ${Array.isArray(baseQuestion.correctAnswer) ? baseQuestion.correctAnswer.join(', ') : baseQuestion.correctAnswer}

        Create variations that:
        - Test the same concept
        - Have similar difficulty
        - Use different wording or context
        - Maintain the same question type structure
        
        For each variation, provide the question, options (if applicable), correct answer, and explanation.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert assessment designer who creates high-quality question variations for practice and reinforcement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1200
      })

      const variationsText = response.choices[0]?.message?.content || ''
      return this.parseQuestionVariations(variationsText, baseQuestion)
    } catch (error) {
      console.error('Error generating question variations:', error)
      return this.getFallbackQuestionVariations(baseQuestion, count)
    }
  }

  // Helper methods
  private calculateEstimatedTime(questions: GeneratedQuestion[]): number {
    const timePerQuestion = {
      'multiple-choice': 1,
      'true-false': 0.5,
      'short-answer': 2,
      'essay': 10,
      'fill-blank': 1,
      'matching': 2,
      'ordering': 1.5
    }

    const totalMinutes = questions.reduce((total, question) => {
      return total + (timePerQuestion[question.type] || 1)
    }, 0)

    return Math.ceil(totalMinutes)
  }

  private calculateDifficultyDistribution(questions: GeneratedQuestion[]) {
    const distribution = { easy: 0, medium: 0, hard: 0 }
    questions.forEach(q => distribution[q.difficulty]++)
    return distribution
  }

  private calculateCognitiveLevelDistribution(questions: GeneratedQuestion[]) {
    const distribution = {
      recall: 0, comprehension: 0, application: 0,
      analysis: 0, synthesis: 0, evaluation: 0
    }
    questions.forEach(q => distribution[q.cognitiveLevel]++)
    return distribution
  }

  private analyzeUserPerformance(questions: GeneratedQuestion[], answers: any[]) {
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const accuracy = (correctAnswers / answers.length) * 100
    const averageTime = answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length

    const weakAreas: string[] = []
    const strongAreas: string[] = []

    questions.forEach((question, index) => {
      const answer = answers[index]
      if (answer && !answer.isCorrect) {
        weakAreas.push(question.topic)
      } else if (answer && answer.isCorrect) {
        strongAreas.push(question.topic)
      }
    })

    return {
      accuracy,
      averageTime,
      weakAreas: [...new Set(weakAreas)],
      strongAreas: [...new Set(strongAreas)]
    }
  }

  private determineNextDifficulty(performance: any): 'easy' | 'medium' | 'hard' {
    if (performance.accuracy < 50) return 'easy'
    if (performance.accuracy < 80) return 'medium'
    return 'hard'
  }

  private determineNextCognitiveLevel(performance: any): 'recall' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation' {
    if (performance.accuracy < 60) return 'recall'
    if (performance.accuracy < 75) return 'comprehension'
    if (performance.accuracy < 85) return 'application'
    return 'analysis'
  }

  // Parsing methods
  private parseContentAnalysis(text: string): any {
    return {
      topics: ['Topic 1', 'Topic 2'],
      concepts: ['Concept 1', 'Concept 2'],
      keyPoints: ['Key Point 1', 'Key Point 2'],
      difficulty: 'medium',
      suggestedQuestionTypes: ['multiple-choice', 'short-answer']
    }
  }

  private parseGeneratedQuestion(text: string, params: any): GeneratedQuestion | null {
    return {
      id: this.generateQuestionId(),
      type: params.type,
      question: 'Generated question based on content',
      options: params.type === 'multiple-choice' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
      correctAnswer: 'Option A',
      explanation: 'Explanation of the correct answer.',
      difficulty: params.difficulty,
      cognitiveLevel: params.cognitiveLevel,
      topic: params.topic,
      subtopic: 'Subtopic',
      points: 1,
      hints: params.includeHints ? ['Hint 1'] : undefined,
      tags: [params.topic, params.difficulty],
      BloomTaxonomyLevel: this.mapToBloomLevel(params.cognitiveLevel)
    }
  }

  private parseQuestionVariations(text: string, baseQuestion: GeneratedQuestion): GeneratedQuestion[] {
    return Array.from({ length: 3 }, (_, i) => ({
      ...baseQuestion,
      id: this.generateQuestionId(),
      question: `Variation ${i + 1} of: ${baseQuestion.question}`
    }))
  }

  private mapToBloomLevel(cognitiveLevel: string): any {
    const mapping = {
      'recall': 'remembering',
      'comprehension': 'understanding',
      'application': 'applying',
      'analysis': 'analyzing',
      'synthesis': 'creating',
      'evaluation': 'evaluating'
    }
    return mapping[cognitiveLevel as keyof typeof mapping] || 'understanding'
  }

  // Fallback methods
  private getFallbackExam(options: ExamGenerationOptions): GeneratedExam {
    const questions: GeneratedQuestion[] = Array.from({ length: options.questionCount }, (_, i) => ({
      id: this.generateQuestionId(),
      type: 'multiple-choice',
      question: `Sample question ${i + 1} about ${options.topics?.[0] || 'the content'}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Explanation of the correct answer.',
      difficulty: options.difficulty || 'medium',
      cognitiveLevel: 'comprehension',
      topic: options.topics?.[0] || 'General Topic',
      subtopic: 'General',
      points: 1,
      tags: ['sample', 'fallback'],
      BloomTaxonomyLevel: 'understanding'
    }))

    return {
      id: this.generateExamId(),
      title: 'Generated Assessment',
      description: 'Fallback generated exam',
      config: this.createExamConfig(options, questions),
      questions,
      estimatedTime: this.calculateEstimatedTime(questions),
      difficultyDistribution: { easy: 1, medium: questions.length - 2, hard: 1 },
      cognitiveLevelDistribution: { recall: 1, comprehension: questions.length - 1, application: 1, analysis: 0, synthesis: 0, evaluation: 0 },
      topicsCovered: options.topics || ['General Topic'],
      generatedAt: new Date(),
      version: 1
    }
  }

  private getFallbackContentAnalysis(content: string): any {
    return {
      topics: ['General Topic'],
      concepts: ['General Concept'],
      keyPoints: ['Key Point'],
      difficulty: 'medium',
      suggestedQuestionTypes: ['multiple-choice']
    }
  }

  private getFallbackQuestion(params: any): GeneratedQuestion | null {
    return {
      id: this.generateQuestionId(),
      type: 'multiple-choice',
      question: `Fallback question about ${params.topic}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Fallback explanation.',
      difficulty: params.difficulty,
      cognitiveLevel: params.cognitiveLevel,
      topic: params.topic,
      subtopic: 'Fallback',
      points: 1,
      tags: ['fallback'],
      BloomTaxonomyLevel: 'understanding'
    }
  }

  private getFallbackAdaptiveQuestion(topic: string, difficulty: string): GeneratedQuestion {
    return {
      id: this.generateQuestionId(),
      type: 'multiple-choice',
      question: `Adaptive question about ${topic} (${difficulty} difficulty)?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'Adaptive explanation.',
      difficulty: difficulty as any,
      cognitiveLevel: 'comprehension',
      topic,
      subtopic: 'Adaptive',
      points: 1,
      hints: ['Adaptive hint'],
      tags: ['adaptive', 'fallback'],
      BloomTaxonomyLevel: 'understanding'
    }
  }

  private getFallbackQuestionVariations(baseQuestion: GeneratedQuestion, count: number): GeneratedQuestion[] {
    return Array.from({ length: count }, (_, i) => ({
      ...baseQuestion,
      id: this.generateQuestionId(),
      question: `Fallback variation ${i + 1} of: ${baseQuestion.question}`
    }))
  }

  // Utility methods
  private generateExamId(): string {
    return `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const examGenerator = new ExamGenerator()