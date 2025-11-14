interface Highlight {
  id: string
  userId: string
  documentId: string
  text: string
  startPosition: number
  endPosition: number
  chapter: string
  section: string
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
  note?: string
  tags: string[]
  timestamp: Date
  isShared: boolean
  sharedWith?: string[]
}

interface Note {
  id: string
  userId: string
  documentId: string
  content: string
  chapter: string
  section: string
  position: number // character position in document
  type: 'text' | 'drawing' | 'voice' | 'image'
  attachments?: string[]
  tags: string[]
  timestamp: Date
  lastModified: Date
  isPinned: boolean
  isShared: boolean
  sharedWith?: string[]
  linkedHighlights?: string[]
  linkedConcepts?: string[]
}

interface Bookmark {
  id: string
  userId: string
  documentId: string
  title: string
  description?: string
  chapter: string
  section: string
  position: number
  tags: string[]
  timestamp: Date
  color: 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  isShared: boolean
  sharedWith?: string[]
}

interface Annotation {
  id: string
  userId: string
  documentId: string
  type: 'highlight' | 'note' | 'bookmark' | 'drawing'
  position: {
    start: number
    end: number
  }
  content: string
  chapter: string
  section: string
  timestamp: Date
  metadata: any
}

interface StudyNote {
  id: string
  userId: string
  documentId: string
  title: string
  content: string
  type: 'summary' | 'question' | 'reflection' | 'action_item'
  chapter: string
  section: string
  tags: string[]
  timestamp: Date
  lastModified: Date
  isPrivate: boolean
  attachments?: string[]
  linkedResources?: string[]
}

interface Flashcard {
  id: string
  userId: string
  documentId: string
  front: string
  back: string
  chapter: string
  section: string
  concept: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  timestamp: Date
  lastReviewed?: Date
  reviewCount: number
  successRate: number
  nextReview: Date
  interval: number // days until next review
}

export class InteractiveFeatures {
  private highlights: Map<string, Highlight> = new Map()
  private notes: Map<string, Note> = new Map()
  private bookmarks: Map<string, Bookmark> = new Map()
  private annotations: Map<string, Annotation> = new Map()
  private studyNotes: Map<string, StudyNote> = new Map()
  private flashcards: Map<string, Flashcard> = new Map()

  // Highlight Management
  createHighlight(
    userId: string,
    documentId: string,
    text: string,
    position: { start: number; end: number },
    context: { chapter: string; section: string },
    options: {
      color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
      note?: string
      tags?: string[]
      isShared?: boolean
      sharedWith?: string[]
    } = {}
  ): Highlight {
    const highlight: Highlight = {
      id: this.generateHighlightId(),
      userId,
      documentId,
      text,
      startPosition: position.start,
      endPosition: position.end,
      chapter: context.chapter,
      section: context.section,
      color: options.color || 'yellow',
      note: options.note,
      tags: options.tags || [],
      timestamp: new Date(),
      isShared: options.isShared || false,
      sharedWith: options.sharedWith || []
    }

    this.highlights.set(highlight.id, highlight)
    
    // Also create an annotation for unified management
    this.createAnnotation(userId, documentId, 'highlight', position, text, context, {
      color: options.color,
      note: options.note
    })

    return highlight
  }

  updateHighlight(
    highlightId: string,
    updates: {
      color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'
      note?: string
      tags?: string[]
      isShared?: boolean
      sharedWith?: string[]
    }
  ): Highlight | null {
    const highlight = this.highlights.get(highlightId)
    if (!highlight) return null

    const updatedHighlight = { ...highlight, ...updates, lastModified: new Date() }
    this.highlights.set(highlightId, updatedHighlight)
    return updatedHighlight
  }

  deleteHighlight(highlightId: string): boolean {
    const deleted = this.highlights.delete(highlightId)
    if (deleted) {
      // Also delete the corresponding annotation
      const annotationToDelete = Array.from(this.annotations.values()).find(
        ann => ann.type === 'highlight' && 
               ann.position.start === this.highlights.get(highlightId)?.startPosition
      )
      if (annotationToDelete) {
        this.annotations.delete(annotationToDelete.id)
      }
    }
    return deleted
  }

