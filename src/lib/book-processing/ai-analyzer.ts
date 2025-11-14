import ZAI from 'z-ai-web-dev-sdk'

interface ConceptAnalysis {
  concept: string
  definition: string
  importance: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  relatedConcepts: string[]
  examples: string[]
  applications: string[]
}

interface TopicAnalysis {
  topic: string
  confidence: number
  keywords: string[]
  subtopics: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedStudyTime: number // in hours
  learningObjectives: string[]
}

interface ContentSummary {
  overview: string
  keyPoints: string[]
  mainTopics: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadingTime: number // in minutes
  prerequisites: string[]
}

interface ExplanationRequest {
  concept: string
  level: 'beginner' | 'intermediate' | 'advanced'
  context?: string
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  includeExamples?: boolean
  includeAnalogies?: boolean
  includeDiagrams?: boolean
}

interface ExplanationResponse {
  concept: string
  explanation: string
  level: 'beginner' | 'intermediate' | 'advanced'
  examples: string[]
  analogies: string[]
  diagrams?: string[]
  relatedConcepts: string[]
  commonMisconceptions: string[]
  studyTips: string[]
  furtherReading?: string[]
}

export class AIAnalyzer {
  private zai: any
  private cache: Map<string, any> = new Map()

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

  // Analyze entire document content
  async analyzeDocument(content: string): Promise<{
    topics: TopicAnalysis[]
    concepts: ConceptAnalysis[]
    summary: ContentSummary
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }> {
    try {
      const cacheKey = `doc_analysis_${content.length}_${content.substring(0, 100)}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const prompt = `
        Analyze the following educational document content and provide a comprehensive analysis:

        Content: ${content.substring(0, 4000)}

        Please provide:
        1. Main topics with confidence scores (0-1)
        2. Key concepts with definitions and importance scores
        3. Overall difficulty assessment
        4. Content summary with key points
        5. Estimated study and reading times
        6. Learning objectives
        7. Prerequisites

        Format your response as a structured JSON object with the following schema:
        {
          "topics": [
            {
              "topic": "string",
              "confidence": number,
              "keywords": ["string"],
              "subtopics": ["string"],
              "difficulty": "beginner|intermediate|advanced",
              "estimatedStudyTime": number,
              "learningObjectives": ["string"]
            }
          ],
          "concepts": [
            {
              "concept": "string",
              "definition": "string",
              "importance": number,
              "difficulty": "beginner|intermediate|advanced",
              "prerequisites": ["string"],
              "relatedConcepts": ["string"],
              "examples": ["string"],
              "applications": ["string"]
            }
          ],
          "summary": {
            "overview": "string",
            "keyPoints": ["string"],
            "mainTopics": ["string"],
            "difficulty": "beginner|intermediate|advanced",
            "estimatedReadingTime": number,
            "prerequisites": ["string"]
          },
          "difficulty": "beginner|intermediate|advanced"
        }
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content analyzer with deep knowledge of curriculum design, learning theory, and subject matter expertise. Provide detailed, accurate analysis of educational materials.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const analysisText = response.choices[0]?.message?.content || ''
      const analysis = this.parseAnalysisResponse(analysisText)

      // Cache the result
      this.cache.set(cacheKey, analysis)
      
      return analysis
    } catch (error) {
      console.error('Error analyzing document:', error)
      return this.getFallbackAnalysis(content)
    }
  }

  // Generate explanation for a specific concept
  async generateExplanation(request: ExplanationRequest): Promise<ExplanationResponse> {
    try {
      const cacheKey = `explanation_${request.concept}_${request.level}_${request.context || ''}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const prompt = `
        Generate a comprehensive explanation for the concept "${request.concept}" at a ${request.level} level.
        ${request.context ? `Context: ${request.context}` : ''}
        ${request.learningStyle ? `Learning style preference: ${request.learningStyle}` : ''}
        
        Please provide:
        1. Clear, concise explanation
        2. Real-world examples (${request.includeExamples !== false ? 'include' : 'exclude'})
        3. Helpful analogies (${request.includeAnalogies !== false ? 'include' : 'exclude'})
        4. Related concepts for further learning
        5. Common misconceptions to avoid
        6. Study tips for mastery
        ${request.includeDiagrams ? '7. Suggested diagram descriptions' : ''}
        
        Make the explanation engaging, accurate, and appropriate for the specified difficulty level.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who excels at explaining complex concepts clearly and engagingly. Adapt your explanations to the learner\'s level and provide practical, real-world context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })

      const explanationText = response.choices[0]?.message?.content || ''
      const explanation = this.parseExplanationResponse(explanationText, request)

      // Cache the result
      this.cache.set(cacheKey, explanation)
      
      return explanation
    } catch (error) {
      console.error('Error generating explanation:', error)
      return this.getFallbackExplanation(request)
    }
  }

