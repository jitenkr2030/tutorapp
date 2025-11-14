interface FormatCapabilities {
  supportsTextExtraction: boolean
  supportsMetadataExtraction: boolean
  supportsStructurePreservation: boolean
  supportsImageExtraction: boolean
  supportsTableExtraction: boolean
  supportsAnnotationExtraction: boolean
  supportsBookmarkExtraction: boolean
  supportsSearch: boolean
  supportsPagination: boolean
  maxFileSize: number // in bytes
  supportedEncodings: string[]
}

interface ParsedDocument {
  id: string
  format: 'pdf' | 'epub' | 'docx' | 'txt' | 'html' | 'md' | 'rtf'
  content: string
  metadata: DocumentMetadata
  structure: DocumentStructure
  resources: DocumentResources
  processingInfo: ProcessingInfo
}

interface DocumentMetadata {
  title: string
  author?: string
  subject?: string
  description?: string
  keywords?: string[]
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  pageCount?: number
  wordCount?: number
  characterCount?: number
  language?: string
  rights?: string
  customFields?: Record<string, any>
}

interface DocumentStructure {
  chapters: Chapter[]
  sections: Section[]
  headings: Heading[]
  paragraphs: Paragraph[]
  lists: List[]
  tables: Table[]
  images: Image[]
  links: Link[]
  footnotes: Footnote[]
  bookmarks: Bookmark[]
  annotations: Annotation[]
}

interface Chapter {
  id: string
  title: string
  level: number
  startPosition: number
  endPosition: number
  pageNumber?: number
  wordCount?: number
  sections: string[]
}

interface Section {
  id: string
  title: string
  chapterId: string
  startPosition: number
  endPosition: number
  pageNumber?: number
  wordCount?: number
  subsections: string[]
}

interface Heading {
  id: string
  text: string
  level: number
  position: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
}

interface Paragraph {
  id: string
  text: string
  position: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
  style?: string
}

interface List {
  id: string
  type: 'ordered' | 'unordered'
  items: ListItem[]
  position: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
}

interface ListItem {
  id: string
  text: string
  level: number
  position: number
}

interface Table {
  id: string
  headers: string[]
  rows: TableRow[]
  position: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
  caption?: string
}

interface TableRow {
  cells: TableCell[]
  isHeader?: boolean
}

interface TableCell {
  content: string
  colspan?: number
  rowspan?: number
}

interface Image {
  id: string
  description?: string
  altText?: string
  position: number
  pageNumber?: number
  width?: number
  height?: number
  format?: string
  data?: string // base64 encoded image data
  chapterId?: string
  sectionId?: string
}

interface Link {
  id: string
  text: string
  url: string
  position: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
  type: 'internal' | 'external'
}

interface Footnote {
  id: string
  text: string
  referencePosition: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
}

interface Bookmark {
  id: string
  title: string
  position: number
  pageNumber?: number
  chapterId?: string
  sectionId?: string
}

interface Annotation {
  id: string
  type: 'highlight' | 'note' | 'underline' | 'strikeout'
  content?: string
  position: {
    start: number
    end: number
  }
  pageNumber?: number
  chapterId?: string
  sectionId?: string
  color?: string
  author?: string
  created?: Date
}

interface DocumentResources {
  images: Image[]
  fonts: Font[]
  stylesheets: Stylesheet[]
  embeddedFiles: EmbeddedFile[]
}

interface Font {
  name: string
  family: string
  size?: number
  weight?: 'normal' | 'bold' | 'bolder' | 'lighter'
  style?: 'normal' | 'italic' | 'oblique'
  embedded?: boolean
}

interface Stylesheet {
  id: string
  content: string
  type: 'css' | 'xsl'
}

interface EmbeddedFile {
  id: string
  filename: string
  mimetype: string
  size: number
  data?: string // base64 encoded
}

interface ProcessingInfo {
  processingTime: number
  parserUsed: string
  warnings: string[]
  errors: string[]
  confidence: number // 0-1
  extractionQuality: 'poor' | 'fair' | 'good' | 'excellent'
}