  // Note Management
  createNote(
    userId: string,
    documentId: string,
    content: string,
    context: { chapter: string; section: string; position: number },
    options: {
      type?: 'text' | 'drawing' | 'voice' | 'image'
      attachments?: string[]
      tags?: string[]
      isPinned?: boolean
      isShared?: boolean
      sharedWith?: string[]
      linkedHighlights?: string[]
      linkedConcepts?: string[]
    } = {}
  ): Note {
    const note: Note = {
      id: this.generateNoteId(),
      userId,
      documentId,
      content,
      chapter: context.chapter,
      section: context.section,
      position: context.position,
      type: options.type || 'text',
      attachments: options.attachments || [],
      tags: options.tags || [],
      timestamp: new Date(),
      lastModified: new Date(),
      isPinned: options.isPinned || false,
      isShared: options.isShared || false,
      sharedWith: options.sharedWith || [],
      linkedHighlights: options.linkedHighlights || [],
      linkedConcepts: options.linkedConcepts || []
    }

    this.notes.set(note.id, note)
    
    // Create annotation
    this.createAnnotation(userId, documentId, 'note', 
      { start: context.position, end: context.position + content.length }, 
      content, context, { type: options.type }
    )

    return note
  }

  updateNote(
    noteId: string,
    updates: {
      content?: string
      type?: 'text' | 'drawing' | 'voice' | 'image'
      attachments?: string[]
      tags?: string[]
      isPinned?: boolean
      isShared?: boolean
      sharedWith?: string[]
      linkedHighlights?: string[]
      linkedConcepts?: string[]
    }
  ): Note | null {
    const note = this.notes.get(noteId)
    if (!note) return null

    const updatedNote = { ...note, ...updates, lastModified: new Date() }
    this.notes.set(noteId, updatedNote)
    return updatedNote
  }

  deleteNote(noteId: string): boolean {
    const deleted = this.notes.delete(noteId)
    if (deleted) {
      // Delete corresponding annotation
      const annotationToDelete = Array.from(this.annotations.values()).find(
        ann => ann.type === 'note' && ann.content === this.notes.get(noteId)?.content
      )
      if (annotationToDelete) {
        this.annotations.delete(annotationToDelete.id)
      }
    }
    return deleted
  }

  // Bookmark Management
  createBookmark(
    userId: string,
    documentId: string,
    title: string,
    context: { chapter: string; section: string; position: number },
    options: {
      description?: string
      tags?: string[]
      color?: 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'purple'
      isShared?: boolean
      sharedWith?: string[]
    } = {}
  ): Bookmark {
    const bookmark: Bookmark = {
      id: this.generateBookmarkId(),
      userId,
      documentId,
      title,
      description: options.description,
      chapter: context.chapter,
      section: context.section,
      position: context.position,
      tags: options.tags || [],
      timestamp: new Date(),
      color: options.color || 'default',
      isShared: options.isShared || false,
      sharedWith: options.sharedWith || []
    }

    this.bookmarks.set(bookmark.id, bookmark)
    return bookmark
  }

  updateBookmark(
    bookmarkId: string,
    updates: {
      title?: string
      description?: string
      tags?: string[]
      color?: 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'purple'
      isShared?: boolean
      sharedWith?: string[]
    }
  ): Bookmark | null {
    const bookmark = this.bookmarks.get(bookmarkId)
    if (!bookmark) return null

    const updatedBookmark = { ...bookmark, ...updates }
    this.bookmarks.set(bookmarkId, updatedBookmark)
    return updatedBookmark
  }

  deleteBookmark(bookmarkId: string): boolean {
    return this.bookmarks.delete(bookmarkId)
  }

  // Study Notes Management
  createStudyNote(
    userId: string,
    documentId: string,
    title: string,
    content: string,
    context: { chapter: string; section: string },
    options: {
      type?: 'summary' | 'question' | 'reflection' | 'action_item'
      tags?: string[]
      isPrivate?: boolean
      attachments?: string[]
      linkedResources?: string[]
    } = {}
  ): StudyNote {
    const studyNote: StudyNote = {
      id: this.generateStudyNoteId(),
      userId,
      documentId,
      title,
      content,
      chapter: context.chapter,
      section: context.section,
      type: options.type || 'summary',
      tags: options.tags || [],
      timestamp: new Date(),
      lastModified: new Date(),
      isPrivate: options.isPrivate || true,
      attachments: options.attachments || [],
      linkedResources: options.linkedResources || []
    }

    this.studyNotes.set(studyNote.id, studyNote)
    return studyNote
  }