  // Analyze specific chapter or section
  async analyzeChapter(content: string, chapterTitle: string): Promise<{
    summary: string
    keyConcepts: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    studyTime: number
    prerequisites: string[]
    learningObjectives: string[]
  }> {
    try {
      const cacheKey = `chapter_${chapterTitle}_${content.length}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const prompt = `
        Analyze the following chapter content titled "${chapterTitle}":

        Content: ${content.substring(0, 3000)}

        Please provide:
        1. Chapter summary
        2. Key concepts covered
        3. Difficulty level assessment
        4. Estimated study time in hours
        5. Prerequisites for understanding this chapter
        6. Learning objectives

        Format your response as a structured JSON object.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum analyst with deep understanding of educational content structure and learning progression.'
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
      const analysis = this.parseChapterAnalysis(analysisText)

      // Cache the result
      this.cache.set(cacheKey, analysis)
      
      return analysis
    } catch (error) {
      console.error('Error analyzing chapter:', error)
      return this.getFallbackChapterAnalysis(content, chapterTitle)
    }
  }

  // Extract and analyze key terms
  async extractKeyTerms(content: string): Promise<Array<{
    term: string
    definition: string
    importance: number
    category: string
  }>> {
    try {
      const cacheKey = `keyterms_${content.length}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const prompt = `
        Extract key terms and concepts from the following educational content:

        Content: ${content.substring(0, 3000)}

        For each key term, provide:
        1. The term itself
        2. A clear definition
        3. Importance score (0-1)
        4. Category (e.g., "concept", "formula", "theory", "process")

        Focus on terms that are central to understanding the content and would be important for a student to know.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in terminology extraction and educational content analysis. Identify and define key terms that are essential for understanding the material.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const termsText = response.choices[0]?.message?.content || ''
      const terms = this.parseKeyTermsResponse(termsText)

      // Cache the result
      this.cache.set(cacheKey, terms)
      
      return terms
    } catch (error) {
      console.error('Error extracting key terms:', error)
      return this.getFallbackKeyTerms(content)
    }
  }

  // Generate study questions for self-assessment
  async generateStudyQuestions(
    content: string,
    options: {
      count?: number
      difficulty?: 'easy' | 'medium' | 'hard'
      types?: ('multiple-choice' | 'short-answer' | 'true-false')[]
    } = {}
  ): Promise<Array<{
    question: string
    type: 'multiple-choice' | 'short-answer' | 'true-false'
    options?: string[]
    answer: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    concept: string
  }>> {
    try {
      const {
        count = 5,
        difficulty = 'medium',
        types = ['multiple-choice', 'short-answer']
      } = options

      const cacheKey = `questions_${content.length}_${difficulty}_${count}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const prompt = `
        Generate ${count} ${difficulty} study questions based on the following content:

        Content: ${content.substring(0, 2500)}

        Question types: ${types.join(', ')}

        For each question, provide:
        1. The question text
        2. Question type
        3. Answer choices (for multiple choice)
        4. Correct answer
        5. Explanation of the answer
        6. Difficulty level
        7. Related concept

        Make sure questions test understanding, not just memorization.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assessment creator who designs thoughtful questions that test deep understanding and critical thinking.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      })

      const questionsText = response.choices[0]?.message?.content || ''
      const questions = this.parseQuestionsResponse(questionsText)

      // Cache the result
      this.cache.set(cacheKey, questions)
      