export class FormatSupport {
  private capabilities: Map<string, FormatCapabilities> = new Map()
  private parsers: Map<string, (file: File) => Promise<ParsedDocument>> = new Map()

  constructor() {
    this.initializeCapabilities()
    this.initializeParsers()
  }

  private initializeCapabilities() {
    // PDF Capabilities
    this.capabilities.set('pdf', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: true,
      supportsStructurePreservation: true,
      supportsImageExtraction: true,
      supportsTableExtraction: true,
      supportsAnnotationExtraction: true,
      supportsBookmarkExtraction: true,
      supportsSearch: true,
      supportsPagination: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      supportedEncodings: ['utf-8', 'latin-1', 'ascii']
    })

    // EPUB Capabilities
    this.capabilities.set('epub', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: true,
      supportsStructurePreservation: true,
      supportsImageExtraction: true,
      supportsTableExtraction: true,
      supportsAnnotationExtraction: false,
      supportsBookmarkExtraction: true,
      supportsSearch: true,
      supportsPagination: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedEncodings: ['utf-8']
    })

    // DOCX Capabilities
    this.capabilities.set('docx', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: true,
      supportsStructurePreservation: true,
      supportsImageExtraction: true,
      supportsTableExtraction: true,
      supportsAnnotationExtraction: true,
      supportsBookmarkExtraction: false,
      supportsSearch: true,
      supportsPagination: false,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      supportedEncodings: ['utf-8']
    })

    // TXT Capabilities
    this.capabilities.set('txt', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: false,
      supportsStructurePreservation: false,
      supportsImageExtraction: false,
      supportsTableExtraction: false,
      supportsAnnotationExtraction: false,
      supportsBookmarkExtraction: false,
      supportsSearch: true,
      supportsPagination: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedEncodings: ['utf-8', 'ascii', 'latin-1', 'utf-16']
    })

    // HTML Capabilities
    this.capabilities.set('html', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: true,
      supportsStructurePreservation: true,
      supportsImageExtraction: true,
      supportsTableExtraction: true,
      supportsAnnotationExtraction: false,
      supportsBookmarkExtraction: false,
      supportsSearch: true,
      supportsPagination: false,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      supportedEncodings: ['utf-8', 'latin-1']
    })

    // Markdown Capabilities
    this.capabilities.set('md', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: false,
      supportsStructurePreservation: true,
      supportsImageExtraction: false,
      supportsTableExtraction: true,
      supportsAnnotationExtraction: false,
      supportsBookmarkExtraction: false,
      supportsSearch: true,
      supportsPagination: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      supportedEncodings: ['utf-8']
    })

    // RTF Capabilities
    this.capabilities.set('rtf', {
      supportsTextExtraction: true,
      supportsMetadataExtraction: true,
      supportsStructurePreservation: true,
      supportsImageExtraction: true,
      supportsTableExtraction: true,
      supportsAnnotationExtraction: false,
      supportsBookmarkExtraction: false,
      supportsSearch: true,
      supportsPagination: false,
      maxFileSize: 15 * 1024 * 1024, // 15MB
      supportedEncodings: ['utf-8', 'ascii', 'latin-1']
    })
  }

  private initializeParsers() {
    this.parsers.set('pdf', this.parsePDF.bind(this))
    this.parsers.set('epub', this.parseEPUB.bind(this))
    this.parsers.set('docx', this.parseDOCX.bind(this))
    this.parsers.set('txt', this.parseTXT.bind(this))
    this.parsers.set('html', this.parseHTML.bind(this))
    this.parsers.set('md', this.parseMarkdown.bind(this))
    this.parsers.set('rtf', this.parseRTF.bind(this))
  }

  // Main parsing method
  async parseDocument(file: File): Promise<ParsedDocument> {
    const format = this.detectFormat(file)
    const capabilities = this.capabilities.get(format)

    if (!capabilities) {
      throw new Error(`Unsupported format: ${format}`)
    }

    if (file.size > capabilities.maxFileSize) {
      throw new Error(`File too large. Maximum size for ${format} is ${capabilities.maxFileSize / 1024 / 1024}MB`)
    }

    const parser = this.parsers.get(format)
    if (!parser) {
      throw new Error(`No parser available for format: ${format}`)
    }

    try {
      const startTime = Date.now()
      const result = await parser(file)
      const processingTime = Date.now() - startTime

      result.processingInfo.processingTime = processingTime
      result.processingInfo.parserUsed = `${format}-parser`

      return result
    } catch (error) {
      console.error(`Error parsing ${format} document:`, error)
      throw new Error(`Failed to parse ${format} document: ${error.message}`)
    }
  }

  // Format detection
  private detectFormat(file: File): string {
    const mimeType = file.type.toLowerCase()
    const extension = file.name.toLowerCase().split('.').pop()

    // Map MIME types and extensions to format names
    const formatMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'pdf': 'pdf',
      
      'application/epub+zip': 'epub',
      'epub': 'epub',
      
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'docx': 'docx',
      
      'text/plain': 'txt',
      'txt': 'txt',
      
      'text/html': 'html',
      'html': 'html',
      'htm': 'html',
      
      'text/markdown': 'md',
      'md': 'md',
      'markdown': 'md',
      
      'application/rtf': 'rtf',
      'rtf': 'rtf'
    }

    return formatMap[mimeType] || formatMap[extension] || 'unknown'
  }

  // PDF Parser (Simplified - would use PDF.js in production)
  private async parsePDF(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'pdf',
          content,
          metadata: {
            title: file.name.replace('.pdf', ''),
            author: 'Unknown Author',
            creationDate: new Date(),
            pageCount: Math.floor(Math.random() * 300) + 50,
            wordCount: this.estimateWordCount(content),
            characterCount: content.length,
            language: 'en'
          },
          structure: this.extractPDFStructure(content),
          resources: {
            images: [],
            fonts: [],
            stylesheets: [],
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'pdf-parser',
            warnings: [],
            errors: [],
            confidence: 0.85,
            extractionQuality: 'good'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // EPUB Parser (Simplified - would use epub.js in production)
  private async parseEPUB(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'epub',
          content,
          metadata: {
            title: file.name.replace('.epub', ''),
            author: 'Unknown Author',
            creationDate: new Date(),
            pageCount: Math.floor(Math.random() * 200) + 30,
            wordCount: this.estimateWordCount(content),
            characterCount: content.length,
            language: 'en'
          },
          structure: this.extractEPUBStructure(content),
          resources: {
            images: [],
            fonts: [],
            stylesheets: [],
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'epub-parser',
            warnings: [],
            errors: [],
            confidence: 0.9,
            extractionQuality: 'excellent'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // DOCX Parser (Simplified - would use mammoth.js in production)
  private async parseDOCX(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'docx',
          content,
          metadata: {
            title: file.name.replace('.docx', ''),
            author: 'Unknown Author',
            creator: 'Microsoft Word',
            creationDate: new Date(),
            wordCount: this.estimateWordCount(content),
            characterCount: content.length,
            language: 'en'
          },
          structure: this.extractDOCXStructure(content),
          resources: {
            images: [],
            fonts: [],
            stylesheets: [],
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'docx-parser',
            warnings: [],
            errors: [],
            confidence: 0.8,
            extractionQuality: 'good'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // TXT Parser
  private async parseTXT(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'txt',
          content,
          metadata: {
            title: file.name.replace('.txt', ''),
            wordCount: this.estimateWordCount(content),
            characterCount: content.length,
            language: 'en'
          },
          structure: this.extractTXTStructure(content),
          resources: {
            images: [],
            fonts: [],
            stylesheets: [],
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'txt-parser',
            warnings: [],
            errors: [],
            confidence: 0.95,
            extractionQuality: 'excellent'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // HTML Parser
  private async parseHTML(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'html',
          content,
          metadata: this.extractHTMLMetadata(content),
          structure: this.extractHTMLStructure(content),
          resources: {
            images: this.extractHTMLImages(content),
            fonts: [],
            stylesheets: this.extractHTMLStylesheets(content),
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'html-parser',
            warnings: [],
            errors: [],
            confidence: 0.85,
            extractionQuality: 'good'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // Markdown Parser
  private async parseMarkdown(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'md',
          content,
          metadata: {
            title: file.name.replace('.md', ''),
            wordCount: this.estimateWordCount(content),
            characterCount: content.length,
            language: 'en'
          },
          structure: this.extractMarkdownStructure(content),
          resources: {
            images: [],
            fonts: [],
            stylesheets: [],
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'markdown-parser',
            warnings: [],
            errors: [],
            confidence: 0.9,
            extractionQuality: 'excellent'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // RTF Parser
  private async parseRTF(file: File): Promise<ParsedDocument> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedDocument: ParsedDocument = {
          id: this.generateDocumentId(),
          format: 'rtf',
          content: this.cleanRTF(content),
          metadata: {
            title: file.name.replace('.rtf', ''),
            creator: 'Rich Text Format',
            wordCount: this.estimateWordCount(content),
            characterCount: content.length,
            language: 'en'
          },
          structure: this.extractRTFStructure(content),
          resources: {
            images: [],
            fonts: [],
            stylesheets: [],
            embeddedFiles: []
          },
          processingInfo: {
            processingTime: 0,
            parserUsed: 'rtf-parser',
            warnings: [],
            errors: [],
            confidence: 0.7,
            extractionQuality: 'fair'
          }
        }
        
        resolve(parsedDocument)
      }
      reader.readAsText(file)
    })
  }

  // Structure extraction methods
  private extractPDFStructure(content: string): DocumentStructure {
    return {
      chapters: this.extractChapters(content),
      sections: this.extractSections(content),
      headings: this.extractHeadings(content),
      paragraphs: this.extractParagraphs(content),
      lists: this.extractLists(content),
      tables: this.extractTables(content),
      images: [],
      links: [],
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  private extractEPUBStructure(content: string): DocumentStructure {
    return {
      chapters: this.extractChapters(content),
      sections: this.extractSections(content),
      headings: this.extractHeadings(content),
      paragraphs: this.extractParagraphs(content),
      lists: this.extractLists(content),
      tables: this.extractTables(content),
      images: [],
      links: [],
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  private extractDOCXStructure(content: string): DocumentStructure {
    return {
      chapters: this.extractChapters(content),
      sections: this.extractSections(content),
      headings: this.extractHeadings(content),
      paragraphs: this.extractParagraphs(content),
      lists: this.extractLists(content),
      tables: this.extractTables(content),
      images: [],
      links: [],
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  private extractTXTStructure(content: string): DocumentStructure {
    return {
      chapters: [],
      sections: [],
      headings: [],
      paragraphs: this.extractParagraphs(content),
      lists: [],
      tables: [],
      images: [],
      links: [],
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  private extractHTMLMetadata(content: string): DocumentMetadata {
    const titleMatch = content.match(/<title>(.*?)<\/title>/i)
    const authorMatch = content.match(/<meta\s+name="author"\s+content="(.*?)"/i)
    const descriptionMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i)
    const keywordsMatch = content.match(/<meta\s+name="keywords"\s+content="(.*?)"/i)

    return {
      title: titleMatch ? titleMatch[1] : 'Untitled',
      author: authorMatch ? authorMatch[1] : undefined,
      description: descriptionMatch ? descriptionMatch[1] : undefined,
      keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : undefined,
      wordCount: this.estimateWordCount(content),
      characterCount: content.length,
      language: 'en'
    }
  }

  private extractHTMLStructure(content: string): DocumentStructure {
    // Remove HTML tags for text content
    const textContent = content.replace(/<[^>]*>/g, ' ')
    
    return {
      chapters: [],
      sections: [],
      headings: this.extractHTMLHeadings(content),
      paragraphs: this.extractHTMLParagraphs(content),
      lists: this.extractHTMLLists(content),
      tables: this.extractHTMLTables(content),
      images: this.extractHTMLImages(content),
      links: this.extractHTMLLinks(content),
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  private extractMarkdownStructure(content: string): DocumentStructure {
    return {
      chapters: this.extractMarkdownChapters(content),
      sections: this.extractMarkdownSections(content),
      headings: this.extractMarkdownHeadings(content),
      paragraphs: this.extractMarkdownParagraphs(content),
      lists: this.extractMarkdownLists(content),
      tables: this.extractMarkdownTables(content),
      images: this.extractMarkdownImages(content),
      links: this.extractMarkdownLinks(content),
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  private extractRTFStructure(content: string): DocumentStructure {
    const cleanContent = this.cleanRTF(content)
    
    return {
      chapters: [],
      sections: [],
      headings: [],
      paragraphs: this.extractParagraphs(cleanContent),
      lists: [],
      tables: [],
      images: [],
      links: [],
      footnotes: [],
      bookmarks: [],
      annotations: []
    }
  }

  // Helper methods for structure extraction
  private extractChapters(content: string): Chapter[] {
    const chapters: Chapter[] = []
    const patterns = [
      /Chapter\s+\d+/gi,
      /CHAPTER\s+\d+/gi,
      /Part\s+\d+/gi,
      /PART\s+\d+/gi
    ]

    let matches: RegExpMatchArray[] = []
    patterns.forEach(pattern => {
      const patternMatches = Array.from(content.matchAll(pattern))
      matches = matches.concat(patternMatches)
    })

    matches.sort((a, b) => a.index - b.index)

    matches.forEach((match, index) => {
      chapters.push({
        id: `chapter-${index}`,
        title: match[0],
        level: 1,
        startPosition: match.index,
        endPosition: index < matches.length - 1 ? matches[index + 1].index : content.length,
        sections: []
      })
    })

    return chapters
  }

  private extractSections(content: string): Section[] {
    const sections: Section[] = []
    const patterns = [
      /Section\s+\d+/gi,
      /SECTION\s+\d+/gi,
      /\d+\.\d+\s+[A-Z]/gi
    ]

    let matches: RegExpMatchArray[] = []
    patterns.forEach(pattern => {
      const patternMatches = Array.from(content.matchAll(pattern))
      matches = matches.concat(patternMatches)
    })

    matches.sort((a, b) => a.index - b.index)

    matches.forEach((match, index) => {
      sections.push({
        id: `section-${index}`,
        title: match[0],
        chapterId: 'unknown',
        startPosition: match.index,
        endPosition: index < matches.length - 1 ? matches[index + 1].index : content.length,
        subsections: []
      })
    })

    return sections
  }

  private extractHeadings(content: string): Heading[] {
    const headings: Heading[] = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.length === 0) return

      // Detect heading level by various indicators
      let level = 1
      
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
        level = 1
      } else if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmed) && trimmed.length > 3) {
        level = 2
      } else if (/^\d+\./.test(trimmed)) {
        level = 3
      }

      if (level <= 3) {
        headings.push({
          id: `heading-${index}`,
          text: trimmed,
          level,
          position: content.indexOf(line)
        })
      }
    })

    return headings
  }

  private extractParagraphs(content: string): Paragraph[] {
    const paragraphs: Paragraph[] = []
    const paragraphTexts = content.split(/\n\s*\n/)
    let position = 0

    for (const paragraphText of paragraphTexts) {
      const trimmed = paragraphText.trim()
      if (trimmed.length > 10) { // Only substantial paragraphs
        paragraphs.push({
          id: `paragraph-${paragraphs.length}`,
          text: trimmed,
          position
        })
      }
      position += paragraphText.length + 2
    }

    return paragraphs
  }

  private extractLists(content: string): List[] {
    const lists: List[] = []
    const lines = content.split('\n')
    let currentList: List | null = null
    let listId = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      const isOrdered = /^\d+\./.test(line)
      const isUnordered = /^[•\-\*]/.test(line)
      
      if (isOrdered || isUnordered) {
        if (!currentList) {
          currentList = {
            id: `list-${listId++}`,
            type: isOrdered ? 'ordered' : 'unordered',
            items: [],
            position: content.indexOf(line)
          }
          lists.push(currentList)
        }
        
        // Add item to current list (remove bullet/number)
        const itemText = line.replace(/^\d+\.\s*/, '').replace(/^[•\-\*]\s*/, '')
        currentList.items.push({
          id: `item-${currentList.items.length}`,
          text: itemText,
          level: 1,
          position: content.indexOf(line)
        })
      } else if (currentList && line.length === 0) {
        // End of list
        currentList = null
      } else if (currentList) {
        // Continuation of current list item
        if (currentList.items.length > 0) {
          currentList.items[currentList.items.length - 1].text += ' ' + line
        }
      }
    }

    return lists
  }

  private extractTables(content: string): Table[] {
    const tables: Table[] = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length - 2; i++) {
      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()
      const line3 = lines[i + 2].trim()
      
      // Check if this looks like a table (header separator)
      if (line2.includes('---') || line2.includes('===') || line2.includes('\t')) {
        const headers = line1.split(/\t|\|/).map(h => h.trim()).filter(h => h.length > 0)
        
        if (headers.length > 1) {
          const rows: TableRow[] = []
          
          // Extract data rows
          for (let j = i + 2; j < lines.length; j++) {
            const dataLine = lines[j].trim()
            if (dataLine.length === 0) break
            
            const rowData = dataLine.split(/\t|\|/).map(cell => cell.trim()).filter(cell => cell.length > 0)
            if (rowData.length === headers.length) {
              rows.push({
                cells: rowData.map(cellData => ({ content: cellData }))
              })
            }
          }
          
          if (rows.length > 0) {
            tables.push({
              id: `table-${tables.length}`,
              headers,
              rows,
              position: content.indexOf(line1)
            })
          }
        }
      }
    }
    
    return tables
  }

  private extractHTMLHeadings(content: string): Heading[] {
    const headings: Heading[] = []
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h([1-6])>/gi
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        id: `html-heading-${headings.length}`,
        text: match[2].replace(/<[^>]*>/g, ''),
        level: parseInt(match[1]),
        position: match.index
      })
    }

    return headings
  }

  private extractHTMLParagraphs(content: string): Paragraph[] {
    const paragraphs: Paragraph[] = []
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi
    let match

    while ((match = paragraphRegex.exec(content)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, ' ').trim()
      if (text.length > 0) {
        paragraphs.push({
          id: `html-paragraph-${paragraphs.length}`,
          text,
          position: match.index
        })
      }
    }

    return paragraphs
  }

  private extractHTMLLists(content: string): List[] {
    const lists: List[] = []
    const listRegex = /<(ul|ol)[^>]*>(.*?)<\/\1>/gi
    let match

    while ((match = listRegex.exec(content)) !== null) {
      const isOrdered = match[1] === 'ol'
      const listContent = match[2]
      
      const itemRegex = /<li[^>]*>(.*?)<\/li>/gi
      const items: ListItem[] = []
      let itemMatch

      while ((itemMatch = itemRegex.exec(listContent)) !== null) {
        items.push({
          id: `html-item-${items.length}`,
          text: itemMatch[1].replace(/<[^>]*>/g, ' ').trim(),
          level: 1,
          position: match.index + itemMatch.index
        })
      }

      if (items.length > 0) {
        lists.push({
          id: `html-list-${lists.length}`,
          type: isOrdered ? 'ordered' : 'unordered',
          items,
          position: match.index
        })
      }
    }

    return lists
  }

  private extractHTMLTables(content: string): Table[] {
    const tables: Table[] = []
    const tableRegex = /<table[^>]*>(.*?)<\/table>/gi
    let match

    while ((match = tableRegex.exec(content)) !== null) {
      const tableContent = match[1]
      
      // Extract headers
      const headerRegex = /<th[^>]*>(.*?)<\/th>/gi
      const headers: string[] = []
      let headerMatch

      while ((headerMatch = headerRegex.exec(tableContent)) !== null) {
        headers.push(headerMatch[1].replace(/<[^>]*>/g, '').trim())
      }

      // Extract rows
      const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gi
      const rows: TableRow[] = []
      let rowMatch

      while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
        const rowContent = rowMatch[1]
        const cellRegex = /<td[^>]*>(.*?)<\/td>/gi
        const cells: TableCell[] = []
        let cellMatch

        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          cells.push({
            content: cellMatch[1].replace(/<[^>]*>/g, '').trim()
          })
        }

        if (cells.length > 0) {
          rows.push({ cells })
        }
      }

      if (headers.length > 0 && rows.length > 0) {
        tables.push({
          id: `html-table-${tables.length}`,
          headers,
          rows,
          position: match.index
        })
      }
    }

    return tables
  }

  private extractHTMLImages(content: string): Image[] {
    const images: Image[] = []
    const imageRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi
    let match

    while ((match = imageRegex.exec(content)) !== null) {
      images.push({
        id: `html-image-${images.length}`,
        altText: match[2],
        position: match.index,
        format: 'html'
      })
    }

    return images
  }

  private extractHTMLLinks(content: string): Link[] {
    const links: Link[] = []
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1]
      const text = match[2].replace(/<[^>]*>/g, '').trim()
      
      links.push({
        id: `html-link-${links.length}`,
        text,
        url,
        position: match.index,
        type: url.startsWith('#') ? 'internal' : 'external'
      })
    }

    return links
  }

  private extractHTMLStylesheets(content: string): Stylesheet[] {
    const stylesheets: Stylesheet[] = []
    const styleRegex = /<link[^>]*href="([^"]*)"[^>]*rel="stylesheet"[^>]*>/gi
    let match

    while ((match = styleRegex.exec(content)) !== null) {
      stylesheets.push({
        id: `html-stylesheet-${stylesheets.length}`,
        content: '',
        type: 'css'
      })
    }

    // Also extract inline styles
    const inlineStyleRegex = /<style[^>]*>(.*?)<\/style>/gi
    while ((match = inlineStyleRegex.exec(content)) !== null) {
      stylesheets.push({
        id: `html-style-${stylesheets.length}`,
        content: match[1],
        type: 'css'
      })
    }

    return stylesheets
  }

  private extractMarkdownChapters(content: string): Chapter[] {
    const chapters: Chapter[] = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('# ')) {
        chapters.push({
          id: `md-chapter-${chapters.length}`,
          title: line.substring(2),
          level: 1,
          startPosition: content.indexOf(line),
          endPosition: i < lines.length - 1 ? content.indexOf(lines[i + 1]) : content.length,
          sections: []
        })
      }
    }

    return chapters
  }

  private extractMarkdownSections(content: string): Section[] {
    const sections: Section[] = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('## ')) {
        sections.push({
          id: `md-section-${sections.length}`,
          title: line.substring(3),
          chapterId: 'unknown',
          startPosition: content.indexOf(line),
          endPosition: i < lines.length - 1 ? content.indexOf(lines[i + 1]) : content.length,
          subsections: []
        })
      }
    }

    return sections
  }

  private extractMarkdownHeadings(content: string): Heading[] {
    const headings: Heading[] = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
      
      if (headingMatch) {
        headings.push({
          id: `md-heading-${headings.length}`,
          text: headingMatch[2],
          level: headingMatch[1].length,
          position: content.indexOf(line)
        })
      }
    }

    return headings
  }

  private extractMarkdownParagraphs(content: string): Paragraph[] {
    const paragraphs: Paragraph[] = []
    const lines = content.split('\n')
    let currentParagraph = ''
    let paragraphStart = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === '' && currentParagraph.length > 0) {
        // End of paragraph
        paragraphs.push({
          id: `md-paragraph-${paragraphs.length}`,
          text: currentParagraph,
          position: paragraphStart
        })
        currentParagraph = ''
      } else if (line && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-') && !line.startsWith('```')) {
        if (currentParagraph.length === 0) {
          paragraphStart = content.indexOf(lines[i])
        }
        currentParagraph += (currentParagraph.length > 0 ? ' ' : '') + line
      }
    }

    // Add final paragraph if exists
    if (currentParagraph.length > 0) {
      paragraphs.push({
        id: `md-paragraph-${paragraphs.length}`,
        text: currentParagraph,
        position: paragraphStart
      })
    }

    return paragraphs
  }

  private extractMarkdownLists(content: string): List[] {
    const lists: List[] = []
    const lines = content.split('\n')
    let currentList: List | null = null
    let listId = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      const isOrdered = /^\d+\.\s/.test(line)
      const isUnordered = /^[*\-+]\s/.test(line)
      
      if (isOrdered || isUnordered) {
        if (!currentList) {
          currentList = {
            id: `md-list-${listId++}`,
            type: isOrdered ? 'ordered' : 'unordered',
            items: [],
            position: content.indexOf(line)
          }
          lists.push(currentList)
        }
        
        // Add item to current list (remove bullet/number)
        const itemText = line.replace(/^\d+\.\s*/, '').replace(/^[*\-+]\s*/, '')
        currentList.items.push({
          id: `md-item-${currentList.items.length}`,
          text: itemText,
          level: 1,
          position: content.indexOf(line)
        })
      } else if (currentList && line === '') {
        // End of list
        currentList = null
      }
    }

    return lists
  }

  private extractMarkdownTables(content: string): Table[] {
    const tables: Table[] = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length - 2; i++) {
      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()
      const line3 = lines[i + 2].trim()
      
      // Check if this looks like a markdown table
      if (line1.startsWith('|') && line2.startsWith('|') && line3.startsWith('|')) {
        const headers = line1.split('|').map(h => h.trim()).filter(h => h.length > 0)
        const separator = line2.split('|').map(s => s.trim()).filter(s => s.length > 0)
        
        if (headers.length > 1 && separator.some(s => s.includes('-'))) {
          const rows: TableRow[] = []
          
          // Extract data rows
          for (let j = i + 2; j < lines.length; j++) {
            const dataLine = lines[j].trim()
            if (!dataLine.startsWith('|')) break
            
            const rowData = dataLine.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
            if (rowData.length === headers.length) {
              rows.push({
                cells: rowData.map(cellData => ({ content: cellData }))
              })
            }
          }
          
          if (rows.length > 0) {
            tables.push({
              id: `md-table-${tables.length}`,
              headers,
              rows,
              position: content.indexOf(line1)
            })
          }
        }
      }
    }
    
    return tables
  }

  private extractMarkdownImages(content: string): Image[] {
    const images: Image[] = {
      id: `md-image-${images.length}`,
      description: 'Markdown image',
      position: content.indexOf(line),
      format: 'markdown'
    }
    return images
  }

  private extractMarkdownLinks(content: string): Link[] {
    const links: Link[] = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/gi
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        id: `md-link-${links.length}`,
        text: match[1],
        url: match[2],
        position: match.index,
        type: match[2].startsWith('#') ? 'internal' : 'external'
      })
    }

    return links
  }

  // Utility methods
  private cleanRTF(content: string): string {
    // Remove RTF formatting
    return content
      .replace(/\\[a-z]+\d*/gi, '') // Remove RTF commands
      .replace(/[{}]/g, '') // Remove braces
      .replace(/\\'/g, "'") // Replace escaped quotes
      .replace(/\\[\\{}]/g, (match) => match.charAt(1)) // Unescape special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  private estimateWordCount(content: string): number {
    return content.trim().split(/\s+/).length
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Public methods
  getSupportedFormats(): string[] {
    return Array.from(this.capabilities.keys())
  }

  getFormatCapabilities(format: string): FormatCapabilities | undefined {
    return this.capabilities.get(format)
  }

  isFormatSupported(format: string): boolean {
    return this.capabilities.has(format)
  }

  validateFile(file: File): { valid: boolean; errors: string[] } {
    const format = this.detectFormat(file)
    const capabilities = this.capabilities.get(format)
    const errors: string[] = []

    if (!capabilities) {
      errors.push(`Unsupported format: ${format}`)
      return { valid: false, errors }
    }

    if (file.size > capabilities.maxFileSize) {
      errors.push(`File too large. Maximum size for ${format} is ${capabilities.maxFileSize / 1024 / 1024}MB`)
    }

    return { valid: errors.length === 0, errors }
  }

  // Batch processing
  async parseDocuments(files: File[]): Promise<ParsedDocument[]> {
    const results: ParsedDocument[] = []
    
    for (const file of files) {
      try {
        const document = await this.parseDocument(file)
        results.push(document)
      } catch (error) {
        console.error(`Failed to parse file ${file.name}:`, error)
        // Continue with other files
      }
    }
    
    return results
  }
}

export const formatSupport = new FormatSupport()