  updateStudyNote(
    studyNoteId: string,
    updates: {
      title?: string
      content?: string
      type?: 'summary' | 'question' | 'reflection' | 'action_item'
      tags?: string[]
      isPrivate?: boolean
      attachments?: string[]
      linkedResources?: string[]
    }
  ): StudyNote | null {
    const studyNote = this.studyNotes.get(studyNoteId)
    if (!studyNote) return null

    const updatedStudyNote = { ...studyNote, ...updates, lastModified: new Date() }
    this.studyNotes.set(studyNoteId, updatedStudyNote)
    return updatedStudyNote
  }

  deleteStudyNote(studyNoteId: string): boolean {
    return this.studyNotes.delete(studyNoteId)
  }

  // Flashcard Management
  createFlashcard(
    userId: string,
    documentId: string,
    front: string,
    back: string,
    context: { chapter: string; section: string; concept: string },
    options: {
      difficulty?: 'easy' | 'medium' | 'hard'
      tags?: string[]
    } = {}
  ): Flashcard {
    const flashcard: Flashcard = {
      id: this.generateFlashcardId(),
      userId,
      documentId,
      front,
      back,
      chapter: context.chapter,
      section: context.section,
      concept: context.concept,
      difficulty: options.difficulty || 'medium',
      tags: options.tags || [],
      timestamp: new Date(),
      reviewCount: 0,
      successRate: 0,
      nextReview: new Date(),
      interval: 1
    }

    this.flashcards.set(flashcard.id, flashcard)
    return flashcard
  }

  reviewFlashcard(
    flashcardId: string,
    success: boolean
  ): Flashcard | null {
    const flashcard = this.flashcards.get(flashcardId)
    if (!flashcard) return null

    flashcard.reviewCount += 1
    flashcard.lastReviewed = new Date()
    
    // Update success rate
    flashcard.successRate = ((flashcard.successRate * (flashcard.reviewCount - 1)) + (success ? 100 : 0)) / flashcard.reviewCount
    
    // Spaced repetition algorithm
    if (success) {
      flashcard.interval = Math.min(flashcard.interval * 2, 30) // Max 30 days
    } else {
      flashcard.interval = Math.max(1, Math.floor(flashcard.interval / 2))
    }
    
    flashcard.nextReview = new Date(Date.now() + flashcard.interval * 24 * 60 * 60 * 1000)
    
    // Adjust difficulty based on performance
    if (flashcard.successRate > 80 && flashcard.difficulty !== 'easy') {
      flashcard.difficulty = flashcard.difficulty === 'hard' ? 'medium' : 'easy'
    } else if (flashcard.successRate < 50 && flashcard.difficulty !== 'hard') {
      flashcard.difficulty = flashcard.difficulty === 'easy' ? 'medium' : 'hard'
    }

    this.flashcards.set(flashcardId, flashcard)
    return flashcard
  }

  deleteFlashcard(flashcardId: string): boolean {
    return this.flashcards.delete(flashcardId)
  }

  // Annotation Management (Unified)
  private createAnnotation(
    userId: string,
    documentId: string,
    type: 'highlight' | 'note' | 'bookmark' | 'drawing',
    position: { start: number; end: number },
    content: string,
    context: { chapter: string; section: string },
    metadata: any = {}
  ): Annotation {
    const annotation: Annotation = {
      id: this.generateAnnotationId(),
      userId,
      documentId,
      type,
      position,
      content,
      chapter: context.chapter,
      section: context.section,
      timestamp: new Date(),
      metadata
    }

    this.annotations.set(annotation.id, annotation)
    return annotation
  }