      return questions
    } catch (error) {
      console.error('Error generating study questions:', error)
      return this.getFallbackStudyQuestions(content, options)
    }
  }

  // Generate learning path recommendations
  async generateLearningPath(
    currentKnowledge: string[],
    targetTopics: string[],
    availableContent: string[]
  ): Promise<{
    recommendedOrder: string[]
    estimatedTime: number
    prerequisites: string[]
    milestones: Array<{
      topic: string
      estimatedTime: number
      prerequisites: string[]
    }>
  }> {
    try {
      const cacheKey = `learning_path_${targetTopics.join('_')}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      const prompt = `
        Generate an optimal learning path based on:
        
        Current knowledge: ${currentKnowledge.join(', ')}
        Target topics: ${targetTopics.join(', ')}
        Available content areas: ${availableContent.join(', ')}

        Please provide:
        1. Recommended learning order
        2. Total estimated study time in hours
        3. Required prerequisites
        4. Learning milestones with time estimates

        Consider logical progression, dependencies between topics, and building foundational knowledge first.
      `

      const response = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert curriculum designer and learning path specialist with deep understanding of how people learn and the logical progression of knowledge.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const pathText = response.choices[0]?.message?.content || ''
      const learningPath = this.parseLearningPathResponse(pathText)

      // Cache the result
      this.cache.set(cacheKey, learningPath)
      
      return learningPath
    } catch (error) {
      console.error('Error generating learning path:', error)
      return this.getFallbackLearningPath(currentKnowledge, targetTopics, availableContent)
    }
  }

  // Helper methods for parsing responses
  private parseAnalysisResponse(response: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback to basic parsing
      return this.getFallbackAnalysis('')
    } catch (error) {
      console.error('Error parsing analysis response:', error)
      return this.getFallbackAnalysis('')
    }
  }

  private parseExplanationResponse(response: string, request: ExplanationRequest): ExplanationResponse {
    return {
      concept: request.concept,
      explanation: response,
      level: request.level,
      examples: ['Example will be provided here'],
      analogies: ['Analogy will be provided here'],
      relatedConcepts: ['Related concepts will be listed here'],
      commonMisconceptions: ['Common misconceptions will be listed here'],
      studyTips: ['Study tips will be provided here']
    }
  }

  private parseChapterAnalysis(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return this.getFallbackChapterAnalysis('', '')
    } catch (error) {
      return this.getFallbackChapterAnalysis('', '')
    }
  }

  private parseKeyTermsResponse(response: string): any {
    return [
      {
        term: 'Sample Term',
        definition: 'Definition will be provided here',
        importance: 0.8,
        category: 'concept'
      }
    ]
  }

  private parseQuestionsResponse(response: string): any {
    return [
      {
        question: 'Sample question based on content?',
        type: 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 'Option A',
        explanation: 'Explanation of the correct answer.',
        difficulty: 'medium',
        concept: 'Sample Concept'
      }
    ]
  }

  private parseLearningPathResponse(response: string): any {
    return {
      recommendedOrder: ['Topic 1', 'Topic 2', 'Topic 3'],
      estimatedTime: 10,
      prerequisites: ['Prerequisite 1'],
      milestones: [
        {
          topic: 'Topic 1',
          estimatedTime: 3,
          prerequisites: ['Prerequisite 1']
        }
      ]
    }
  }

  // Fallback methods when AI is unavailable
  private getFallbackAnalysis(content: string): any {
    return {
      topics: [{
        topic: 'General Topic',
        confidence: 0.7,
        keywords: ['keyword1', 'keyword2'],
        subtopics: ['subtopic1'],
        difficulty: 'intermediate',
        estimatedStudyTime: 5,
        learningObjectives: ['Understand the basic concepts']
      }],
      concepts: [{
        concept: 'Basic Concept',
        definition: 'A fundamental concept in this subject',
        importance: 0.8,
        difficulty: 'intermediate',
        prerequisites: [],
        relatedConcepts: ['Related Concept'],
        examples: ['Example'],
        applications: ['Application']
      }],
      summary: {
        overview: 'This content covers fundamental concepts in the subject area.',
        keyPoints: ['Key point 1', 'Key point 2'],
        mainTopics: ['Main Topic'],
        difficulty: 'intermediate',
        estimatedReadingTime: 30,
        prerequisites: []
      },
      difficulty: 'intermediate'
    }
  }

  private getFallbackExplanation(request: ExplanationRequest): ExplanationResponse {
    return {
      concept: request.concept,
      explanation: `This is a ${request.level}-level explanation of ${request.concept}.`,
      level: request.level,
      examples: ['Example 1', 'Example 2'],
      analogies: ['Analogy 1'],
      relatedConcepts: ['Related Concept 1', 'Related Concept 2'],
      commonMisconceptions: ['Common misconception'],
      studyTips: ['Study tip 1', 'Study tip 2']
    }
  }

  private getFallbackChapterAnalysis(content: string, chapterTitle: string): any {
    return {
      summary: `This chapter covers key concepts related to ${chapterTitle}.`,
      keyConcepts: ['Concept 1', 'Concept 2'],
      difficulty: 'intermediate',
      studyTime: 2,
      prerequisites: [],
      learningObjectives: ['Understand the main concepts']
    }
  }

  private getFallbackKeyTerms(content: string): any {
    return [
      {
        term: 'Key Term',
        definition: 'Definition of key term',
        importance: 0.8,
        category: 'concept'
      }
    ]
  }

  private getFallbackStudyQuestions(content: string, options: any): any {
    return [
      {
        question: 'What is the main concept discussed in this content?',
        type: 'short-answer',
        answer: 'The main concept is...',
        explanation: 'This question tests understanding of the core concept.',
        difficulty: options.difficulty || 'medium',
        concept: 'Main Concept'
      }
    ]
  }

  private getFallbackLearningPath(currentKnowledge: string[], targetTopics: string[], availableContent: string[]): any {
    return {
      recommendedOrder: targetTopics,
      estimatedTime: targetTopics.length * 2,
      prerequisites: currentKnowledge,
      milestones: targetTopics.map(topic => ({
        topic,
        estimatedTime: 2,
        prerequisites: currentKnowledge
      }))
    }
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

export const aiAnalyzer = new AIAnalyzer()