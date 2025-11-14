interface ParsedContent {
  text: string
  metadata: {
    title: string
    author: string
    pageCount?: number
    chapters: Array<{
      title: string
      startIndex: number
      endIndex: number
      pageCount?: number
    }>
    sections: Array<{
      title: string
      chapter: string
      startIndex: number
      endIndex: number
    }>
  }
  structure: {
    headings: Array<{
      level: number
      text: string
      position: number
    }>
    paragraphs: Array<{
      text: string
      position: number
    }>
    lists: Array<{
      items: string[]
      position: number
      type: 'ordered' | 'unordered'
    }>
    tables: Array<{
      headers: string[]
      rows: string[][]
      position: number
    }>
    images: Array<{
      description?: string
      position: number
    }>
  }
}

export class DocumentParser {
  // PDF Parsing
  async parsePDF(file: File): Promise<ParsedContent> {
    // In a real implementation, you would use PDF.js or similar library
    // For now, we'll simulate PDF parsing
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        // Simulate PDF structure extraction
        const parsedContent: ParsedContent = {
          text: content,
          metadata: {
            title: file.name.replace('.pdf', ''),
            author: 'Unknown Author',
            pageCount: Math.floor(Math.random() * 300) + 50,
            chapters: this.extractChapters(content),
            sections: this.extractSections(content)
          },
          structure: this.extractStructure(content)
        }
        
        resolve(parsedContent)
      }
      reader.readAsText(file)
    })
  }

  // EPUB Parsing
  async parseEPUB(file: File): Promise<ParsedContent> {
    // In a real implementation, you would use epub.js or similar library
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedContent: ParsedContent = {
          text: content,
          metadata: {
            title: file.name.replace('.epub', ''),
            author: 'Unknown Author',
            chapters: this.extractChapters(content),
            sections: this.extractSections(content)
          },
          structure: this.extractStructure(content)
        }
        
        resolve(parsedContent)
      }
      reader.readAsText(file)
    })
  }

  // DOCX Parsing
  async parseDOCX(file: File): Promise<ParsedContent> {
    // In a real implementation, you would use mammoth.js or similar library
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedContent: ParsedContent = {
          text: content,
          metadata: {
            title: file.name.replace('.docx', ''),
            author: 'Unknown Author',
            chapters: this.extractChapters(content),
            sections: this.extractSections(content)
          },
          structure: this.extractStructure(content)
        }
        
        resolve(parsedContent)
      }
      reader.readAsText(file)
    })
  }

  // TXT Parsing
  async parseTXT(file: File): Promise<ParsedContent> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        
        const parsedContent: ParsedContent = {
          text: content,
          metadata: {
            title: file.name.replace('.txt', ''),
            author: 'Unknown Author',
            chapters: this.extractChapters(content),
            sections: this.extractSections(content)
          },
          structure: this.extractStructure(content)
        }
        
        resolve(parsedContent)
      }
      reader.readAsText(file)
    })
  }

  // Generic parser that detects file type
  async parseDocument(file: File): Promise<ParsedContent> {
    const fileType = file.type
    
    if (fileType.includes('pdf')) {
      return this.parsePDF(file)
    } else if (fileType.includes('epub')) {
      return this.parseEPUB(file)
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return this.parseDOCX(file)
    } else {
      return this.parseTXT(file)
    }
  }

  // Extract chapters from content
  private extractChapters(content: string): Array<{
    title: string
    startIndex: number
    endIndex: number
    pageCount?: number
  }> {
    const chapters: Array<{
      title: string
      startIndex: number
      endIndex: number
      pageCount?: number
    }> = []
    
    // Look for chapter patterns
    const chapterPatterns = [
      /Chapter\s+\d+/gi,
      /CHAPTER\s+\d+/gi,
      /Chapter\s+[A-Z]/gi,
      /\d+\.\s*[A-Z]/gi
    ]
    
    let positions: number[] = []
    
    for (const pattern of chapterPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        positions.push(match.index)
      }
    }
    
    // Sort positions and remove duplicates
    positions = [...new Set(positions)].sort((a, b) => a - b)
    
    // Create chapter objects
    for (let i = 0; i < positions.length; i++) {
      const startIndex = positions[i]
      const endIndex = i < positions.length - 1 ? positions[i + 1] : content.length
      
      // Extract chapter title
      const chapterText = content.substring(startIndex, Math.min(startIndex + 100, endIndex))
      const titleMatch = chapterText.match(/^([^\n\r]+)/)
      const title = titleMatch ? titleMatch[1].trim() : `Chapter ${i + 1}`
      
      chapters.push({
        title,
        startIndex,
        endIndex,
        pageCount: Math.floor((endIndex - startIndex) / 2000) // Estimate pages
      })
    }
    
    return chapters
  }

  // Extract sections from content
  private extractSections(content: string): Array<{
    title: string
    chapter: string
    startIndex: number
    endIndex: number
  }> {
    const sections: Array<{
      title: string
      chapter: string
      startIndex: number
      endIndex: number
    }> = []
    
    // Look for section patterns
    const sectionPatterns = [
      /Section\s+\d+/gi,
      /SECTION\s+\d+/gi,
      /\d+\.\d+\s*[A-Z]/gi,
      /[A-Z][a-z]+\s+[A-Z][a-z]+/gi // Camel case sections
    ]
    
    let positions: number[] = []
    
    for (const pattern of sectionPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        positions.push(match.index)
      }
    }
    
    // Sort positions and remove duplicates
    positions = [...new Set(positions)].sort((a, b) => a - b)
    
    // Create section objects
    for (let i = 0; i < positions.length; i++) {
      const startIndex = positions[i]
      const endIndex = i < positions.length - 1 ? positions[i + 1] : content.length
      
      // Extract section title
      const sectionText = content.substring(startIndex, Math.min(startIndex + 50, endIndex))
      const titleMatch = sectionText.match(/^([^\n\r]+)/)
      const title = titleMatch ? titleMatch[1].trim() : `Section ${i + 1}`
      
      // Find which chapter this section belongs to
      const chapter = this.findChapterForPosition(startIndex, content)
      
      sections.push({
        title,
        chapter,
        startIndex,
        endIndex
      })
    }
    
    return sections
  }

  // Find which chapter a position belongs to
  private findChapterForPosition(position: number, content: string): string {
    const chapters = this.extractChapters(content)
    
    for (const chapter of chapters) {
      if (position >= chapter.startIndex && position < chapter.endIndex) {
        return chapter.title
      }
    }
    
    return 'Unknown Chapter'
  }

  // Extract document structure
  private extractStructure(content: string): ParsedContent['structure'] {
    return {
      headings: this.extractHeadings(content),
      paragraphs: this.extractParagraphs(content),
      lists: this.extractLists(content),
      tables: this.extractTables(content),
      images: this.extractImages(content)
    }
  }

  // Extract headings
  private extractHeadings(content: string): Array<{
    level: number
    text: string
    position: number
  }> {
    const headings: Array<{
      level: number
      text: string
      position: number
    }> = []
    
    // Look for heading patterns
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.length === 0) continue
      
      // Determine heading level by various indicators
      let level = 1
      
      // All caps heading
      if (line === line.toUpperCase() && line.length > 3) {
        level = 1
      }
      // Title case heading
      else if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line) && line.length > 3) {
        level = 2
      }
      // Numbered heading
      else if (/^\d+\./.test(line)) {
        level = 3
      }
      // Bullet point
      else if (/^[•\-\*]/.test(line)) {
        level = 4
      }
      
      if (level <= 4) {
        headings.push({
          level,
          text: line,
          position: content.indexOf(line)
        })
      }
    }
    
    return headings
  }

  // Extract paragraphs
  private extractParagraphs(content: string): Array<{
    text: string
    position: number
  }> {
    const paragraphs: Array<{
      text: string
      position: number
    }> = []
    
    // Split by double newlines to get paragraphs
    const paragraphTexts = content.split(/\n\s*\n/)
    let position = 0
    
    for (const paragraphText of paragraphTexts) {
      const trimmed = paragraphText.trim()
      if (trimmed.length > 10) { // Only substantial paragraphs
        paragraphs.push({
          text: trimmed,
          position
        })
      }
      position += paragraphText.length + 2
    }
    
    return paragraphs
  }

  // Extract lists
  private extractLists(content: string): Array<{
    items: string[]
    position: number
    type: 'ordered' | 'unordered'
  }> {
    const lists: Array<{
      items: string[]
      position: number
      type: 'ordered' | 'unordered'
    }> = []
    
    const lines = content.split('\n')
    let currentList: string[] = []
    let listType: 'ordered' | 'unordered' = 'unordered'
    let listStart = 0
    let inList = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check if line is a list item
      const isOrdered = /^\d+\./.test(line)
      const isUnordered = /^[•\-\*]/.test(line)
      
      if (isOrdered || isUnordered) {
        if (!inList) {
          // Start new list
          currentList = []
          listType = isOrdered ? 'ordered' : 'unordered'
          listStart = content.indexOf(line)
          inList = true
        }
        
        // Add item to current list (remove bullet/number)
        const itemText = line.replace(/^\d+\.\s*/, '').replace(/^[•\-\*]\s*/, '')
        currentList.push(itemText)
      } else if (inList && line.length === 0) {
        // End of list
        if (currentList.length > 0) {
          lists.push({
            items: [...currentList],
            position: listStart,
            type: listType
          })
        }
        inList = false
        currentList = []
      } else if (inList) {
        // Continuation of current list item
        if (currentList.length > 0) {
          currentList[currentList.length - 1] += ' ' + line
        }
      }
    }
    
    // Add final list if still in list
    if (inList && currentList.length > 0) {
      lists.push({
        items: currentList,
        position: listStart,
        type: listType
      })
    }
    
    return lists
  }

  // Extract tables (simplified)
  private extractTables(content: string): Array<{
    headers: string[]
    rows: string[][]
    position: number
  }> {
    const tables: Array<{
      headers: string[]
      rows: string[][]
      position: number
    }> = []
    
    // Look for simple table patterns (tab-separated or pipe-separated)
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length - 2; i++) {
      const line1 = lines[i].trim()
      const line2 = lines[i + 1].trim()
      const line3 = lines[i + 2].trim()
      
      // Check if this looks like a table (header separator)
      if (line2.includes('---') || line2.includes('===') || line2.includes('\t')) {
        const headers = line1.split(/\t|\|/).map(h => h.trim()).filter(h => h.length > 0)
        
        if (headers.length > 1) {
          const rows: string[][] = []
          
          // Extract data rows
          for (let j = i + 2; j < lines.length; j++) {
            const dataLine = lines[j].trim()
            if (dataLine.length === 0) break
            
            const rowData = dataLine.split(/\t|\|/).map(cell => cell.trim()).filter(cell => cell.length > 0)
            if (rowData.length === headers.length) {
              rows.push(rowData)
            }
          }
          
          if (rows.length > 0) {
            tables.push({
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

  // Extract images (simplified - just look for image references)
  private extractImages(content: string): Array<{
    description?: string
    position: number
  }> {
    const images: Array<{
      description?: string
      position: number
    }> = []
    
    // Look for image patterns
    const imagePatterns = [
      /Figure\s+\d+/gi,
      /Image\s+\d+/gi,
      /Diagram\s+\d+/gi,
      /!\[.*?\]\(.*?\)/gi // Markdown images
    ]
    
    for (const pattern of imagePatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        images.push({
          description: match[0],
          position: match.index
        })
      }
    }
    
    return images
  }

  // Content chunking for processing
  chunkContent(
    content: string,
    options: {
      maxWords?: number
      maxCharacters?: number
      overlap?: number
      respectChapters?: boolean
    } = {}
  ): Array<{
    id: string
    content: string
    chapter?: string
    section?: string
    startIndex: number
    endIndex: number
    wordCount: number
  }> {
    const {
      maxWords = 500,
      maxCharacters = 3000,
      overlap = 50,
      respectChapters = true
    } = options
    
    const chunks: Array<{
      id: string
      content: string
      chapter?: string
      section?: string
      startIndex: number
      endIndex: number
      wordCount: number
    }> = []
    
    if (respectChapters) {
      const chapters = this.extractChapters(content)
      
      for (const chapter of chapters) {
        const chapterContent = content.substring(chapter.startIndex, chapter.endIndex)
        const chapterChunks = this.chunkText(chapterContent, maxWords, maxCharacters, overlap)
        
        for (const chunk of chapterChunks) {
          chunks.push({
            id: this.generateChunkId(),
            content: chunk.text,
            chapter: chapter.title,
            startIndex: chapter.startIndex + chunk.startIndex,
            endIndex: chapter.startIndex + chunk.endIndex,
            wordCount: chunk.wordCount
          })
        }
      }
    } else {
      const textChunks = this.chunkText(content, maxWords, maxCharacters, overlap)
      
      for (const chunk of textChunks) {
        chunks.push({
          id: this.generateChunkId(),
          content: chunk.text,
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
          wordCount: chunk.wordCount
        })
      }
    }
    
    return chunks
  }

  // Helper method to chunk text
  private chunkText(
    text: string,
    maxWords: number,
    maxCharacters: number,
    overlap: number
  ): Array<{
    text: string
    startIndex: number
    endIndex: number
    wordCount: number
  }> {
    const chunks: Array<{
      text: string
      startIndex: number
      endIndex: number
      wordCount: number
    }> = []
    
    const words = text.split(/\s+/)
    let currentIndex = 0
    
    while (currentIndex < words.length) {
      const chunkWords = words.slice(currentIndex, currentIndex + maxWords)
      const chunkText = chunkWords.join(' ')
      
      // Check character limit
      if (chunkText.length > maxCharacters) {
        // Reduce chunk size to fit character limit
        let adjustedWords = chunkWords
        let adjustedText = chunkText
        
        while (adjustedText.length > maxCharacters && adjustedWords.length > 1) {
          adjustedWords = adjustedWords.slice(0, -1)
          adjustedText = adjustedWords.join(' ')
        }
        
        chunks.push({
          text: adjustedText,
          startIndex: text.indexOf(chunkText),
          endIndex: text.indexOf(chunkText) + adjustedText.length,
          wordCount: adjustedWords.length
        })
        
        currentIndex += adjustedWords.length - Math.floor(overlap / 2)
      } else {
        chunks.push({
          text: chunkText,
          startIndex: text.indexOf(chunkText),
          endIndex: text.indexOf(chunkText) + chunkText.length,
          wordCount: chunkWords.length
        })
        
        currentIndex += maxWords - Math.floor(overlap / 2)
      }
    }
    
    return chunks
  }

  // Generate unique chunk ID
  private generateChunkId(): string {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Extract key terms and concepts
  extractKeyTerms(content: string): Array<{
    term: string
    definition?: string
    frequency: number
    importance: number
  }> {
    // Simple keyword extraction (in production, use NLP libraries)
    const words = content.toLowerCase().split(/\s+/)
    const wordFreq: { [key: string]: number } = {}
    
    // Count word frequencies
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '')
      if (cleanWord.length > 3) { // Only substantial words
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
      }
    }
    
    // Filter common words and sort by frequency
    const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'her', 'way', 'many', 'oil', 'sit', 'set', 'three', 'want', 'air', 'well', 'also', 'play', 'small', 'end', 'home', 'hand', 'port', 'spell', 'add', 'even', 'land', 'here', 'must', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father', 'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late', 'run', "don't", 'while', 'press', 'close', 'night', 'real', 'life', 'few', 'north', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour', 'better', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'ago', 'though', 'method', 'ride', 'skin', 'glad', 'detail', 'secret', 'blue', 'spread', 'arrange', 'quiet', 'weather', 'tube', 'share', 'die', 'stop', 'meant', 'yet', 'quality', 'face', 'wood', 'main', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour', 'better', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'ago', 'though', 'method', 'ride', 'skin', 'glad', 'detail', 'secret'])
    
    const terms = Object.entries(wordFreq)
      .filter(([word]) => !commonWords.has(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([term, frequency]) => ({
        term,
        frequency,
        importance: frequency / words.length
      }))
    
    return terms
  }
}

export const documentParser = new DocumentParser()