  // Search and Filter Functions
  searchHighlights(
    userId: string,
    documentId?: string,
    query?: string,
    filters?: {
      color?: ('yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple')[]
      chapter?: string
      tags?: string[]
      dateRange?: { start: Date; end: Date }
    }
  ): Highlight[] {
    let results = Array.from(this.highlights.values()).filter(h => h.userId === userId)

    if (documentId) {
      results = results.filter(h => h.documentId === documentId)
    }

    if (query) {
      results = results.filter(h => 
        h.text.toLowerCase().includes(query.toLowerCase()) ||
        h.note?.toLowerCase().includes(query.toLowerCase()) ||
        h.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }

    if (filters?.color) {
      results = results.filter(h => filters.color!.includes(h.color))
    }

    if (filters?.chapter) {
      results = results.filter(h => h.chapter === filters.chapter)
    }

    if (filters?.tags) {
      results = results.filter(h => 
        filters.tags!.some(tag => h.tags.includes(tag))
      )
    }

    if (filters?.dateRange) {
      results = results.filter(h => 
        h.timestamp >= filters.dateRange!.start && 
        h.timestamp <= filters.dateRange!.end
      )
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  searchNotes(
    userId: string,
    documentId?: string,
    query?: string,
    filters?: {
      type?: ('text' | 'drawing' | 'voice' | 'image')[]
      chapter?: string
      tags?: string[]
      isPinned?: boolean
      dateRange?: { start: Date; end: Date }
    }
  ): Note[] {
    let results = Array.from(this.notes.values()).filter(n => n.userId === userId)

    if (documentId) {
      results = results.filter(n => n.documentId === documentId)
    }

    if (query) {
      results = results.filter(n => 
        n.content.toLowerCase().includes(query.toLowerCase()) ||
        n.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }

    if (filters?.type) {
      results = results.filter(n => filters.type!.includes(n.type))
    }

    if (filters?.chapter) {
      results = results.filter(n => n.chapter === filters.chapter)
    }

    if (filters?.tags) {
      results = results.filter(n => 
        filters.tags!.some(tag => n.tags.includes(tag))
      )
    }

    if (filters?.isPinned !== undefined) {
      results = results.filter(n => n.isPinned === filters.isPinned)
    }

    if (filters?.dateRange) {
      results = results.filter(n => 
        n.timestamp >= filters.dateRange!.start && 
        n.timestamp <= filters.dateRange!.end
      )
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getDueFlashcards(userId: string, documentId?: string): Flashcard[] {
    const now = new Date()
    let results = Array.from(this.flashcards.values()).filter(f => 
      f.userId === userId && f.nextReview <= now
    )

    if (documentId) {
      results = results.filter(f => f.documentId === documentId)
    }

    return results.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
  }

  // Export Functions
  exportHighlights(userId: string, documentId?: string): Highlight[] {
    let highlights = Array.from(this.highlights.values()).filter(h => h.userId === userId)
    if (documentId) {
      highlights = highlights.filter(h => h.documentId === documentId)
    }
    return highlights
  }

  exportNotes(userId: string, documentId?: string): Note[] {
    let notes = Array.from(this.notes.values()).filter(n => n.userId === userId)
    if (documentId) {
      notes = notes.filter(n => n.documentId === documentId)
    }
    return notes
  }

  exportBookmarks(userId: string, documentId?: string): Bookmark[] {
    let bookmarks = Array.from(this.bookmarks.values()).filter(b => b.userId === userId)
    if (documentId) {
      bookmarks = bookmarks.filter(b => b.documentId === documentId)
    }
    return bookmarks
  }

  exportStudyNotes(userId: string, documentId?: string): StudyNote[] {
    let studyNotes = Array.from(this.studyNotes.values()).filter(sn => sn.userId === userId)
    if (documentId) {
      studyNotes = studyNotes.filter(sn => sn.documentId === documentId)
    }
    return studyNotes
  }

  exportFlashcards(userId: string, documentId?: string): Flashcard[] {
    let flashcards = Array.from(this.flashcards.values()).filter(f => f.userId === userId)
    if (documentId) {
      flashcards = flashcards.filter(f => f.documentId === documentId)
    }
    return flashcards
  }

  // Statistics and Analytics
  getAnnotationStats(userId: string, documentId?: string): {
    totalHighlights: number
    totalNotes: number
    totalBookmarks: number
    totalStudyNotes: number
    totalFlashcards: number
    highlightsByColor: Record<string, number>
    notesByType: Record<string, number>
    activityByDay: Record<string, number>
  } {
    const filter = (item: any) => item.userId === userId && (!documentId || item.documentId === documentId)

    const highlights = Array.from(this.highlights.values()).filter(filter)
    const notes = Array.from(this.notes.values()).filter(filter)
    const bookmarks = Array.from(this.bookmarks.values()).filter(filter)
    const studyNotes = Array.from(this.studyNotes.values()).filter(filter)
    const flashcards = Array.from(this.flashcards.values()).filter(filter)

    const highlightsByColor = highlights.reduce((acc, h) => {
      acc[h.color] = (acc[h.color] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const notesByType = notes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const activityByDay = [...highlights, ...notes, ...bookmarks, ...studyNotes].reduce((acc, item) => {
      const day = item.timestamp.toDateString()
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalHighlights: highlights.length,
      totalNotes: notes.length,
      totalBookmarks: bookmarks.length,
      totalStudyNotes: studyNotes.length,
      totalFlashcards: flashcards.length,
      highlightsByColor,
      notesByType,
      activityByDay
    }
  }

  // Utility Methods
  private generateHighlightId(): string {
    return `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateNoteId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateBookmarkId(): string {
    return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateStudyNoteId(): string {
    return `studynote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFlashcardId(): string {
    return `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateAnnotationId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Getters
  getHighlight(highlightId: string): Highlight | undefined {
    return this.highlights.get(highlightId)
  }

  getNote(noteId: string): Note | undefined {
    return this.notes.get(noteId)
  }

  getBookmark(bookmarkId: string): Bookmark | undefined {
    return this.bookmarks.get(bookmarkId)
  }

  getStudyNote(studyNoteId: string): StudyNote | undefined {
    return this.studyNotes.get(studyNoteId)
  }

  getFlashcard(flashcardId: string): Flashcard | undefined {
    return this.flashcards.get(flashcardId)
  }

  getUserHighlights(userId: string, documentId?: string): Highlight[] {
    let highlights = Array.from(this.highlights.values()).filter(h => h.userId === userId)
    if (documentId) {
      highlights = highlights.filter(h => h.documentId === documentId)
    }
    return highlights
  }

  getUserNotes(userId: string, documentId?: string): Note[] {
    let notes = Array.from(this.notes.values()).filter(n => n.userId === userId)
    if (documentId) {
      notes = notes.filter(n => n.documentId === documentId)
    }
    return notes
  }

  getUserBookmarks(userId: string, documentId?: string): Bookmark[] {
    let bookmarks = Array.from(this.bookmarks.values()).filter(b => b.userId === userId)
    if (documentId) {
      bookmarks = bookmarks.filter(b => b.documentId === documentId)
    }
    return bookmarks
  }

  getUserStudyNotes(userId: string, documentId?: string): StudyNote[] {
    let studyNotes = Array.from(this.studyNotes.values()).filter(sn => sn.userId === userId)
    if (documentId) {
      studyNotes = studyNotes.filter(sn => sn.documentId === documentId)
    }
    return studyNotes
  }

  getUserFlashcards(userId: string, documentId?: string): Flashcard[] {
    let flashcards = Array.from(this.flashcards.values()).filter(f => f.userId === userId)
    if (documentId) {
      flashcards = flashcards.filter(f => f.documentId === documentId)
    }
    return flashcards
  }

  // Clear user data (for privacy/deletion)
  clearUserData(userId: string): void {
    // Delete highlights
    const highlightsToDelete = Array.from(this.highlights.keys()).filter(key => {
      const highlight = this.highlights.get(key)
      return highlight?.userId === userId
    })
    highlightsToDelete.forEach(key => this.highlights.delete(key))

    // Delete notes
    const notesToDelete = Array.from(this.notes.keys()).filter(key => {
      const note = this.notes.get(key)
      return note?.userId === userId
    })
    notesToDelete.forEach(key => this.notes.delete(key))

    // Delete bookmarks
    const bookmarksToDelete = Array.from(this.bookmarks.keys()).filter(key => {
      const bookmark = this.bookmarks.get(key)
      return bookmark?.userId === userId
    })
    bookmarksToDelete.forEach(key => this.bookmarks.delete(key))

    // Delete study notes
    const studyNotesToDelete = Array.from(this.studyNotes.keys()).filter(key => {
      const studyNote = this.studyNotes.get(key)
      return studyNote?.userId === userId
    })
    studyNotesToDelete.forEach(key => this.studyNotes.delete(key))

    // Delete flashcards
    const flashcardsToDelete = Array.from(this.flashcards.keys()).filter(key => {
      const flashcard = this.flashcards.get(key)
      return flashcard?.userId === userId
    })
    flashcardsToDelete.forEach(key => this.flashcards.delete(key))

    // Delete annotations
    const annotationsToDelete = Array.from(this.annotations.keys()).filter(key => {
      const annotation = this.annotations.get(key)
      return annotation?.userId === userId
    })
    annotationsToDelete.forEach(key => this.annotations.delete(key))
  }
}

export const interactiveFeatures = new InteractiveFeatures()