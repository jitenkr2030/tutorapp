interface StudyGroup {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: Date
  members: StudyGroupMember[]
  documents: SharedDocument[]
  sessions: StudySession[]
  discussions: Discussion[]
  isPublic: boolean
  maxMembers?: number
  tags: string[]
  settings: {
    allowInvites: boolean
    requireApproval: boolean
    enableChat: boolean
    enableFileSharing: boolean
        enableScreenSharing: boolean
    enableWhiteboard: boolean
    recordSessions: boolean
  }
}

interface StudyGroupMember {
  userId: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  joinedAt: Date
  lastActive: Date
  contributions: {
    notesAdded: number
    highlightsShared: number
    discussionsStarted: number
    sessionsAttended: number
  }
  permissions: {
    canInvite: boolean
    canManageDocuments: boolean
    canManageMembers: boolean
    canStartSessions: boolean
    canDeleteContent: boolean
  }
}

interface SharedDocument {
  id: string
  documentId: string
  title: string
  description?: string
  sharedBy: string
  sharedAt: Date
  permissions: 'view' | 'comment' | 'edit'
  accessLevel: 'group' | 'selected'
  selectedMembers?: string[]
  collaborativeAnnotations: CollaborativeAnnotation[]
}

interface CollaborativeAnnotation {
  id: string
  documentId: string
  type: 'highlight' | 'note' | 'comment' | 'drawing'
  content: string
  position: {
    start: number
    end: number
  }
  chapter: string
  section: string
  createdBy: string
  createdAt: Date
  lastModified: Date
  modifiedBy?: string
  replies: AnnotationReply[]
  isResolved: boolean
  tags: string[]
  visibility: 'group' | 'selected' | 'private'
  selectedViewers?: string[]
}

interface AnnotationReply {
  id: string
  annotationId: string
  content: string
  createdBy: string
  createdAt: Date
  lastModified: Date
  parentId?: string // For nested replies
  reactions: ReplyReaction[]
}

interface ReplyReaction {
  userId: string
  emoji: string
  timestamp: Date
}

interface StudySession {
  id: string
  groupId: string
  title: string
  description?: string
  scheduledBy: string
  scheduledAt: Date
  startTime?: Date
  endTime?: Date
  duration: number // in minutes
  maxParticipants?: number
  participants: SessionParticipant[]
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  type: 'study' | 'review' | 'exam' | 'discussion'
  topic: string
  agenda: string[]
  materials: string[]
  recordingUrl?: string
  whiteboardData?: any
  chatMessages: ChatMessage[]
}

interface SessionParticipant {
  userId: string
  joinedAt: Date
  leftAt?: Date
  role: 'host' | 'co-host' | 'participant'
  isMuted: boolean
  isVideoOn: boolean
  screenSharing: boolean
  contributions: {
    messagesSent: number
    annotationsAdded: number
    questionsAsked: number
    answersProvided: number
  }
}

interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  content: string
  type: 'text' | 'file' | 'image' | 'system'
  timestamp: Date
  replyTo?: string
  reactions: MessageReaction[]
  isEdited: boolean
  editedAt?: Date
  attachments?: MessageAttachment[]
}

interface MessageReaction {
  userId: string
  emoji: string
  timestamp: Date
}

interface MessageAttachment {
  id: string
  filename: string
  size: number
  type: string
  url: string
  uploadedBy: string
  uploadedAt: Date
}

interface Discussion {
  id: string
  groupId: string
  title: string
  content: string
  createdBy: string
  createdAt: Date
  lastModified: Date
  modifiedBy?: string
  tags: string[]
  category: string
  isPinned: boolean
  isLocked: boolean
  views: number
  replies: DiscussionReply[]
  upvotes: string[]
  downvotes: string[]
  relatedDocuments: string[]
  relatedConcepts: string[]
}

interface DiscussionReply {
  id: string
  discussionId: string
  content: string
  createdBy: string
  createdAt: Date
  lastModified: Date
  parentId?: string // For nested replies
  upvotes: string[]
  downvotes: string[]
  isAccepted: boolean // For question-type discussions
  attachments?: MessageAttachment[]
}

interface StudyBuddy {
  id: string
  userId: string
  buddyId: string
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  requestedBy: string
  requestedAt: Date
  respondedAt?: Date
  sharedInterests: string[]
  compatibilityScore: number
  studyPreferences: {
    preferredTime: string[]
    studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
    pace: 'slow' | 'medium' | 'fast'
    subjects: string[]
  }
  lastStudySession?: Date
  mutualDocuments: string[]
}

interface PeerReview {
  id: string
  documentId: string
  reviewerId: string
  revieweeId: string
  content: string
  rating: number // 1-5
  categories: {
    accuracy: number
    clarity: number
    completeness: number
    organization: number
    insights: number
  }
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  createdAt: Date
  isAnonymous: boolean
  isHelpful: boolean
  helpfulVotes: string[]
  response?: {
    content: string
    createdAt: Date
    isAppreciated: boolean
  }
}

export class CollaborativeFeatures {
  private studyGroups: Map<string, StudyGroup> = new Map()
  private sharedDocuments: Map<string, SharedDocument> = new Map()
  private collaborativeAnnotations: Map<string, CollaborativeAnnotation> = new Map()
  private studySessions: Map<string, StudySession> = new Map()
  private discussions: Map<string, Discussion> = new Map()
  private studyBuddies: Map<string, StudyBuddy> = new Map()
  private peerReviews: Map<string, PeerReview> = new Map()

  // Study Group Management
  createStudyGroup(
    name: string,
    description: string,
    createdBy: string,
    options: {
      isPublic?: boolean
      maxMembers?: number
      tags?: string[]
      settings?: Partial<StudyGroup['settings']>
    } = {}
  ): StudyGroup {
    const group: StudyGroup = {
      id: this.generateGroupId(),
      name,
      description,
      createdBy,
      createdAt: new Date(),
      members: [{
        userId: createdBy,
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date(),
        contributions: {
          notesAdded: 0,
          highlightsShared: 0,
          discussionsStarted: 0,
          sessionsAttended: 0
        },
        permissions: {
          canInvite: true,
          canManageDocuments: true,
          canManageMembers: true,
          canStartSessions: true,
          canDeleteContent: true
        }
      }],
      documents: [],
      sessions: [],
      discussions: [],
      isPublic: options.isPublic || false,
      maxMembers: options.maxMembers,
      tags: options.tags || [],
      settings: {
        allowInvites: true,
        requireApproval: false,
        enableChat: true,
        enableFileSharing: true,
        enableScreenSharing: true,
        enableWhiteboard: true,
        recordSessions: false,
        ...options.settings
      }
    }

    this.studyGroups.set(group.id, group)
    return group
  }

  joinStudyGroup(groupId: string, userId: string, invitedBy?: string): StudyGroup | null {
    const group = this.studyGroups.get(groupId)
    if (!group) return null

    // Check if user is already a member
    if (group.members.some(m => m.userId === userId)) {
      return null
    }

    // Check if group is full
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return null
    }

    // Check if approval is required
    if (group.settings.requireApproval && group.members[0].userId !== userId) {
      // In a real implementation, this would create a pending request
      return null
    }

    const newMember: StudyGroupMember = {
      userId,
      role: 'member',
      joinedAt: new Date(),
      lastActive: new Date(),
      contributions: {
        notesAdded: 0,
        highlightsShared: 0,
        discussionsStarted: 0,
        sessionsAttended: 0
      },
      permissions: {
        canInvite: group.settings.allowInvites,
        canManageDocuments: false,
        canManageMembers: false,
        canStartSessions: true,
        canDeleteContent: false
      }
    }

    group.members.push(newMember)
    this.studyGroups.set(groupId, group)
    return group
  }

  leaveStudyGroup(groupId: string, userId: string): boolean {
    const group = this.studyGroups.get(groupId)
    if (!group) return false

    const memberIndex = group.members.findIndex(m => m.userId === userId)
    if (memberIndex === -1) return false

    // Owner cannot leave, must transfer ownership first
    if (group.members[memberIndex].role === 'owner') {
      return false
    }

    group.members.splice(memberIndex, 1)
    this.studyGroups.set(groupId, group)
    return true
  }

  // Document Sharing
  shareDocument(
    documentId: string,
    groupId: string,
    sharedBy: string,
    options: {
      title?: string
      description?: string
      permissions?: 'view' | 'comment' | 'edit'
      accessLevel?: 'group' | 'selected'
      selectedMembers?: string[]
    } = {}
  ): SharedDocument | null {
    const group = this.studyGroups.get(groupId)
    if (!group) return null

    // Check if user has permission to share
    const member = group.members.find(m => m.userId === sharedBy)
    if (!member || !member.permissions.canManageDocuments) {
      return null
    }

    const sharedDocument: SharedDocument = {
      id: this.generateSharedDocumentId(),
      documentId,
      title: options.title || `Shared Document ${Date.now()}`,
      description: options.description,
      sharedBy,
      sharedAt: new Date(),
      permissions: options.permissions || 'view',
      accessLevel: options.accessLevel || 'group',
      selectedMembers: options.selectedMembers,
      collaborativeAnnotations: []
    }

    group.documents.push(sharedDocument)
    this.sharedDocuments.set(sharedDocument.id, sharedDocument)
    this.studyGroups.set(groupId, group)
    return sharedDocument
  }

  // Collaborative Annotations
  addCollaborativeAnnotation(
    documentId: string,
    userId: string,
    groupId: string,
    type: 'highlight' | 'note' | 'comment' | 'drawing',
    content: string,
    position: { start: number; end: number },
    context: { chapter: string; section: string },
    options: {
      visibility?: 'group' | 'selected' | 'private'
      selectedViewers?: string[]
      tags?: string[]
    } = {}
  ): CollaborativeAnnotation | null {
    const group = this.studyGroups.get(groupId)
    if (!group) return null

    const member = group.members.find(m => m.userId === userId)
    if (!member) return null

    const annotation: CollaborativeAnnotation = {
      id: this.generateAnnotationId(),
      documentId,
      type,
      content,
      position,
      chapter: context.chapter,
      section: context.section,
      createdBy: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      replies: [],
      isResolved: false,
      tags: options.tags || [],
      visibility: options.visibility || 'group',
      selectedViewers: options.selectedViewers
    }

    this.collaborativeAnnotations.set(annotation.id, annotation)
    
    // Add to shared document if exists
    const sharedDoc = group.documents.find(d => d.documentId === documentId)
    if (sharedDoc) {
      sharedDoc.collaborativeAnnotations.push(annotation)
      this.studyGroups.set(groupId, group)
    }

    return annotation
  }

  addAnnotationReply(
    annotationId: string,
    userId: string,
    content: string,
    parentId?: string
  ): AnnotationReply | null {
    const annotation = this.collaborativeAnnotations.get(annotationId)
    if (!annotation) return null

    const reply: AnnotationReply = {
      id: this.generateReplyId(),
      annotationId,
      content,
      createdBy: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      parentId,
      reactions: []
    }

    annotation.replies.push(reply)
    annotation.lastModified = new Date()
    annotation.modifiedBy = userId
    this.collaborativeAnnotations.set(annotationId, annotation)
    return reply
  }

  // Study Sessions
  scheduleStudySession(
    groupId: string,
    scheduledBy: string,
    title: string,
    options: {
      description?: string
      scheduledAt: Date
      duration: number
      maxParticipants?: number
      type: 'study' | 'review' | 'exam' | 'discussion'
      topic: string
      agenda?: string[]
      materials?: string[]
    }
  ): StudySession | null {
    const group = this.studyGroups.get(groupId)
    if (!group) return null

    const member = group.members.find(m => m.userId === scheduledBy)
    if (!member || !member.permissions.canStartSessions) {
      return null
    }

    const session: StudySession = {
      id: this.generateSessionId(),
      groupId,
      title,
      description: options.description,
      scheduledBy,
      scheduledAt: options.scheduledAt,
      duration: options.duration,
      maxParticipants: options.maxParticipants,
      participants: [{
        userId: scheduledBy,
        joinedAt: new Date(),
        role: 'host',
        isMuted: false,
        isVideoOn: false,
        screenSharing: false,
        contributions: {
          messagesSent: 0,
          annotationsAdded: 0,
          questionsAsked: 0,
          answersProvided: 0
        }
      }],
      status: 'scheduled',
      type: options.type,
      topic: options.topic,
      agenda: options.agenda || [],
      materials: options.materials || [],
      chatMessages: []
    }

    group.sessions.push(session)
    this.studySessions.set(session.id, session)
    this.studyGroups.set(groupId, group)
    return session
  }

  joinStudySession(sessionId: string, userId: string): StudySession | null {
    const session = this.studySessions.get(sessionId)
    if (!session) return null

    // Check if session is active
    if (session.status !== 'in-progress') {
      return null
    }

    // Check if user is already a participant
    if (session.participants.some(p => p.userId === userId)) {
      return null
    }

    // Check max participants
    if (session.maxParticipants && session.participants.length >= session.maxParticipants) {
      return null
    }

    const participant: SessionParticipant = {
      userId,
      joinedAt: new Date(),
      role: 'participant',
      isMuted: false,
      isVideoOn: false,
      screenSharing: false,
      contributions: {
        messagesSent: 0,
        annotationsAdded: 0,
        questionsAsked: 0,
        answersProvided: 0
      }
    }

    session.participants.push(participant)
    this.studySessions.set(sessionId, session)
    return session
  }

  addChatMessage(
    sessionId: string,
    userId: string,
    content: string,
    type: 'text' | 'file' | 'image' | 'system' = 'text',
    replyTo?: string,
    attachments?: MessageAttachment[]
  ): ChatMessage | null {
    const session = this.studySessions.get(sessionId)
    if (!session || session.status !== 'in-progress') return null

    const participant = session.participants.find(p => p.userId === userId)
    if (!participant) return null

    const message: ChatMessage = {
      id: this.generateMessageId(),
      sessionId,
      userId,
      content,
      type,
      timestamp: new Date(),
      replyTo,
      reactions: [],
      isEdited: false,
      attachments
    }

    session.chatMessages.push(message)
    participant.contributions.messagesSent++
    this.studySessions.set(sessionId, session)
    return message
  }

  // Discussions
  createDiscussion(
    groupId: string,
    userId: string,
    title: string,
    content: string,
    options: {
      category?: string
      tags?: string[]
      relatedDocuments?: string[]
      relatedConcepts?: string[]
    } = {}
  ): Discussion | null {
    const group = this.studyGroups.get(groupId)
    if (!group) return null

    const member = group.members.find(m => m.userId === userId)
    if (!member) return null

    const discussion: Discussion = {
      id: this.generateDiscussionId(),
      groupId,
      title,
      content,
      createdBy: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      tags: options.tags || [],
      category: options.category || 'general',
      isPinned: false,
      isLocked: false,
      views: 0,
      replies: [],
      upvotes: [],
      downvotes: [],
      relatedDocuments: options.relatedDocuments || [],
      relatedConcepts: options.relatedConcepts || []
    }

    group.discussions.push(discussion)
    this.discussions.set(discussion.id, discussion)
    this.studyGroups.set(groupId, group)
    return discussion
  }

  addDiscussionReply(
    discussionId: string,
    userId: string,
    content: string,
    parentId?: string
  ): DiscussionReply | null {
    const discussion = this.discussions.get(discussionId)
    if (!discussion || discussion.isLocked) return null

    const reply: DiscussionReply = {
      id: this.generateReplyId(),
      discussionId,
      content,
      createdBy: userId,
      createdAt: new Date(),
      lastModified: new Date(),
      parentId,
      upvotes: [],
      downvotes: [],
      isAccepted: false
    }

    discussion.replies.push(reply)
    discussion.lastModified = new Date()
    discussion.modifiedBy = userId
    this.discussions.set(discussionId, discussion)
    return reply
  }

  // Study Buddies
  sendStudyBuddyRequest(
    userId: string,
    buddyId: string,
    message?: string
  ): StudyBuddy | null {
    // Check if request already exists
    const existing = Array.from(this.studyBuddies.values()).find(
      buddy => 
        (buddy.userId === userId && buddy.buddyId === buddyId) ||
        (buddy.userId === buddyId && buddy.buddyId === userId)
    )
    
    if (existing) {
      return null
    }

    const studyBuddy: StudyBuddy = {
      id: this.generateStudyBuddyId(),
      userId,
      buddyId,
      status: 'pending',
      requestedBy: userId,
      requestedAt: new Date(),
      sharedInterests: [],
      compatibilityScore: 0,
      studyPreferences: {
        preferredTime: [],
        studyStyle: 'reading',
        pace: 'medium',
        subjects: []
      },
      mutualDocuments: []
    }

    this.studyBuddies.set(studyBuddy.id, studyBuddy)
    return studyBuddy
  }

  respondToStudyBuddyRequest(
    buddyId: string,
    userId: string,
    accept: boolean
  ): StudyBuddy | null {
    const buddy = this.studyBuddies.get(buddyId)
    if (!buddy || buddy.status !== 'pending') return null

    if (buddy.buddyId !== userId) return null

    buddy.status = accept ? 'accepted' : 'rejected'
    buddy.respondedAt = new Date()

    this.studyBuddies.set(buddyId, buddy)
    return buddy
  }

  // Peer Reviews
  createPeerReview(
    documentId: string,
    reviewerId: string,
    revieweeId: string,
    content: string,
    rating: number,
    options: {
      categories?: Partial<PeerReview['categories']>
      strengths?: string[]
      improvements?: string[]
      suggestions?: string[]
      isAnonymous?: boolean
    } = {}
  ): PeerReview | null {
    if (rating < 1 || rating > 5) return null

    const review: PeerReview = {
      id: this.generatePeerReviewId(),
      documentId,
      reviewerId,
      revieweeId,
      content,
      rating,
      categories: {
        accuracy: 3,
        clarity: 3,
        completeness: 3,
        organization: 3,
        insights: 3,
        ...options.categories
      },
      strengths: options.strengths || [],
      improvements: options.improvements || [],
      suggestions: options.suggestions || [],
      createdAt: new Date(),
      isAnonymous: options.isAnonymous || false,
      isHelpful: false,
      helpfulVotes: []
    }

    this.peerReviews.set(review.id, review)
    return review
  }

  respondToPeerReview(
    reviewId: string,
    revieweeId: string,
    content: string,
    isAppreciated: boolean
  ): PeerReview | null {
    const review = this.peerReviews.get(reviewId)
    if (!review || review.revieweeId !== revieweeId) return null

    review.response = {
      content,
      createdAt: new Date(),
      isAppreciated
    }

    this.peerReviews.set(reviewId, review)
    return review
  }

  // Search and Filter Functions
  searchStudyGroups(
    userId: string,
    query?: string,
    filters?: {
      isPublic?: boolean
      tags?: string[]
      memberCount?: { min?: number; max?: number }
    }
  ): StudyGroup[] {
    let results = Array.from(this.studyGroups.values())

    // Filter out groups user is already a member of
    const userGroups = Array.from(this.studyGroups.values())
      .filter(group => group.members.some(m => m.userId === userId))
      .map(group => group.id)

    results = results.filter(group => !userGroups.includes(group.id))

    if (query) {
      results = results.filter(group =>
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description.toLowerCase().includes(query.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }

    if (filters?.isPublic !== undefined) {
      results = results.filter(group => group.isPublic === filters.isPublic)
    }

    if (filters?.tags) {
      results = results.filter(group =>
        filters.tags!.some(tag => group.tags.includes(tag))
      )
    }

    if (filters?.memberCount) {
      results = results.filter(group => {
        const memberCount = group.members.length
        return (!filters.memberCount!.min || memberCount >= filters.memberCount!.min) &&
               (!filters.memberCount!.max || memberCount <= filters.memberCount!.max)
      })
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getUserStudyGroups(userId: string): StudyGroup[] {
    return Array.from(this.studyGroups.values())
      .filter(group => group.members.some(m => m.userId === userId))
  }

  getAvailableStudySessions(userId: string): StudySession[] {
    const now = new Date()
    return Array.from(this.studySessions.values())
      .filter(session => 
        session.status === 'scheduled' && 
        session.scheduledAt > now &&
        (!session.maxParticipants || session.participants.length < session.maxParticipants)
      )
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  }

  // Utility Methods
  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSharedDocumentId(): string {
    return `shared_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateAnnotationId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateReplyId(): string {
    return `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMessageId(): string {
    return `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateDiscussionId(): string {
    return `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateStudyBuddyId(): string {
    return `buddy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generatePeerReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Getters
  getStudyGroup(groupId: string): StudyGroup | undefined {
    return this.studyGroups.get(groupId)
  }

  getSharedDocument(documentId: string): SharedDocument | undefined {
    return this.sharedDocuments.get(documentId)
  }

  getCollaborativeAnnotation(annotationId: string): CollaborativeAnnotation | undefined {
    return this.collaborativeAnnotations.get(annotationId)
  }

  getStudySession(sessionId: string): StudySession | undefined {
    return this.studySessions.get(sessionId)
  }

  getDiscussion(discussionId: string): Discussion | undefined {
    return this.discussions.get(discussionId)
  }

  getStudyBuddy(buddyId: string): StudyBuddy | undefined {
    return this.studyBuddies.get(buddyId)
  }

  getPeerReview(reviewId: string): PeerReview | undefined {
    return this.peerReviews.get(reviewId)
  }

  // Clear user data (for privacy/deletion)
  clearUserData(userId: string): void {
    // Remove from study groups (unless owner)
    this.studyGroups.forEach((group, groupId) => {
      const memberIndex = group.members.findIndex(m => m.userId === userId)
      if (memberIndex > 0) { // Don't remove owner
        group.members.splice(memberIndex, 1)
        this.studyGroups.set(groupId, group)
      }
    })

    // Delete shared documents where user is the only one with access
    const sharedDocsToDelete = Array.from(this.sharedDocuments.keys()).filter(key => {
      const doc = this.sharedDocuments.get(key)
      return doc?.sharedBy === userId && doc.accessLevel === 'private'
    })
    sharedDocsToDelete.forEach(key => this.sharedDocuments.delete(key))

    // Delete collaborative annotations
    const annotationsToDelete = Array.from(this.collaborativeAnnotations.keys()).filter(key => {
      const ann = this.collaborativeAnnotations.get(key)
      return ann?.createdBy === userId
    })
    annotationsToDelete.forEach(key => this.collaborativeAnnotations.delete(key))

    // Delete study sessions (unless other participants exist)
    const sessionsToDelete = Array.from(this.studySessions.keys()).filter(key => {
      const session = this.studySessions.get(key)
      return session?.scheduledBy === userId && session.participants.length <= 1
    })
    sessionsToDelete.forEach(key => this.studySessions.delete(key))

    // Delete discussions
    const discussionsToDelete = Array.from(this.discussions.keys()).filter(key => {
      const discussion = this.discussions.get(key)
      return discussion?.createdBy === userId
    })
    discussionsToDelete.forEach(key => this.discussions.delete(key))

    // Delete study buddy relationships
    const buddiesToDelete = Array.from(this.studyBuddies.keys()).filter(key => {
      const buddy = this.studyBuddies.get(key)
      return buddy?.userId === userId || buddy?.buddyId === userId
    })
    buddiesToDelete.forEach(key => this.studyBuddies.delete(key))

    // Delete peer reviews
    const reviewsToDelete = Array.from(this.peerReviews.keys()).filter(key => {
      const review = this.peerReviews.get(key)
      return review?.reviewerId === userId || review?.revieweeId === userId
    })
    reviewsToDelete.forEach(key => this.peerReviews.delete(key))
  }
}

export const collaborativeFeatures = new CollaborativeFeatures()